# ConstraintViolationError Domain Error

## Overview

ConstraintViolationError represents failures that occur when domain constraints are violated during domain operations. This error is thrown when values or operations violate established domain constraints, invariants, or business rules that define the boundaries and limitations of the domain model.

## Error Details

- **Error Name**: ConstraintViolationError
- **Error Code**: `CONSTRAINT_VIOLATION`
- **Category**: BusinessRuleViolation
- **Class Location**: `packages/domain/src/kernel/errors/constraint-violation.error.ts`
- **Thrown By**: Domain services, entity methods, constraint validators, domain operations
- **Business Context**: Domain constraint violations that prevent proper domain operations due to violated domain rules or invariants

## Error Properties

- `constraintName`: string - The name of the domain constraint that was violated
- `violatedValue`: unknown - The value that violated the constraint

## Business Rules

1. **Domain Constraint Enforcement**: All domain constraints must be enforced during domain operations
2. **Constraint Identification**: Violated constraint name must be clearly specified
3. **Value Preservation**: The violating value must be preserved for analysis
4. **Immutability**: All error properties must be readonly and immutable
5. **Clear Messaging**: Error messages must clearly indicate which constraint was violated and by what value

## Error Context

### When Thrown

- When domain constraints are violated during entity operations
- When invariant conditions are broken in the domain model
- When business rules that define domain boundaries are violated
- When attempting operations that exceed domain limitations
- When values violate domain-specific constraints
- When domain integrity rules are broken

### Error Handling

- Display clear error messages indicating violated constraints
- Provide guidance on constraint requirements and limitations
- Prevent operations that violate domain constraints
- Log constraint violations for domain analysis
- Allow for constraint exception handling where appropriate
- Provide violating value information for debugging

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend

### Value Objects

- None directly, but may reference value objects in violated values

### Entities

- May reference entities in constraint violations

### Other Domain Errors

- **BusinessRuleViolationError** - Related error for general business rule violations
- **ValidationError** - Related error for validation failures
- **StateTransitionError** - Related error for invalid state transitions

## Factory Methods

### Static Factory Methods

- `static forConstraint(constraintName: string, violatedValue: unknown): ConstraintViolationError`
  - **Purpose**: Creates a constraint violation error for a violated domain constraint
  - **Parameters**: Constraint name and the value that violated the constraint
  - **Returns**: ConstraintViolationError with detailed constraint violation information
  - **Usage**: When a domain constraint is violated during domain operations

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test factory method with valid parameters
- Test factory method with different value types

#### Constraint Validation

- Test various constraint violation scenarios
- Verify constraint names are preserved correctly
- Test different violated value types
- Test constraint violation message formatting

### Integration Tests

#### Error Throwing

- Verify error is thrown when domain constraint is violated
- Verify error is not thrown when domain constraints are satisfied
- Verify error properties contain correct constraint violation information
- Test various constraint violation scenarios

### Error Handling Tests

#### Error Catching

- Handler catches ConstraintViolationError correctly
- Handler processes constraint violation appropriately
- Handler displays user-friendly constraint violation messages
- Handler prevents operations that violate domain constraints

## Serialization

### JSON Format

```json
{
  "name": "ConstraintViolationError",
  "message": "Domain constraint 'maximum_order_amount' has been violated. Value: 10000",
  "code": "CONSTRAINT_VIOLATION",
  "metadata": {
    "constraintName": "maximum_order_amount",
    "violatedValue": 10000
  }
}
```

### Serialization Rules

- All constraint and value data must be serializable
- Use consistent constraint naming conventions
- Include violating values for analysis
- Handle null and undefined values consistently
- Preserve constraint names for domain analysis

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
Location: `packages/domain/src/kernel/errors/constraint-violation.error.ts`
