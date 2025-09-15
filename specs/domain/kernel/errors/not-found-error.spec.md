# NotFoundError Domain Error

## Overview

NotFoundError represents failures that occur when a requested resource, entity, or data cannot be found. This error is thrown when lookup operations fail to locate the specified resource, indicating that the resource does not exist or is not accessible.

## Error Details

- **Error Name**: NotFoundError
- **Error Code**: `NOT_FOUND`
- **Category**: EntityError
- **Class Location**: `packages/domain/src/kernel/errors/not-found.error.ts`
- **Thrown By**: Repository implementations, lookup services, domain services, use cases
- **Business Context**: Resource lookup failures that prevent proper domain operations due to missing resources

## Error Properties

- `entityType`: string - The type of resource that was not found
- `entityId`: string - The identifier of the resource that was not found

## Business Rules

1. **Resource Existence**: Resources must exist before they can be accessed
2. **Resource Identification**: Resource type and ID must be clearly specified
3. **Lookup Validation**: Resource lookup operations must validate resource existence
4. **Immutability**: All error properties must be readonly and immutable
5. **Clear Messaging**: Error messages must clearly indicate which resource was not found

## Error Context

### When Thrown

- When attempting to retrieve a resource by ID that does not exist
- When trying to access non-existent resources or entities
- When resource lookup operations fail to find the specified resource
- When referencing resources in relationships that do not exist
- When attempting operations on resources that have been deleted
- When resource IDs are invalid or malformed

### Error Handling

- Display clear error messages indicating which resource was not found
- Provide guidance on resource existence and availability
- Prevent operations on non-existent resources
- Log resource not found errors for system monitoring
- Allow for resource creation or alternative resource selection
- Provide resource type and ID information for debugging

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend

### Value Objects

- May reference resource IDs that are value objects

### Entities

- Referenced by entityType property

### Other Domain Errors

- **EntityNotFoundError** - Related error for entity-specific not found scenarios
- **InvalidValueError** - Related error for invalid resource IDs

## Factory Methods

### Static Factory Methods

- `static forEntity(entityType: string, entityId: string): NotFoundError`
  - **Purpose**: Creates a not found error for a missing entity
  - **Parameters**: Entity type and entity identifier
  - **Returns**: NotFoundError with detailed entity not found information
  - **Usage**: When an entity lookup operation fails to find the specified entity

- `static forResource(resource: string, id: string): NotFoundError`
  - **Purpose**: Creates a not found error for a missing resource
  - **Parameters**: Resource name and resource identifier
  - **Returns**: NotFoundError with detailed resource not found information
  - **Usage**: When a resource lookup operation fails to find the specified resource

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test factory methods with valid parameters
- Test factory methods with different resource types and IDs

#### Resource Lookup Validation

- Test various resource not found scenarios
- Verify resource type and ID are preserved correctly
- Test different resource types and identifier formats
- Test resource not found message formatting

### Integration Tests

#### Error Throwing

- Verify error is thrown when resource is not found
- Verify error is not thrown when resource is found
- Verify error properties contain correct resource not found information
- Test various resource lookup failure scenarios

### Error Handling Tests

#### Error Catching

- Handler catches NotFoundError correctly
- Handler processes resource not found failure appropriately
- Handler displays user-friendly resource not found messages
- Handler prevents operations on non-existent resources

## Serialization

### JSON Format

```json
{
  "name": "NotFoundError",
  "message": "User with ID 'user-123' not found",
  "code": "NOT_FOUND",
  "metadata": {
    "entityType": "User",
    "entityId": "user-123"
  }
}
```

### Serialization Rules

- All resource type and ID data must be serializable
- Use consistent resource type naming conventions
- Include resource identifiers for debugging
- Handle null and undefined values consistently
- Preserve resource information for analysis

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
