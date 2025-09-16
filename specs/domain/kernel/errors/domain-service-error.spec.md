# DomainServiceError Domain Error

## Overview

DomainServiceError represents failures that occur when domain service operations fail due to internal errors, business logic failures, or service-level issues. This error is thrown when domain services encounter unexpected conditions or fail to complete their intended operations.

## Error Details

- **Error Name**: DomainServiceError
- **Error Code**: `DOMAIN_SERVICE_ERROR`
- **Category**: ServiceError
- **Class Location**: `packages/domain/src/kernel/errors/domain-service.error.ts`
- **Thrown By**: Domain services, service implementations, business logic services
- **Business Context**: Domain service operation failures that prevent proper business operations due to service-level issues

## Error Properties

- `serviceName`: string - The name of the domain service that failed
- `operation`: string - The operation that was being performed when the service failed
- `originalError`: string | undefined - Optional original error message or details

## Business Rules

1. **Service Operation Tracking**: Service name and operation must be clearly specified
2. **Error Context**: Original error information should be preserved when available
3. **Service Identification**: Service name must be clearly identifiable
4. **Immutability**: All error properties must be readonly and immutable
5. **Clear Messaging**: Error messages must clearly indicate service and operation failure

## Error Context

### When Thrown

- When domain service operations fail due to internal errors
- When business logic services encounter unexpected conditions
- When service operations cannot complete due to external dependencies
- When domain services fail to process business rules correctly
- When service implementations encounter runtime errors
- When business operations fail at the service level

### Error Handling

- Display clear error messages indicating service and operation failure
- Provide guidance on service availability and retry options
- Log service errors for system monitoring and debugging
- Allow for service retry mechanisms where appropriate
- Preserve original error information for debugging
- Provide service and operation context for analysis

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend

### Value Objects

- None directly, but may reference value objects in service operations

### Entities

- May reference entities in service operations

### Other Domain Errors

- **ServiceUnavailableError** - Related error for service availability issues
- **BusinessRuleViolationError** - Related error for business rule violations in services

## Factory Methods

### Static Factory Methods

- `static forService(serviceName: string, operation: string, originalError?: string): DomainServiceError`
  - **Purpose**: Creates a domain service error for a failed service operation
  - **Parameters**: Service name, operation name, and optional original error details
  - **Returns**: DomainServiceError with detailed service failure information
  - **Usage**: When a domain service operation fails

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test factory method with valid parameters
- Test factory method with and without original error
- Test factory method with different service names and operations

#### Service Error Validation

- Test various domain service error scenarios
- Verify service name and operation are preserved correctly
- Test different service types and operation names
- Test service error message formatting

### Integration Tests

#### Error Throwing

- Verify error is thrown when domain service operation fails
- Verify error is not thrown when domain service operations succeed
- Verify error properties contain correct service failure information
- Test various domain service failure scenarios

### Error Handling Tests

#### Error Catching

- Handler catches DomainServiceError correctly
- Handler processes service failure appropriately
- Handler displays user-friendly service error messages
- Handler prevents operations that depend on failed services

## Serialization

### JSON Format

```json
{
  "name": "DomainServiceError",
  "message": "Domain service 'OrderProcessingService' failed during operation 'processPayment'",
  "code": "DOMAIN_SERVICE_ERROR",
  "metadata": {
    "serviceName": "OrderProcessingService",
    "operation": "processPayment",
    "originalError": "Payment gateway timeout"
  }
}
```

### Serialization Rules

- All service and operation data must be serializable
- Use consistent service naming conventions
- Include original error information when available
- Handle null and undefined values consistently
- Preserve service context for debugging

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
Location: `packages/domain/src/kernel/errors/domain-service.error.ts`
