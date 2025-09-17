# Domain Error Specification Writing Guide

## Overview

This guide provides a simplified template for writing domain error specifications in Domain-Driven Design projects. Domain errors represent business failures and validation issues in the domain layer.

**Base Class**: All domain errors extend `DomainError` for consistent structure, serialization, and metadata handling.

## Domain Error Characteristics

- **Business-focused** - Represent domain failures, not technical issues
- **Immutable** - Cannot be changed after creation
- **Serializable** - Include all context needed for error handling
- **Recoverable** - Provide guidance for error recovery

## Specification Template

```markdown
# [ErrorName] Domain Error

## Overview

[Brief description of what the error represents and when it occurs]

## Properties

- propertyName: Type - Description of error-specific property
- code: string - Error code (inherited from base class)
- message: string - Human-readable error message (inherited from base class)

## Factory Methods

- `static create(params: {param: Type}): ErrorName`
  - **Throws:** Never (errors don't throw errors)
  - **Business rules:** Key validation rules for parameters
  - **Returns:** New error instance

### Common Factory Patterns

- `static forField(fieldName: string, value: unknown): ValidationError`
- `static forEntity(entityType: string, entityId: string): EntityNotFoundError`
- `static forRule(ruleName: string, context: object): BusinessRuleViolationError`

## Business Rules

1. **Primary Rule**: Core business logic that was violated
2. **Context Rule**: Required context for error handling

## Dependencies

- **DomainError** - Base class (provides code, message, metadata handling)
- **[RelatedValueObject]** - If error properties reference value objects

## Tests

### Essential Tests

- Create error with valid/invalid parameters
- Verify error properties and code
- Test factory methods
- Serialization/deserialization

## Metadata

Version: 1.0.0
Last Updated: [Date]
Location: `packages/domain/src/<module>/errors/<error-name>.error.ts`
```

## Specification Levels

### Simple Domain Errors (ValidationError, FormatError)

Use the basic template above with minimal business rules.

### Complex Domain Errors (StateTransitionError, BusinessRuleViolationError)

Add context properties for error recovery:

```markdown
## Properties

- entityType: string - Type of entity involved
- currentState: string - Current state of the entity
- targetState: string - Attempted target state
- context: Record<string, unknown> - Additional context for recovery
```

### Composite Domain Errors (AggregateValidationError)

Add collection properties for multiple failures:

```markdown
## Properties

- errors: DomainError[] - Collection of related errors
- entityId: string - ID of the aggregate that failed
```

## Common Error Categories

### Validation Errors

- **ValidationError** - Field validation failures
- **FormatError** - Data format issues
- **RequiredFieldError** - Missing required data

### Business Rule Violations

- **BusinessRuleViolationError** - Domain rule violations
- **StateTransitionError** - Invalid state changes
- **ConstraintViolationError** - Domain constraint failures

### Entity Errors

- **EntityNotFoundError** - Entity lookup failures
- **EntityAlreadyExistsError** - Duplicate entity creation
- **EntityStateError** - Invalid entity state for operation

## Guidelines

- **Keep it simple**: Only document what's actually needed
- **Focus on business value**: Explain why the error exists in domain terms
- **Minimal business rules**: Only document complex validation logic
- **Essential tests only**: Focus on creation, properties, and serialization
- **No boilerplate**: Skip sections that don't apply

## Implementation Pattern

```typescript
export class ValidationError extends DomainError {
  readonly fieldName: string
  readonly fieldValue: unknown

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.fieldName = params.metadata?.fieldName as string
    this.fieldValue = params.metadata?.fieldValue
  }

  static forField(fieldName: string, value: unknown): ValidationError {
    return new ValidationError({
      message: `Field '${fieldName}' validation failed`,
      code: 'VALIDATION_ERROR',
      metadata: { fieldName, fieldValue: value },
    })
  }
}
```

## Review Checklist

- [ ] Extends DomainError base class
- [ ] Clear business rules documented
- [ ] Essential tests identified
- [ ] Factory methods for common scenarios
- [ ] No unnecessary complexity
- [ ] Focused on domain purpose
