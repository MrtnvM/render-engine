# ID Value Object

## Overview

The ID value object represents a unique identifier for entities and aggregates in the domain. It encapsulates UUID string values and ensures they are properly validated, formatted, and compared. IDs are immutable and provide type-safe identification for domain objects.

**Base Class**: Extends `ValueObject<string>` to inherit common functionality for immutability, equality comparison, and serialization.

## Properties

- value: string - The UUID string representation of the identifier

## Methods

### Factory Methods

- `static create(id: string): ID`
  - **Throws:** ValidationError, InvalidValueError
  - **Business rules:**
    - If no ID provided, generates a new UUID v4
    - If ID provided, must be a valid UUID v4 format
    - ID must be a non-empty string
  - **Returns:** New instance of ID

- `static generate(): ID`
  - **Throws:** None
  - **Business rules:**
    - Always generates a new UUID v4
    - Guaranteed to be unique
  - **Returns:** New instance of ID with generated UUID

- `static fromJSON(data: { value: string }): ID`
  - **Throws:** InvalidDataError, ValidationError
  - **Business rules:**
    - Data must have a 'value' property
    - Value must be a valid UUID v4 format
  - **Returns:** New instance of ID

### Property Accessors

- `toString(): string`
  - **Returns:** String representation of the ID
  - **Business rules:**
    - Returns the UUID string directly
    - Consistent with primitive value

### Utility Methods

- `equals(other: ID | null | undefined): boolean`
  - **Returns:** true if both IDs have the same value
  - **Business rules:**
    - Deep equality comparison via base class
    - Null safety (null returns false)
    - Case-sensitive comparison

- `toJSON(): { value: string }`
  - **Returns:** Plain object for serialization
  - **Business rules:**
    - Consistent JSON structure
    - Contains the UUID value

- `toPrimitive(): string`
  - **Returns:** The UUID string value
  - **Business rules:**
    - Returns the primitive string value
    - Used for database storage and external APIs

## Business Rules & Invariants

1. **UUID Format Rule**: ID must be a valid UUID v4 format (8-4-4-4-12 hexadecimal digits with hyphens)
2. **Immutability Rule**: ID cannot be changed after creation
3. **Uniqueness Rule**: Generated IDs are guaranteed to be unique within the system
4. **Non-Empty Rule**: ID cannot be an empty string or whitespace-only
5. **Case Sensitivity Rule**: ID comparisons are case-sensitive
6. **Validation Rule**: All ID creation methods validate the format before instantiation

## Dependencies

### Base Class

- **ValueObject<string>** - Abstract base class providing common functionality
  - Located at: `src/shared/value-object.ts`
  - Provides: Immutability, equality comparison, serialization framework
  - Required: All value objects must extend this class

### External Dependencies

- **uuid** - UUID generation library
  - Provides: UUID v4 generation functionality
  - Used for: Generating new unique identifiers

### Domain Errors

- **ValidationError** - Thrown when UUID format validation fails
- **ParseError** - Thrown when string parsing fails
- **InvalidValueError** - Thrown when provided value is invalid
- **InvalidDataError** - Thrown when JSON data structure is invalid

## Tests

### Unit Tests

#### Factory Methods

- **ID Creation:**
  - Create with valid UUID string
  - Create with invalid UUID format (should throw ValidationError)
  - Create with empty string (should throw ValidationError)
  - Create with null/undefined (should throw ValidationError)
  - Verify correct property values are set

- **UUID Generation:**
  - Generate new UUID
  - Verify generated ID is valid UUID v4 format
  - Verify multiple generations produce different IDs
  - Verify generated ID is unique

- **String Parsing:**
  - Parse valid UUID string
  - Parse invalid UUID format (should throw ParseError)
  - Parse empty string (should throw ParseError)
  - Parse null/undefined string (should throw ParseError)
  - Parse string with whitespace (should trim and validate)

- **JSON Deserialization:**
  - Deserialize valid JSON object with value property
  - Deserialize invalid JSON structure (should throw InvalidDataError)
  - Deserialize with missing value field (should throw InvalidDataError)
  - Deserialize with invalid value format (should throw ValidationError)

#### Property Accessors

- **Value Access:**
  - toString() returns the same UUID string
  - toJSON() returns correct object structure
  - toPrimitive() returns correct string value

#### Utility Methods

- **Equality Comparison:**
  - Equal IDs return true
  - Different IDs return false
  - Null/undefined comparison returns false
  - Case-sensitive comparison works correctly

- **Serialization:**
  - toJSON() produces valid JSON structure
  - fromJSON() recreates identical ID
  - Round-trip serialization preserves data
  - toPrimitive() returns string value

### Edge Cases

#### Boundary Conditions

- Minimum valid UUID (all zeros)
- Maximum valid UUID (all F's)
- Empty string handling
- Null value handling
- Whitespace handling

#### Error Scenarios

- Invalid UUID format handling
- Malformed JSON handling
- System failure scenarios
- Memory constraints

#### Performance Tests

- Large number of ID generations
- Frequent equality comparisons
- Serialization performance
- UUID generation performance

## Usage Examples

### Creating IDs

```typescript
// Generate new unique ID
const id1 = ID.generate()

// Create from existing UUID
const id2 = ID.create('550e8400-e29b-41d4-a716-446655440000')
```

### Using IDs in Entities

```typescript
export class User extends BaseEntity<ID> {
  private constructor(id: ID, name: string) {
    super(id)
    this._name = name
  }

  static create(name: string): User {
    const id = ID.generate()
    return new User(id, name)
  }

  get id(): ID {
    return super.id
  }
}
```

### ID Validation

```typescript
// Compare IDs
const areEqual = id1.equals(id2)
```

### Serialization

```typescript
// Convert to JSON
const json = id.toJSON()
// { value: "550e8400-e29b-41d4-a716-446655440000" }

// Convert to primitive
const primitive = id.toPrimitive()
// "550e8400-e29b-41d4-a716-446655440000"

// Convert from JSON
const restoredId = ID.fromJSON(json)
```

## Best Practices

1. **Use ID.generate()**: For new entities, always use `ID.generate()` to ensure uniqueness
2. **Validate on Creation**: Always validate UUID format in factory methods
3. **Immutable Usage**: Never modify ID values after creation
4. **Type Safety**: Use ID type instead of raw strings for entity identification
5. **Consistent Serialization**: Use toJSON() and fromJSON() for consistent serialization
6. **Error Handling**: Always handle ValidationError and ParseError exceptions
7. **Domain Language**: Use ID in entity and aggregate contexts for clear domain modeling

## Common Patterns

### Entity ID Pattern

```typescript
export abstract class Entity {
  protected readonly _id: ID

  protected constructor(id: ID) {
    this._id = id
  }

  get id(): ID {
    return this._id
  }
}
```

### Repository Pattern

```typescript
export interface Repository<T extends BaseEntity> {
  findById(id: ID): Promise<T | null>
  save(entity: T): Promise<void>
  delete(id: ID): Promise<void>
}
```

### Domain Event Pattern

```typescript
export abstract class DomainEvent {
  readonly aggregateId: ID
  readonly occurredAt: Date

  protected constructor(aggregateId: ID) {
    this.aggregateId = aggregateId
    this.occurredAt = new Date()
  }
}
```

## Metadata

Version: 1.0.0
Last Updated: [Date]
Value Object Location: `packages/domain/src/kernel/value-objects/id.value-object.ts`
