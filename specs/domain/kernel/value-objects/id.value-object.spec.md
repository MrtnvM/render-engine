# ID Value Object

## Overview

Unique identifier for entities and aggregates using UUID v4 format. Provides type-safe identification for domain objects.

## Properties

- value: string - UUID v4 string representation

## Methods

### Factory Methods

- `static create(value: string): ID`

  - **Throws:** ValidationError
  - **Business rules:** Must be valid UUID v4 format
  - **Returns:** New ID instance

- `static generate(): ID`
  - **Business rules:** Generates new unique UUID v4
  - **Returns:** New ID instance with generated UUID

### Core Methods

- `equals(other: ID): boolean` - UUID string equality comparison
- `toString(): string` - Returns UUID string
- `toJSON(): { value: string }` - Serialization format

## Business Rules

1. **UUID Format**: Must be valid UUID v4 format (8-4-4-4-12 hexadecimal with hyphens)
2. **Uniqueness**: Generated IDs are guaranteed unique

## Dependencies

- **ValueObject<string>** - Base class
- **ValidationError** - Invalid UUID format
- **uuid** library - UUID generation

## Tests

### Essential Tests

- Create with valid/invalid UUID format
- Generate unique UUIDs
- Equality comparison
- JSON serialization/deserialization

## Usage Examples

```typescript
// Generate new ID
const id = ID.generate()

// Create from existing UUID
const existingId = ID.create('550e8400-e29b-41d4-a716-446655440000')

// Use in entities
export class User extends BaseEntity<ID> {
  static create(name: string): User {
    return new User(ID.generate(), name)
  }
}
```

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
Location: `packages/domain/src/kernel/value-objects/id.value-object.ts`
