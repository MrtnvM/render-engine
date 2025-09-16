# Value Object Specification Writing Guide

## Overview

This guide provides a simplified template for writing value object specifications in Domain-Driven Design projects. Value objects are immutable domain objects that encapsulate validation and business logic for domain-specific values.

**Base Class**: All value objects extend `ValueObject<T>` for immutability, equality comparison, and serialization.

## Value Object Characteristics

- **Immutable** - Cannot be changed after creation
- **Compared by value** - Equality based on properties, not identity
- **Enforce domain rules** - Validate and encapsulate business logic

## Specification Template

```markdown
# [ValueObjectName] Value Object

## Overview

[Brief description of what the value object represents]

## Properties

- value: Type - Description of the core property

## Methods

### Factory Methods

- `static create(value: Type): ValueObjectName`
  - **Throws:** ValidationError
  - **Business rules:** Key validation rules
  - **Returns:** New instance

### Core Methods

- `equals(other: ValueObjectName): boolean` - Value equality comparison
- `toString(): string` - String representation
- `toJSON(): object` - Automatic serialization (inherited from base class)

## Business Rules

1. **Primary Rule**: Core validation logic
2. **Format Rule**: Format requirements (if applicable)

## Dependencies

- **ValueObject<T>** - Base class (provides automatic toJSON serialization)
- **ValidationError** - Validation failures

## Tests

### Essential Tests

- Create with valid/invalid values
- Equality comparison
- Serialization/deserialization

## Metadata

Version: 1.0.0
Last Updated: [Date]
```

## Specification Levels

### Simple Value Objects (Name, Description, ID)

Use the basic template above with minimal business rules.

### Complex Value Objects (Email, URL, Money)

Add parsing methods and format validation as needed:

```markdown
### Factory Methods

- `static create(value: Type): ValueObjectName`
- `static fromString(value: string): ValueObjectName` (if needed)
```

### Composite Value Objects (Address, DateRange)

Add query methods for complex operations:

```markdown
### Query Methods

- `methodName(): ReturnType` - Description of query operation
```

## Guidelines

- **Keep it simple**: Only document what's actually needed
- **Focus on domain value**: Explain why the value object exists
- **Minimal business rules**: Only document complex validation
- **Essential tests only**: Focus on validation, equality, and serialization
- **No boilerplate**: Skip sections that don't apply

## Review Checklist

- [ ] Extends ValueObject<T> base class
- [ ] Clear validation rules documented
- [ ] Essential tests identified
- [ ] No unnecessary complexity
- [ ] Focused on domain purpose
