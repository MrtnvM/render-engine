# EntityNotFoundError Domain Error

## Overview

EntityNotFoundError represents failures that occur when an entity cannot be found by its identifier. This error is thrown when entity lookup operations fail to locate an entity with the specified ID, indicating that the entity does not exist in the system or is not accessible.

## Error Details

- **Error Name**: EntityNotFoundError
- **Error Code**: `ENTITY_NOT_FOUND`
- **Category**: EntityError
- **Class Location**: `packages/domain/src/kernel/errors/entity-not-found.error.ts`
- **Thrown By**: Repository implementations, entity lookup services, domain services, use cases
- **Business Context**: Entity lookup failures that prevent proper domain operations due to missing entities

## Error Properties

- `entityType`: string - The type of entity that was not found
- `entityId`: string - The identifier of the entity that was not found

## Business Rules

1. **Entity Existence**: Entities must exist before they can be operated upon
2. **Entity Identification**: Entity type and ID must be clearly specified
3. **Lookup Validation**: Entity lookup operations must validate entity existence
4. **Immutability**: All error properties must be readonly and immutable
5. **Clear Messaging**: Error messages must clearly indicate which entity was not found

## Error Context

### When Thrown

- When attempting to retrieve an entity by ID that does not exist
- When trying to update or delete a non-existent entity
- When entity lookup operations fail to find the specified entity
- When referencing entities in relationships that do not exist
- When attempting operations on entities that have been deleted
- When entity IDs are invalid or malformed

### Error Handling

- Display clear error messages indicating which entity was not found
- Provide guidance on entity existence and availability
- Prevent operations on non-existent entities
- Log entity not found errors for system monitoring
- Allow for entity creation or alternative entity selection
- Provide entity type and ID information for debugging

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend
  - **Location**: `packages/domain/src/kernel/errors/base.domain-error.ts`
  - **Purpose**: Provides common functionality for error structure, serialization, and metadata handling
  - **Required**: All domain errors must extend this class

### Value Objects

- May reference entity IDs that are value objects

### Entities

- Referenced by entityType property

### Other Domain Errors

- **NotFoundError** - Related error for general not found scenarios
- **InvalidValueError** - Related error for invalid entity IDs

## Factory Methods

### Static Factory Methods

- `static forEntity(entityType: string, entityId: string): EntityNotFoundError`
  - **Purpose**: Creates an entity not found error for a missing entity
  - **Parameters**: Entity type and entity identifier
  - **Returns**: EntityNotFoundError with detailed entity not found information
  - **Usage**: When an entity lookup operation fails to find the specified entity

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test factory method with valid parameters
- Test factory method with different entity types and IDs

#### Entity Lookup Validation

- Test various entity not found scenarios
- Verify entity type and ID are preserved correctly
- Test different entity types and identifier formats
- Test entity not found message formatting

### Integration Tests

#### Error Throwing

- Verify error is thrown when entity is not found
- Verify error is not thrown when entity is found
- Verify error properties contain correct entity not found information
- Test various entity lookup failure scenarios

### Error Handling Tests

#### Error Catching

- Handler catches EntityNotFoundError correctly
- Handler processes entity not found failure appropriately
- Handler displays user-friendly entity not found messages
- Handler prevents operations on non-existent entities

## Serialization

### JSON Format

```json
{
  "name": "EntityNotFoundError",
  "message": "User with ID 'user-123' not found",
  "code": "ENTITY_NOT_FOUND",
  "metadata": {
    "entityType": "User",
    "entityId": "user-123"
  }
}
```

### Serialization Rules

- All entity type and ID data must be serializable
- Use consistent entity type naming conventions
- Include entity identifiers for debugging
- Handle null and undefined values consistently
- Preserve entity information for analysis

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
Location: `packages/domain/src/kernel/errors/entity-not-found.error.ts`
