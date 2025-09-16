# EntityAlreadyExistsError Domain Error

## Overview

EntityAlreadyExistsError represents failures that occur when attempting to create an entity that already exists with the same identifier. This error is thrown when entity creation operations attempt to create duplicate entities, violating uniqueness constraints or business rules.

## Error Details

- **Error Name**: EntityAlreadyExistsError
- **Error Code**: `ENTITY_ALREADY_EXISTS`
- **Category**: EntityError
- **Class Location**: `packages/domain/src/kernel/errors/entity-already-exists.error.ts`
- **Thrown By**: Repository implementations, entity creation services, domain services, use cases
- **Business Context**: Entity creation failures that prevent proper domain operations due to duplicate entity existence

## Error Properties

- `entityType`: string - The type of entity that already exists
- `entityId`: string - The identifier of the entity that already exists

## Business Rules

1. **Entity Uniqueness**: Entities must have unique identifiers within their type
2. **Duplicate Prevention**: Duplicate entity creation must be prevented
3. **Entity Identification**: Entity type and ID must be clearly specified
4. **Immutability**: All error properties must be readonly and immutable
5. **Clear Messaging**: Error messages must clearly indicate which entity already exists

## Error Context

### When Thrown

- When attempting to create an entity with an ID that already exists
- When trying to create duplicate entities in the system
- When entity creation operations violate uniqueness constraints
- When attempting to create entities with existing unique attributes
- When duplicate entity detection occurs during creation processes
- When business rules prevent duplicate entity creation

### Error Handling

- Display clear error messages indicating which entity already exists
- Provide guidance on entity uniqueness requirements
- Prevent duplicate entity creation
- Log entity already exists errors for system monitoring
- Allow for entity update or alternative entity creation
- Provide entity type and ID information for debugging

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend

### Value Objects

- May reference entity IDs that are value objects

### Entities

- Referenced by entityType property

### Other Domain Errors

- **EntityNotFoundError** - Related error for missing entities
- **ConstraintViolationError** - Related error for constraint violations
- **BusinessRuleViolationError** - Related error for business rule violations

## Factory Methods

### Static Factory Methods

- `static forEntity(entityType: string, entityId: string): EntityAlreadyExistsError`
  - **Purpose**: Creates an entity already exists error for a duplicate entity
  - **Parameters**: Entity type and entity identifier
  - **Returns**: EntityAlreadyExistsError with detailed entity already exists information
  - **Usage**: When an entity creation operation attempts to create a duplicate entity

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test factory method with valid parameters
- Test factory method with different entity types and IDs

#### Entity Creation Validation

- Test various entity already exists scenarios
- Verify entity type and ID are preserved correctly
- Test different entity types and identifier formats
- Test entity already exists message formatting

### Integration Tests

#### Error Throwing

- Verify error is thrown when entity already exists
- Verify error is not thrown when entity does not exist
- Verify error properties contain correct entity already exists information
- Test various entity creation duplicate scenarios

### Error Handling Tests

#### Error Catching

- Handler catches EntityAlreadyExistsError correctly
- Handler processes entity already exists failure appropriately
- Handler displays user-friendly entity already exists messages
- Handler prevents duplicate entity creation

## Serialization

### JSON Format

```json
{
  "name": "EntityAlreadyExistsError",
  "message": "User with ID 'user-123' already exists",
  "code": "ENTITY_ALREADY_EXISTS",
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
Location: `packages/domain/src/kernel/errors/entity-already-exists.error.ts`
