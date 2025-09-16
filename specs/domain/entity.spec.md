# Entity Specification Writing Guide

## Overview

Template for writing entity specifications. Entities extend `Entity<Data>` which provides identity management, domain events, lifecycle tracking, and serialization.

**Base Class**: `Entity<Data extends EntityData>` - see [base class spec](./kernel/entities/base.entity.spec.md)

## Template Structure

### 1. Header

```markdown
# [EntityName] Entity

## Overview

[Brief description of entity purpose and responsibilities]
```

### 2. Data Structure

```typescript
interface EntityNameData extends EntityData {
  field1: Type
  field2: Type | null
  field3: Type[]
}
```

**Inherited fields:** `id`, `createdAt`, `updatedAt` (auto-generated)

### 3. Methods

```markdown
## Methods

### Factory Methods

- `static create(params): EntityName`
  - **Returns:** New entity instance
  - **Emits:** EntityCreatedEvent
  - **Throws:** ValidationError

### Business Methods

- `methodName(params): ReturnType`
  - **Emits:** EventName
  - **Throws:** ErrorName
  - **Business rules:** Rule description

### Inherited Methods

- `equals()` - Entity equality comparison
- `toJSON()` - Automatic JSON serialization
- `toString()` - String representation
- `toDetailedString()` - Detailed string representation
- `getDomainEvents()` - Get domain events
- `clearDomainEvents()` - Clear domain events
```

### 4. Business Rules

```markdown
## Business Rules

1. **Rule Name**: Description
2. **Another Rule**: Description
```

### 5. Events & Dependencies

```markdown
## Events

- EntityCreatedEvent
- EntityUpdatedEvent

## Dependencies

### Base Classes

- Entity<EntityNameData>

### Value Objects

- Type1, Type2

### Domain Events

- EntityCreatedEvent

### Domain Errors

- ValidationError
```

### 6. Tests

```markdown
## Tests

### Essential Tests

- Factory method with valid/invalid parameters
- Business method behavior and events
- Equality comparison
- Serialization (toJSON, toString)
- Domain event emission/clearing
```

## Example Template

````markdown
# User Entity

## Overview

Represents a system user with email, name, and activation status.

## Data Structure

```typescript
interface UserData extends EntityData {
  email: Email
  name: UserName
  isActive: boolean
}
```
````

## Methods

### Factory Methods

- `static create(email: Email, name: UserName): User`
  - **Returns:** New user instance
  - **Emits:** UserCreatedEvent
  - **Throws:** ValidationError

### Business Methods

- `activate(): void`
  - **Emits:** UserActivatedEvent
  - **Throws:** BusinessRuleViolation
  - **Business rules:** User must not already be active

## Business Rules

1. **Email Uniqueness**: Email must be unique across all users
2. **Name Required**: Name cannot be empty

## Events

- UserCreatedEvent
- UserActivatedEvent

## Dependencies

### Base Classes

- Entity<UserData>

### Value Objects

- Email, UserName

### Domain Events

- UserCreatedEvent, UserActivatedEvent

### Domain Errors

- ValidationError, BusinessRuleViolation

## Tests

### Essential Tests

- Create user with valid email/name
- Create user with invalid data (should throw)
- Activate user (should emit event)
- Activate already active user (should throw)
- Equality comparison between users
- JSON serialization includes all fields

```

## Guidelines

1. **Keep it concise** - Focus on essential information
2. **Use factory methods** - Always provide static creation methods
3. **Document events** - List all emitted domain events
4. **Validate early** - Validate in factory methods
5. **Test thoroughly** - Cover all methods and business rules

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
```
