# Methods Section Writing Specification

## Overview

This specification defines the standard format and guidelines for writing methods sections in all specification documents. The methods section documents the behavior and capabilities of components, organizing methods into logical groups with comprehensive documentation.

## Section Structure

### Standard Format

```markdown
## Methods

### [Method Group Name]

- `methodName(params: {param: Type}): ReturnType`
  - **Description:** What this method does
  - **Parameters:** Description of each parameter
  - **Returns:** Description of return value
  - **Throws:** ErrorName, AnotherError
  - **Business rules:**
    - Rule description
    - Another rule description
  - **Emits:** EventName (for command methods)
```

### Method Groups

#### For Entities

- **Core Lifecycle Methods** - Creation, updates, deletion
- **Feature-Specific Method Groups** - Organized by business capability
- **Query Methods** - Read-only operations
- **Validation Methods** - Business rule validation

#### For Value Objects

- **Factory Methods** - Creation and parsing
- **Transformation Methods** - Value transformations
- **Query Methods** - Read-only operations
- **Property Accessors** - Value access
- **Utility Methods** - Helper functions

#### For Domain Services

- **Core Business Logic Methods** - Main business operations
- **Calculation Methods** - Pure calculations
- **Validation Methods** - Business rule validation

#### For Domain Errors

- **Factory Methods** - Error creation
- **Static Factory Methods** - Common error scenarios

#### For Domain Events

- **Event Creation** - Event instantiation
- **Payload Access** - Event data access

## Writing Guidelines

### Method Documentation

1. **Method Signature**: Include complete method signature
2. **Description**: Clear explanation of what the method does
3. **Parameters**: Document each parameter with type and description
4. **Returns**: Describe the return value and its type
5. **Throws**: List all possible exceptions
6. **Business Rules**: Document business logic and constraints
7. **Emits**: List domain events (for command methods)

### Method Grouping

1. **Logical Organization**: Group related methods together
2. **Clear Group Names**: Use descriptive group names
3. **Consistent Ordering**: Use consistent ordering within groups
4. **Purpose-Based**: Group by business purpose, not technical implementation

### Signature Format

1. **TypeScript Syntax**: Use proper TypeScript method signatures
2. **Parameter Objects**: Use object parameters for multiple parameters
3. **Return Types**: Include complete return type information
4. **Generic Types**: Include generic type parameters when applicable

## Content Requirements

### Required Information

- Complete method signature
- Clear description
- Parameter documentation
- Return value documentation
- Exception documentation
- Business rules

### Optional Information

- Usage examples
- Performance notes
- Side effects
- Dependencies
- Implementation notes

## Examples

### Entity Methods

```markdown
## Methods

### Core Lifecycle Methods

- `create(params: {title: TaskTitle, description?: TaskDescription}): Task`
  - **Description:** Creates a new task with the specified title and optional description
  - **Parameters:**
    - title: Task title value object
    - description: Optional task description
  - **Returns:** New Task entity instance
  - **Throws:** ValidationError, TaskTitleRequiredError
  - **Business rules:**
    - Task title must be provided and valid
    - Task description is optional but must be valid if provided
    - New task starts with 'pending' status
  - **Emits:** TaskCreatedEvent

- `updateTitle(newTitle: TaskTitle): void`
  - **Description:** Updates the task title with validation
  - **Parameters:**
    - newTitle: New task title value object
  - **Returns:** void
  - **Throws:** ValidationError, TaskTitleRequiredError
  - **Business rules:**
    - New title must be different from current title
    - Title must meet validation requirements
  - **Emits:** TaskTitleUpdatedEvent

### Query Methods

- `isCompleted(): boolean`
  - **Description:** Checks if the task is in completed status
  - **Returns:** true if task status is 'completed'
  - **Business rules:**
    - Only tasks with 'completed' status return true

- `getDaysUntilDue(): number | null`
  - **Description:** Calculates days remaining until due date
  - **Returns:** Number of days or null if no due date
  - **Business rules:**
    - Returns null if no due date is set
    - Returns negative number if overdue
```

### Value Object Methods

```markdown
## Methods

### Factory Methods

- `static create(value: string): TaskTitle`
  - **Description:** Creates a new TaskTitle from a string value
  - **Parameters:**
    - value: String value to create title from
  - **Returns:** New TaskTitle instance
  - **Throws:** ValidationError, InvalidValueError
  - **Business rules:**
    - Value must be non-empty string
    - Value must be between 1 and 100 characters
    - Value is trimmed of whitespace

- `static fromString(value: string): TaskTitle`
  - **Description:** Creates TaskTitle from string with parsing
  - **Parameters:**
    - value: String to parse
  - **Returns:** New TaskTitle instance
  - **Throws:** ParseError, ValidationError
  - **Business rules:**
    - String is parsed and validated
    - Invalid format throws ParseError

### Transformation Methods

- `toUpperCase(): TaskTitle`
  - **Description:** Returns new TaskTitle with uppercase value
  - **Returns:** New TaskTitle with uppercase value
  - **Business rules:**
    - Original instance remains unchanged
    - New instance has uppercase value

### Query Methods

- `isValid(): boolean`
  - **Description:** Checks if the title meets all validation rules
  - **Returns:** true if title is valid
  - **Business rules:**
    - Validates length, format, and content

### Property Accessors

- `get value(): string`
  - **Description:** Returns the underlying string value
  - **Returns:** The primitive string value
  - **Business rules:**
    - Value is immutable after creation

- `toString(): string`
  - **Description:** Returns string representation
  - **Returns:** String representation of the title
  - **Business rules:**
    - Returns the underlying value
```

### Domain Service Methods

```markdown
## Methods

### Core Business Logic Methods

- `assignTask(params: {task: Task, user: User}): AssignmentResult`
  - **Description:** Assigns a task to a user with validation
  - **Parameters:**
    - task: Task entity to assign
    - user: User entity to assign to
  - **Returns:** AssignmentResult with success status and details
  - **Throws:** TaskAlreadyAssignedError, UserOverloadedError
  - **Business rules:**
    - Task must not already be assigned
    - User must not exceed maximum concurrent tasks
    - User must have required skills for task

### Calculation Methods

- `calculateWorkload(user: User): WorkloadInfo`
  - **Description:** Calculates current workload for a user
  - **Parameters:**
    - user: User entity to calculate workload for
  - **Returns:** WorkloadInfo with current and maximum capacity
  - **Business rules:**
    - Counts active tasks assigned to user
    - Calculates percentage of maximum capacity
    - Considers task priority in calculation
```

### Domain Error Methods

```markdown
## Methods

### Factory Methods

- `static withId(taskId: string): TaskNotFoundError`
  - **Description:** Creates error for specific task ID
  - **Parameters:**
    - taskId: ID of the task that was not found
  - **Returns:** TaskNotFoundError instance
  - **Business rules:**
    - Task ID must be valid string
    - Error message includes task ID

- `static withCriteria(criteria: object): TaskNotFoundError`
  - **Description:** Creates error for search criteria
  - **Parameters:**
    - criteria: Search criteria that failed
  - **Returns:** TaskNotFoundError instance
  - **Business rules:**
    - Criteria object is included in metadata
```

## Quality Checklist

Before finalizing a methods section, ensure:

- [ ] All methods are documented
- [ ] Method signatures are complete and accurate
- [ ] Descriptions are clear and specific
- [ ] Parameters are documented with types and descriptions
- [ ] Return values are documented
- [ ] Exceptions are listed
- [ ] Business rules are documented
- [ ] Methods are grouped logically
- [ ] Group names are descriptive
- [ ] Formatting is consistent

## Common Mistakes to Avoid

1. **Incomplete Signatures**: Include complete method signatures
2. **Missing Parameters**: Document all parameters
3. **Vague Descriptions**: Be specific about what methods do
4. **Missing Exceptions**: List all possible exceptions
5. **Inconsistent Grouping**: Use logical, consistent grouping
6. **Technical Jargon**: Use domain language
7. **Missing Business Rules**: Document business logic

## Best Practices

1. **Group Logically**: Organize methods by business purpose
2. **Be Comprehensive**: Document all aspects of each method
3. **Use Clear Names**: Choose descriptive method and group names
4. **Document Everything**: Include all required information
5. **Use Domain Language**: Use business terminology
6. **Be Consistent**: Use consistent formatting and structure
7. **Keep It Current**: Update when methods change

## Special Considerations

### Command vs Query Methods

- **Command Methods**: Change state, emit events
- **Query Methods**: Read-only, no side effects
- **Factory Methods**: Create new instances
- **Validation Methods**: Check business rules

### Method Visibility

- **Public Methods**: Document fully
- **Protected Methods**: Document with access level
- **Private Methods**: Document if significant

### Static Methods

- Mark as `static` in signature
- Explain when to use static methods
- Document factory method patterns

### Abstract Methods

- Mark as `abstract` in signature
- Explain implementation requirements
- Document base class expectations

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
