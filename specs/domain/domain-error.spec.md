# Domain Error Specification Writing Guide

## Overview

This guide provides a comprehensive template and guidelines for writing domain error specifications in Domain-Driven Design (DDD) projects. Domain error specifications serve as the single source of truth for domain errors, documenting their structure, purpose, usage, and handling requirements.

**Important**: All domain errors must extend the `DomainError` abstract class, which provides common functionality for error structure, serialization, and metadata handling. See the [DomainError Specification](./kernel/base.domain-error.spec.md) for details on the base class requirements.

## Specification Structure

### 1. Header Section

```markdown
# [ErrorName] Domain Error

## Overview

[Brief description of what the error represents and when it occurs]
```

**Guidelines:**

- Use clear, descriptive error names in past tense or descriptive form
- Provide a concise overview of the error's purpose
- Explain when and why the error is thrown
- Mention the business significance of the error

### 2. Error Details Section

```markdown
## Error Details

- **Error Name**: ErrorClassName
- **Error Code**: ERROR_CODE
- **Category**: ValidationError | BusinessRuleViolation | EntityError | ServiceError
- **Thrown By**: Method or operation that throws this error
- **Business Context**: Description of the business scenario
```

**Guidelines:**

- Use consistent error naming convention (e.g., `EntityActionError`)
- Specify which operations throw the error
- Document the business context and significance
- Categorize the error type appropriately

### 3. Error Properties Section

```markdown
## Error Properties

- propertyName: Type - Description of the property
- propertyName: Type | null - Optional property description
- propertyName: Type[] - Collection property description
```

**Guidelines:**

- List all error-specific properties with their types
- Use clear, descriptive property names
- Include nullability indicators (`| null | undefined`)
- Use array notation for collections (`[]`)
- Reference value objects and other entities by name
- Group related properties logically
- Ensure all properties are serializable

### 4. Business Rules Section

```markdown
## Business Rules

1. **Rule Name**: Description of the rule
2. **Another Rule**: Description of another rule
```

**Guidelines:**

- Number rules for easy reference
- Use descriptive rule names
- Explain the business logic clearly
- Include validation rules for error properties
- Document constraints and invariants
- Mention relationship constraints

### 5. Error Context Section

```markdown
## Error Context

### When Thrown

- Description of when this error is thrown
- Business conditions that must be met
- State conditions that trigger the error

### Error Handling

- How the error should be handled
- Recovery strategies
- User-facing error messages
```

**Guidelines:**

- Clearly define when the error is thrown
- Explain the business conditions
- Document handling requirements
- Mention recovery strategies

### 6. Dependencies Section

```markdown
## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend

### Value Objects

- ValueObjectName
- AnotherValueObject

### Entities

- RelatedEntity

### Other Domain Errors

- **RelatedError** - Description of related error
- **AnotherError** - Description of another related error
```

**Guidelines:**

- Categorize dependencies by type
- Use clear references to other components
- Document all related domain errors with descriptions
- Include all value objects used in error properties
- List related entities

### 7. Factory Methods Section

```markdown
## Factory Methods

### Static Factory Methods

- `static methodName(params: {param: Type}): ErrorName`
  - **Purpose**: Description of what this factory method does
  - **Parameters**: Description of parameters
  - **Validation rules**: If any should be followed
  - **Returns**: Description of returned error
  - **Usage**: When to use this factory method
```

**Guidelines:**

- List all static factory methods
- Document parameters and return values
- Explain when to use each factory method
- Provide usage examples
- Use descriptive method names

### 8. Tests Section

#### 8.1 Unit Tests Structure

```markdown
## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test factory methods
```

#### 8.2 Integration Tests

```markdown
### Integration Tests

#### Error Throwing

- Verify error is thrown when expected
- Verify error is not thrown when conditions not met
- Verify error properties are correct
```

#### 8.3 Error Handling Tests

```markdown
### Error Handling Tests

#### Error Catching

- Handler catches error correctly
- Handler processes error appropriately
- Handler performs expected recovery actions
```

**Testing Guidelines:**

- Cover all error creation scenarios
- Test all factory methods
- Include positive and negative test cases
- Test error handling and recovery
- Include integration scenarios
- Test error serialization

### 9. Serialization Section

````markdown
## Serialization

### JSON Format

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
````

### Serialization Rules

- All properties must be serializable
- Use consistent error code format
- Include relevant metadata
- Handle null and undefined values consistently

````

**Guidelines:**

- Provide example JSON format
- Document serialization rules
- Mention versioning considerations
- Explain handling of special values

### 10. Metadata Section

```markdown
## Metadata

Version: 1.0.0
Last Updated: [Date or reference to analysis]
````

## Writing Guidelines

### General Principles

1. **Clarity**: Write clear, unambiguous descriptions
2. **Completeness**: Cover all aspects of the error
3. **Consistency**: Use consistent formatting and terminology
4. **Accuracy**: Ensure all information is correct and up-to-date
5. **Maintainability**: Structure for easy updates and modifications

### Content Guidelines

1. **Business Focus**: Focus on business meaning, not technical implementation
2. **Error Naming**: Use descriptive names that convey business intent
3. **Message Design**: Create clear, actionable error messages
4. **Context Inclusion**: Include relevant context in error properties
5. **Recovery Guidance**: Provide guidance on error recovery

### Formatting Guidelines

1. **Headers**: Use consistent header hierarchy
2. **Lists**: Use bullet points for better readability
3. **Code**: Use backticks for error names and types
4. **Emphasis**: Use bold for important terms and error codes
5. **Structure**: Maintain consistent indentation and spacing

### Review Checklist

Before finalizing a domain error specification, ensure:

- [ ] Error name follows naming conventions
- [ ] Error properties are clearly documented with types
- [ ] Business rules are clearly stated and numbered
- [ ] Error context is well documented
- [ ] All dependencies are documented
- [ ] Factory methods are documented
- [ ] Serialization format is specified
- [ ] Test coverage is comprehensive
- [ ] Formatting is consistent throughout
- [ ] Content is accurate and up-to-date
- [ ] Language is clear and unambiguous

## Standard Domain Errors

### Validation Errors

#### ValidationError

- **Purpose**: General validation failure
- **Code**: `VALIDATION_ERROR`
- **Properties**: `fields: FieldError[]` - Array of field validation errors with details about each failed field
- **Usage**: When input data fails validation rules

#### ParseError

- **Purpose**: Data parsing failure
- **Code**: `PARSE_ERROR`
- **Properties**: `data: unknown`, `expectedFormat: string`, `parseContext: string`
- **Usage**: When data cannot be parsed into expected format

#### FormatError

- **Purpose**: Data format validation failure
- **Code**: `FORMAT_ERROR`
- **Properties**: `fieldName: string`, `value: unknown`, `expectedFormat: string`
- **Usage**: When data format is invalid

#### RequiredFieldError

- **Purpose**: Missing required field
- **Code**: `REQUIRED_FIELD_ERROR`
- **Properties**: `fieldName: string`, `entityType: string`
- **Usage**: When required field is missing

#### InvalidValueError

- **Purpose**: Invalid field value
- **Code**: `INVALID_VALUE_ERROR`
- **Properties**: `fieldName: string`, `value: unknown`, `expectedFormat: string`
- **Usage**: When field values are invalid or don't meet specific value requirements

#### InvalidDataError

- **Purpose**: Invalid data structure
- **Code**: `INVALID_DATA_ERROR`
- **Properties**: `data: unknown`, `expectedFormat: string`, `parseContext: string`
- **Usage**: When data structures are invalid or malformed

### Business Rule Violations

#### BusinessRuleViolationError

- **Purpose**: General business rule violation
- **Code**: `BUSINESS_RULE_VIOLATION`
- **Properties**: `ruleName: string`, `context: Record<string, unknown>`
- **Usage**: When business rules are violated

#### StateTransitionError

- **Purpose**: Invalid state transition
- **Code**: `STATE_TRANSITION_ERROR`
- **Properties**: `currentState: string`, `targetState: string`, `entityType: string`
- **Usage**: When invalid state transition is attempted

#### ConstraintViolationError

- **Purpose**: Domain constraint violation
- **Code**: `CONSTRAINT_VIOLATION`
- **Properties**: `constraintName: string`, `violatedValue: unknown`
- **Usage**: When domain constraints are violated

### Entity Errors

#### EntityNotFoundError

- **Purpose**: Entity not found by ID
- **Code**: `ENTITY_NOT_FOUND`
- **Properties**: `entityType: string`, `entityId: string`
- **Usage**: When entity lookup fails

#### NotFoundError

- **Purpose**: General resource not found
- **Code**: `NOT_FOUND`
- **Properties**: `entityType: string`, `entityId: string`
- **Usage**: When any resource lookup fails

#### EntityAlreadyExistsError

- **Purpose**: Entity already exists
- **Code**: `ENTITY_ALREADY_EXISTS`
- **Properties**: `entityType: string`, `entityId: string`
- **Usage**: When duplicate entity creation is attempted

#### EntityStateError

- **Purpose**: Invalid entity state
- **Code**: `ENTITY_STATE_ERROR`
- **Properties**: `entityType: string`, `currentState: string`, `requiredState: string`
- **Usage**: When entity is in invalid state for operation

### Service Errors

#### DomainServiceError

- **Purpose**: General domain service error
- **Code**: `DOMAIN_SERVICE_ERROR`
- **Properties**: `serviceName: string`, `operation: string`, `originalError?: string`
- **Usage**: When domain service operations fail

#### ServiceUnavailableError

- **Purpose**: Service temporarily unavailable
- **Code**: `SERVICE_UNAVAILABLE`
- **Properties**: `serviceName: string`, `retryAfter?: number`
- **Usage**: When service is temporarily unavailable

## Example Template

````markdown
# [ErrorName] Domain Error

## Overview

[Brief description of what the error represents and when it occurs]

## Error Details

- **Error Name**: [ErrorClassName]
- **Error Code**: [ERROR_CODE]
- **Category**: ValidationError | BusinessRuleViolation | EntityError | ServiceError
- **Thrown By**: [Method or operation that throws this error]
- **Business Context**: [Description of the business scenario]

## Error Properties

- [propertyName]: [Type] - [Description of the property]
- [propertyName]: [Type] | null - [Optional property description]
- [propertyName]: [Type][] - [Collection property description]

## Business Rules

1. **[Rule Name]**: [Description of the rule]
2. **[Another Rule]**: [Description of another rule]

## Error Context

### When Thrown

- [Description of when this error is thrown]
- [Business conditions that must be met]
- [State conditions that trigger the error]

### Error Handling

- [How the error should be handled]
- [Recovery strategies]
- [User-facing error messages]

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend

### Value Objects

- [ValueObjectName]
- [AnotherValueObject]

### Entities

- [RelatedEntity]

### Other Domain Errors

- **[RelatedError]** - [Description of related error]
- **[AnotherError]** - [Description of another related error]

## Factory Methods

### Static Factory Methods

- `static [methodName]([params]: {[param]: [Type]}): [ErrorName]Error`
  - **Purpose**: [Description of what this factory method does]
  - **Parameters**: [Description of parameters]
  - **Returns**: [Description of returned error]
  - **Usage**: [When to use this factory method]

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test factory methods

### Integration Tests

#### Error Throwing

- Verify error is thrown when expected
- Verify error is not thrown when conditions not met
- Verify error properties are correct

### Error Handling Tests

#### Error Catching

- Handler catches error correctly
- Handler processes error appropriately
- Handler performs expected recovery actions

## Serialization

### JSON Format

```json
{
  "name": "[ErrorClassName]",
  "message": "[Human readable error message]",
  "code": "[ERROR_CODE]",
  "metadata": {
    "[property1]": "[value1]",
    "[property2]": "[value2]"
  }
}
```
````

### Serialization Rules

- All properties must be serializable
- Use consistent error code format
- Include relevant metadata
- Handle null and undefined values consistently

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13

````

## Implementation Requirements

### Implementation Pattern

```typescript
export class ValidationError extends DomainError {
  readonly fieldName: string;
  readonly fieldValue: unknown;
  readonly validationRule: string;

  private constructor(params: {
    message: string;
    code: string;
    metadata?: Record<string, unknown>;
  }) {
    super(params);
    this.fieldName = params.metadata?.fieldName as string;
    this.fieldValue = params.metadata?.fieldValue;
    this.validationRule = params.metadata?.validationRule as string;
  }

  static forField(
    fieldName: string,
    fieldValue: unknown,
    rule: string
  ): ValidationError {
    return new ValidationError({
      message: `Field '${fieldName}' failed validation: ${rule}`,
      code: 'VALIDATION_ERROR',
      metadata: { fieldName, fieldValue, validationRule }
    });
  }
}
````

### Required Implementation

1. **Extend BaseDomainError**: All errors must extend the base class
2. **Implement Properties**: Add error-specific properties
3. **Call Super Constructor**: Must call parent constructor with required parameters
4. **Use Factory Methods**: Prefer static factory methods for common scenarios
5. **Validate Properties**: Validate all error properties in constructor
6. **Immutability**: Ensure all error properties are readonly

## Best Practices

1. **Start with the business**: Focus on business meaning, not technical implementation
2. **Be specific**: Use concrete examples and clear descriptions
3. **Think about recovery**: Consider how the error will be handled
4. **Plan for evolution**: Structure the spec to accommodate future changes
5. **Validate completeness**: Ensure all aspects of the error are covered
6. **Use domain language**: Use terminology that matches the business domain
7. **Document assumptions**: Make implicit business rules explicit
8. **Consider performance**: Design error properties for efficient serialization
9. **Follow BaseDomainError patterns**: Ensure consistency with base class requirements
10. **Provide Recovery Guidance**: Include guidance on error recovery strategies

This guide ensures that domain error specifications are comprehensive, consistent, and maintainable, serving as effective documentation for error handling and domain modeling.
