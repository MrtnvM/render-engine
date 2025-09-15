# Dependencies Section Writing Specification

## Overview

This specification defines the standard format for writing dependencies sections in specification documents. The dependencies section documents all external dependencies, relationships, and references that a component requires.

## Section Structure

### Standard Format

```markdown
## Dependencies

### Base Class

- **BaseClassName** - Description of the base class
  - **Location**: `path/to/base-class.ts`
  - **Purpose**: What the base class provides
  - **Required**: Whether this dependency is required

### Value Objects

- ValueObjectName - Description of how this value object is used

### Entities

- EntityName - Description of how this entity is referenced

### Domain Events

- EventName - Description of when this event is used

### Domain Errors

- **ErrorName** - Description of when this error is thrown

### Other Dependencies

- DependencyName - Description of the dependency
```

### Alternative Formats

#### For Domain Errors

```markdown
## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend
  - **Location**: `packages/domain/src/kernel/errors/base.domain-error.ts`
  - **Purpose**: Provides common functionality for error structure, serialization, and metadata handling
  - **Required**: All domain errors must extend this class

### Value Objects

- May reference entity IDs that are value objects

### Entities

- Referenced by entityType property

### Other Domain Errors

- **RelatedError** - Description of related error
```

#### For Domain Services

```markdown
## Dependencies

### Entities

- EntityName

### Value Objects

- ValueObjectName

### Domain Errors

- **ErrorName** - Description of when this error is thrown

### Policies/Strategies (if any)

- PolicyName
```

## Writing Guidelines

### Dependency Categorization

1. **Base Classes**: Abstract base classes that the component extends
2. **Value Objects**: Value objects used in properties or methods
3. **Entities**: Entities referenced or operated on
4. **Domain Events**: Events emitted or handled
5. **Domain Errors**: Errors thrown or caught
6. **Other Dependencies**: Any other dependencies

### Documentation Requirements

- **Dependency Name**: Clear name of the dependency
- **Description**: How the dependency is used
- **Location**: File path for base classes
- **Purpose**: What the dependency provides
- **Required**: Whether the dependency is mandatory

### Description Guidelines

- **Be Specific**: Explain exactly how the dependency is used
- **Use Domain Language**: Use business terminology
- **Explain Purpose**: Why the dependency is needed
- **Keep Concise**: Be clear but brief

## Examples

### Entity Dependencies

```markdown
## Dependencies

### Base Class

- **Entity<Id>** - Abstract base class providing common entity functionality
  - **Location**: `packages/domain/src/kernel/entities/base.entity.ts`
  - **Purpose**: Provides identity management, domain event handling, lifecycle tracking, and entity comparison
  - **Required**: All entities must extend this class

### Value Objects

- ID - Unique identifier for the task
- TaskTitle - Title of the task with validation
- TaskStatus - Status enumeration for the task
- Priority - Priority level enumeration

### Entities

- User - User assigned to the task
- Project - Project that contains the task

### Domain Events

- TaskCreatedEvent - Emitted when task is created
- TaskUpdatedEvent - Emitted when task is updated

### Domain Errors

- **ValidationError** - Thrown when validation fails
- **TaskTitleRequiredError** - Thrown when title is missing
- **UserNotFoundError** - Thrown when assigned user doesn't exist
```

### Value Object Dependencies

```markdown
## Dependencies

### Base Class

- **ValueObject<string>** - Abstract base class providing common value object functionality
  - **Location**: `packages/domain/src/kernel/value-objects/base.value-object.ts`
  - **Purpose**: Provides immutability, equality comparison, and serialization framework
  - **Required**: All value objects must extend this class

### Domain Errors

- **ValidationError** - Thrown when validation fails
- **InvalidValueError** - Thrown when value is invalid
```

### Domain Service Dependencies

```markdown
## Dependencies

### Entities

- Task
- User

### Value Objects

- ID
- TaskStatus

### Domain Errors

- **TaskNotFoundError** - Thrown when task is not found
- **UserNotFoundError** - Thrown when user is not found

### Policies/Strategies

- AssignmentPolicy
```

## Quality Checklist

Before finalizing a dependencies section, ensure:

- [ ] All dependencies are documented
- [ ] Dependencies are properly categorized
- [ ] Descriptions explain how dependencies are used
- [ ] Base class information is complete
- [ ] File paths are accurate
- [ ] Descriptions use domain language
- [ ] Formatting is consistent

## Common Mistakes to Avoid

1. **Missing Dependencies**: Document all required dependencies
2. **Incomplete Information**: Include all required details
3. **Incorrect Paths**: Ensure file paths are accurate
4. **Vague Descriptions**: Be specific about how dependencies are used
5. **Inconsistent Formatting**: Use consistent formatting throughout

## Best Practices

1. **Be Comprehensive**: Document all dependencies
2. **Use Clear Categories**: Organize dependencies logically
3. **Explain Usage**: Describe how each dependency is used
4. **Use Domain Language**: Use business terminology
5. **Be Consistent**: Use consistent formatting and structure

## Special Considerations

### Base Class Dependencies

- Always include base class information
- Provide complete location and purpose
- Indicate if required or optional

### Optional Dependencies

- Mark optional dependencies clearly
- Explain when they're used

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
