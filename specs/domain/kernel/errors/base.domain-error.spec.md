# DomainError Abstract Class Specification

## Overview

The DomainError is an abstract base class that provides the foundation for all domain errors in the system. It implements common functionality for error structure, serialization, and metadata handling, ensuring consistency across all domain errors while enforcing the core principles of domain-driven design.

## Class Structure

### Abstract Class Definition

```typescript
export abstract class DomainError extends Error {
  public readonly name: string
  public readonly code: string
  public readonly metadata: Record<string, unknown>

  protected constructor(params: { message: string; code?: string; metadata?: Record<string, unknown> })

  toString(): string
  toJSON(): object
}
```

## Core Properties

### Public Properties

- **name**: `string` (readonly)
  - **Purpose**: The name of the error class
  - **Source**: Automatically set to `this.constructor.name`
  - **Immutability**: Set once during construction, cannot be modified
  - **Usage**: Error identification and debugging

- **code**: `string` (readonly)
  - **Purpose**: Unique error code for programmatic identification
  - **Default**: Auto-generated from class name if not provided
  - **Format**: UPPER_SNAKE_CASE (e.g., `USER_NOT_FOUND`, `VALIDATION_FAILED`)
  - **Immutability**: Set once during construction, cannot be modified
  - **Usage**: Error handling, logging, API responses

- **metadata**: `Record<string, unknown>` (readonly)
  - **Purpose**: Additional context data for the error
  - **Type**: Flexible object with string keys and unknown values
  - **Optional**: Can be undefined if no additional context is needed
  - **Immutability**: Set once during construction, cannot be modified
  - **Usage**: Debugging, error reporting, context preservation

### Inherited Properties

- **message**: `string` (from Error)
  - **Purpose**: Human-readable error description
  - **Source**: Passed to parent Error constructor
  - **Requirements**: Must be descriptive and domain-focused
  - **Usage**: User-facing error messages, logging

## Constructor

### Signature

```typescript
protected constructor(params: {
  message: string;
  code?: string;
  metadata?: Record<string, unknown>
})
```

### Parameters

- **message**: `string` (required)
  - **Purpose**: Human-readable error description
  - **Requirements**: Must be descriptive and domain-focused
  - **Format**: Should use domain language, not technical terms
  - **Examples**:
    - ✅ "User with email 'john@example.com' is already registered"
    - ❌ "Email already exists in database"

- **code**: `string` (required)
  - **Purpose**: Unique error code for programmatic identification
  - **Default**: Auto-generated from class name using PascalCase to UPPER_SNAKE_CASE conversion
  - **Format**: UPPER_SNAKE_CASE
  - **Examples**: `USER_ALREADY_REGISTERED`, `INVALID_EMAIL_FORMAT`

- **metadata**: `Record<string, unknown>`
  - **Purpose**: Additional context data for debugging and error handling
  - **Type**: Object with string keys and unknown values
  - **Serialization**: Must be JSON serializable
  - **Examples**: `{ userId: "123", email: "john@example.com" }`

### Implementation Rules

1. **Protected Access**: Constructor is protected to prevent direct instantiation
2. **Message Validation**: Message must be provided and non-empty
3. **Code Generation**: Auto-generate code from class name if not provided
4. **Metadata Serialization**: Ensure metadata is JSON serializable
5. **Metadata Immutability**: Freeze metadata object using `Object.freeze()` to prevent modifications
6. **Prototype Setting**: Properly set prototype for instanceof checks

## Public Methods

### toString

```typescript
toString(): string
```

- **Purpose**: Provides string representation of the error
- **Returns**: Formatted string with error code and message
- **Format**: `[ERROR_CODE] Error message`
- **Example**: `[USER_NOT_FOUND] User with ID '123' not found`
- **Usage**: Logging, debugging, error display

## Implementation Requirements

### For Concrete Error Classes

1. **Extend DomainError**: All domain errors must extend this class
2. **Call Super Constructor**: Must call parent constructor with required parameters
3. **Provide Meaningful Messages**: Use domain language in error messages
4. **Include Relevant Metadata**: Add context data when helpful
5. **Use Static Factory Methods**: Prefer static factory methods for common scenarios
6. **Immutability**: Ensure all error data is immutable

### Example Implementation

```typescript
export class UserNotFoundError extends DomainError {
  readonly userId: string

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.userId = params.metadata?.userId as string
  }

  static withId(userId: string): UserNotFoundError {
    return new UserNotFoundError({
      message: `User with ID '${userId}' not found`,
      code: 'USER_NOT_FOUND',
      metadata: { userId },
    })
  }
}
```

## Business Rules & Invariants

1. **Error Name Uniqueness**: Each error type must have a unique class name
2. **Message Clarity**: Error messages must be clear and domain-focused
3. **Code Consistency**: Error codes must follow UPPER_SNAKE_CASE convention
4. **Metadata Serialization**: All metadata must be JSON serializable
5. **Metadata Immutability**: Metadata objects must be frozen to prevent modifications after creation
6. **Error Data Immutability**: All error properties cannot be modified after creation
7. **Constructor Protection**: Only concrete error classes can instantiate errors

## Error Categories

### Validation Errors

Errors that occur when input data fails validation rules:

- **ValidationError**: General validation failure
- **ParseError**: Data parsing failure
- **FormatError**: Data format validation failure
- **RequiredFieldError**: Missing required field
- **InvalidValueError**: Invalid field value

### Business Rule Violations

Errors that occur when business rules are violated:

- **BusinessRuleViolationError**: General business rule violation
- **StateTransitionError**: Invalid state transition
- **ConstraintViolationError**: Domain constraint violation
- **InvariantViolationError**: Entity invariant violation

### Entity Errors

Errors related to entity operations:

- **EntityNotFoundError**: Entity not found by ID
- **EntityAlreadyExistsError**: Entity already exists
- **EntityStateError**: Invalid entity state
- **EntityOperationError**: Invalid entity operation

### Domain Service Errors

Errors from domain services:

- **DomainServiceError**: General domain service error
- **ServiceUnavailableError**: Service temporarily unavailable
- **ServiceConfigurationError**: Service configuration error

## Serialization Rules

### JSON Format

All errors serialize to the following JSON structure:

```json
{
  "name": "UserNotFoundError",
  "message": "User with ID '123' not found",
  "code": "USER_NOT_FOUND",
  "metadata": {
    "userId": "123",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Serialization Requirements

1. **JSON Compatibility**: All properties must be JSON serializable
2. **Metadata Validation**: Metadata must pass schema validation
3. **Consistent Format**: All errors follow the same structure
4. **Error Preservation**: Serialization preserves all error information
5. **Metadata Immutability**: Metadata objects are frozen to prevent runtime modifications

## Metadata Freezing Requirements

### Why Freeze Metadata?

Since metadata is stored by reference, multiple errors can share the same metadata object. To prevent unexpected mutations and maintain data integrity, all metadata objects must be frozen.

### Implementation

```typescript
// In the constructor
if (metadata) {
  this.metadata = Object.freeze(metadata)
} else {
  this.metadata = Object.freeze({})
}
```

### Benefits

1. **Prevents Mutations**: Frozen objects cannot be modified after creation
2. **Reference Safety**: Multiple errors can safely share the same metadata reference
3. **Data Integrity**: Ensures metadata remains consistent throughout the error's lifetime
4. **Debugging Clarity**: Frozen metadata provides clear error state at any point

### Behavior

```typescript
const metadata = { userId: '123' }
const error = new DomainServiceError({
  message: 'User not found',
  metadata,
})

// This will NOT affect error.metadata because it's frozen
metadata.userId = '456'

// error.metadata.userId remains '123'
console.log(error.metadata.userId) // '123'

// Attempting to modify frozen metadata will throw in strict mode
error.metadata.userId = '789' // TypeError: Cannot assign to read only property
```

## Dependencies

### Core Dependencies

- **Error**: JavaScript built-in Error class
- **Object.freeze()**: JavaScript built-in method for object immutability
- **Record<string, unknown>**: TypeScript utility type

### No External Dependencies

- The base class has minimal external dependencies
- Uses only essential libraries for validation
- Designed for maximum compatibility

## Usage Guidelines

### Error Creation

```typescript
// Create error with factory methods
const error = new UserNotFoundError.withId('123')
```

### Error Handling

```typescript
// Check error type
if (error instanceof UserNotFoundError) {
  const userId = error.userId
  // Handle user not found
}

// Access error properties
const errorCode = error.code
const errorMessage = error.message
const errorMetadata = error.metadata
```

### Error Serialization

```typescript
// Convert to string
const errorString = error.toString()

// Convert to JSON
const errorJson = error.toJSON()
```

## Testing Requirements

### Unit Tests

#### Constructor Testing

- Create error with valid parameters
- Create error with auto-generated code
- Create error with custom code
- Verify properties are set correctly
- Test metadata serialization
- Verify metadata object is frozen
- Test that frozen metadata cannot be modified

#### Error Handling Testing

- Test instanceof checks
- Test error message formatting
- Test toString() output
- Test JSON serialization

#### Validation Testing

- Test with invalid parameters
- Test metadata validation
- Test schema compliance

### Integration Tests

#### Error Propagation

- Test error throwing in entities
- Test error catching in services
- Test error handling in use cases

#### Error Serialization

- Test error persistence
- Test error retrieval
- Test error transmission

## Error Handling Patterns

### Entity Error Handling

```typescript
// In entity methods
if (!user.isActive) {
  throw UserNotFoundError.withId(userId)
}
```

### Service Error Handling

```typescript
// In domain services
try {
  return await this.userRepository.findById(userId)
} catch (error) {
  if (error instanceof UserNotFoundError) {
    throw error // Re-throw domain errors
  }
  throw new DomainServiceError({
    message: 'Failed to retrieve user',
    metadata: { originalError: error.message },
  })
}
```

### Use Case Error Handling

```typescript
// In use cases
try {
  return await this.userService.activateUser(userId)
} catch (error) {
  if (error instanceof UserNotFoundError) {
    return Result.failure('User not found')
  }
  if (error instanceof UserAlreadyActiveError) {
    return Result.failure('User is already active')
  }
  return Result.failure('Unexpected error occurred')
}
```

## Performance Considerations

### Memory Usage

- Errors are lightweight objects
- Metadata is stored by reference (frozen to prevent mutations)
- Minimal memory overhead per error

### Error Creation Performance

- Constructor is optimized for speed
- Minimal processing overhead
- Efficient property setting

### Serialization Performance

- toString() and toJSON() serialization are optimized
- Uses native JSON.stringify when possible
- Minimal processing overhead

## Best Practices

1. **Use Domain Language**: Error messages should use business terminology
2. **Include Context**: Add relevant metadata for debugging
3. **Be Specific**: Create specific error types for different scenarios
4. **Use Factory Methods**: Provide static factory methods for common cases
5. **Ensure Metadata Immutability**: Always freeze metadata objects to prevent mutations
6. **Test Thoroughly**: Test error creation, handling, and metadata immutability
7. **Document Errors**: Provide clear documentation for each error type
8. **Handle Gracefully**: Implement proper error handling patterns
9. **Log Appropriately**: Include errors in logging with proper context

## Migration and Evolution

### Backward Compatibility

- Base class changes should be backward compatible
- New properties should be optional
- Deprecated methods should be marked clearly

### Error Versioning

- Consider adding version field for future evolution
- Plan for error schema changes
- Document breaking changes clearly

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
Base Class Location: `packages/domain/src/kernel/errors/base.domain-error.ts`
