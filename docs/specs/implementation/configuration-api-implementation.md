# Implementation Plan: Configuration API (Backend-Driven UI)

## Overview
Implement a REST API that delivers backend-driven UI schemas to client applications (iOS, Android, Web) with support for versioning, caching, platform selection, and experiment resolution.

## Architecture Approach
Follow Clean Architecture pattern already established in the codebase:
- **Domain Layer**: Configuration entities, value objects, business rules
- **Application Layer**: Use cases for fetching and resolving configurations
- **Infrastructure Layer**: HTTP endpoints, caching, database repositories
- **Integration**: Connect with existing Schema Management and A/B Testing domains

## Implementation Steps

### 1. Domain Layer (packages/admin-backend/domain/)

#### 1.1 Create Configuration Delivery Subdomain
Location: `packages/admin-backend/domain/src/deployment-and-distribution/configuration-delivery/`

**Value Objects:**
- `ConfigurationRequest.vo.ts` - Encapsulates request parameters
  - scenario_id (string)
  - platform (PlatformSupport enum: ios, android, web)
  - render_engine_version (SemanticVersion)
  - user_id (optional string)
  - experiment_id (optional string)

- `VersionCompatibility.vo.ts` - Validates render engine version compatibility
  - min_version (SemanticVersion)
  - max_version (SemanticVersion)
  - isCompatible(version: SemanticVersion): boolean

- `CacheMetadata.vo.ts` - Cache control metadata
  - etag (string)
  - last_modified (Date)
  - max_age (number in seconds)

**Entities:**
- `ConfigurationResponse.entity.ts` - Complete response with schema
  - schema_version (SemanticVersion)
  - render_engine compatibility (VersionCompatibility)
  - scenario_id (string)
  - platform (PlatformSupport)
  - config (JSON schema)
  - cache_metadata (CacheMetadata)
  - experiment_variant (optional string)

- `ConfigurationFallback.entity.ts` - Fallback chain logic
  - scenario_default_config (JSON)
  - global_default_config (JSON)
  - resolve(): JSON

**Domain Events:**
- `ConfigurationRequested.event.ts`
- `ConfigurationDelivered.event.ts`
- `FallbackUsed.event.ts` (with reason: scenario_not_found | version_incompatible | server_error)
- `ExperimentResolved.event.ts`

**Domain Errors:**
- `ScenarioNotFoundError`
- `IncompatibleVersionError`
- `InvalidPlatformError`

**Repository Interfaces:**
- `IConfigurationRepository.interface.ts`
  - findByScenarioPlatformVersion(scenarioId, platform, version): Promise<ConfigurationResponse | null>
  - findDefaultForScenario(scenarioId): Promise<JSON | null>
  - findGlobalDefault(): Promise<JSON>

### 2. Application Layer (packages/admin-backend/application/)

#### 2.1 Use Cases
Location: `packages/admin-backend/application/src/configuration-delivery/use-cases/`

**GetConfigurationUseCase.ts**
```typescript
interface GetConfigurationInput {
  scenario_id: string
  platform: 'ios' | 'android' | 'web'
  render_engine_version: string
  user_id?: string
  experiment_id?: string
}

interface GetConfigurationOutput {
  schema_version: string
  render_engine: {
    min_version: string
    max_version: string
  }
  scenario_id: string
  platform: string
  last_modified: string
  etag: string
  config: Record<string, any>
  experiment_variant?: string
}

class GetConfigurationUseCase {
  execute(input: GetConfigurationInput): Promise<GetConfigurationOutput>
}
```

**Resolution Logic:**
1. Parse and validate input parameters
2. If user_id and experiment_id provided → resolve experiment variant
3. Query configuration by (scenario_id, platform, render_engine_version, variant?)
4. Check version compatibility
5. If not found or incompatible:
   - Try scenario default
   - Try global default
   - Emit FallbackUsed event
6. Build response with cache metadata
7. Emit ConfigurationDelivered event
8. Return response

#### 2.2 Services
**ExperimentResolverService.ts**
- Integrates with A/B Testing domain or external service
- resolveVariant(userId, experimentId): Promise<string | null>
- Handles failures gracefully (returns null → base variant)

#### 2.3 DTOs
- `GetConfigurationRequestDTO.ts` - Input validation
- `GetConfigurationResponseDTO.ts` - Output mapping

### 3. Infrastructure Layer (apps/admin-backend/src/infrastructure/)

#### 3.1 Database Schema Extension
Location: `apps/admin-backend/src/infrastructure/configuration-delivery/`

**Tables:**
```typescript
// configuration.table.ts
export const configurationTable = pgTable('configurations', {
  id: uuid('id').primaryKey().defaultRandom(),
  scenario_id: text('scenario_id').notNull(),
  platform: text('platform').notNull(), // 'ios' | 'android' | 'web' | 'all'
  schema_version: text('schema_version').notNull(),
  min_render_engine_version: text('min_render_engine_version').notNull(),
  max_render_engine_version: text('max_render_engine_version').notNull(),
  config_json: jsonb('config_json').notNull(),
  experiment_variant: text('experiment_variant'), // null = base variant
  is_default: boolean('is_default').default(false),
  etag: text('etag').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// global_defaults.table.ts
export const globalDefaultsTable = pgTable('global_defaults', {
  id: uuid('id').primaryKey().defaultRandom(),
  platform: text('platform').notNull(), // 'ios' | 'android' | 'web'
  config_json: jsonb('config_json').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})
```

**Indexes:**
- `(scenario_id, platform, schema_version)` - Primary lookup
- `(scenario_id, is_default)` - Default lookup
- `etag` - Cache validation

#### 3.2 Repository Implementation
**ConfigurationRepository.ts**
- Implements `IConfigurationRepository`
- Uses Drizzle ORM for queries
- Handles version range queries with semantic version comparison

#### 3.3 Caching Strategy
**CacheService.ts**
- Generate ETag from config hash (MD5/SHA256)
- Store last_modified from database timestamp
- Implement If-None-Match and If-Modified-Since validation
- Return 304 Not Modified when appropriate

### 4. API Routes (apps/admin-backend/src/)

#### 4.1 REST Endpoint
Location: `apps/admin-backend/src/routes/configuration.routes.ts`

**GET /api/v1/config**
```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const configQuerySchema = z.object({
  scenario_id: z.string().min(1),
  platform: z.enum(['ios', 'android', 'web']),
  render_engine_version: z.string().regex(/^\d+\.\d+\.\d+$/),
  user_id: z.string().optional(),
  experiment_id: z.string().optional(),
})

app.get(
  '/api/v1/config',
  zValidator('query', configQuerySchema),
  async (c) => {
    const query = c.req.valid('query')

    // Check cache headers
    const ifNoneMatch = c.req.header('If-None-Match')
    const ifModifiedSince = c.req.header('If-Modified-Since')

    // Execute use case
    const result = await getConfigurationUseCase.execute(query)

    // Check cache match
    if (ifNoneMatch === result.etag) {
      return c.body(null, 304)
    }

    // Set cache headers
    c.header('ETag', result.etag)
    c.header('Last-Modified', new Date(result.last_modified).toUTCString())
    c.header('Cache-Control', 'max-age=60')

    return c.json(result, 200)
  }
)
```

**Error Handling:**
- 404 → Return scenario default or global default (still 200 OK with default config)
- 409 → Return compatible version or default (still 200 OK)
- 500 → Return global default (still 200 OK)
- Log all fallback uses for monitoring

#### 4.2 WebSocket Endpoint (Debug Mode)
Location: `apps/admin-backend/src/routes/debug.routes.ts`

**WS /api/v1/debug/config/subscribe**
```typescript
import { WSContext } from 'hono/ws'

app.get(
  '/api/v1/debug/config/subscribe',
  upgradeWebSocket((c) => {
    return {
      onOpen: (evt, ws) => {
        // Subscribe to schema updates
        subscribeToSchemaChanges((event) => {
          ws.send(JSON.stringify({
            event: 'schema_updated',
            scenario_id: event.scenario_id,
            schema_version: event.schema_version,
          }))
        })
      },
      onClose: () => {
        // Cleanup subscription
      },
    }
  })
)
```

### 5. Experiment Integration

#### 5.1 External Service Client
Location: `apps/admin-backend/src/infrastructure/experiment/`

**ExperimentServiceClient.ts**
```typescript
class ExperimentServiceClient {
  async resolveVariant(
    userId: string,
    experimentId: string
  ): Promise<string | null> {
    try {
      // Call external experiment service
      const response = await fetch(`${EXPERIMENT_SERVICE_URL}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, experiment_id: experimentId }),
      })

      if (!response.ok) return null

      const data = await response.json()
      return data.variant
    } catch (error) {
      logger.error('Experiment resolution failed', error)
      return null // Graceful degradation
    }
  }
}
```

#### 5.2 Internal Integration (Alternative)
If using internal A/B Testing domain:
- Import `UserAssignmentService` from domain
- Call `assignUserToTestGroup(userId, experimentId)`
- Map test group to configuration variant

### 6. Testing

#### 6.1 Domain Layer Tests
Location: `packages/admin-backend/domain/src/deployment-and-distribution/configuration-delivery/tests/`

**Unit Tests:**
- `ConfigurationRequest.vo.test.ts` - Validation logic
- `VersionCompatibility.vo.test.ts` - Compatibility checks
- `ConfigurationResponse.entity.test.ts` - Business rules
- `ConfigurationFallback.entity.test.ts` - Fallback chain

#### 6.2 Application Layer Tests
Location: `packages/admin-backend/application/src/configuration-delivery/tests/`

**Integration Tests:**
- `GetConfigurationUseCase.test.ts`
  - Test successful resolution
  - Test fallback to scenario default
  - Test fallback to global default
  - Test version incompatibility handling
  - Test experiment resolution integration
  - Test cache metadata generation

#### 6.3 Infrastructure Tests
Location: `apps/admin-backend/src/infrastructure/configuration-delivery/tests/`

**Repository Tests:**
- `ConfigurationRepository.test.ts` - Database queries

#### 6.4 E2E Tests
Location: `apps/admin-backend/tests/e2e/`

**API Tests:**
- `configuration-api.test.ts`
  - GET /api/v1/config with valid parameters
  - GET with invalid parameters (validation errors)
  - GET with cache headers (304 response)
  - GET with experiment resolution
  - GET scenario not found (fallback)
  - GET version incompatible (fallback)
  - WebSocket subscription and updates

### 7. Database Migration

Create migration file:
```bash
cd apps/admin-backend
pnpm db:generate
```

Migration will create:
- `configurations` table
- `global_defaults` table
- Indexes for performance

### 8. Documentation

#### 8.1 Update API Documentation
- Add `/api/v1/config` endpoint details to API docs
- Document query parameters with examples
- Document response format and headers
- Document error handling and fallback behavior

#### 8.2 Sequence Diagram
Update or create: `docs/specs/configuration_api_sequence.png`
- Client request flow
- Experiment resolution
- Version compatibility check
- Fallback chain
- Cache validation

#### 8.3 Developer Guide
Create: `docs/guides/configuration-api.md`
- How to add new configurations
- How to set up experiments
- How to configure defaults
- Caching best practices
- Debugging with WebSocket

## Implementation Order

1. **Domain Layer** (1-2 days)
   - Value objects, entities, events, interfaces
   - Unit tests

2. **Application Layer** (1 day)
   - GetConfigurationUseCase
   - Integration tests with mocked repositories

3. **Infrastructure Layer** (1-2 days)
   - Database schema and migration
   - Repository implementation
   - Experiment service client

4. **API Routes** (1 day)
   - REST endpoint with validation
   - Error handling and fallbacks
   - Cache headers

5. **WebSocket Support** (0.5 day)
   - Debug endpoint
   - Real-time updates

6. **E2E Testing** (1 day)
   - Full flow testing
   - Edge cases and fallbacks

7. **Documentation** (0.5 day)
   - API docs
   - Developer guide

**Total Estimated Time: 6-8 days**

## Dependencies

- Existing Schema Management domain (for schema structure)
- Existing A/B Testing domain (optional, for experiment resolution)
- Database (PostgreSQL with Drizzle ORM)
- HTTP framework (Hono)

## Future Enhancements (Post-MVP)

1. **Authentication & Authorization**
   - API keys or JWT tokens
   - Rate limiting per client

2. **Advanced Caching**
   - CDN integration
   - Edge caching
   - Distributed cache (Redis)

3. **Analytics**
   - Configuration fetch metrics
   - Fallback usage tracking
   - Version adoption rates

4. **Conditional Logic**
   - User segment targeting
   - Feature flags
   - Geographic targeting

5. **Configuration Validation**
   - Schema validation on publish
   - Automated compatibility testing

## Rollout Strategy

1. Deploy backend with new endpoints
2. Test with iOS playground app
3. Test with Android playground app
4. Test with web playground app
5. Monitor fallback usage and errors
6. Gradually roll out to production apps
