# Domain Event Specification Writing Guide

## Overview

This guide provides a simplified template for writing domain event specifications in Domain-Driven Design projects. Domain events represent significant business occurrences that other parts of the system care about.

**Base Class**: All domain events extend `DomainEvent` for event structure, serialization, and immutability.

## Domain Event Characteristics

- **Immutable** - Cannot be changed after creation
- **Past tense naming** - Represents something that has already happened
- **Business focused** - Represents meaningful business occurrences
- **Serializable** - Can be stored and transmitted across boundaries

## Specification Template

```markdown
# [EventName] Domain Event

## Overview

[Brief description of what the event represents and when it occurs]

## Event Details

- **Event Name**: event.name
- **Aggregate Root**: EntityName
- **Triggered By**: Method or action that emits this event

## Payload

- fieldName: Type - Description of the field
- fieldName: Type | null - Optional field description

## Methods

### Factory Methods

- `constructor(payload: PayloadType, occurredAt?: Date): EventName`
  - **Throws:** ValidationError
  - **Business rules:** Key validation rules
  - **Returns:** New event instance

### Core Methods

- `toJSON(): object` - Automatic serialization (inherited from DomainEvent)
- `equals(other: EventName): boolean` - Event equality comparison

## Business Rules

1. **Primary Rule**: Core validation logic for payload
2. **Timing Rule**: When the event should be emitted

## Dependencies

- **DomainEvent** - Base class (provides automatic serialization)
- **ValidationError** - Validation failures
- **ValueObjectName** - Value objects used in payload

## Tests

### Essential Tests

- Create event with valid/invalid payload
- Event emission scenarios
- Serialization/deserialization

## Metadata

Version: 1.0.0
Last Updated: [Date]
```

## Specification Levels

### Simple Events (StatusChanged, ItemAdded)

Use the basic template above with minimal business rules.

### Complex Events (OrderCompleted, UserRegistered)

Add handler information and business context as needed:

```markdown
### Event Handlers

- HandlerName - Description of what this handler does
```

### Integration Events (External system events)

Add serialization format for external communication:

````markdown
### Serialization

```json
{
  "eventName": "event.name",
  "occurredAt": "2024-01-01T00:00:00.000Z",
  "payload": { ... }
}
```
````

```

## Guidelines

- **Keep it simple**: Only document what's actually needed
- **Focus on business value**: Explain why the event exists
- **Minimal business rules**: Only document complex validation
- **Essential tests only**: Focus on creation, emission, and serialization
- **No boilerplate**: Skip sections that don't apply

## Review Checklist

- [ ] Extends BaseDomainEvent base class
- [ ] Clear event name and trigger documented
- [ ] Essential payload fields identified
- [ ] Key business rules documented
- [ ] Essential tests identified
- [ ] No unnecessary complexity
- [ ] Focused on business purpose
```
