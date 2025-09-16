# DomainEvent Base Class

## Overview

Abstract base class providing common functionality for all domain events: immutable event structure, timestamp management, and serialization.

## Class Structure

```typescript
export abstract class DomainEvent {
  abstract readonly eventName: string
  private readonly _occurredAt: Date
  private readonly _payload: EventPayload

  protected constructor(payload: EventPayload, occurredAt?: Date)

  get payload(): EventPayload
  get occurredAt(): Date

  toString(): string
  toJSON(): Record<string, unknown>
}

export interface EventPayload {
  [key: string]: unknown
}
```

## Core Features

### Event Identity

- `eventName: string` - Unique event identifier (abstract, must implement)
- Format: `entity.action` convention (e.g., `task.created`)

### Immutable Storage

- `_payload: EventPayload` - Event-specific data (readonly)
- `_occurredAt: Date` - Event timestamp (readonly)

### Serialization

- `toString()` - JSON string representation
- `toJSON()` - Plain object for JSON serialization
- Format: `{ eventName, payload, occurredAt }`

## Implementation Requirements

Concrete domain events must:

1. **Extend DomainEvent**: All events extend this base class
2. **Implement eventName**: Provide unique event identifier
3. **Call super constructor**: Pass payload and optional timestamp
4. **Protected constructor**: Prevent direct instantiation

## Example Implementation

```typescript
export class TaskCreatedEvent extends DomainEvent {
  static readonly eventName = 'task.created'
  readonly eventName = TaskCreatedEvent.eventName

  constructor(
    public readonly taskId: string,
    public readonly title: string,
    public readonly userId: string,
    occurredAt?: Date,
  ) {
    super(
      {
        taskId,
        title,
        userId,
      },
      occurredAt,
    )
  }
}
```

## Usage Examples

```typescript
// Creation with current timestamp
const event = new TaskCreatedEvent('task-123', 'My Task', 'user-456')

// Creation with custom timestamp
const event = new TaskCreatedEvent('task-123', 'My Task', 'user-456', new Date('2024-01-01T00:00:00Z'))

// Access event data
const taskId = event.payload.taskId
const occurredAt = event.occurredAt
const eventName = event.eventName

// Serialization
const json = event.toJSON() // { eventName: "task.created", payload: {...}, occurredAt: "..." }
const str = event.toString() // JSON string
```

## JSON Serialization Format

```json
{
  "eventName": "task.created",
  "payload": {
    "taskId": "task-123",
    "title": "My Task",
    "userId": "user-456"
  },
  "occurredAt": "2024-01-01T00:00:00.000Z"
}
```

## Business Rules

1. **Immutability** - Event data cannot change after creation
2. **Event Name Uniqueness** - Each event type has unique identifier
3. **Payload Serializability** - All payload data must be JSON serializable
4. **Protected construction** - Only subclasses can instantiate events

## Dependencies

- TypeScript for type safety
- JavaScript built-ins only (Date, JSON)
- No external dependencies

## Tests

### Essential Tests

- Constructor with valid payload and timestamp
- Event name implementation
- Payload and timestamp access
- Serialization methods (toString, toJSON)
- Immutability verification

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
Location: `packages/domain/src/kernel/events/base.domain-event.ts`
