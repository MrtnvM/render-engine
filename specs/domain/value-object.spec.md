# Value Object Specification Writing Guide

## Overview

This guide provides a comprehensive template and guidelines for writing value object specifications in Domain-Driven Design (DDD) projects. Value objects are immutable domain objects that model concepts without identity, encapsulating rules, validations, and formatting logic for domain-specific values.

**Base Class**: All value objects must extend the `ValueObject<T>` abstract base class, which provides common functionality for immutability, equality comparison, and serialization. See the [ValueObject Base Class Specification](../../playgrounds/to-do-app/implementation/src/value-objects/base-value-object.spec.md) for detailed information about the base class.

## Value Object Characteristics

- **No unique ID** - Value objects are identified by their properties
- **Immutable** - Cannot be changed after creation
- **Compared by value** - Two value objects are equal if all their properties are equal
- **Enforce domain rules** - Validate and encapsulate business logic
- **Stateless and pure** - No side effects or domain events

## Specification Structure

### 1. Header Section

```markdown
# [ValueObjectName] Value Object

## Overview

[Brief description of what the value object represents and its purpose in the domain]

**Base Class**: Extends `ValueObject<[Type]>` to inherit common functionality for immutability, equality comparison, and serialization.
```

**Guidelines:**

- Use clear, descriptive value object names
- Explain the concept being modeled
- Describe the value object's role in the domain
- Mention key validation rules and constraints

### 2. Properties Section

```markdown
## Properties

- propertyName: Type - Description of the property
- propertyName: Type | null - Optional property description
- propertyName: Type[] - Collection property description
```

**Guidelines:**

- List all internal properties with their types
- Use clear, descriptive property names
- Include nullability indicators (`| null`)
- Use array notation for collections (`[]`)
- Reference primitive types and other value objects
- Keep properties minimal and focused

### 3. Methods Section

Organize methods in this exact order:

#### 3.1 Factory Methods

```markdown
### Factory Methods

- `static create(value: Type): ValueObjectName`
  - **Throws:** ValidationError, InvalidValueError
  - **Business rules:**
    - Validation rule description
    - Another validation rule
  - **Returns:** New instance of ValueObjectName

- `static fromString(value: string): ValueObjectName`
  - **Throws:** ParseError, ValidationError
  - **Business rules:**
    - Parsing rule description
  - **Returns:** New instance of ValueObjectName

- `static fromJSON(data: object): ValueObjectName`
  - **Throws:** InvalidDataError, ValidationError
  - **Business rules:**
    - Deserialization rule description
  - **Returns:** New instance of ValueObjectName
```

#### 3.2 Transformation Methods

```markdown
### Transformation Methods

- `methodName(params: {param: Type}): ValueObjectName`
  - **Returns:** New instance with transformed value
  - **Business rules:**
    - Transformation rule description
    - Validation rule for result
  - **Throws:** TransformationError, ValidationError
```

#### 3.3 Query Methods

```markdown
### Query Methods

- `isValid(): boolean`
  - **Returns:** true if the value object is in a valid state
  - **Business rules:**
    - Validation logic description

- `methodName(): ReturnType`
  - **Returns:** Description of return value
  - **Business rules:**
    - Query logic description
```

#### 3.4 Property Accessors

```markdown
### Property Accessors

- `get value(): Type`
  - **Returns:** The primitive value
  - **Business rules:**
    - Access rule description

- `toString(): string`
  - **Returns:** String representation
  - **Business rules:**
    - Formatting rule description
```

#### 3.5 Utility Methods

```markdown
### Utility Methods

- `equals(other: ValueObjectName): boolean`
  - **Returns:** true if all properties are equal
  - **Business rules:**
    - Deep equality comparison
    - Null safety

- `toJSON(): object`
  - **Returns:** Plain object for serialization
  - **Business rules:**
    - Serialization format
    - Data structure consistency

- `toPrimitive(): Type`
  - **Returns:** Primitive representation
  - **Business rules:**
    - Primitive conversion rules
```

**Method Documentation Guidelines:**

- Use clear, descriptive method names
- Include parameter types and return types
- Document all possible exceptions
- Explain business rules clearly
- Use consistent formatting
- Group methods by functionality
- Focus on immutability and validation

### 4. Business Rules & Invariants Section

```markdown
## Business Rules & Invariants

1. **Validation Rule**: Description of the validation rule
2. **Format Rule**: Description of the format requirement
3. **Range Rule**: Description of value range constraints
4. **Structure Rule**: Description of structural requirements
```

**Guidelines:**

- Number rules for easy reference
- Use descriptive rule names
- Explain validation logic clearly
- Include format and structure requirements
- Document value constraints
- Mention immutability guarantees

### 5. Dependencies Section

```markdown
## Dependencies

### Base Class

- **ValueObject<T>** - Abstract base class providing common functionality
  - Located at: `src/shared/value-object.ts`
  - Provides: Immutability, equality comparison, serialization framework
  - Required: All value objects must extend this class

### Value Objects

- RelatedValueObject -> ValueObject
- AnotherValueObject -> ValueObject

### Domain Errors

- **ValidationError** - Thrown when validation fails
- **ParseError** - Thrown when parsing fails
- **InvalidValueError** - Thrown when value is invalid
- **TransformationError** - Thrown when transformation fails
```

**Guidelines:**

- Always include ValueObject<T> base class dependency
- List all value objects used
- Document all domain errors with descriptions
- Include parsing and validation errors
- Reference primitive types if significant

### 6. Tests Section

#### 6.1 Unit Tests Structure

```markdown
## Tests

### Unit Tests

#### Factory Methods

- **Value Object Creation:**
  - Create with valid value
  - Create with invalid value (should throw ValidationError)
  - Create with null value (should throw ValidationError)
  - Create with empty value (should throw ValidationError)
  - Verify correct property values are set

- **String Parsing:**
  - Parse valid string format
  - Parse invalid string format (should throw ParseError)
  - Parse empty string (should throw ParseError)
  - Parse null string (should throw ParseError)

- **JSON Deserialization:**
  - Deserialize valid JSON object
  - Deserialize invalid JSON structure (should throw InvalidDataError)
  - Deserialize with missing required fields (should throw ValidationError)

#### Transformation Methods

- **Value Transformation:**
  - Transform with valid parameters
  - Transform with invalid parameters (should throw TransformationError)
  - Verify immutability (original unchanged)
  - Verify new instance is created

#### Query Methods

- **Validation Queries:**
  - Valid value object returns true for isValid()
  - Invalid value object returns false for isValid()
  - Edge case validation scenarios

- **Property Queries:**
  - Query returns correct values
  - Query handles edge cases appropriately

#### Property Accessors

- **Value Access:**
  - Getter returns correct primitive value
  - toString() returns properly formatted string
  - toJSON() returns correct object structure
  - toPrimitive() returns correct primitive type

#### Utility Methods

- **Equality Comparison:**
  - Equal value objects return true
  - Different value objects return false
  - Null comparison returns false
  - Deep equality for complex value objects

- **Serialization:**
  - toJSON() produces valid JSON
  - fromJSON() recreates identical value object
  - Round-trip serialization preserves data

### Integration Tests

#### Value Object Interactions

- Value object with other value objects
- Value object in entity context
- Value object in aggregate context

#### Serialization Integration

- JSON serialization/deserialization
- Database persistence and retrieval
- API serialization

### Edge Cases

#### Boundary Conditions

- Minimum valid values
- Maximum valid values
- Empty values
- Null values
- Special characters and formats

#### Error Scenarios

- Invalid input handling
- Malformed data handling
- System failure scenarios
- Memory constraints

#### Performance Tests

- Large value object creation
- Frequent transformations
- Serialization performance
- Equality comparison performance

## Metadata

Version: 1.0.0
Last Updated: [Date or reference to analysis]
```

## Writing Guidelines

### General Principles

1. **Base Class Extension**: All value objects must extend `ValueObject<T>` base class
2. **Immutability**: Emphasize that value objects cannot be changed after creation
3. **Validation**: Focus on comprehensive input validation in factory methods
4. **Equality**: Rely on base class equality implementation for consistency
5. **Clarity**: Write clear, unambiguous descriptions
6. **Completeness**: Cover all aspects of the value object

### Content Guidelines

1. **Business Rules**: Focus on domain validation and formatting rules
2. **Validation**: Document all validation rules and constraints in factory methods
3. **Transformation**: Explain how value objects can be transformed (returning new instances)
4. **Serialization**: Document JSON and primitive conversion methods (required by base class)
5. **Equality**: Reference base class equality implementation, document any custom behavior

### Formatting Guidelines

1. **Headers**: Use consistent header hierarchy
2. **Methods**: Group methods by functionality
3. **Code**: Use backticks for method signatures and types
4. **Emphasis**: Use bold for important terms and error names
5. **Structure**: Maintain consistent indentation and spacing

### Review Checklist

Before finalizing a value object specification, ensure:

- [ ] Value object extends `ValueObject<T>` base class
- [ ] All properties are documented with types and descriptions
- [ ] All factory methods include validation rules and exceptions
- [ ] All transformation methods return new instances
- [ ] All query methods are read-only
- [ ] Business rules are clearly stated and numbered
- [ ] All domain errors are listed with descriptions
- [ ] Test coverage is comprehensive
- [ ] Immutability is emphasized throughout
- [ ] Equality comparison references base class implementation
- [ ] Serialization methods (toJSON, toPrimitive) are documented
- [ ] Formatting is consistent throughout
- [ ] Content is accurate and up-to-date
- [ ] Language is clear and unambiguous

## Example Template

```markdown
# [ValueObjectName] Value Object

## Overview

[Brief description of the value object's purpose and domain role]

**Base Class**: Extends `ValueObject<[Type]>` to inherit common functionality for immutability, equality comparison, and serialization.

## Properties

- value: Type - The core value
- property1: Type - Additional property description
- property2: Type | null - Optional property description

## Methods

### Factory Methods

- `static create(value: Type): ValueObjectName`
  - **Throws:** ValidationError
  - **Business rules:**
    - Validation rule description
  - **Returns:** New instance of ValueObjectName

### Transformation Methods

- `transform(param: Type): ValueObjectName`
  - **Returns:** New instance with transformed value
  - **Business rules:**
    - Transformation rule description
  - **Throws:** TransformationError

### Query Methods

- `isValid(): boolean`
  - **Returns:** true if value object is valid
  - **Business rules:**
    - Validation logic description

### Property Accessors

- `get value(): Type`
  - **Returns:** The primitive value

- `toString(): string`
  - **Returns:** String representation

### Utility Methods

- `equals(other: ValueObjectName): boolean`
  - **Returns:** true if all properties are equal
  - **Business rules:**
    - Deep equality comparison

- `toJSON(): object`
  - **Returns:** Plain object for serialization

## Business Rules & Invariants

1. **Validation Rule**: Description
2. **Format Rule**: Description
3. **Range Rule**: Description

## Dependencies

### Domain Errors

- **ValidationError** - Thrown when validation fails

## Tests

### Unit Tests

#### Factory Methods

- **Value Object Creation:**
  - Create with valid value
  - Create with invalid value (should throw ValidationError)
  - Verify correct property values are set

#### Transformation Methods

- **Value Transformation:**
  - Transform with valid parameters
  - Verify immutability (original unchanged)
  - Verify new instance is created

#### Utility Methods

- **Equality Comparison:**
  - Equal value objects return true
  - Different value objects return false

## Metadata

Version: 1.0.0
Last Updated: [Date]

## Best Practices

1. **Extend base class**: Always extend `ValueObject<T>` for consistency
2. **Use private constructor**: Make constructor private to enforce factory method usage
3. **Implement required methods**: Always implement `toJSON()` and `toPrimitive()`
4. **Validate everything**: Comprehensive input validation in factory methods is crucial
5. **Leverage base equality**: Use inherited `equals()` method for consistency
6. **Consider serialization**: Plan for JSON and primitive conversion (required by base class)
7. **Use domain language**: Use terminology that matches the business domain
8. **Plan for reuse**: Design for maximum reusability across the domain
9. **Document constraints**: Make all validation rules explicit
10. **Test thoroughly**: Value objects need extensive testing due to their critical role

## Common Value Object Patterns

### Simple Value Objects

- Single primitive value with validation
- Examples: Email, PhoneNumber, Currency

### Composite Value Objects

- Multiple related properties
- Examples: Address, FullName, Money

### Enumeration Value Objects

- Fixed set of valid values
- Examples: Status, Priority, Type

### Calculated Value Objects

- Derived from other values
- Examples: Total, Percentage, Rate

### Formatted Value Objects

- Specific format requirements
- Examples: Date, Time, Code
```
