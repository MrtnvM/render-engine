# Header Section Writing Specification

## Overview

This specification defines the standard format and guidelines for writing header sections in all specification documents. The header section serves as the document title and provides the first impression of the specification's content and scope.

## Section Structure

### Standard Format

```markdown
# [ComponentName] [ComponentType]

## Overview

[Brief description of what the component represents and its primary responsibilities]
```

### Component Type Classifications

- **Entity**: `[EntityName] Entity`
- **Value Object**: `[ValueObjectName] Value Object`
- **Domain Service**: `[ServiceName] Domain Service`
- **Domain Event**: `[EventName] Domain Event`
- **Domain Error**: `[ErrorName] Domain Error`
- **Use Case**: `[UseCaseName] Use Case`
- **DTO**: `[DTOName] DTO`
- **Repository**: `[RepositoryName] Repository`
- **Controller**: `[ControllerName] Controller`
- **Gateway**: `[GatewayName] Gateway`
- **Service**: `[ServiceName] Service`
- **LLM Call**: `[CallName] LLM Call`

## Writing Guidelines

### Title Guidelines

1. **Use Clear Names**: Use descriptive, business-focused component names
2. **Follow Naming Conventions**: Use PascalCase for component names
3. **Include Component Type**: Always specify the component type
4. **Be Consistent**: Use consistent naming patterns across similar components
5. **Avoid Abbreviations**: Use full words instead of abbreviations when possible

### Overview Guidelines

1. **Be Concise**: Keep the overview brief but comprehensive
2. **Focus on Purpose**: Explain what the component does and why it exists
3. **Use Domain Language**: Use business terminology, not technical jargon
4. **Mention Key Responsibilities**: Highlight the main responsibilities
5. **Explain Business Context**: Describe the component's role in the domain

### Content Requirements

1. **Business Focus**: Emphasize business value and purpose
2. **Clarity**: Write in clear, unambiguous language
3. **Completeness**: Cover the essential aspects of the component
4. **Consistency**: Use consistent terminology and formatting
5. **Accuracy**: Ensure all information is correct and up-to-date

## Examples

### Entity Header

```markdown
# Task Entity

## Overview

The Task entity represents a single task in the todo application, encapsulating task state, business rules, and lifecycle management. It serves as the primary aggregate root for task-related operations and ensures data integrity through validation and domain event emission.
```

### Value Object Header

```markdown
# TaskTitle Value Object

## Overview

The TaskTitle value object encapsulates the title of a task with validation rules and formatting constraints. It ensures that task titles meet business requirements and provides a type-safe way to handle task naming throughout the domain.
```

### Domain Service Header

```markdown
# TaskAssignmentService Domain Service

## Overview

The TaskAssignmentService encapsulates complex business logic for assigning tasks to users, including validation of assignment rules, calculation of workload distribution, and enforcement of business constraints that span multiple entities.
```

### Domain Error Header

```markdown
# TaskNotFoundError Domain Error

## Overview

The TaskNotFoundError represents the failure to locate a task by its identifier. This error is thrown when task lookup operations fail and provides context about the missing task for proper error handling and user feedback.
```

### Domain Event Header

```markdown
# TaskCreated Domain Event

## Overview

The TaskCreated event is emitted when a new task is successfully created in the system. This event represents the completion of the task creation process and signals that a new task entity has been added to the domain.
```

## Quality Checklist

Before finalizing a header section, ensure:

- [ ] Component name is clear and descriptive
- [ ] Component type is correctly specified
- [ ] Overview explains the component's purpose
- [ ] Overview mentions key responsibilities
- [ ] Overview uses domain language
- [ ] Overview is concise but comprehensive
- [ ] Title follows naming conventions
- [ ] Content is accurate and up-to-date
- [ ] Language is clear and unambiguous
- [ ] Formatting is consistent

## Common Mistakes to Avoid

1. **Vague Titles**: Avoid generic or unclear component names
2. **Missing Component Type**: Always specify what type of component it is
3. **Technical Jargon**: Use business language, not technical terms
4. **Overly Long Overviews**: Keep overviews concise and focused
5. **Inconsistent Naming**: Use consistent naming patterns
6. **Missing Context**: Explain why the component exists
7. **Outdated Information**: Ensure content is current and accurate

## Best Practices

1. **Start with Purpose**: Begin the overview with the component's primary purpose
2. **Use Active Voice**: Write in active voice for clarity
3. **Be Specific**: Use specific, concrete language
4. **Think About Users**: Consider who will read this specification
5. **Plan for Evolution**: Structure for future updates and changes
6. **Validate Completeness**: Ensure all essential aspects are covered
7. **Use Domain Language**: Use terminology that matches the business domain

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
