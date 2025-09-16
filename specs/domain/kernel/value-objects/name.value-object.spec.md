# Name Value Object

## Overview

Human-readable name string for domain entities. Ensures consistent naming with validation for length and content quality.

## Properties

- value: string - Name string (3-100 characters, trimmed)

## Methods

### Factory Methods

- `static create(value: string): Name`
  - **Throws:** ValidationError
  - **Business rules:**
    - Length 3-100 characters after trimming
    - Must contain at least one letter
    - Whitespace automatically trimmed
  - **Returns:** New Name instance

### Core Methods

- `equals(other: Name): boolean` - Inherited from base class
- `toString(): string` - Inherited from base class
- `toJSON(): object` - Inherited from base class

## Business Rules

1. **Length**: 3-100 characters after trimming whitespace
2. **Content**: Must contain at least one alphabetic character
3. **Format**: Leading/trailing whitespace automatically trimmed

## Dependencies

- **ValueObject<string>** - Base class
- **ValidationError** - Validation failures

## Tests

### Essential Tests

- Create with valid/invalid length strings
- Content validation (must have letters)
- Whitespace trimming
- Equality comparison
- JSON serialization

## Usage Examples

```typescript
// Valid names
const name1 = Name.create('User Profile Schema')
const name2 = Name.create('Login-Form_v2')

// Invalid names (will throw)
Name.create('ab') // Too short
Name.create('123') // No letters
Name.create('   ') // Only whitespace
Name.create('a'.repeat(101)) // Too long

// Comparison
console.log(name1.equals(name2)) // false
```

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
