# ValidationResult Value Object

## Overview

The **ValidationResult** value object represents the result of validation operations performed on schemas, components, properties, and templates within the server-driven UI framework. It provides a comprehensive structure for reporting validation status, errors, warnings, and detailed information about validation outcomes.

ValidationResult enables detailed feedback about validation failures, supports multiple severity levels, and provides actionable information for resolving validation issues. It is essential for maintaining data integrity and providing meaningful feedback to users.

## Properties

### Core Properties

| Property   | Type                       | Description                       | Constraints                               |
| ---------- | -------------------------- | --------------------------------- | ----------------------------------------- | ---------------------- |
| `isValid`  | `boolean`                  | Whether validation passed         | Required                                  |
| `errors`   | `ValidationError[]`        | Array of validation errors        | Required array (can be empty)             |
| `warnings` | `ValidationWarning[]`      | Array of validation warnings      | Required array (can be empty)             |
| `info`     | `ValidationInfo[]`         | Array of validation info messages | Required array (can be empty)             |
| `context`  | `ValidationContext         | null`                             | Context in which validation was performed | Optional               |
| `duration` | `number                    | null`                             | Validation duration in milliseconds       | Optional, non-negative |
| `metadata` | `ValidationResultMetadata` | Additional result metadata        | Required                                  |

### Derived Properties

| Property            | Type                 | Description                            | Calculation                                     |
| ------------------- | -------------------- | -------------------------------------- | ----------------------------------------------- |
| `hasErrors`         | `boolean`            | Whether validation has errors          | `errors.length > 0`                             |
| `hasWarnings`       | `boolean`            | Whether validation has warnings        | `warnings.length > 0`                           |
| `hasInfo`           | `boolean`            | Whether validation has info messages   | `info.length > 0`                               |
| `errorCount`        | `number`             | Total number of errors                 | `errors.length`                                 |
| `warningCount`      | `number`             | Total number of warnings               | `warnings.length`                               |
| `infoCount`         | `number`             | Total number of info messages          | `info.length`                                   |
| `totalMessageCount` | `number`             | Total number of all messages           | `errors.length + warnings.length + info.length` |
| `severityLevel`     | `ValidationSeverity` | Highest severity level in result       | Computed from messages                          |
| `hasCriticalErrors` | `boolean`            | Whether validation has critical errors | Based on error severity                         |

## Methods

### Constructors

#### `constructor(props: ValidationResultProps)`

Creates a new ValidationResult instance with the provided properties.

**Parameters:**

- `props.isValid`: Whether validation passed (required)
- `props.errors`: Array of validation errors (required, can be empty)
- `props.warnings`: Array of validation warnings (required, can be empty)
- `props.info`: Array of validation info messages (required, can be empty)
- `props.context`: Validation context (optional)
- `props.duration`: Validation duration (optional)
- `props.metadata`: Result metadata (required)

**Returns:** New ValidationResult instance

**Business Rules:**

- isValid must accurately reflect presence of errors
- All messages must be properly structured
- Duration must be non-negative if provided
- Context must be valid if provided

### Factory Methods

#### `ValidationResult.success(context?: ValidationContext, metadata?: ValidationResultMetadata): ValidationResult`

Creates a successful validation result.

**Parameters:**

- `context`: Optional validation context
- `metadata`: Optional result metadata

**Returns:** New ValidationResult instance indicating success

#### `ValidationResult.failure(errors: ValidationError[], context?: ValidationContext, metadata?: ValidationResultMetadata): ValidationResult`

Creates a failed validation result with errors.

**Parameters:**

- `errors`: Array of validation errors
- `context`: Optional validation context
- `metadata`: Optional result metadata

**Returns:** New ValidationResult instance indicating failure

**Business Rules:**

- Errors array must not be empty
- All errors must be valid ValidationError instances
- isValid will be automatically set to false

#### `ValidationResult.withErrors(errors: ValidationError[], baseResult?: ValidationResult): ValidationResult`

Creates a validation result with additional errors.

**Parameters:**

- `errors`: Array of validation errors to add
- `baseResult`: Optional base result to extend

**Returns:** New ValidationResult instance with combined errors

#### `ValidationResult.withWarnings(warnings: ValidationWarning[], baseResult?: ValidationResult): ValidationResult`

Creates a validation result with additional warnings.

**Parameters:**

- `warnings`: Array of validation warnings to add
- `baseResult`: Optional base result to extend

**Returns:** New ValidationResult instance with combined warnings

#### `ValidationResult.withInfo(info: ValidationInfo[], baseResult?: ValidationResult): ValidationResult`

Creates a validation result with additional info messages.

**Parameters:**

- `info`: Array of validation info messages to add
- `baseResult`: Optional base result to extend

**Returns:** New ValidationResult instance with combined info

### Message Management Methods

#### `addError(error: ValidationError): ValidationResult`

Creates a new ValidationResult with additional error.

**Parameters:**

- `error`: Validation error to add

**Returns:** New ValidationResult instance with added error

**Business Rules:**

- Error must be valid ValidationError instance
- isValid will be updated to false
- Original result remains unchanged (immutability)

#### `addWarning(warning: ValidationWarning): ValidationResult`

Creates a new ValidationResult with additional warning.

**Parameters:**

- `warning`: Validation warning to add

**Returns:** New ValidationResult instance with added warning

**Business Rules:**

- Warning must be valid ValidationWarning instance
- isValid is not affected by warnings
- Original result remains unchanged (immutability)

#### `addInfo(info: ValidationInfo): ValidationResult`

Creates a new ValidationResult with additional info message.

**Parameters:**

- `info`: Validation info message to add

**Returns:** New ValidationResult instance with added info message

**Business Rules:**

- Info must be valid ValidationInfo instance
- isValid is not affected by info messages
- Original result remains unchanged (immutability)

#### `removeMessage(messageId: string): ValidationResult`

Creates a new ValidationResult with message removed.

**Parameters:**

- `messageId`: ID of message to remove

**Returns:** New ValidationResult instance with message removed

**Business Rules:**

- Message must exist in the result
- All message types can be removed
- isValid will be recalculated if errors are removed
- Original result remains unchanged (immutability)

### Query Methods

#### `getMessageById(messageId: string): ValidationError | ValidationWarning | ValidationInfo | null`

Gets a validation message by ID.

**Parameters:**

- `messageId`: ID of message to retrieve

**Returns:** Message if found, null otherwise

#### `getMessagesBySeverity(severity: ValidationSeverity): (ValidationError | ValidationWarning | ValidationInfo)[]`

Gets all messages with a specific severity level.

**Parameters:**

- `severity`: Severity level to filter by

**Returns:** Array of messages with specified severity

#### `getMessagesByPath(path: string): (ValidationError | ValidationWarning | ValidationInfo)[]`

Gets all messages related to a specific path.

**Parameters:**

- `path`: Path to filter messages by

**Returns:** Array of messages related to the path

#### `getErrorMessages(): string[]`

Gets all error messages as strings.

**Returns:** Array of error message strings

#### `getWarningMessages(): string[]`

Gets all warning messages as strings.

**Returns:** Array of warning message strings

#### `getInfoMessages(): string[]`

Gets all info messages as strings.

**Returns:** Array of info message strings

#### `getAllMessages(): string[]`

Gets all messages as strings.

**Returns:** Array of all message strings

### Utility Methods

#### `merge(other: ValidationResult): ValidationResult`

Merges this validation result with another.

**Parameters:**

- `other`: Validation result to merge with

**Returns:** New ValidationResult instance with combined messages

**Business Rules:**

- Messages from both results are combined
- isValid is true only if both results are valid
- Context and duration are handled appropriately
- Metadata is merged when possible

#### `filter(predicate: (message: ValidationError | ValidationWarning | ValidationInfo) => boolean): ValidationResult`

Filters messages based on a predicate function.

**Parameters:**

- `predicate`: Function to filter messages

**Returns:** New ValidationResult instance with filtered messages

#### `groupByPath(): Record<string, ValidationResult[]>`

Groups messages by their paths.

**Returns:** Record mapping paths to validation results

#### `sortBySeverity(): ValidationResult`

Creates a new ValidationResult with messages sorted by severity.

**Returns:** New ValidationResult instance with sorted messages

**Business Rules:**

- Messages are sorted by severity (errors first, then warnings, then info)
- Within each severity, messages maintain original order
- Original result remains unchanged (immutability)

#### `hasMessageWithCode(code: string): boolean`

Checks if any message has a specific error code.

**Parameters:**

- `code`: Error code to search for

**Returns:** True if message with code exists, false otherwise

#### `getMessagesWithCode(code: string): (ValidationError | ValidationWarning | ValidationInfo)[]`

Gets all messages with a specific error code.

**Parameters:**

- `code`: Error code to search for

**Returns:** Array of messages with the specified code

### Serialization Methods

#### `toJSON(): ValidationResultJSON`

Converts the validation result to a JSON representation.

**Returns:** JSON representation of the validation result

#### `toSummary(): ValidationSummary`

Creates a summary of the validation result.

**Returns:** ValidationSummary with key statistics

#### `toReport(): ValidationReport`

Creates a detailed validation report.

**Returns:** ValidationReport with comprehensive information

## Business Rules & Invariants

### Result Integrity Invariants

1. **Validity Consistency**: isValid must accurately reflect result state

   - isValid must be true only if there are no errors
   - isValid must be false if there are any errors
   - Warnings and info do not affect isValid
   - Validity must be maintained through all operations

2. **Message Structure**: All validation messages must be properly structured

   - Messages must have valid IDs
   - Messages must have valid severity levels
   - Messages must have meaningful content
   - Messages must have proper context information

3. **Immutability**: ValidationResult instances must be immutable
   - All modification operations return new instances
   - Original instances remain unchanged
   - State must be consistent after operations
   - Performance must be reasonable for immutability

### Context and Metadata Invariants

1. **Context Integrity**: Validation context must be properly maintained

   - Context must be valid if provided
   - Context must be relevant to validation
   - Context must provide meaningful information
   - Context must be serializable

2. **Metadata Consistency**: Result metadata must be consistent and useful
   - Metadata must be properly structured
   - Metadata must provide useful information
   - Metadata must be serializable
   - Metadata must be maintained through operations

## Dependencies

### External Dependencies

- `uuid`: For generating unique message IDs

### Internal Dependencies

- `ValidationError`: Value object for validation errors
- `ValidationWarning`: Value object for validation warnings
- `ValidationInfo`: Value object for validation info messages
- `ValidationContext`: Value object for validation context
- `ValidationSeverity`: Value object for severity levels
- `ValidationResultMetadata`: Value object for result metadata
- `ValidationSummary`: Value object for result summaries
- `ValidationReport`: Value object for detailed reports

## Errors

### Domain Errors

- `InvalidValidationResultError`: Thrown when validation result is invalid
- `InvalidMessageError`: Thrown when validation message is invalid
- `InvalidContextError`: Thrown when validation context is invalid
- `InvalidMetadataError`: Thrown when result metadata is invalid
- `MergeError`: Thrown when result merging fails
- `FilterError`: Thrown when message filtering fails

### Validation Errors

- `MessageNotFoundError`: Thrown when message is not found
- `InvalidMessageIdError`: Thrown when message ID is invalid
- `InvalidSeverityError`: Thrown when severity level is invalid
- `InvalidPathError`: Thrown when validation path is invalid

## Tests

### Unit Tests

1. **Result Creation**

   - Should create successful validation result
   - Should create failed validation result with errors
   - Should create result with warnings only
   - Should create result with info messages only
   - Should handle result metadata properly

2. **Message Management**

   - Should add error messages
   - Should add warning messages
   - Should add info messages
   - Should remove messages by ID
   - Should maintain immutability

3. **Message Querying**

   - Should get message by ID
   - Should filter messages by severity
   - Should filter messages by path
   - Should get messages by error code
   - Should handle missing messages

4. **Result Operations**

   - Should merge validation results
   - Should filter messages by predicate
   - Should group messages by path
   - Should sort messages by severity
   - Should create summaries and reports

5. **Utility Methods**
   - Should check for message codes
   - Should get message strings
   - Should handle result statistics
   - Should maintain context integrity
   - Should handle serialization

### Integration Tests

1. **Schema Validation Integration**

   - Should integrate with schema validation
   - Should handle schema-specific errors
   - Should maintain schema context
   - Should provide schema-specific feedback

2. **Component Validation Integration**

   - Should integrate with component validation
   - Should handle component-specific errors
   - Should maintain component context
   - Should provide component-specific feedback

3. **Template Validation Integration**
   - Should integrate with template validation
   - Should handle template-specific errors
   - Should maintain template context
   - Should provide template-specific feedback

## Serialization

### JSON Format

```typescript
interface ValidationResultJSON {
  isValid: boolean
  errors: ValidationErrorJSON[]
  warnings: ValidationWarningJSON[]
  info: ValidationInfoJSON[]
  context?: ValidationContextJSON
  duration?: number
  metadata: {
    timestamp: string
    validator: string
    version: string
    [key: string]: any
  }
}
```

### Serialization Rules

1. **Validity Handling**: isValid is serialized as boolean
2. **Message Handling**: Messages are serialized as structured objects
3. **Context Handling**: Context is serialized as object if present
4. **Duration Handling**: Duration is serialized as number if present
5. **Metadata**: Metadata is preserved during serialization
6. **Immutability**: Serialization preserves immutability guarantees

### Deserialization Rules

1. **Validity Validation**: isValid is validated during deserialization
2. **Message Validation**: Messages are validated during deserialization
3. **Context Validation**: Context is validated during deserialization
4. **Duration Validation**: Duration is validated during deserialization
5. **Metadata Integrity**: Metadata integrity is maintained

## Metadata

| Field                | Value                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| **Version**          | 1.0.0                                                                                                     |
| **Last Updated**     | 2025-09-15                                                                                                |
| **Author**           | Schema Management Domain Team                                                                             |
| **Status**           | Draft                                                                                                     |
| **Dependencies**     | ValidationError, ValidationWarning, ValidationInfo, ValidationContext                                     |
| **Complexity**       | Medium                                                                                                    |
| **Location**         | `packages/domain/src/schema-management/schema-validation/value-objects/validation-result.value-object.ts` |
| **Testing Priority** | High                                                                                                      |
| **Review Required**  | Yes                                                                                                       |
| **Documentation**    | Complete                                                                                                  |
| **Breaking Changes** | None                                                                                                      |
