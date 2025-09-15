# Fields/Properties Section Writing Specification

## Overview

This specification defines the standard format and guidelines for writing fields/properties sections in all specification documents. This section documents the internal state and data structure of components, providing clear type information and descriptions for all properties.

## Section Structure

### Standard Format

```markdown
## Fields

- fieldName: Type - Description of the field
- fieldName: Type | null - Optional field description
- fieldName: Type[] - Collection field description
- fieldName: Type | undefined - Optional field description
```

### Alternative Formats

#### For Value Objects

```markdown
## Properties

- propertyName: Type - Description of the property
- propertyName: Type | null - Optional property description
```

#### For Errors

```markdown
## Error Properties

- propertyName: Type - Description of the property
- propertyName: Type | null - Optional property description
```

#### For Events

```markdown
## Payload

- fieldName: Type - Description of the field
- fieldName: Type | null - Optional field description
```

## Writing Guidelines

### Field Documentation

1. **Field Name**: Use clear, descriptive property names
2. **Type Information**: Include complete type information
3. **Description**: Provide clear, concise descriptions
4. **Nullability**: Indicate optional fields with `| null` or `| undefined`
5. **Collections**: Use array notation `[]` for collections
6. **References**: Reference other components by name

### Type Documentation

1. **Primitive Types**: Use standard TypeScript types
2. **Value Objects**: Reference by name (e.g., `Email`, `TaskTitle`)
3. **Entities**: Reference by name (e.g., `User`, `Task`)
4. **Enums**: Reference by name (e.g., `TaskStatus`, `Priority`)
5. **Collections**: Use array notation (e.g., `Task[]`, `string[]`)
6. **Optional Fields**: Use union types (e.g., `string | null`)

### Description Guidelines

1. **Be Specific**: Describe what the field represents
2. **Use Domain Language**: Use business terminology
3. **Explain Purpose**: Explain why the field exists
4. **Mention Constraints**: Include validation rules if relevant
5. **Keep Concise**: Be clear but brief

## Content Requirements

### Required Information

- Field/property name
- Complete type information
- Clear description
- Nullability indicators
- Collection indicators

### Optional Information

- Validation rules
- Default values
- Constraints
- Business rules
- Usage examples

## Examples

### Entity Fields

```markdown
## Fields

- id: ID - Unique identifier (inherited from Entity base class)
- title: TaskTitle - Title of the task
- description: TaskDescription | null - Optional detailed description
- status: TaskStatus - Current status of the task
- priority: Priority - Priority level of the task
- assignedTo: User | null - User assigned to the task
- dueDate: DateTime | null - Optional due date for the task
- subtasks: Subtask[] - Collection of subtasks
- tags: string[] - Array of tag names
- createdAt: Date - Timestamp when task was created
- updatedAt: Date - Timestamp when task was last updated
```

### Value Object Properties

```markdown
## Properties

- value: string - The underlying string value
- normalizedValue: string - Normalized version for comparison
- length: number - Character count of the title
```

### Error Properties

```markdown
## Error Properties

- taskId: string - Identifier of the task that was not found
- searchCriteria: object - Criteria used in the search
- timestamp: Date - When the error occurred
```

### Event Payload

```markdown
## Payload

- taskId: ID - Unique identifier of the created task
- title: TaskTitle - Title of the created task
- description: TaskDescription | null - Optional description
- status: TaskStatus - Initial status of the task
- assignedTo: User | null - User assigned to the task
- createdAt: DateTime - Timestamp when task was created
- createdBy: ID - Identifier of the user who created the task
```

### Service Properties

```markdown
## Properties

- maxConcurrentTasks: number - Maximum tasks per user
- skillMatchingEnabled: boolean - Whether skill matching is required
- workloadThreshold: number - Maximum workload percentage
```

## Type Reference Guidelines

### Primitive Types

- `string` - Text data
- `number` - Numeric data
- `boolean` - True/false values
- `Date` - Date and time values
- `object` - Generic object data

### Domain Types

- `ID` - Unique identifier value object
- `Email` - Email address value object
- `TaskTitle` - Task title value object
- `TaskStatus` - Task status enumeration
- `User` - User entity
- `Task` - Task entity

### Collection Types

- `string[]` - Array of strings
- `Task[]` - Array of task entities
- `ID[]` - Array of identifiers

### Optional Types

- `string | null` - Optional string
- `Task | undefined` - Optional task entity
- `Date | null | undefined` - Optional date

## Quality Checklist

Before finalizing a fields/properties section, ensure:

- [ ] All fields are documented
- [ ] Type information is complete and accurate
- [ ] Descriptions are clear and specific
- [ ] Nullability is properly indicated
- [ ] Collections are marked with `[]`
- [ ] Domain types are referenced by name
- [ ] Inherited fields are noted
- [ ] Descriptions use domain language
- [ ] Information is accurate and up-to-date
- [ ] Formatting is consistent

## Common Mistakes to Avoid

1. **Missing Types**: Always include complete type information
2. **Vague Descriptions**: Be specific about what fields represent
3. **Inconsistent Formatting**: Use consistent formatting throughout
4. **Missing Nullability**: Indicate optional fields clearly
5. **Technical Jargon**: Use domain language, not technical terms
6. **Incomplete Information**: Document all relevant fields
7. **Outdated Types**: Ensure type information is current

## Best Practices

1. **Group Related Fields**: Organize fields logically
2. **Use Clear Names**: Choose descriptive field names
3. **Be Consistent**: Use consistent formatting and terminology
4. **Document Everything**: Include all relevant fields
5. **Explain Purpose**: Help readers understand field usage
6. **Use Domain Language**: Use business terminology
7. **Keep It Current**: Update when fields change

## Special Considerations

### Inherited Fields

- Mark inherited fields clearly
- Reference the base class
- Explain inheritance relationship

### Computed Properties

- Mark as computed if applicable
- Explain calculation method
- Mention dependencies

### Private Fields

- Use underscore prefix convention
- Explain why they're private
- Document access patterns

### Readonly Fields

- Mark as readonly if applicable
- Explain immutability
- Mention when values are set

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
