# ValueObject Abstract Base Class Specification

## Overview

The ValueObject is an abstract base class that provides the foundation for all value objects in the system. It implements common functionality for immutability, equality comparison, serialization, and deep value comparison, ensuring consistency across all value objects while enforcing the core principles of domain-driven design and value object patterns.

## Class Structure

### Abstract Class Definition

```typescript
export abstract class ValueObject<T> {
  protected readonly _value: T

  protected constructor(value: T)

  protected get value(): T

  equals(other: ValueObject<T> | null): boolean
  abstract toJSON(): object
  abstract toPrimitive(): T
  toString(): string
  private deepEquals(a: any, b: any): boolean
}
```

### Generic Type Parameter

- **T**: The type of the underlying value
  - **Purpose**: Type-safe encapsulation of the value object's data
  - **Requirements**: Must be specified by concrete value object classes
  - **Examples**: `string`, `number`, `Date`, `object`, `Array<T>`

## Core Properties

### Protected Properties

- **\_value**: `T` (protected readonly)
  - **Purpose**: Stores the immutable value of the value object
  - **Access**: Protected, accessible only to subclasses
  - **Immutability**: Set once during construction, cannot be modified
  - **Type Safety**: Generic type T ensures type consistency

### Protected Accessor

- **value**: `T` (protected getter)
  - **Purpose**: Provides controlled access to the underlying value
  - **Access**: Protected, accessible only to subclasses
  - **Returns**: The immutable value T
  - **Usage**: Allows subclasses to access value for business logic

## Constructor

### Signature

```typescript
protected constructor(value: T)
```

### Parameters

- **value**: `T` (required)
  - **Purpose**: The initial value for the value object
  - **Type**: Generic type T as specified by the concrete class
  - **Validation**: Must be provided by concrete classes
  - **Immutability**: Stored as readonly, cannot be changed after construction

### Implementation Rules

1. **Protected Access**: Constructor is protected, only accessible to subclasses
2. **Value Storage**: Value is stored as readonly for immutability
3. **Type Safety**: Generic type ensures compile-time type checking
4. **No Validation**: Base class performs no validation; concrete classes handle this

## Public Methods

### Equality Comparison

#### equals

```typescript
equals(other: ValueObject<T> | null): boolean
```

- **Purpose**: Determines if two value objects are equal
- **Parameters**:
  - `other`: Another value object of the same type or null
- **Returns**: `true` if objects are equal, `false` otherwise
- **Business Rules**:
  - Null or undefined values return false
  - Different constructor types return false
  - Deep equality comparison of underlying values
  - Handles complex nested objects and arrays
- **Usage**: Value-based equality for value objects

### Serialization Methods

#### toJSON (Abstract)

```typescript
abstract toJSON(): object
```

- **Purpose**: Converts value object to JSON-serializable object
- **Returns**: Plain object suitable for JSON serialization
- **Implementation**: Must be implemented by concrete classes
- **Usage**: API responses, persistence, event serialization

#### toPrimitive (Abstract)

```typescript
abstract toPrimitive(): T
```

- **Purpose**: Converts value object to its primitive representation
- **Returns**: The primitive value of type T
- **Implementation**: Must be implemented by concrete classes
- **Usage**: Database storage, primitive operations, legacy system integration

#### toString

```typescript
toString(): string
```

- **Purpose**: Converts value object to string representation
- **Returns**: String representation of the underlying value
- **Default Implementation**: Uses `String(this._value)`
- **Override**: Concrete classes can override for custom formatting
- **Usage**: Logging, debugging, user display

### Private Helper Methods

#### deepEquals

```typescript
private deepEquals(a: any, b: any): boolean
```

- **Purpose**: Performs deep equality comparison of complex values
- **Parameters**:
  - `a`: First value to compare
  - `b`: Second value to compare
- **Returns**: `true` if values are deeply equal, `false` otherwise
- **Business Rules**:
  - Reference equality check first (fast path)
  - Null/undefined handling
  - Type checking
  - Recursive object property comparison
  - Array element comparison
- **Usage**: Internal method for equality comparison

## Implementation Requirements

### For Concrete Value Object Classes

1. **Extend ValueObject<T>**: All value objects must extend this class with appropriate type
2. **Implement Abstract Methods**: Must implement `toJSON()` and `toPrimitive()`
3. **Provide Factory Methods**: Should provide static factory methods for creation
4. **Validate Input**: Should validate input in factory methods
5. **Maintain Immutability**: Ensure all operations return new instances

### Example Implementation

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

  toJSON(): { value: string } {
    return { value: this.value }
  }

  toPrimitive(): string {
    return this.value
  }

  private static isValidEmail(email: string): boolean {
    // Email validation logic
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}
```

## Business Rules & Invariants

1. **Immutability**: Value objects cannot be changed after creation
2. **Value-Based Equality**: Equality is determined by value, not reference
3. **Type Safety**: Generic typing ensures compile-time type safety
4. **Deep Equality**: Complex values are compared using deep equality
5. **Null Safety**: Null and undefined values are handled safely
6. **Constructor Protection**: Base constructor is protected, only subclasses can instantiate
7. **Serialization Completeness**: All value objects must support JSON and primitive conversion

## Deep Equality Rules

### Comparison Logic

1. **Reference Equality**: Check if values are the same reference (fast path)
2. **Null Handling**: Null and undefined values are not equal to each other or anything else
3. **Type Checking**: Different types are never equal
4. **Object Comparison**:
   - Compare object key counts
   - Check that all keys exist in both objects
   - Recursively compare all property values
5. **Array Comparison**: Compare array lengths and elements recursively
6. **Primitive Comparison**: Direct comparison for primitive types

### Supported Types

- **Primitives**: `string`, `number`, `boolean`, `null`, `undefined`
- **Objects**: Plain objects with string keys
- **Arrays**: Arrays of any supported type
- **Nested Structures**: Deeply nested objects and arrays
- **Mixed Types**: Objects containing arrays and vice versa

## Dependencies

### Core Dependencies

- **Generic Type System**: TypeScript generics for type safety
- **Object.keys()**: JavaScript built-in for object iteration
- **String()**: JavaScript built-in for string conversion

### No External Dependencies

- The base class has no external dependencies
- Uses only JavaScript/TypeScript built-ins
- Designed for maximum compatibility and performance

## Usage Guidelines

### Value Object Creation

```typescript
// Create via factory method (recommended)
const email = Email.create('user@example.com')
```

### Equality Comparison

```typescript
// Compare value objects
const email1 = Email.create('user@example.com')
const email2 = Email.create('user@example.com')
const areEqual = email1.equals(email2) // true

// Handle null comparison
const isNull = email1.equals(null) // false
```

### Serialization

```typescript
// Convert to JSON
const json = email.toJSON()
// { value: "user@example.com" }

// Convert to primitive
const primitive = email.toPrimitive()
// "user@example.com"

// String representation
const str = email.toString()
// "user@example.com"
```

## Testing Requirements

### Unit Tests

#### Constructor Testing

- Create value object with valid value
- Verify value is stored correctly
- Test value immutability
- Verify type safety

#### Equality Testing

- Test equal value objects return true
- Test different value objects return false
- Test null comparison returns false
- Test deep equality for complex values
- Test equality with different constructor types

#### Serialization Testing

- Test toJSON() output format
- Test toPrimitive() returns correct type
- Test toString() formatting
- Test JSON serialization compatibility

#### Deep Equality Testing

- Test primitive value equality
- Test object equality with same properties
- Test object equality with different property order
- Test array equality
- Test nested structure equality
- Test mixed type equality

### Integration Tests

#### Value Object Interactions

- Test value objects in entity context
- Test value objects in aggregate context
- Test value object collections

#### Serialization Integration

- Test JSON serialization/deserialization
- Test database persistence and retrieval
- Test API serialization

## Error Handling

### Common Errors

1. **Type Mismatch**: Generic type violations
2. **Null Value**: Unexpected null values in equality comparison
3. **Circular References**: Deep equality with circular object references
4. **Invalid Serialization**: Non-serializable values in toJSON()

### Error Prevention

- Use generic types for compile-time safety
- Implement proper null checks
- Validate input in factory methods
- Document serialization requirements
- Use readonly properties for immutability

## Performance Considerations

### Memory Usage

- Value objects are lightweight wrappers
- Value is stored by reference (except primitives)
- Minimal memory overhead per value object

### Equality Performance

- Reference equality check first (O(1))
- Deep equality for complex objects (O(n))
- Optimized for common use cases
- Cached comparisons when possible

### Serialization Performance

- toJSON() and toPrimitive() are optimized
- Minimal processing overhead
- Efficient for high-frequency operations

## Best Practices

1. **Use Factory Methods**: Always provide static factory methods for creation
2. **Validate Early**: Validate input in factory methods, not constructors
3. **Override toString()**: Provide meaningful string representations
4. **Keep Values Simple**: Avoid complex nested structures when possible
5. **Test Equality Thoroughly**: Value objects need extensive equality testing
6. **Document Constraints**: Make validation rules explicit
7. **Use Domain Language**: Name value objects with domain terminology

## Common Patterns

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

## Migration and Evolution

### Backward Compatibility

- Base class changes should be backward compatible
- New methods should be optional or have defaults
- Deprecated methods should be marked clearly

### Value Object Evolution

- Consider versioning for complex value objects
- Plan for schema changes in serialization
- Document breaking changes clearly

## Metadata

Version: 1.0.0
Last Updated: [Date]

Base Class Location: `packages/domain/src/kernel/value-objects/base.value-object.ts`
