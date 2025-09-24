# Configuration API Implementation

This document describes the implementation of the Configuration API based on the specification in `/docs/specs/configuration-api.spec.md`.

## Overview

The Configuration API delivers backend-driven UI (BDUI) schemas to client applications (Android, iOS, Web). It supports versioning, caching, experiment resolution, and fallback mechanisms.

## Architecture

The implementation follows a clean architecture pattern with the following layers:

- **Domain Layer** (`packages/domain/`): Core business entities and rules
- **Application Layer** (`packages/application/`): Use cases and application services
- **Infrastructure Layer** (`packages/infrastructure/`): External dependencies and implementations
- **Presentation Layer** (`apps/admin-backend/`): HTTP API endpoints and controllers

## API Endpoints

### GET /api/v1/config

Fetch a configuration schema for a given scenario.

**Query Parameters:**
- `scenario_id` (required): Unique ID of the UI scenario (e.g., "onboarding_flow")
- `platform` (required): Client platform: `ios`, `android`, `web`
- `render_engine_version` (required): Version of the client RenderEngine (semantic version)
- `user_id` (required): User identifier for experiment resolution
- `experiment_id` (optional): Override experiment variant

**Example Request:**
```http
GET /api/v1/config?scenario_id=onboarding&platform=ios&render_engine_version=1.2.0&user_id=12345
```

**Example Response:**
```json
{
  "schema_version": "1.4.0",
  "render_engine": {
    "min_version": "1.2.0",
    "max_version": "2.0.0"
  },
  "scenario_id": "onboarding",
  "platform": "ios",
  "last_modified": "2025-09-20T12:30:00Z",
  "etag": "abc123etag",
  "config": {
    "type": "Screen",
    "id": "onboarding_main",
    "children": [
      {
        "type": "Text",
        "props": { "text": "Welcome to Avito!" }
      },
      {
        "type": "Button",
        "props": { "label": "Continue", "action": "next_step" }
      }
    ]
  }
}
```

### GET /api/v1/config/default

Return the default schema for a scenario or global default.

**Query Parameters:**
- `scenario_id` (optional): If provided, returns default schema for that scenario
- `platform` (optional): Target platform

**Example Request:**
```http
GET /api/v1/config/default?scenario_id=onboarding&platform=ios
```

### WS /api/v1/debug/config/subscribe

WebSocket endpoint for real-time schema updates (debug mode only).

**Example Message (server → client):**
```json
{
  "event": "schema_updated",
  "scenario_id": "onboarding",
  "schema_version": "1.5.0",
  "timestamp": "2025-09-20T12:35:00Z"
}
```

## Error Handling

- **400 Bad Request**: Invalid request parameters
- **404 Not Found**: Scenario not found → Returns default schema
- **409 Conflict**: RenderEngine version not supported → Returns compatible schema or default
- **500 Internal Server Error**: Server failure → Returns default schema

## Caching

The API supports HTTP caching with:
- `ETag` headers for cache validation
- `Last-Modified` headers for conditional requests
- `Cache-Control` headers with appropriate max-age values
- Support for `If-None-Match` and `If-Modified-Since` headers

## Experiment Resolution

The system integrates with experiment services to resolve schema variants:
- 90% of users get the "base" variant (default behavior)
- 10% of users get the "experiment" variant (new features)
- Direct experiment_id override is supported for testing

## Development

### Running the Server

```bash
cd apps/admin-backend
npm run dev
```

The server will start on `http://localhost:3050` with the following endpoints:
- `GET /health` - Health check
- `GET /json-schema` - Legacy endpoint (backward compatibility)
- `GET /api/v1/config` - Main configuration endpoint
- `GET /api/v1/config/default` - Default configuration endpoint
- `WS /api/v1/debug/config/subscribe` - Debug WebSocket endpoint

### Testing the API

**Example curl commands:**

```bash
# Get configuration
curl "http://localhost:3050/api/v1/config?scenario_id=onboarding&platform=ios&render_engine_version=1.0.0&user_id=12345"

# Get default configuration
curl "http://localhost:3050/api/v1/config/default?scenario_id=onboarding&platform=ios"

# Test caching with ETag
curl -H "If-None-Match: \"some-etag\"" "http://localhost:3050/api/v1/config?scenario_id=onboarding&platform=ios&render_engine_version=1.0.0&user_id=12345"
```

## Future Enhancements

1. **Database Integration**: Replace mock repository with actual database implementation
2. **Authentication**: Add authentication and authorization
3. **Rate Limiting**: Implement rate limiting for production
4. **Real Experiment Service**: Integrate with actual A/B testing services
5. **Metrics and Monitoring**: Add comprehensive logging and metrics
6. **Schema Validation**: Add runtime schema validation
7. **Admin Interface**: Create admin interface for managing configurations

## Dependencies

The implementation uses the following key dependencies:
- **Hono**: Web framework for the API server
- **Drizzle ORM**: Database ORM (prepared for future use)
- **Domain Value Objects**: Custom value objects for type safety
- **Clean Architecture**: Separation of concerns across layers

## Security Considerations

- No authentication required for MVP (as per spec)
- All responses are JSON with appropriate CORS headers
- Input validation on all endpoints
- SQL injection protection through ORM (when implemented)
- XSS protection through JSON-only responses