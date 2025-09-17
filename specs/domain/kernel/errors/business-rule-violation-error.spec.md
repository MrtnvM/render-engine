# BusinessRuleViolationError Domain Error

## Overview

BusinessRuleViolationError represents failures that occur when business rules or domain invariants are violated during domain operations. This error is thrown when operations attempt to violate established business logic, domain constraints, or business policies.

## Error Details

- **Error Name**: BusinessRuleViolationError
- **Error Code**: `BUSINESS_RULE_VIOLATION`
- **Category**: BusinessRuleViolation
- **Class Location**: `packages/domain/src/kernel/errors/business-rule-violation.error.ts`
- **Thrown By**: Domain services, entity methods, business rule validators, domain operations
- **Business Context**: Business rule violations that prevent proper business operations due to violated domain logic or business policies

## Error Properties

- `ruleName`: string - The name of the business rule that was violated
- `context`: Record<string, unknown> - Additional context information about the rule violation

## Business Rules

1. **Business Rule Enforcement**: All business rules must be enforced during domain operations
2. **Rule Identification**: Violated rule name must be clearly specified
3. **Context Preservation**: Context information must be preserved for debugging and analysis
4. **Immutability**: All error properties must be readonly and immutable
5. **Clear Messaging**: Error messages must clearly indicate which business rule was violated

## Error Context

### When Thrown

- When attempting to perform operations that violate business logic
- When domain invariants are broken during entity state changes
- When business policies are not followed during operations
- When attempting to perform operations outside of allowed business scenarios
- When business constraints are violated during data processing
- When attempting to perform operations that are not permitted by business rules

### Error Handling

- Display clear error messages indicating violated business rules
- Provide guidance on why the operation is not permitted
- Prevent operations that violate business rules
- Log business rule violations for business analysis
- Allow for business rule exception handling where appropriate
- Provide context information for business rule analysis

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend
  - **Location**: `packages/domain/src/kernel/errors/base.domain-error.ts`
  - **Purpose**: Provides common functionality for error structure, serialization, and metadata handling
  - **Required**: All domain errors must extend this class

### Value Objects

- None directly, but may reference value objects in context

### Entities

- May reference entities in context information

### Other Domain Errors

- **ConstraintViolationError** - Related error for domain constraint violations
- **StateTransitionError** - Related error for invalid state transitions
- **EntityStateError** - Related error for invalid entity states

## Factory Methods

### Static Factory Methods

- `static forRule(ruleName: string, context: Record<string, unknown> = {}): BusinessRuleViolationError`
  - **Purpose**: Creates a business rule violation error for a violated business rule
  - **Parameters**: Rule name and optional context information
  - **Returns**: BusinessRuleViolationError with detailed rule violation information
  - **Usage**: When a business rule is violated during domain operations

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test factory method with valid parameters
- Test factory method with context information
- Test factory method with empty context

#### Business Rule Validation

- Test various business rule violation scenarios
- Verify rule names are preserved correctly
- Test context information preservation
- Test different business rule types

### Integration Tests

#### Error Throwing

- Verify error is thrown when business rule is violated
- Verify error is not thrown when business rules are followed
- Verify error properties contain correct rule violation information
- Test various business rule violation scenarios

### Error Handling Tests

#### Error Catching

- Handler catches BusinessRuleViolationError correctly
- Handler processes rule violation appropriately
- Handler displays user-friendly business rule violation messages
- Handler prevents operations that violate business rules

## Serialization

### JSON Format

```json
{
  "name": "BusinessRuleViolationError",
  "message": "Business rule 'minimum_balance' has been violated",
  "code": "BUSINESS_RULE_VIOLATION",
  "metadata": {
    "ruleName": "minimum_balance",
    "context": {
      "accountId": "acc-123",
      "currentBalance": 50,
      "minimumRequired": 100
    }
  }
}
```

### Serialization Rules

- All context data must be serializable
- Use consistent business rule naming conventions
- Include relevant context information for analysis
- Handle null and undefined values consistently
- Preserve rule names for business analysis

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
Location: `packages/domain/src/kernel/errors/business-rule-violation.error.ts`
