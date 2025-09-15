# Distribution Entity

## Overview

The Distribution entity manages the efficient delivery of schemas to client applications across the globe. It handles caching strategies, CDN management, client authentication, and network failure handling to ensure reliable and performant schema distribution.

## Fields

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| id | ID | Yes | - | Unique identifier for the distribution |
| releaseId | ID | Yes | - | Associated release ID |
| schemaId | ID | Yes | - | Schema being distributed |
| version | Version | Yes | - | Version of the schema being distributed |
| status | DistributionStatus | Yes | - | Current distribution status |
| cacheStrategy | CacheStrategy | Yes | - | Caching strategy for this distribution |
| cdnLocations | CDNLocation[] | Yes | [] | CDN endpoints where schema is available |
| clientRequests | ClientRequest[] | Yes | [] | History of client requests |
| metrics | DistributionMetrics | Yes | - | Performance and usage metrics |
| createdAt | Date | Yes | - | Timestamp when distribution was created |
| updatedAt | Date | Yes | - | Timestamp when distribution was last updated |
| expiresAt | Date | No | - | Timestamp when distribution expires |

## Methods

### create(params: CreateDistributionParams): Distribution

Creates a new distribution with the specified parameters.

**Parameters:**
- `params`: Object containing:
  - `releaseId`: Associated release ID
  - `schemaId`: Schema to distribute
  - `version`: Version of the schema
  - `cacheStrategy`: Caching strategy to use

**Returns:** New Distribution instance

**Throws:**
- `InvalidDistributionError` if required parameters are missing or invalid

### deployToCDN(location: CDNLocation): void

Deploys the schema to a CDN location.

**Parameters:**
- `location`: CDN location to deploy to

**Returns:** void

**Throws:**
- `CDNDeploymentError` if deployment fails
- `InvalidCDNLocationError` if location is invalid

### updateCacheStrategy(strategy: CacheStrategy): void

Updates the caching strategy for the distribution.

**Parameters:**
- `strategy`: New caching strategy

**Returns:** void

**Throws:**
- `InvalidCacheStrategyError` if strategy is invalid
- `CannotUpdateActiveDistributionError` if distribution is active

### handleClientRequest(request: ClientRequest): SchemaDelivery

Handles a client request for the schema.

**Parameters:**
- `request`: Client request details

**Returns:** Schema delivery response

**Throws:**
- `UnauthorizedRequestError` if client is not authorized
- `SchemaNotAvailableError` if schema is not available
- `RateLimitExceededError` if client rate limit is exceeded

### recordMetrics(metrics: Partial<DistributionMetrics>): void

Records distribution metrics.

**Parameters:**
- `metrics`: Metrics to record

**Returns:** void

### expire(): void

Expires the distribution, making it unavailable for new requests.

**Returns:** void

### validateAvailability(): boolean

Validates if the distribution is currently available.

**Returns:** True if available, false otherwise

### getOptimalCDNLocation(clientRegion: string): CDNLocation | null

Gets the optimal CDN location for a client region.

**Parameters:**
- `clientRegion`: Client's geographic region

**Returns:** Optimal CDN location or null if none available

## Business Rules & Invariants

1. **Global Optimization**: Schema delivery must be globally optimized for performance
2. **Cache Freshness**: Caching strategies must balance performance and data freshness
3. **Client Authentication**: All client requests must be authenticated and authorized
4. **Rate Limiting**: Clients must be rate limited to prevent abuse
5. **Graceful Degradation**: Network failures must be handled gracefully
6. **Cache Invalidation**: Cache must be invalidated when schemas are updated
7. **CDN Replication**: Schemas must be replicated across multiple CDN locations
8. **Metrics Collection**: Performance metrics must be collected for monitoring

## Dependencies

- **ID**: From `@render-engine/domain` - Unique identifier
- **Version**: Value object for semantic versioning
- **DistributionStatus**: Value object for distribution status
- **CacheStrategy**: Value object for caching strategy
- **CDNLocation**: Value object for CDN location
- **ClientRequest**: Entity for client requests
- **SchemaDelivery**: Entity for schema delivery
- **DistributionMetrics**: Value object for distribution metrics

## Events

### DistributionCreatedEvent

Emitted when a new distribution is created.

**Payload:**
```typescript
{
  distributionId: ID;
  releaseId: ID;
  schemaId: ID;
  version: string;
  cacheStrategy: string;
  createdAt: Date;
}
```

### DistributionDeployedEvent

Emitted when a distribution is deployed to a CDN location.

**Payload:**
```typescript
{
  distributionId: ID;
  cdnLocation: string;
  deployedAt: Date;
  deployedBy: ID;
}
```

### ClientRequestServedEvent

Emitted when a client request is served.

**Payload:**
```typescript
{
  distributionId: ID;
  clientId: ID;
  requestId: string;
  servedAt: Date;
  responseTime: number;
  cdnLocation: string;
}
```

### DistributionExpiredEvent

Emitted when a distribution expires.

**Payload:**
```typescript
{
  distributionId: ID;
  expiredAt: Date;
  reason: string;
}
```

## Tests

### Unit Tests

1. **Distribution Creation**
   - Should create distribution with valid parameters
   - Should throw error with missing required parameters
   - Should set initial status to PENDING
   - Should generate unique ID

2. **CDN Deployment**
   - Should deploy to CDN location
   - Should handle deployment failures
   - Should update CDN locations list
   - Should validate CDN location

3. **Cache Strategy Management**
   - Should update cache strategy
   - Should validate cache strategy
   - Should handle active distribution restrictions
   - Should invalidate cache on update

4. **Client Request Handling**
   - Should handle authorized requests
   - Should reject unauthorized requests
   - Should handle rate limiting
   - Should return schema delivery

5. **Metrics Collection**
   - Should record metrics
   - Should validate metrics format
   - Should aggregate metrics over time
   - Should handle metrics persistence

6. **Availability Management**
   - Should validate availability status
   - Should handle expiration
   - Should check CDN health
   - Should handle network failures

### Integration Tests

1. **End-to-End Distribution**
   - Should handle complete distribution lifecycle
   - Should integrate with CDN providers
   - Should handle multiple schema versions
   - Should support cache invalidation

2. **Client Request Flow**
   - Should handle client authentication
   - Should serve schemas efficiently
   - Should handle concurrent requests
   - Should provide consistent performance

## Serialization

### JSON Format

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "releaseId": "550e8400-e29b-41d4-a716-446655440001",
  "schemaId": "550e8400-e29b-41d4-a716-446655440002",
  "version": "1.0.0",
  "status": "ACTIVE",
  "cacheStrategy": {
    "type": "TIME_BASED",
    "ttl": 3600,
    "staleWhileRevalidate": 300
  },
  "cdnLocations": [
    {
      "region": "us-east-1",
      "endpoint": "https://cdn.example.com/schemas",
      "status": "ACTIVE"
    }
  ],
  "clientRequests": [],
  "metrics": {
    "totalRequests": 1250,
    "cacheHitRate": 0.85,
    "averageResponseTime": 45,
    "errorRate": 0.02
  },
  "createdAt": "2025-01-15T08:00:00Z",
  "updatedAt": "2025-01-15T10:30:00Z",
  "expiresAt": "2025-02-15T08:00:00Z"
}
```

### Serialization Rules

1. **ID Serialization**: IDs are serialized as UUID strings
2. **Date Serialization**: Dates are serialized as ISO 8601 strings
3. **Enum Serialization**: Status enums are serialized as strings
4. **Nested Objects**: Complex objects are serialized as nested objects
5. **Array Handling**: Empty arrays are included as empty arrays
6. **Null Handling**: Optional null fields are included as null

## Metadata

Version: 1.0.0
Last Updated: 2025-09-15
Status: Draft
Author: Deployment Domain Team
Bounded Context: Content Distribution