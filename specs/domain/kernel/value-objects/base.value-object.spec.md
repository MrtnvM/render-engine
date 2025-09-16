# ValueObject Base Class

## Overview

Abstract base class providing common functionality for all value objects: immutability, equality comparison, and serialization.

## Class Structure

```typescript
export abstract class ValueObject<T> {
  protected readonly _value: T
  protected constructor(value: T)
  protected get value(): T

  equals(other: ValueObject<T> | null): boolean
  toJSON(): object
  abstract toPrimitive(): T
  toString(): string
}
```

## Core Features

### Immutable Storage

- `_value: T` - Protected readonly property storing the value
- `value: T` - Protected getter for subclass access

### Equality Comparison

- `equals()` - Deep value comparison between instances
- Handles null values, type checking, and complex objects
- Uses reference equality first for performance

### Serialization

- `toJSON()` - Automatically handles complex nested serialization
- `toPrimitive()` - Must return primitive value (abstract)
- `toString()` - Default string conversion (can override)

## Implementation Requirements

Concrete value objects must:

1. **Extend with type**: `extends ValueObject<string>`
2. **Implement abstracts**: `toPrimitive()` (toJSON is provided automatically)
3. **Use factory methods**: Static creation methods with validation
4. **Protected constructor**: Prevent direct instantiation

## Example Implementation

```typescript
export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value)
  }

  static create(email: string): Email {
    if (!email || !this.isValidEmail(email)) {
      throw new ValidationError('Invalid email format')
    }
    return new Email(email.toLowerCase())
  }

  // toJSON() is automatically provided by base class

  toPrimitive(): string {
    return this.value
  }

  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}
```

## Usage Examples

```typescript
// Creation
const email = Email.create('user@example.com')

// Equality
const email1 = Email.create('user@example.com')
const email2 = Email.create('user@example.com')
console.log(email1.equals(email2)) // true
console.log(email1.equals(null)) // false

// Serialization
const json = email.toJSON() // { value: "user@example.com" }
const primitive = email.toPrimitive() // "user@example.com"
const str = email.toString() // "user@example.com"
```

## Deep Equality Logic

1. **Reference check** (fast path)
2. **Null/undefined handling**
3. **Type comparison**
4. **Object/Array recursive comparison**
5. **Primitive direct comparison**

## Automatic Serialization

The base class provides intelligent `toJSON()` serialization that handles:

- **Primitives** - strings, numbers, booleans passed through
- **Dates** - converted to ISO string format
- **Arrays** - recursively serialized
- **Value Objects** - calls their `toJSON()` method
- **Plain Objects** - recursively serializes properties
- **Custom Objects** - serializes enumerable properties
- **Null/Undefined** - preserved as-is

This eliminates the need to implement `toJSON()` in concrete value objects unless custom serialization is required.

## Business Rules

1. **Immutability** - Values cannot change after creation
2. **Value-based equality** - Equality by content, not reference
3. **Type safety** - Generic typing ensures consistency
4. **Protected construction** - Only subclasses can instantiate

## Dependencies

- TypeScript generics for type safety
- JavaScript built-ins only (Object.keys, String)
- No external dependencies

## Tests

### Essential Tests

- Constructor with valid value
- Equality comparison (same/different/null)
- Serialization methods (toJSON, toPrimitive, toString)
- Deep equality for complex values

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
Location: `packages/domain/src/kernel/value-objects/base.value-object.ts`
