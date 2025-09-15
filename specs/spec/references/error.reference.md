# Domain Error Reference

## Overview

This document serves as the master reference for all domain errors in the system. It provides a centralized view of all error types, their relationships, and usage patterns.

## Error Categories

### Validation Errors

Errors that occur when input data fails validation rules or constraints.

| Error Type                                                         | Code                   | Purpose                        | Properties                                                        |
| ------------------------------------------------------------------ | ---------------------- | ------------------------------ | ----------------------------------------------------------------- |
| [ValidationError](./kernel/errors/validation-error.spec.md)        | `VALIDATION_ERROR`     | General validation failure     | `fields: FieldError[]`                                            |
| [ParseError](./kernel/errors/parse-error.spec.md)                  | `PARSE_ERROR`          | Data parsing failure           | `data: unknown`, `expectedFormat: string`, `parseContext: string` |
| [FormatError](./kernel/errors/format-error.spec.md)                | `FORMAT_ERROR`         | Data format validation failure | `fieldName: string`, `value: unknown`, `expectedFormat: string`   |
| [RequiredFieldError](./kernel/errors/required-field-error.spec.md) | `REQUIRED_FIELD_ERROR` | Missing required field         | `fieldName: string`, `entityType: string`                         |
| [InvalidValueError](./kernel/errors/invalid-value-error.spec.md)   | `INVALID_VALUE_ERROR`  | Invalid field value            | `fieldName: string`, `value: unknown`, `expectedFormat: string`   |
| [InvalidDataError](./kernel/errors/invalid-data-error.spec.md)     | `INVALID_DATA_ERROR`   | Invalid data structure         | `data: unknown`, `expectedFormat: string`, `parseContext: string` |

### Business Rule Violations

Errors that occur when business rules or domain invariants are violated.

| Error Type                                                                          | Code                      | Purpose                         | Properties                                                                                               |
| ----------------------------------------------------------------------------------- | ------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [BusinessRuleViolationError](./kernel/errors/business-rule-violation-error.spec.md) | `BUSINESS_RULE_VIOLATION` | General business rule violation | `ruleName: string`, `context: Record<string, unknown>`                                                   |
| [StateTransitionError](./kernel/errors/state-transition-error.spec.md)              | `STATE_TRANSITION_ERROR`  | Invalid state transition        | `currentState: string`, `targetState: string`, `entityType: string`, `context?: Record<string, unknown>` |
| [ConstraintViolationError](./kernel/errors/constraint-violation-error.spec.md)      | `CONSTRAINT_VIOLATION`    | Domain constraint violation     | `constraintName: string`, `violatedValue: unknown`                                                       |

### Entity Errors

Errors related to entity operations and state.

| Error Type                                                                      | Code                    | Purpose                    | Properties                                                            |
| ------------------------------------------------------------------------------- | ----------------------- | -------------------------- | --------------------------------------------------------------------- |
| [EntityNotFoundError](./kernel/errors/entity-not-found-error.spec.md)           | `ENTITY_NOT_FOUND`      | Entity not found by ID     | `entityType: string`, `entityId: string`                              |
| [NotFoundError](./kernel/errors/not-found-error.spec.md)                        | `NOT_FOUND`             | General resource not found | `entityType: string`, `entityId: string`                              |
| [EntityAlreadyExistsError](./kernel/errors/entity-already-exists-error.spec.md) | `ENTITY_ALREADY_EXISTS` | Entity already exists      | `entityType: string`, `entityId: string`                              |
| [EntityStateError](./kernel/errors/entity-state-error.spec.md)                  | `ENTITY_STATE_ERROR`    | Invalid entity state       | `entityType: string`, `currentState: string`, `requiredState: string` |

### Service Errors

Errors from domain services and external integrations.

| Error Type                                                                   | Code                   | Purpose                         | Properties                                                           |
| ---------------------------------------------------------------------------- | ---------------------- | ------------------------------- | -------------------------------------------------------------------- |
| [DomainServiceError](./kernel/errors/domain-service-error.spec.md)           | `DOMAIN_SERVICE_ERROR` | General domain service error    | `serviceName: string`, `operation: string`, `originalError?: string` |
| [ServiceUnavailableError](./kernel/errors/service-unavailable-error.spec.md) | `SERVICE_UNAVAILABLE`  | Service temporarily unavailable | `serviceName: string`, `retryAfter?: number`                         |

## Error Relationships

### Validation Error Hierarchy

```
ValidationError (parent)
├── FormatError
├── InvalidValueError
├── RequiredFieldError
├── ParseError
└── InvalidDataError
```

### Entity Error Hierarchy

```
NotFoundError (general)
└── EntityNotFoundError (specific)

EntityAlreadyExistsError (sibling)
EntityStateError (sibling)
```

### Business Rule Error Hierarchy

```
BusinessRuleViolationError (parent)
├── ConstraintViolationError
└── StateTransitionError
```

## Usage Guidelines

### When to Use Each Error Type

1. **ValidationError**: Use for general validation failures with multiple field errors
2. **FormatError**: Use for format-specific validation failures (email, phone, etc.)
3. **InvalidValueError**: Use for value-specific validation failures (UUID, ranges, etc.)
4. **RequiredFieldError**: Use when required fields are missing
5. **ParseError**: Use when data cannot be parsed into expected format
6. **InvalidDataError**: Use when data structures are malformed
7. **BusinessRuleViolationError**: Use for general business rule violations
8. **ConstraintViolationError**: Use for domain constraint violations
9. **StateTransitionError**: Use for invalid state transitions
10. **EntityNotFoundError**: Use when specific entities are not found
11. **NotFoundError**: Use for general resource not found scenarios
12. **EntityAlreadyExistsError**: Use when duplicate entities are created
13. **EntityStateError**: Use when entities are in invalid states
14. **DomainServiceError**: Use for domain service operation failures
15. **ServiceUnavailableError**: Use when services are temporarily unavailable

### Error Code Standards

- Use UPPER_SNAKE_CASE format
- Be descriptive and specific
- Avoid abbreviations when possible
- Use consistent naming patterns within categories

### Serialization Standards

All errors follow this JSON structure:

```json
{
  "name": "ErrorClassName",
  "message": "Human readable error message",
  "code": "ERROR_CODE",
  "metadata": {
    "property1": "value1",
    "property2": "value2"
  }
}
```

## Cross-Reference Matrix

| Error                      | Related Errors                                                            |
| -------------------------- | ------------------------------------------------------------------------- |
| ValidationError            | FormatError, InvalidValueError, RequiredFieldError                        |
| FormatError                | ValidationError, ParseError, InvalidValueError                            |
| InvalidValueError          | ValidationError, FormatError, ParseError                                  |
| ParseError                 | ValidationError, FormatError, InvalidDataError                            |
| RequiredFieldError         | ValidationError, ParseError, InvalidDataError                             |
| InvalidDataError           | ValidationError, ParseError, RequiredFieldError                           |
| BusinessRuleViolationError | ConstraintViolationError, StateTransitionError, EntityStateError          |
| ConstraintViolationError   | BusinessRuleViolationError, ValidationError, StateTransitionError         |
| StateTransitionError       | BusinessRuleViolationError, EntityStateError, ConstraintViolationError    |
| EntityNotFoundError        | NotFoundError, InvalidValueError                                          |
| NotFoundError              | EntityNotFoundError, InvalidValueError                                    |
| EntityAlreadyExistsError   | EntityNotFoundError, ConstraintViolationError, BusinessRuleViolationError |
| EntityStateError           | StateTransitionError, BusinessRuleViolationError, EntityNotFoundError     |
| DomainServiceError         | ServiceUnavailableError, BusinessRuleViolationError                       |
| ServiceUnavailableError    | DomainServiceError                                                        |

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
