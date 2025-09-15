# Entity Specification Writing Guide

## Overview

This guide provides a comprehensive template and guidelines for writing entity specifications in Domain-Driven Design (DDD) projects. Entity specifications serve as the single source of truth for domain entities, documenting their structure, behavior, business rules, and testing requirements.

**Base Class**: All entities must extend the `Entity<Id>` abstract base class, which provides common functionality for identity management, domain event handling, lifecycle tracking, and entity comparison. See the [Entity Base Class Specification](./kernel/entities/base.entity.spec.md) for detailed information about the base class.

## Specification Structure

### 1. Header Section

```markdown
# [EntityName] Entity

## Overview

[Brief description of what the entity represents and its primary responsibilities]
```

**Guidelines:**

- Use clear, descriptive entity names
- Provide a concise overview of the entity's purpose
- Explain the entity's role in the domain
- Mention key responsibilities and lifecycle management

### 2. Fields Section

```markdown
## Fields

- id: Id - Unique identifier (inherited from Entity base class)
- fieldName: Type - Description of the field
- fieldName: Type | null - Optional field description
- fieldName: Type[] - Collection field description
```

**Guidelines:**

- List all entity fields with their types
- Include the inherited `id` field from Entity
- Use clear, descriptive field names
- Include nullability indicators (`| null`)
- Use array notation for collections (`[]`)
- Reference value objects and other entities by name
- Group related fields logically

### 3. Methods Section

Organize methods into logical groups:

#### 3.1 Core Lifecycle Methods

```markdown
### Core Lifecycle Methods

- `methodName(params: {param: Type}): ReturnType`
  - **Emits:** EventName
  - **Throws:** ErrorName, AnotherError
  - **Business rules:**
    - Rule description
    - Another rule description
```

#### 3.2 Feature-Specific Method Groups

```markdown
### [Feature] Management

- `methodName(params: {param: Type}): ReturnType`
  - **Emits:** EventName
  - **Throws:** ErrorName
  - **Business rules:**
    - Rule description
```

#### 3.3 Query Methods

```markdown
### Query Methods

- `methodName(): ReturnType`
  - **Returns:** Description of return value
  - **Business rules:**
    - Rule description
```

**Method Documentation Guidelines:**

- Use clear, descriptive method names
- Include parameter types and return types
- Document all emitted events
- List all possible exceptions
- Explain business rules clearly
- Use consistent formatting
- Group related methods together

### 4. Business Rules & Invariants Section

```markdown
## Business Rules & Invariants

1. **Rule Name**: Description of the rule
2. **Another Rule**: Description of another rule
```

**Guidelines:**

- Number rules for easy reference
- Use descriptive rule names
- Explain the business logic clearly
- Include validation rules
- Document state transition rules
- Mention relationship constraints

### 5. Events Section

```markdown
## Events

The [EntityName] entity can emit the following domain events:

- EventName
- AnotherEvent
- ThirdEvent
```

**Guidelines:**

- List all events the entity can emit
- Use clear, descriptive event names
- Group events logically if needed
- Reference events mentioned in methods

### 6. Dependencies Section

```markdown
## Dependencies

### Base Classes

- Entity<Id>

### Value Objects

- ValueObjectName
- AnotherValueObject

### Entities

- RelatedEntity

### Domain Events

- EventName
- AnotherEvent

### Domain Errors

- **ErrorName** - Description of when this error is thrown
- **AnotherError** - Description of when this error is thrown
```

**Guidelines:**

- Categorize dependencies by type
- Include Entity as the base class dependency
- Use clear references to other components
- Document all domain errors with descriptions
- Include all value objects used
- List related entities
- Include domain events the entity emits

### 7. Tests Section

#### 7.1 Unit Tests Structure

```markdown
## Tests

### Unit Tests

#### [Method Group] Methods

- **[Method Name]:**
  - Test case description
  - Another test case description
  - Error case description (should throw ErrorName)
  - Verify event emission
  - Verify state changes
```

#### 7.2 Integration Tests

```markdown
### Integration Tests

#### [Feature] Integration

- Test scenario description
- Another test scenario
- Complex workflow testing
```

#### 7.3 Edge Cases

```markdown
### Edge Cases

#### Boundary Conditions

- Maximum values testing
- Minimum values testing
- Edge case descriptions

#### Error Scenarios

- System failure scenarios
- Network failure scenarios
- Data corruption scenarios

#### Performance Tests

- Large dataset testing
- Memory usage testing
- Response time testing
```

**Testing Guidelines:**

- Cover all methods and scenarios
- Include positive and negative test cases
- Test error conditions explicitly
- Verify event emissions
- Test state changes
- Include integration scenarios
- Test edge cases and boundary conditions
- Consider performance implications

### 8. Metadata Section

```markdown
## Metadata

Version: 1.0.0
Last Updated: [Date or reference to analysis]
```

## Writing Guidelines

### General Principles

1. **Clarity**: Write clear, unambiguous descriptions
2. **Completeness**: Cover all aspects of the entity
3. **Consistency**: Use consistent formatting and terminology
4. **Accuracy**: Ensure all information is correct and up-to-date
5. **Maintainability**: Structure for easy updates and modifications

### Content Guidelines

1. **Business Rules**: Focus on domain logic, not implementation details
2. **Events**: Document all domain events the entity can emit
3. **Errors**: Include all possible exceptions with clear descriptions
4. **Dependencies**: List all external dependencies clearly
5. **Tests**: Provide comprehensive test coverage requirements

### Formatting Guidelines

1. **Headers**: Use consistent header hierarchy
2. **Lists**: Use bullet points for better readability
3. **Code**: Use backticks for method signatures and types
4. **Emphasis**: Use bold for important terms and error names
5. **Structure**: Maintain consistent indentation and spacing

### Review Checklist

Before finalizing an entity specification, ensure:

- [ ] All fields are documented with types and descriptions
- [ ] All methods include parameters, return types, events, and errors
- [ ] Business rules are clearly stated and numbered
- [ ] All events are listed in the events section
- [ ] All dependencies are documented
- [ ] All domain errors are listed with descriptions
- [ ] Test coverage is comprehensive
- [ ] Formatting is consistent throughout
- [ ] Content is accurate and up-to-date
- [ ] Language is clear and unambiguous

## Example Template

```markdown
# [EntityName] Entity

## Overview

[Brief description of the entity's purpose and responsibilities]

**Base Class**: Extends `Entity<Id>` to inherit common functionality for identity management, domain event handling, lifecycle tracking, and entity comparison.

## Fields

- id: Id - Unique identifier (inherited from Entity)
- field1: Type - Description
- field2: Type | null - Optional description
- field3: Type[] - Collection description

## Methods

### Core Lifecycle Methods

- `create(params: {param: Type}): EntityName`
  - **Emits:** EntityCreatedEvent
  - **Throws:** ValidationError
  - **Business rules:**
    - Rule description

### Query Methods

- `isValid(): boolean`
  - **Returns:** true if entity is in valid state
  - **Business rules:**
    - Validation logic description

## Business Rules & Invariants

1. **Rule Name**: Description
2. **Another Rule**: Description

## Events

The [EntityName] entity can emit the following domain events:

- EntityCreated
- EntityUpdated

## Dependencies

### Base Classes

- Entity<Id>

### Value Objects

- Type -> ValueObject

### Domain Events

- EntityCreatedEvent
- EntityUpdatedEvent

### Domain Errors

- **ValidationError** - Thrown when validation fails

## Tests

### Unit Tests

#### Core Lifecycle Methods

- **Entity Creation:**
  - Create with valid parameters
  - Create with invalid parameters (should throw ValidationError)
  - Verify EntityCreatedEvent is emitted

#### Entity Base Class Methods

- **Identity Management:**

  - Test id getter returns correct value
  - Test createdAt and updatedAt getters
  - Test equality comparison

- **Domain Events:**

  - Test event emission in command methods
  - Test event collection and retrieval
  - Test event clearing

- **Abstract Methods:**
  - Test isValid() implementation

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13

## Best Practices

1. **Start with the domain**: Focus on business logic, not technical implementation
2. **Be specific**: Use concrete examples and clear descriptions
3. **Think about testing**: Consider how each method and rule will be tested
4. **Consider relationships**: Document how the entity relates to others
5. **Plan for evolution**: Structure the spec to accommodate future changes
6. **Validate completeness**: Ensure all aspects of the entity are covered
7. **Use domain language**: Use terminology that matches the business domain
8. **Document assumptions**: Make implicit business rules explicit

This guide ensures that entity specifications are comprehensive, consistent, and maintainable, serving as effective documentation for domain modeling and implementation.
```
