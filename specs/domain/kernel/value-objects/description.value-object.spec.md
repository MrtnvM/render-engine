# Description Value Object

## Overview

Optional descriptive text for domain entities. Supports empty values and validates length when present.

## Properties

- value: string - Description text (optional, max 500 characters)

## Methods

### Factory Methods

- `static create(value: string | null | undefined): Description`

  - **Business rules:**
    - Null/undefined creates empty description
    - Max 500 characters when present
    - Whitespace automatically trimmed
  - **Returns:** New Description instance

- `static empty(): Description`
  - **Returns:** Empty description instance

### Core Methods

- `equals(other: Description): boolean` - Inherited from base class
- `toString(): string` - Inherited from base class
- `toJSON(): { value: string }` - Inherited from base class

## Business Rules

1. **Length**: Maximum 500 characters when present
2. **Null Handling**: Null/undefined values create empty descriptions
3. **Format**: Leading/trailing whitespace trimmed automatically

## Dependencies

- **ValueObject<string>** - Base class
- **ValidationError** - Length validation failures

## Tests

### Essential Tests

- Create with valid/invalid length strings
- Null and undefined handling
- Whitespace trimming
- Equality comparison (including null cases)
- JSON serialization

## Usage Examples

```typescript
// Valid descriptions
const desc1 = Description.create('User interface schema for login forms')
const desc2 = Description.create(null) // Creates empty description
const desc3 = Description.empty() // Creates empty description

// Invalid descriptions (will throw)
Description.create('a'.repeat(501)) // Too long
Description.create(123) // Not a string/null/undefined

// Comparison
console.log(desc2.equals(desc3)) // true (both empty)
console.log(desc1.equals(desc2)) // false
```

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
Location: `packages/domain/src/kernel/value-objects/description.value-object.ts`
