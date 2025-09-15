# ServiceUnavailableError Domain Error

## Overview

ServiceUnavailableError represents failures that occur when a service is temporarily unavailable or cannot be accessed. This error is thrown when service operations fail due to service downtime, network issues, or temporary service unavailability.

## Error Details

- **Error Name**: ServiceUnavailableError
- **Error Code**: `SERVICE_UNAVAILABLE`
- **Category**: ServiceError
- **Class Location**: `packages/domain/src/kernel/errors/service-unavailable.error.ts`
- **Thrown By**: Service clients, infrastructure services, external service integrations
- **Business Context**: Service availability failures that prevent proper business operations due to temporary service unavailability

## Error Properties

- `serviceName`: string - The name of the service that is unavailable
- `retryAfter`: number | undefined - Optional number of seconds to wait before retrying

## Business Rules

1. **Service Identification**: Service name must be clearly specified
2. **Retry Guidance**: Retry after time should be provided when available
3. **Temporary Nature**: This error indicates temporary unavailability
4. **Immutability**: All error properties must be readonly and immutable
5. **Clear Messaging**: Error messages must clearly indicate service unavailability

## Error Context

### When Thrown

- When external services are temporarily unavailable
- When network connectivity issues prevent service access
- When services are undergoing maintenance or updates
- When service rate limits are exceeded temporarily
- When services are experiencing high load or overload
- When infrastructure issues prevent service access

### Error Handling

- Display clear error messages indicating service unavailability
- Provide retry guidance when retry after time is available
- Implement retry mechanisms with exponential backoff
- Log service unavailability for monitoring and alerting
- Allow for graceful degradation or alternative service usage
- Provide service context for debugging and analysis

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend

### Value Objects

- None directly, but may reference service names that are value objects

### Entities

- None directly, but may reference entities in service operations

### Other Domain Errors

- **DomainServiceError** - Related error for general domain service failures

## Factory Methods

### Static Factory Methods

- `static forService(serviceName: string, retryAfter?: number): ServiceUnavailableError`
  - **Purpose**: Creates a service unavailable error for a temporarily unavailable service
  - **Parameters**: Service name and optional retry after time in seconds
  - **Returns**: ServiceUnavailableError with detailed service unavailability information
  - **Usage**: When a service is temporarily unavailable

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test factory method with valid parameters
- Test factory method with and without retry after time
- Test factory method with different service names

#### Service Availability Validation

- Test various service unavailable scenarios
- Verify service name and retry after time are preserved correctly
- Test different service types and retry scenarios
- Test service unavailable message formatting

### Integration Tests

#### Error Throwing

- Verify error is thrown when service is unavailable
- Verify error is not thrown when service is available
- Verify error properties contain correct service unavailability information
- Test various service unavailability scenarios

### Error Handling Tests

#### Error Catching

- Handler catches ServiceUnavailableError correctly
- Handler processes service unavailability appropriately
- Handler displays user-friendly service unavailable messages
- Handler implements retry mechanisms when appropriate

## Serialization

### JSON Format

```json
{
  "name": "ServiceUnavailableError",
  "message": "Service 'PaymentGateway' is temporarily unavailable. Retry after 30 seconds",
  "code": "SERVICE_UNAVAILABLE",
  "metadata": {
    "serviceName": "PaymentGateway",
    "retryAfter": 30
  }
}
```

### Serialization Rules

- All service and retry data must be serializable
- Use consistent service naming conventions
- Include retry after time when available
- Handle null and undefined values consistently
- Preserve service context for monitoring

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
