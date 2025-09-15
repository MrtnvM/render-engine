# Entity Abstract Base Class Specification

## Overview

The Entity is an abstract base class that provides the foundation for all entities in the system. It implements common functionality for identity management, domain event handling, lifecycle tracking, and entity comparison, ensuring consistency across all entities while enforcing the core principles of domain-driven design and entity patterns.

## Class Structure

### Abstract Class Definition

```typescript
export abstract class Entity<Id extends ValueObject<any> = ID> {
  protected readonly _id: Id
  private readonly _domainEvents: BaseDomainEvent[]
  private readonly _createdAt: Date
  private readonly _updatedAt: Date

  protected constructor(id: Id, createdAt?: Date, updatedAt?: Date)

  get id(): Id
  get createdAt(): Date
  get updatedAt(): Date

  equals(other: BaseEntity<Id> | null | undefined): boolean

  protected addDomainEvent(event: BaseDomainEvent): void
  getDomainEvents(): readonly BaseDomainEvent[]
  clearDomainEvents(): void

  abstract toJSON(): object
  abstract toPrimitive(): object
  toString(): string

  abstract isValid(): boolean
}
```

### Generic Type Parameter

- **Id**: The type of the entity's unique identifier
  - **Purpose**: Type-safe encapsulation of the entity's identity
  - **Requirements**: Must be specified by concrete entity classes
  - **Default**: `ID` (ID - UUID v4 value object)

## Core Properties

### Protected Properties

- **\_id**: `Id` (protected readonly)
  - **Purpose**: Stores the unique identifier of the entity
  - **Access**: Protected, accessible only to subclasses
  - **Immutability**: Set once during construction, cannot be modified
  - **Type Safety**: Generic type Id ensures type consistency

### Private Properties

- **\_domainEvents**: `DomainEvent[]` (private readonly)
  - **Purpose**: Collection of domain events emitted by the entity
  - **Access**: Private, managed through protected methods
  - **Immutability**: Array is readonly, contents can be added/cleared
  - **Usage**: Event sourcing and domain event handling

- **\_createdAt**: `Date` (private readonly)
  - **Purpose**: Timestamp when the entity was created
  - **Access**: Private, accessible via getter
  - **Immutability**: Set once during construction, cannot be modified
  - **Usage**: Audit trails and lifecycle tracking

- **\_updatedAt**: `Date` (private readonly)
  - **Purpose**: Timestamp when the entity was last updated
  - **Access**: Private, accessible via getter
  - **Immutability**: Set once during construction, cannot be modified
  - **Usage**: Audit trails and lifecycle tracking

## Constructor

### Signature

```typescript
protected constructor(id: Id, createdAt?: Date, updatedAt?: Date)
```

### Parameters

- **id**: `Id` (required)
  - **Purpose**: The unique identifier for the entity
  - **Type**: Generic type Id as specified by the concrete class
  - **Validation**: Must be provided by concrete classes
  - **Immutability**: Stored as readonly, cannot be changed after construction

- **createdAt**: `Date` (optional)
  - **Purpose**: The creation timestamp
  - **Default**: Current date if not provided
  - **Usage**: Audit trails and persistence reconstruction

- **updatedAt**: `Date` (optional)
  - **Purpose**: The last update timestamp
  - **Default**: Current date if not provided
  - **Usage**: Audit trails and persistence reconstruction

### Implementation Rules

1. **Protected Access**: Constructor is protected, only accessible to subclasses
2. **ID Storage**: ID is stored as readonly for immutability
3. **Type Safety**: Generic type ensures compile-time type checking
4. **Timestamp Handling**: Automatic timestamp generation if not provided
5. **No Validation**: Base class performs no validation; concrete classes handle this

## Public Methods

### Identity Management

#### id (Getter)

```typescript
get id(): Id
```

- **Purpose**: Provides access to the entity's unique identifier
- **Returns**: The immutable ID of type Id
- **Usage**: Identity-based operations and comparisons

#### createdAt (Getter)

```typescript
get createdAt(): Date
```

- **Purpose**: Provides access to the creation timestamp
- **Returns**: The immutable creation date
- **Usage**: Audit trails and lifecycle tracking

#### updatedAt (Getter)

```typescript
get updatedAt(): Date
```

- **Purpose**: Provides access to the last update timestamp
- **Returns**: The immutable last update date
- **Usage**: Audit trails and lifecycle tracking

### Equality Comparison

#### equals

```typescript
equals(other: Entity<Id> | null | undefined): boolean
```

- **Purpose**: Determines if two entities are equal
- **Parameters**:
  - `other`: Another entity of the same type or null
- **Returns**: `true` if entities are equal, `false` otherwise
- **Business Rules**:
  - Null or undefined values return false
  - Different constructor types return false
  - Identity-based equality comparison using IDs
- **Usage**: Entity comparison and collections

### Domain Event Management

#### addDomainEvent

```typescript
protected addDomainEvent(event: DomainEvent): void
```

- **Purpose**: Adds a domain event to the entity's event collection
- **Parameters**:
  - `event`: The domain event to add
- **Access**: Protected, only accessible to subclasses
- **Usage**: Command methods emit events through this method

#### getDomainEvents

```typescript
getDomainEvents(): readonly DomainEvent[]
```

- **Purpose**: Retrieves all domain events for this entity
- **Returns**: Read-only array of domain events
- **Usage**: Event processing and persistence

#### clearDomainEvents

```typescript
clearDomainEvents(): void
```

- **Purpose**: Clears all domain events from the entity
- **Usage**: Called after events are processed to prevent duplicate processing

### Serialization Methods

#### toJSON (Abstract)

```typescript
abstract toJSON(): object
```

- **Purpose**: Converts entity to JSON-serializable object
- **Returns**: Plain object suitable for JSON serialization
- **Implementation**: Must be implemented by concrete classes
- **Usage**: API responses, persistence, event serialization

#### toPrimitive (Abstract)

```typescript
abstract toPrimitive(): object
```

- **Purpose**: Converts entity to its primitive representation
- **Returns**: The primitive representation of the entity
- **Implementation**: Must be implemented by concrete classes
- **Usage**: Database storage, primitive operations, legacy system integration

#### toString

```typescript
toString(): string
```

- **Purpose**: Converts entity to string representation
- **Returns**: String representation showing class name and ID
- **Default Implementation**: `${this.constructor.name}(id=${this._id})`
- **Override**: Concrete classes can override for custom formatting
- **Usage**: Logging, debugging, user display

### Abstract Methods

#### isValid (Abstract)

```typescript
abstract isValid(): boolean
```

- **Purpose**: Determines if the entity is in a valid state
- **Returns**: `true` if entity is valid, `false` otherwise
- **Implementation**: Must be implemented by concrete classes
- **Usage**: Business rule validation and state checking

## Implementation Requirements

### For Concrete Entity Classes

1. **Extend Entity<Id>**: All entities must extend this class with appropriate ID type
2. **Implement Abstract Methods**: Must implement `toJSON()`, `toPrimitive()`, `isValid()`
3. **Provide Factory Methods**: Should provide static factory methods for creation
4. **Validate Input**: Should validate input in factory methods
5. **Emit Events**: Should emit domain events in command methods
6. **Maintain Invariants**: Ensure all operations maintain entity invariants

### Example Implementation

```typescript
export class User extends Entity<ID> {
  private _email: Email
  private _name: UserName
  private _isActive: boolean

  private constructor(id: ID, email: Email, name: UserName, isActive: boolean, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt)
    this._email = email
    this._name = name
    this._isActive = isActive
  }

  static create(email: Email, name: UserName): User {
    const user = new User(ID.generate(), email, name, true)

    user.addDomainEvent(new UserCreatedEvent(user.id, email, name))
    return user
  }

  activate(): void {
    if (this._isActive) {
      throw new BusinessRuleViolation('User is already active')
    }

    this._isActive = true
    this.addDomainEvent(new UserActivatedEvent(this.id))
  }

  toJSON(): object {
    return {
      id: this.id.toJSON(),
      email: this._email.toJSON(),
      name: this._name.toJSON(),
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  toPrimitive(): object {
    return this.toJSON()
  }

  isValid(): boolean {
    // Here implementation of business rules and invariants validation.
    // The example entity too simple to demonstrate,
    // Email and UserName value objects already validates values internally.
    return true
  }
}
```

## Business Rules & Invariants

1. **Identity Immutability**: Entity ID cannot be changed after creation
2. **Identity-Based Equality**: Entities are equal if they have the same ID and type
3. **Type Safety**: Generic typing ensures compile-time type safety
4. **Event Collection**: Domain events are collected and can be retrieved
5. **Timestamp Tracking**: Creation and update timestamps are automatically managed
6. **Constructor Protection**: Base constructor is protected, only subclasses can instantiate
7. **Abstract Method Implementation**: All abstract methods must be implemented by concrete classes
8. **Invariant Validation**: Entities must validate their invariants

## Domain Event Rules

### Event Emission

1. **Command Methods Only**: Only command methods should emit events
2. **Business Relevance**: Events should represent meaningful business occurrences
3. **Past Tense**: Event names should be in past tense (e.g., `UserActivated`)
4. **Immutable**: Events are immutable once created
5. **Serializable**: Events must be JSON serializable

### Event Processing

1. **Collection**: Events are collected in the entity
2. **Retrieval**: Events can be retrieved for processing
3. **Clearing**: Events should be cleared after processing
4. **Persistence**: Events may be persisted for event sourcing

## Dependencies

### Core Dependencies

- **ID**: ID value object (UUID v4 implementation)
- **DomainEvent**: Domain event base class
- **Generic Type System**: TypeScript generics for type safety

### No External Dependencies

- The base class has minimal external dependencies
- Uses only essential packages for core functionality
- Designed for maximum compatibility and performance

## Usage Guidelines

### Entity Creation

```typescript
// Create via factory method (recommended)
const user = User.create(Email.create('user@example.com'), UserName.create('John Doe'))
```

### Equality Comparison

```typescript
// Compare entities
const user1 = User.create(Email.create('user@example.com'), UserName.create('John Doe'))
const user2 = User.create(Email.create('user@example.com'), UserName.create('John Doe'))
const areEqual = user1.equals(user2) // false (different IDs)

// Handle null comparison
const isNull = user1.equals(null) // false
const isUndefined = user1.equals(undefined) // false
```

### Domain Events

```typescript
// Emit events in command methods
activate(): void {
  this._isActive = true
  this.addDomainEvent(new UserActivatedEvent(this.id))
}

// Process events
const events = user.getDomainEvents()
// Process events...
user.clearDomainEvents()
```

### Serialization

```typescript
// Convert to JSON
const json = user.toJSON()
// { id: "...", email: "...", name: "...", ... }

// Convert to primitive
const primitive = user.toPrimitive()
// Same as toJSON()

// String representation
const str = user.toString()
// "User(id=12345-67890-...)"
```

## Testing Requirements

### Unit Tests

#### Constructor Testing

- Create entity with valid parameters
- Verify ID and timestamps are stored correctly
- Test entity immutability
- Verify type safety

#### Equality Testing

- Test equal entities return true
- Test different entities return false
- Test null comparison returns false
- Test undefined comparison returns false
- Test equality with different constructor types

#### Domain Event Testing

- Test event emission in command methods
- Test event collection and retrieval
- Test event clearing
- Test event serialization

#### Serialization Testing

- Test toJSON() output format
- Test toPrimitive() returns correct type
- Test toString() formatting
- Test JSON serialization compatibility

#### Abstract Method Testing

- Test isValid() implementation
- Test all abstract methods are implemented

### Integration Tests

#### Entity Interactions

- Test entities in aggregate context
- Test entity relationships
- Test entity collections

#### Event Processing Integration

- Test event emission and processing
- Test event persistence and retrieval
- Test event sourcing scenarios

## Error Handling

### Common Errors

1. **Type Mismatch**: Generic type violations
2. **Null Value**: Unexpected null/undefined values in equality comparison
3. **Invalid State**: Entity in invalid state
4. **Invariant Violation**: Business rule violations
5. **Event Processing**: Event processing failures

### Error Prevention

- Use generic types for compile-time safety
- Implement proper null/undefined checks
- Validate input in factory methods
- Document business rules clearly
- Use readonly properties for immutability

## Performance Considerations

### Memory Usage

- Entities are lightweight wrappers around domain data
- ID and timestamps are stored by value
- Domain events are stored in memory until cleared
- Minimal memory overhead per entity

### Equality Performance

- Identity-based equality is O(1)
- No deep comparison needed
- Optimized for high-frequency operations

### Event Performance

- Event collection is O(1) for each event
- Event retrieval creates a copy of the array
- Event clearing is O(1)
- Consider memory usage for long-lived entities

## Best Practices

1. **Use Factory Methods**: Always provide static factory methods for creation
2. **Validate Early**: Validate input in factory methods, not constructors
3. **Emit Events**: Emit domain events in command methods
4. **Clear Events**: Clear events after processing
5. **Override toString()**: Provide meaningful string representations
6. **Implement Abstract Methods**: All abstract methods must be implemented
7. **Document Business Rules**: Make business rules explicit
8. **Use Domain Language**: Name entities with domain terminology

## Common Patterns

### Simple Entities

- Single aggregate root with basic properties
- Examples: User, Product, Order

### Complex Entities

- Multiple properties with complex relationships
- Examples: Project, Task, Epic

### Aggregate Roots

- Entry points to aggregates
- Examples: Order, Project, User

### Child Entities

- Entities within aggregates
- Examples: OrderLine, Task, Feature

## Migration and Evolution

### Backward Compatibility

- Base class changes should be backward compatible
- New methods should be optional or have defaults
- Deprecated methods should be marked clearly

### Entity Evolution

- Consider versioning for complex entities
- Plan for schema changes in serialization
- Document breaking changes clearly

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
Base Class Location: `packages/domain/src/kernel/entities/base.entity.ts`
