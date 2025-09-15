# Domain Event Specification Writing Guide

## Overview

This guide provides a comprehensive template and guidelines for writing domain event specifications in Domain-Driven Design (DDD) projects. Domain event specifications serve as the single source of truth for domain events, documenting their structure, purpose, payload, and usage requirements.

**Important**: All domain events must extend the `BaseDomainEvent` abstract class, which provides common functionality for event structure, serialization, and immutability. See the [BaseDomainEvent Specification](./kernel/base-domain-event.spec.md) for details on the base class requirements.

## Specification Structure

### 1. Header Section

```markdown
# [EventName] Domain Event

## Overview

[Brief description of what the event represents and when it occurs]
```

**Guidelines:**

- Use clear, descriptive event names in past tense
- Provide a concise overview of the event's purpose
- Explain when and why the event is emitted
- Mention the business significance of the event

### 2. Event Details Section

```markdown
## Event Details

- **Event Name**: event.name
- **Aggregate Root**: EntityName
- **Triggered By**: Method or action that emits this event
- **Business Context**: Description of the business scenario
```

**Guidelines:**

- Use consistent event naming convention (`entity.action`)
- Specify which aggregate root emits the event
- Document the trigger that causes the event
- Explain the business context and significance

### 3. Payload Section

```markdown
## Payload

- fieldName: Type - Description of the field
- fieldName: Type | null - Optional field description
- fieldName: Type[] - Collection field description
```

**Guidelines:**

- List all payload fields with their types
- Use clear, descriptive field names
- Include nullability indicators (`| null`)
- Use array notation for collections (`[]`)
- Reference value objects and other entities by name
- Group related fields logically
- Ensure all fields are serializable (see BaseDomainEvent requirements)
- Payload data is passed to the BaseDomainEvent constructor

### 4. Business Rules Section

```markdown
## Business Rules

1. **Rule Name**: Description of the rule
2. **Another Rule**: Description of another rule
```

**Guidelines:**

- Number rules for easy reference
- Use descriptive rule names
- Explain the business logic clearly
- Include validation rules for payload
- Document constraints and invariants
- Mention relationship constraints

### 5. Event Lifecycle Section

```markdown
## Event Lifecycle

### When Emitted

- Description of when this event is emitted
- Business conditions that must be met
- State changes that trigger the event

### Event Processing

- How the event should be processed
- Any side effects or reactions
- Integration points with other systems
```

**Guidelines:**

- Clearly define when the event is emitted
- Explain the business conditions
- Document processing requirements
- Mention integration considerations

### 6. Dependencies Section

```markdown
## Dependencies

### Base Class

- **BaseDomainEvent** - Abstract base class that all domain events must extend

### Value Objects

- ValueObjectName
- AnotherValueObject

### Entities

- RelatedEntity

### Domain Errors

- **ErrorName** - Description of when this error is thrown
- **AnotherError** - Description of when this error is thrown
```

**Guidelines:**

- Categorize dependencies by type
- Use clear references to other components
- Document all domain errors with descriptions
- Include all value objects used in payload
- List related entities

### 7. Event Handlers Section

```markdown
## Event Handlers

### Internal Handlers

- HandlerName - Description of what this handler does
- AnotherHandler - Description of another handler

### External Handlers

- IntegrationHandler - Description of external integration
- NotificationHandler - Description of notification handling
```

**Guidelines:**

- List all known event handlers
- Categorize as internal or external
- Describe what each handler does
- Mention integration points

### 8. Tests Section

#### 8.1 Unit Tests Structure

```markdown
## Tests

### Unit Tests

#### Event Creation

- Create event with valid payload
- Create event with invalid payload (should throw error)
- Verify event properties are set correctly
- Verify event timestamp is set
```

#### 8.2 Integration Tests

```markdown
### Integration Tests

#### Event Emission

- Verify event is emitted when expected
- Verify event is not emitted when conditions not met
- Verify event payload is correct
```

#### 8.3 Event Handler Tests

```markdown
### Event Handler Tests

#### Handler Processing

- Handler processes event correctly
- Handler handles invalid event gracefully
- Handler performs expected side effects
```

**Testing Guidelines:**

- Cover event creation and validation
- Test event emission scenarios
- Test event handler processing
- Include error conditions
- Test serialization/deserialization
- Consider performance implications

### 9. Serialization Section

````markdown
## Serialization

### JSON Format

```json
{
  "eventName": "event.name",
  "aggregateId": "entity-id",
  "occurredAt": "2024-01-01T00:00:00.000Z",
  "payload": {
    "field1": "value1",
    "field2": "value2"
  }
}
```
````

### Serialization Rules

- All fields must be serializable
- Use ISO 8601 format for dates
- Include version information if needed
- Handle null and undefined values consistently

````

**Guidelines:**

- Provide example JSON format
- Document serialization rules
- Mention versioning considerations
- Explain handling of special values

### 10. Metadata Section

```markdown
## Metadata

Version: 1.0.0
Last Updated: [Date or reference to analysis]
````

## Writing Guidelines

### General Principles

1. **Clarity**: Write clear, unambiguous descriptions
2. **Completeness**: Cover all aspects of the event
3. **Consistency**: Use consistent formatting and terminology
4. **Accuracy**: Ensure all information is correct and up-to-date
5. **Maintainability**: Structure for easy updates and modifications

### Content Guidelines

1. **Business Focus**: Focus on business meaning, not technical implementation
2. **Event Naming**: Use past-tense verbs and business vocabulary
3. **Payload Design**: Keep payload minimal and focused
4. **Serialization**: Ensure all data is serializable
5. **Immutability**: Events should be immutable once created

### Formatting Guidelines

1. **Headers**: Use consistent header hierarchy
2. **Lists**: Use bullet points for better readability
3. **Code**: Use backticks for event names and types
4. **Emphasis**: Use bold for important terms and error names
5. **Structure**: Maintain consistent indentation and spacing

### Review Checklist

Before finalizing a domain event specification, ensure:

- [ ] Event name follows naming conventions
- [ ] Payload is clearly documented with types
- [ ] Business rules are clearly stated and numbered
- [ ] Event lifecycle is well documented
- [ ] All dependencies are documented
- [ ] Event handlers are identified
- [ ] Serialization format is specified
- [ ] Test coverage is comprehensive
- [ ] Formatting is consistent throughout
- [ ] Content is accurate and up-to-date
- [ ] Language is clear and unambiguous

## Example Template

````markdown
# TaskCreated Domain Event

## Overview

The TaskCreated event is emitted when a new task is successfully created in the system. This event represents the completion of the task creation process and signals that a new task entity has been added to the domain.

## Event Details

- **Event Name**: task.created
- **Aggregate Root**: Task
- **Triggered By**: Task.create() method
- **Business Context**: User creates a new task through the application interface

## Payload

- taskId: ID - Unique identifier of the created task
- title: TaskTitle - Title of the created task
- description: TaskDescription | null - Optional description of the task
- status: TaskStatus - Initial status of the task (typically 'pending')
- createdAt: DateTime - Timestamp when the task was created
- userId: ID - Identifier of the user who created the task

## Business Rules

1. **Task ID Required**: The taskId must be a valid, unique identifier
2. **Title Required**: The title must be non-empty and valid
3. **Status Consistency**: The status must be a valid task status
4. **User Context**: The userId must reference a valid user
5. **Timestamp Accuracy**: The createdAt timestamp must be accurate

## Event Lifecycle

### When Emitted

- After successful task creation
- When all validation rules pass
- After the task is persisted to storage

### Event Processing

- Event is added to the domain event collection
- Event is processed by registered handlers
- Event may trigger notifications or integrations

## Dependencies

### Value Objects

- ID
- TaskTitle
- TaskDescription
- TaskStatus
- DateTime

### Domain Errors

- **TaskCreationError** - Thrown when task creation fails
- **ValidationError** - Thrown when payload validation fails

## Event Handlers

### Internal Handlers

- TaskAuditHandler - Logs task creation for audit purposes
- TaskNotificationHandler - Sends notifications about new task

### External Handlers

- TaskSyncHandler - Synchronizes task with external systems
- AnalyticsHandler - Tracks task creation metrics

## Tests

### Unit Tests

#### Event Creation

- Create event with valid payload
- Create event with invalid payload (should throw ValidationError)
- Verify event properties are set correctly
- Verify event timestamp is set

### Integration Tests

#### Event Emission

- Verify event is emitted when task is created
- Verify event is not emitted when creation fails
- Verify event payload matches task data

### Event Handler Tests

#### Handler Processing

- Handler processes event correctly
- Handler handles invalid event gracefully
- Handler performs expected side effects

## Serialization

### JSON Format

```json
{
  "eventName": "task.created",
  "aggregateId": "task-123",
  "occurredAt": "2024-01-01T00:00:00.000Z",
  "payload": {
    "taskId": "task-123",
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the project",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "userId": "user-456"
  }
}
```
````

### Serialization Rules

- All fields must be serializable
- Use ISO 8601 format for dates
- Include version information if needed
- Handle null and undefined values consistently

## Metadata

Version: 1.0.0
Last Updated: [Date]

## Implementation Requirements

### BaseDomainEvent Extension

All domain events must extend the `BaseDomainEvent` abstract class:

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

### Required Implementation

1. **Extend BaseDomainEvent**: All events must extend the base class
2. **Implement eventName**: Must provide a unique event name constant
3. **Call Super Constructor**: Must call parent constructor with payload object
4. **Payload Validation**: Validate all payload data in constructor
5. **Immutability**: Ensure all event properties are readonly

## Best Practices

1. **Start with the business**: Focus on business meaning, not technical implementation
2. **Be specific**: Use concrete examples and clear descriptions
3. **Think about handlers**: Consider how the event will be processed
4. **Plan for evolution**: Structure the spec to accommodate future changes
5. **Validate completeness**: Ensure all aspects of the event are covered
6. **Use domain language**: Use terminology that matches the business domain
7. **Document assumptions**: Make implicit business rules explicit
8. **Consider performance**: Design payload for efficient serialization and processing
9. **Follow BaseDomainEvent patterns**: Ensure consistency with base class requirements
