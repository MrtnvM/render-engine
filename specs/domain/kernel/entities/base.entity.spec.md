# Entity Base Class

## Overview

Abstract base class providing common functionality for all entities: identity management, domain event handling, lifecycle tracking, and serialization.

## Class Structure

```typescript
export interface EntityData {
  id: ID
  createdAt: Date
  updatedAt: Date
}

export abstract class Entity<Data extends EntityData = EntityData> {
  private readonly _data: Data
  private readonly _domainEvents: DomainEvent[]

  protected constructor(
    data: Omit<Data, 'id' | 'createdAt' | 'updatedAt'> & { id?: ID; createdAt?: Date; updatedAt?: Date },
  )

  get id(): ID
  get createdAt(): Date
  get updatedAt(): Date
  protected get data(): Data

  equals(other: Entity | null | undefined): boolean
  protected addDomainEvent(event: DomainEvent): void
  getDomainEvents(): readonly DomainEvent[]
  clearDomainEvents(): void

  toJSON(): object
  toString(): string
  toDetailedString(): string
}
```

## Core Features

### Data Management

- `_data: Data` - Immutable entity data including id, timestamps, and custom fields
- `data: Data` - Protected getter for subclass access
- Auto-generates `id`, `createdAt`, `updatedAt` if not provided

### Identity & Equality

- `id`, `createdAt`, `updatedAt` - Automatic lifecycle management
- `equals()` - Identity-based comparison (same ID and type)
- Handles null/undefined values and type checking

### Domain Events

- `addDomainEvent()` - Protected method for emitting events
- `getDomainEvents()` - Retrieve collected events
- `clearDomainEvents()` - Clear events after processing

### Serialization

- `toJSON()` - Automatically handles complex nested serialization
- `toString()` - Concise representation: `ClassName(id=...)`
- `toDetailedString()` - Includes all data fields

## Implementation Requirements

Concrete entities must:

1. **Extend with data type**: `extends Entity<CustomEntityData>`
2. **Define data interface**: `interface CustomEntityData extends EntityData`
3. **Use factory methods**: Static creation methods with validation
4. **Protected constructor**: Prevent direct instantiation

## Example Implementation

```typescript
interface UserData extends EntityData {
  email: Email
  name: UserName
  isActive: boolean
}

export class User extends Entity<UserData> {
  private constructor(
    data: Omit<UserData, 'id' | 'createdAt' | 'updatedAt'> & { id?: ID; createdAt?: Date; updatedAt?: Date },
  ) {
    super(data)
  }

  static create(email: Email, name: UserName): User {
    const user = new User({
      email,
      name,
      isActive: true,
    })

    user.addDomainEvent(new UserCreatedEvent(user.id, email, name))
    return user
  }

  get email(): Email {
    return this.data.email
  }

  get name(): UserName {
    return this.data.name
  }

  get isActive(): boolean {
    return this.data.isActive
  }

  activate(): void {
    if (this.data.isActive) {
      throw new BusinessRuleViolation('User is already active')
    }

    this.addDomainEvent(new UserActivatedEvent(this.id))
  }

  // toJSON(), toString(), toDetailedString(), equals() are inherited
}
```

## Usage Examples

```typescript
// Creation
const user = User.create(email, name)

// Equality
const user1 = User.create(email1, name1)
const user2 = User.create(email2, name2)
console.log(user1.equals(user2)) // false (different IDs)
console.log(user1.equals(null)) // false

// Events
user.activate()
const events = user.getDomainEvents()
// Process events...
user.clearDomainEvents()

// Serialization
const json = user.toJSON() // { id: "...", email: "...", name: "...", isActive: true, ... }
const str = user.toString() // "User(id=...)"
const detailed = user.toDetailedString() // "User(id=..., email=..., name=..., isActive=true)"
```

## Automatic Serialization

The base class provides intelligent `toJSON()` serialization that handles:

- **Primitives** - strings, numbers, booleans passed through
- **Dates** - converted to ISO string format
- **Value Objects** - calls their `toJSON()` method
- **Child Entities** - calls their `toJSON()` method
- **Arrays** - recursively serialized
- **Plain Objects** - recursively serializes properties
- **Custom Objects** - serializes enumerable properties
- **Null/Undefined** - preserved as-is

This eliminates the need to implement `toJSON()` in concrete entities.

## Business Rules

1. **ID Immutability** - Entity ID cannot change after creation
2. **Identity-Based Equality** - Entities equal if same ID and type
3. **Auto-generation** - ID and timestamps auto-generated if not provided
4. **Protected Construction** - Only subclasses can instantiate

## Dependencies

- **ID** - ID value object (UUID v4 implementation)
- **DomainEvent** - Domain event base class

## Tests

### Essential Tests

- Constructor with valid data (verify auto-generation)
- Equality comparison (same/different/null entities)
- Domain event emission, collection, and clearing
- Serialization methods (toJSON, toString, toDetailedString)
- Data immutability

## Best Practices

1. **Use factory methods** - Always provide static creation methods
2. **Validate early** - Validate input in factory methods
3. **Emit events** - Emit domain events in command methods
4. **Clear events** - Clear events after processing
5. **Define data interface** - Create clear interfaces extending EntityData

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
Location: `packages/domain/src/kernel/entities/base.entity.ts`
