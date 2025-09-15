# StateTransitionError Domain Error

## Overview

StateTransitionError represents failures that occur when invalid state transitions are attempted on entities or objects. This error is thrown when operations try to change the state of an entity from one state to another in a way that violates the defined state machine or business rules.

## Error Details

- **Error Name**: StateTransitionError
- **Error Code**: `STATE_TRANSITION_ERROR`
- **Category**: BusinessRuleViolation
- **Class Location**: `packages/domain/src/kernel/errors/state-transition.error.ts`
- **Thrown By**: Entity state methods, domain services, state machines, workflow engines
- **Business Context**: Invalid state transition failures that prevent proper entity state changes due to violated state machine rules

## Error Properties

- `currentState`: string - The current state of the entity
- `targetState`: string - The target state that was attempted
- `entityType`: string - The type of entity attempting the state transition
- `context`: Record<string, unknown> - Optional additional context information about the transition

## Business Rules

1. **State Machine Enforcement**: All state transitions must follow defined state machine rules
2. **State Validation**: Current and target states must be valid states for the entity type
3. **Transition Rules**: Only allowed transitions between states are permitted
4. **Entity Context**: Entity type must be specified to provide proper context
5. **Immutability**: All error properties must be readonly and immutable

## Error Context

### When Thrown

- When attempting invalid state transitions on entities
- When trying to change entity state in ways not permitted by business rules
- When state machine rules are violated during workflow operations
- When attempting to transition from a terminal state
- When trying to transition to an invalid state for the entity type
- When business logic prevents certain state transitions

### Error Handling

- Display clear error messages indicating invalid state transitions
- Provide guidance on valid state transitions for the entity
- Prevent invalid state changes from occurring
- Log state transition violations for business analysis
- Allow for state transition exception handling where appropriate
- Provide context information for state transition analysis

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend

### Value Objects

- None directly, but may reference state values that are value objects

### Entities

- Referenced by entityType property

### Other Domain Errors

- **BusinessRuleViolationError** - Related error for general business rule violations
- **EntityStateError** - Related error for invalid entity states
- **ConstraintViolationError** - Related error for domain constraint violations

## Factory Methods

### Static Factory Methods

- `static forTransition(params: { currentState: string; targetState: string; entityType: string; context?: Record<string, unknown> }): StateTransitionError`
  - **Purpose**: Creates a state transition error for an invalid state change attempt
  - **Parameters**: Current state, target state, entity type, and optional context
  - **Returns**: StateTransitionError with detailed state transition failure information
  - **Usage**: When an invalid state transition is attempted on an entity

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test factory method with valid parameters
- Test factory method with context information
- Test factory method without context

#### State Transition Validation

- Test various invalid state transition scenarios
- Verify state information is preserved correctly
- Test different entity types and states
- Test context information preservation

### Integration Tests

#### Error Throwing

- Verify error is thrown when invalid state transition is attempted
- Verify error is not thrown when valid state transitions are performed
- Verify error properties contain correct state transition information
- Test various state transition violation scenarios

### Error Handling Tests

#### Error Catching

- Handler catches StateTransitionError correctly
- Handler processes state transition failure appropriately
- Handler displays user-friendly state transition error messages
- Handler prevents invalid state transitions

## Serialization

### JSON Format

```json
{
  "name": "StateTransitionError",
  "message": "Invalid state transition from 'pending' to 'completed' for Order",
  "code": "STATE_TRANSITION_ERROR",
  "metadata": {
    "currentState": "pending",
    "targetState": "completed",
    "entityType": "Order",
    "context": {
      "orderId": "ord-123",
      "reason": "payment_not_confirmed"
    }
  }
}
```

### Serialization Rules

- All state and context data must be serializable
- Use consistent state naming conventions
- Include entity type for clear context
- Handle null and undefined values consistently
- Preserve state information for analysis

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
