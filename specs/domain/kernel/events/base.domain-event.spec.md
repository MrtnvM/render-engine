# DomainEvent Abstract Class Specification

## Overview

The DomainEvent is an abstract base class that provides the foundation for all domain events in the system. It implements common functionality for event structure, serialization, and immutability, ensuring consistency across all domain events while enforcing the core principles of domain-driven design.

## Class Structure

### Abstract Class Definition

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
```

### Interface Definition

```typescript
export interface EventPayload {
  [key: string]: unknown
}
```

## Core Properties

### Abstract Properties

- **eventName**: `string` (abstract readonly)
  - **Purpose**: Unique identifier for the event type
  - **Requirements**: Must be implemented by concrete event classes
  - **Format**: Should follow `entity.action` convention (e.g., `task.created`)
  - **Immutability**: Readonly, cannot be changed after instantiation

### Private Properties

- **\_occurredAt**: `Date` (private readonly)
  - **Purpose**: Timestamp when the event occurred
  - **Default**: Current date/time if not provided in constructor
  - **Immutability**: Set once during construction, cannot be modified
  - **Serialization**: Converted to ISO 8601 string in JSON output

- **\_payload**: `EventPayload` (private readonly)
  - **Purpose**: Contains all event-specific data
  - **Type**: Flexible object with string keys and unknown values
  - **Immutability**: Set once during construction, cannot be modified
  - **Serialization**: Included as-is in JSON output

## Constructor

### Signature

```typescript
protected constructor(payload: EventPayload, occurredAt?: Date)
```

### Parameters

- **payload**: `EventPayload` (required)
  - **Purpose**: Event-specific data
  - **Type**: Object with string keys and unknown values
  - **Validation**: Must be serializable
  - **Requirements**: Cannot be null or undefined

- **occurredAt**: `Date` (optional)
  - **Purpose**: Custom timestamp for the event
  - **Default**: Current date/time if not provided
  - **Use Cases**: Event replay, testing, historical events
  - **Validation**: Must be a valid Date object

### Implementation Rules

1. **Protected Access**: Constructor is protected to prevent direct instantiation
2. **Payload Validation**: Payload must be provided and serializable
3. **Timestamp Handling**: Use provided timestamp or default to current time
4. **Immutability**: All properties are set once and made readonly

## Public Methods

### Getters

#### payload

```typescript
get payload(): EventPayload
```

- **Purpose**: Provides read-only access to event payload
- **Returns**: The event payload object
- **Immutability**: Returns a reference to the immutable payload
- **Usage**: Access event-specific data in handlers

#### occurredAt

```typescript
get occurredAt(): Date
```

- **Purpose**: Provides read-only access to event timestamp
- **Returns**: The date when the event occurred
- **Immutability**: Returns a reference to the immutable date
- **Usage**: Event ordering, audit trails, debugging

### Serialization Methods

#### toString

```typescript
toString(): string
```

- **Purpose**: Converts event to JSON string representation
- **Returns**: JSON string containing event data
- **Format**:
  ```json
  {
    "eventName": "event.name",
    "payload": { ... },
    "occurredAt": "2024-01-01T00:00:00.000Z"
  }
  ```
- **Usage**: Logging, debugging, simple serialization

#### toJSON

```typescript
toJSON(): Record<string, unknown>
```

- **Purpose**: Converts event to plain object for JSON serialization
- **Returns**: Object containing event data
- **Format**: Same as toString but as object
- **Usage**: JSON.stringify(), API responses, event storage

## Implementation Requirements

### For Concrete Event Classes

1. **Extend BaseDomainEvent**: All domain events must extend this class
2. **Implement eventName**: Must provide a unique event name
3. **Call Super Constructor**: Must call parent constructor with payload
4. **Payload Validation**: Validate payload data in constructor
5. **Immutability**: Ensure all event data is immutable

### Example Implementation

```typescript
export class TaskCreatedEvent extends BaseDomainEvent {
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

## Business Rules & Invariants

1. **Event Name Uniqueness**: Each event type must have a unique eventName
2. **Payload Serializability**: All payload data must be JSON serializable
3. **Timestamp Validity**: occurredAt must be a valid Date object
4. **Immutability**: Event data cannot be modified after creation
5. **Constructor Protection**: Only concrete event classes can instantiate events
6. **Payload Completeness**: Payload must contain all necessary event data

## Serialization Rules

### JSON Format

All events serialize to the following JSON structure:

```json
{
  "eventName": "string",
  "payload": {
    "key1": "value1",
    "key2": "value2"
  },
  "occurredAt": "2024-01-01T00:00:00.000Z"
}
```

### Serialization Requirements

1. **ISO 8601 Dates**: All dates must be in ISO 8601 format
2. **Primitive Types**: Use only primitive types in payload
3. **No Functions**: Payload cannot contain functions or methods
4. **No Circular References**: Avoid circular references in payload
5. **Consistent Format**: All events follow the same structure

## Dependencies

### Core Dependencies

- **EventPayload Interface**: Defines the structure for event data
- **Date Object**: JavaScript built-in for timestamps
- **JSON**: Built-in serialization support

### No External Dependencies

- The base class has no external dependencies
- Uses only JavaScript/TypeScript built-ins
- Designed for maximum compatibility

## Usage Guidelines

### Event Creation

```typescript
// Create event with current timestamp
const event = new TaskCreatedEvent('task-123', 'My Task', 'user-456')

// Create event with custom timestamp
const event = new TaskCreatedEvent('task-123', 'My Task', 'user-456', new Date('2024-01-01T00:00:00Z'))
```

### Event Serialization

```typescript
// Convert to JSON string
const jsonString = event.toString()

// Convert to object
const eventObject = event.toJSON()

// Use with JSON.stringify
const serialized = JSON.stringify(event)
```

### Event Handling

```typescript
// Access event data
const taskId = event.payload.taskId
const occurredAt = event.occurredAt
const eventName = event.eventName
```

## Testing Requirements

### Unit Tests

#### Constructor Testing

- Create event with valid payload
- Create event with custom timestamp
- Verify payload is set correctly
- Verify timestamp is set correctly
- Test payload immutability

#### Serialization Testing

- Test toString() output format
- Test toJSON() output format
- Verify JSON serialization compatibility
- Test with various payload types

#### Immutability Testing

- Verify properties cannot be modified
- Test that payload is readonly
- Verify timestamp cannot be changed

### Integration Tests

#### Event Emission

- Test event creation in entity methods
- Verify event is properly serialized
- Test event handling pipeline

#### Event Storage

- Test event persistence
- Verify event retrieval
- Test event replay scenarios

## Error Handling

### Common Errors

1. **Invalid Payload**: Non-serializable data in payload
2. **Invalid Timestamp**: Invalid Date object provided
3. **Missing Event Name**: Concrete class doesn't implement eventName
4. **Payload Mutation**: Attempting to modify payload after creation

### Error Prevention

- Validate payload in constructor
- Use readonly properties
- Provide clear error messages
- Document serialization requirements

## Performance Considerations

### Memory Usage

- Events are lightweight objects
- Payload is stored by reference
- Minimal memory overhead per event

### Serialization Performance

- toString() and toJSON() are optimized
- Uses native JSON.stringify when possible
- Minimal processing overhead

### Event Volume

- Designed to handle high event volumes
- Efficient serialization for storage
- Optimized for event streaming

## Best Practices

1. **Keep Payloads Small**: Include only necessary data
2. **Use Primitive Types**: Avoid complex objects in payload
3. **Validate Early**: Validate payload in constructor
4. **Document Events**: Provide clear documentation for each event
5. **Test Thoroughly**: Test serialization and immutability
6. **Version Events**: Consider versioning for event evolution
7. **Handle Errors Gracefully**: Provide meaningful error messages

## Migration and Evolution

### Backward Compatibility

- Base class changes should be backward compatible
- New properties should be optional
- Deprecated methods should be marked clearly

### Event Versioning

- Consider adding version field for future evolution
- Plan for payload schema changes
- Document breaking changes clearly

## Metadata

Version: 1.0.0
Last Updated: 2025-09-12
Base Class Location: `packages/domain/src/kernel/events/base.domain-event.ts`
