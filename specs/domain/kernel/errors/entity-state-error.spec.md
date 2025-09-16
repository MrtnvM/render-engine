# EntityStateError Domain Error

## Overview

EntityStateError represents failures that occur when an entity is in an invalid state for a particular operation. This error is thrown when operations are attempted on entities that are not in the correct state to perform the requested action, violating business rules or state machine constraints.

## Error Details

- **Error Name**: EntityStateError
- **Error Code**: `ENTITY_STATE_ERROR`
- **Category**: EntityError
- **Class Location**: `packages/domain/src/kernel/errors/entity-state.error.ts`
- **Thrown By**: Entity methods, domain services, state validators, business operations
- **Business Context**: Entity state validation failures that prevent proper domain operations due to invalid entity state

## Error Properties

- `entityType`: string - The type of entity that is in invalid state
- `currentState`: string - The current state of the entity
- `requiredState`: string - The state required for the operation

## Business Rules

1. **Entity State Validation**: Entities must be in valid states for operations
2. **State Requirements**: Operations must specify required entity states
3. **State Comparison**: Current and required states must be clearly specified
4. **Immutability**: All error properties must be readonly and immutable
5. **Clear Messaging**: Error messages must clearly indicate state mismatch

## Error Context

### When Thrown

- When attempting operations on entities in invalid states
- When entity state does not allow the requested operation
- When business rules require specific entity states for operations
- When state machine constraints are violated
- When entities are in terminal or locked states
- When operations are attempted on inactive or disabled entities

### Error Handling

- Display clear error messages indicating invalid entity state
- Provide guidance on required entity states for operations
- Prevent operations on entities in invalid states
- Log entity state errors for business analysis
- Allow for state transitions or alternative operations
- Provide state information for debugging and analysis

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend

### Value Objects

- May reference state values that are value objects

### Entities

- Referenced by entityType property

### Other Domain Errors

- **StateTransitionError** - Related error for invalid state transitions
- **BusinessRuleViolationError** - Related error for business rule violations
- **EntityNotFoundError** - Related error for missing entities

## Factory Methods

### Static Factory Methods

- `static forState(entityType: string, currentState: string, requiredState: string): EntityStateError`
  - **Purpose**: Creates an entity state error for an entity in invalid state
  - **Parameters**: Entity type, current state, and required state
  - **Returns**: EntityStateError with detailed entity state failure information
  - **Usage**: When an entity is in an invalid state for a requested operation

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test factory method with valid parameters
- Test factory method with different entity types and states

#### Entity State Validation

- Test various entity state error scenarios
- Verify entity type and states are preserved correctly
- Test different entity types and state combinations
- Test entity state error message formatting

### Integration Tests

#### Error Throwing

- Verify error is thrown when entity is in invalid state
- Verify error is not thrown when entity is in valid state
- Verify error properties contain correct entity state information
- Test various entity state validation scenarios

### Error Handling Tests

#### Error Catching

- Handler catches EntityStateError correctly
- Handler processes entity state failure appropriately
- Handler displays user-friendly entity state error messages
- Handler prevents operations on entities in invalid states

## Serialization

### JSON Format

```json
{
  "name": "EntityStateError",
  "message": "Order is in invalid state 'cancelled' for this operation. Required state: 'pending'",
  "code": "ENTITY_STATE_ERROR",
  "metadata": {
    "entityType": "Order",
    "currentState": "cancelled",
    "requiredState": "pending"
  }
}
```

### Serialization Rules

- All entity type and state data must be serializable
- Use consistent entity type and state naming conventions
- Include state information for analysis
- Handle null and undefined values consistently
- Preserve state information for debugging

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
Location: `packages/domain/src/kernel/errors/entity-state.error.ts`
