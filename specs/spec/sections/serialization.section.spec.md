# Serialization Section Writing Specification

## Overview

This specification defines the standard format and guidelines for writing serialization sections in all specification documents. The serialization section documents how components are converted to and from JSON format, including data structure, rules, and requirements.

## Section Structure

### Standard Format

````markdown
## Serialization

### JSON Format

```json
{
  "property1": "value1",
  "property2": "value2",
  "property3": {
    "nestedProperty": "nestedValue"
  }
}
```
````

### Serialization Rules

- All properties must be serializable
- Use consistent data types
- Handle null and undefined values consistently
- Preserve data integrity
- Support versioning when needed

````

### Alternative Formats

#### For Domain Errors
```markdown
## Serialization

### JSON Format

```json
{
  "name": "ErrorClassName",
  "message": "Human readable error message",
  "code": "ERROR_CODE",
  "metadata": {
    "property1": "value1",
    "property2": "value2"
  }
}
````

### Serialization Rules

- All properties must be serializable
- Use consistent error code format
- Include relevant metadata
- Handle null and undefined values consistently

````

#### For Domain Events
```markdown
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
````

### Serialization Rules

- All fields must be serializable
- Use ISO 8601 format for dates
- Include version information if needed
- Handle null and undefined values consistently

````

## Writing Guidelines

### JSON Format Documentation

1. **Complete Structure**: Show the complete JSON structure
2. **Real Examples**: Use realistic example values
3. **Nested Objects**: Show nested object structures
4. **Arrays**: Include array examples when applicable
5. **Data Types**: Use appropriate JSON data types

### Serialization Rules

1. **Data Integrity**: Ensure data is preserved
2. **Type Consistency**: Use consistent data types
3. **Null Handling**: Document null/undefined handling
4. **Versioning**: Mention versioning if applicable
5. **Performance**: Consider serialization performance

### Content Requirements

1. **Complete Examples**: Show full JSON examples
2. **Clear Rules**: Document all serialization rules
3. **Data Types**: Specify expected data types
4. **Constraints**: Mention any constraints
5. **Versioning**: Include versioning information if needed

## Content Requirements

### Required Information

- Complete JSON format example
- Serialization rules
- Data type specifications
- Null handling rules

### Optional Information

- Versioning information
- Performance considerations
- Migration notes
- Compatibility requirements

## Examples

### Entity Serialization

```markdown
## Serialization

### JSON Format

```json
{
  "id": "task-123",
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the project",
  "status": "pending",
  "priority": "high",
  "assignedTo": "user-456",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "subtasks": [
    {
      "id": "subtask-789",
      "title": "Write API documentation",
      "status": "completed"
    }
  ],
  "tags": ["documentation", "project"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
````

### Serialization Rules

- All properties must be JSON serializable
- Use ISO 8601 format for dates
- Include all entity properties
- Preserve nested object structures
- Handle null and undefined values consistently
- Use consistent naming conventions

````

### Value Object Serialization

```markdown
## Serialization

### JSON Format

```json
{
  "value": "Complete project documentation",
  "normalizedValue": "complete project documentation",
  "length": 28
}
````

### Serialization Rules

- Value object properties must be serializable
- Include all relevant properties
- Preserve data integrity
- Use consistent data types
- Handle null values appropriately

````

### Domain Error Serialization

```markdown
## Serialization

### JSON Format

```json
{
  "name": "TaskNotFoundError",
  "message": "Task with ID 'task-123' not found",
  "code": "TASK_NOT_FOUND",
  "metadata": {
    "taskId": "task-123",
    "searchCriteria": {
      "status": "pending",
      "assignedTo": "user-456"
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
````

### Serialization Rules

- All properties must be serializable
- Use consistent error code format
- Include relevant metadata
- Handle null and undefined values consistently
- Preserve error context information

````

### Domain Event Serialization

```markdown
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
    "description": "Write comprehensive documentation",
    "status": "pending",
    "assignedTo": "user-456",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "createdBy": "user-456"
  }
}
```
```

### Serialization Rules

- All fields must be serializable
- Use ISO 8601 format for dates
- Include version information if needed
- Handle null and undefined values consistently
- Preserve event context

## Quality Checklist

Before finalizing a serialization section, ensure:

- [ ] JSON format is complete and accurate
- [ ] Example values are realistic
- [ ] Serialization rules are documented
- [ ] Data types are specified
- [ ] Null handling is documented
- [ ] Versioning is mentioned if applicable
- [ ] Formatting is consistent
- [ ] Information is accurate and up-to-date
- [ ] Examples are comprehensive
- [ ] Rules are clear and actionable

## Common Mistakes to Avoid

1. **Incomplete Examples**: Show complete JSON structure
2. **Unrealistic Values**: Use realistic example values
3. **Missing Rules**: Document all serialization rules
4. **Inconsistent Types**: Use consistent data types
5. **Poor Formatting**: Use proper JSON formatting
6. **Missing Null Handling**: Document null/undefined handling
7. **Outdated Information**: Keep serialization info current

## Best Practices

1. **Use Real Examples**: Provide realistic JSON examples
2. **Document Everything**: Include all serialization rules
3. **Be Consistent**: Use consistent data types and formats
4. **Handle Edge Cases**: Document null/undefined handling
5. **Consider Versioning**: Plan for future changes
6. **Test Examples**: Ensure examples are valid JSON
7. **Keep It Current**: Update when structure changes

## Special Considerations

### Date Serialization

- Use ISO 8601 format for dates
- Include timezone information when relevant
- Handle date parsing consistently
- Consider date precision requirements

### Null and Undefined Handling

- Document how null values are handled
- Specify undefined value behavior
- Consider optional vs required fields
- Plan for backward compatibility

### Nested Object Serialization

- Show nested object structure
- Document nested object rules
- Consider deep vs shallow serialization
- Handle circular references if applicable

### Array Serialization

- Show array structure
- Document array element types
- Consider empty array handling
- Plan for array size limits

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
````
