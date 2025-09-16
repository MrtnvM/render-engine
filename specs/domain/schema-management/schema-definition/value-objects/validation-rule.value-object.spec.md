# ValidationRule Value Object

## Overview

The **ValidationRule** value object represents a validation rule that can be applied to properties and components within the server-driven UI framework. Validation rules define the constraints and requirements that data must satisfy to be considered valid. They are immutable and can be composed to create complex validation logic.

Validation rules support various validation types, custom error messages, and can be configured with parameters to create flexible and reusable validation logic. They are essential for ensuring data integrity and providing meaningful feedback to users when validation fails.

## Properties

### Core Properties

| Property       | Type                        | Description                                  | Constraints                                 |
| -------------- | --------------------------- | -------------------------------------------- | ------------------------------------------- |
| `name`         | `Name`                      | Unique name for the validation rule          | Required, uses Name value object validation |
| `type`         | `ValidationRuleType`        | Type of validation rule                      | Required, must be valid ValidationRuleType  |
| `displayName`  | `string`                    | Human-readable display name                  | Required, min 3 chars, max 100 chars        |
| `description`  | `Description`               | Optional description of the rule purpose     | Optional, uses Description value object     |
| `parameters`   | `ValidationRuleParameter[]` | Parameters for the validation rule           | Required array (can be empty)               |
| `errorMessage` | `string \| null`            | Custom error message for validation failures | Optional, max 200 chars                     |
| `severity`     | `ValidationSeverity`        | Severity level for validation failures       | Required, default: 'error'                  |
| `isBuiltIn`    | `boolean`                   | Whether this is a built-in rule              | Required, default: false                    |
| `metadata`     | `ValidationRuleMetadata`    | Additional rule metadata                     | Required                                    |

### Derived Properties

| Property            | Type      | Description                           | Calculation              |
| ------------------- | --------- | ------------------------------------- | ------------------------ |
| `parameterCount`    | `number`  | Number of parameters                  | `parameters.length`      |
| `hasParameters`     | `boolean` | Whether rule has parameters           | `parameters.length > 0`  |
| `hasCustomMessage`  | `boolean` | Whether rule has custom error message | `errorMessage !== null`  |
| `isErrorSeverity`   | `boolean` | Whether rule is error severity        | `severity === 'error'`   |
| `isWarningSeverity` | `boolean` | Whether rule is warning severity      | `severity === 'warning'` |
| `isInfoSeverity`    | `boolean` | Whether rule is info severity         | `severity === 'info'`    |

## Methods

### Constructors

#### `constructor(props: ValidationRuleProps)`

Creates a new ValidationRule instance with the provided properties.

**Parameters:**

- `props.name`: Rule name (required)
- `props.type`: Rule type (required)
- `props.displayName`: Display name (required)
- `props.description`: Optional description
- `props.parameters`: Rule parameters (required, can be empty)
- `props.errorMessage`: Custom error message (optional)
- `props.severity`: Validation severity (default: 'error')
- `props.isBuiltIn`: Whether built-in rule (default: false)
- `props.metadata`: Rule metadata (required)

**Returns:** New ValidationRule instance

**Business Rules:**

- Rule name must be valid (alphanumeric + underscore/hyphen)
- Rule type must be valid ValidationRuleType
- Display name must be valid (3-100 characters)
- Parameters must be valid for the rule type
- Error message must be reasonable length if provided

### Validation Methods

#### `validate(value: unknown, context?: ValidationContext): ValidationResult`

Validates a value against this validation rule.

**Parameters:**

- `value`: Value to validate
- `context`: Optional validation context

**Returns:** ValidationResult with validation status and errors

**Business Rules:**

- Validation logic follows rule type patterns:
  - **String rules**: Use string operations (length, regex, format)
  - **Numeric rules**: Use numeric comparisons (min, max, range)
  - **Array rules**: Use array operations (length, uniqueness)
  - **Object rules**: Use object property validation
  - **Universal rules**: Apply to all data types (required, custom)
- Parameters must be used in validation logic
- Context can provide additional information for validation
- Error messages should be descriptive and actionable
- Validation must be deterministic and efficient

#### `validateAsync(value: unknown, context?: ValidationContext): Promise<ValidationResult>`

Validates a value asynchronously against this validation rule.

**Parameters:**

- `value`: Value to validate
- `context`: Optional validation context

**Returns:** Promise that resolves to ValidationResult

**Business Rules:**

- Should be used for rules that require async operations
- Should handle async errors gracefully
- Should provide progress feedback for long-running validations
- Should respect cancellation if supported

#### `isApplicableTo(dataType: DataType): boolean`

Checks if this validation rule is applicable to a specific data type.

**Parameters:**

- `dataType`: Data type to check applicability for

**Returns:** True if rule is applicable, false otherwise

**Business Rules:**

- Rule type must be compatible with data type
- Some rules are type-specific (e.g., minLength for strings)
- Some rules are universal (e.g., required)
- Should return false for incompatible combinations

### Parameter Management Methods

#### `getParameter(name: string): ValidationRuleParameter | null`

Gets a parameter by name.

**Parameters:**

- `name`: Parameter name to retrieve

**Returns:** Parameter if found, null otherwise

#### `hasParameter(name: string): boolean`

Checks if the rule has a specific parameter.

**Parameters:**

- `name`: Parameter name to check

**Returns:** True if parameter exists, false otherwise

#### `setParameter(name: string, value: unknown): ValidationRule`

Creates a new validation rule with updated parameter.

**Parameters:**

- `name`: Parameter name to update
- `value`: New parameter value

**Returns:** New ValidationRule instance with updated parameter

**Business Rules:**

- Parameter must exist in the rule
- New value must be valid for parameter type
- Returns new instance (immutability)
- Original rule remains unchanged

#### `addParameter(parameter: ValidationRuleParameter): ValidationRule`

Creates a new validation rule with additional parameter.

**Parameters:**

- `parameter`: Parameter to add

**Returns:** New ValidationRule instance with additional parameter

**Business Rules:**

- Parameter name must be unique within rule
- Parameter must be valid for rule type
- Returns new instance (immutability)
- Original rule remains unchanged

#### `removeParameter(name: string): ValidationRule`

Creates a new validation rule with parameter removed.

**Parameters:**

- `name`: Parameter name to remove

**Returns:** New ValidationRule instance with parameter removed

**Business Rules:**

- Parameter must exist in the rule
- Cannot remove required parameters for rule type
- Returns new instance (immutability)
- Original rule remains unchanged

### Message Methods

#### `getErrorMessage(value: unknown): string`

Gets the error message for a failed validation.

**Parameters:**

- `value`: Value that failed validation

**Returns:** Error message string

**Business Rules:**

- Should use custom error message if available
- Should use default message for rule type if no custom message
- Should include parameter values in message for context
- Should be user-friendly and actionable

#### `formatMessage(template: string, value: unknown): string`

Formats a message template with rule parameters and value.

**Parameters:**

- `template`: Message template with placeholders
- `value`: Value that was validated

**Returns:** Formatted message string

**Business Rules:**

- Should replace placeholders with actual values
- Should handle parameter substitution properly
- Should handle edge cases (missing parameters)
- Should return meaningful error messages

### Query Methods

#### `isRequiredFor(dataType: DataType): boolean`

Checks if this rule is required for a specific data type.

**Parameters:**

- `dataType`: Data type to check

**Returns:** True if rule is required, false otherwise

#### `getSupportedDataTypes(): DataType[]`

Gets the list of data types this rule supports.

**Returns:** Array of supported DataType enum values

#### `toJSON(): ValidationRuleJSON`

Converts the validation rule to a JSON representation.

**Returns:** JSON representation of the validation rule

### Factory Methods

#### `ValidationRule.create(props: Omit<ValidationRuleProps, 'metadata'>): ValidationRule`

Creates a new validation rule with auto-generated metadata.

**Parameters:**

- `props`: Validation rule properties (excluding metadata)

**Returns:** New ValidationRule instance

#### `ValidationRule.builtIn(name: string, type: ValidationRuleType, displayName: string, parameters?: ValidationRuleParameter[]): ValidationRule`

Creates a built-in validation rule.

**Parameters:**

- `name`: Rule name
- `type`: Rule type
- `displayName`: Display name
- `parameters`: Optional parameters

**Returns:** New ValidationRule instance marked as built-in

**Business Rules:**

- Built-in rules cannot be modified
- Built-in rules have predefined validation logic
- Built-in rules are available globally
- Built-in rules have system-generated metadata

#### `ValidationRule.builtIn(name: string, type: ValidationRuleType, displayName: string, parameters?: ValidationRuleParameter[]): ValidationRule`

Creates a built-in validation rule.

**Parameters:**

- `name`: Rule name
- `type`: Rule type
- `displayName`: Display name
- `parameters`: Optional parameters

**Returns:** New ValidationRule instance marked as built-in

**Business Rules:**

- Built-in rules cannot be modified
- Built-in rules have predefined validation logic
- Built-in rules are available globally
- Built-in rules have system-generated metadata

### Base Class

The ValidationRule value object extends the base `ValueObject<ValidationRuleProps>` class to ensure consistent behavior across all value objects in the domain.

### Domain Events

ValidationRule value objects do not emit domain events. Value objects are immutable and represent domain concepts without identity, making them unsuitable for event emission. Event emission should be handled by entities or domain services that orchestrate validation operations.

## Business Rules & Invariants

### Rule Definition Invariants

1. **Name Uniqueness**: Rule names must be unique within context

   - Names must be valid (alphanumeric + underscore/hyphen)
   - Names must be case-sensitive
   - Built-in rules have reserved names
   - Custom rules must avoid naming conflicts

2. **Type Consistency**: Rule types must be consistent and valid

   - Type must be valid ValidationRuleType enum value
   - Type determines validation behavior
   - Type cannot be changed after creation
   - Type must match validation logic

3. **Parameter Integrity**: Rule parameters must be valid and consistent
   - Parameters must have valid names and types
   - Parameters must be compatible with rule type
   - Required parameters must be present
   - Parameter values must be valid

### Validation Invariants

1. **Validation Logic**: Validation logic must be sound and predictable

   - Validation must be deterministic
   - Validation must be efficient
   - Validation must handle edge cases
   - Validation must provide meaningful feedback

2. **Error Handling**: Error handling must be comprehensive and user-friendly
   - Error messages must be descriptive
   - Error messages must be actionable
   - Error messages must be consistent
   - Error handling must not expose sensitive information

## Dependencies

### External Dependencies

- `zod`: For type validation and schema definitions

### Internal Dependencies

- `ValidationRuleType`: Value object for rule type definitions
- `ValidationRuleParameter`: Value object for rule parameters
- `ValidationSeverity`: Value object for severity levels
- `ValidationRuleMetadata`: Value object for rule metadata
- `ValidationResult`: Value object for validation results
- `ValidationContext`: Value object for validation context
- `DataType`: Value object for data type definitions

## Errors

### Domain Errors

- `InvalidValidationRuleError`: Thrown when validation rule is invalid
- `InvalidRuleNameError`: Thrown when rule name is invalid
- `InvalidRuleTypeError`: Thrown when rule type is invalid
- `InvalidParameterError`: Thrown when parameter is invalid
- `ParameterNotFoundError`: Thrown when parameter is not found
- `ValidationError`: Thrown when validation fails
- `AsyncValidationError`: Thrown when async validation fails

### Validation Errors

- `RuleNotApplicableError`: Thrown when rule is not applicable to data type
- `ParameterTypeError`: Thrown when parameter type is invalid
- `MissingParameterError`: Thrown when required parameter is missing
- `InvalidParameterValueError`: Thrown when parameter value is invalid

## Tests

### Unit Tests

1. **Rule Creation**

   - Should create rule with valid properties
   - Should throw error for invalid names
   - Should throw error for invalid types
   - Should throw error for invalid parameters
   - Should auto-generate metadata

2. **Parameter Management**

   - Should get parameter by name
   - Should check parameter existence
   - Should set parameter value
   - Should add parameter
   - Should remove parameter

3. **Validation Logic**

   - Should validate values correctly
   - Should handle different rule types
   - Should use parameters in validation
   - Should provide context-aware validation
   - Should handle async validation

4. **Message Handling**

   - Should get error messages
   - Should format message templates
   - Should handle custom messages
   - Should include parameter values
   - Should be user-friendly

5. **Applicability**
   - Should check applicability to data types
   - Should get supported data types
   - Should handle type compatibility
   - Should provide type checking

### Integration Tests

1. **Property Integration**

   - Should integrate with property validation
   - Should handle property-specific rules
   - Should support property inheritance
   - Should handle property serialization

2. **Component Integration**

   - Should integrate with component validation
   - Should handle component-specific rules
   - Should support component composition
   - Should handle component lifecycle

3. **Schema Integration**
   - Should integrate with schema validation
   - Should handle schema-level rules
   - Should support schema versioning
   - Should handle schema constraints

## Serialization

### JSON Format

```typescript
interface ValidationRuleJSON {
  name: string
  type: string
  displayName: string
  description?: string
  parameters: ValidationRuleParameterJSON[]
  errorMessage?: string
  severity: 'error' | 'warning' | 'info'
  isBuiltIn: boolean
  metadata: {
    createdAt: string
    updatedAt: string
    version: string
    [key: string]: any
  }
}
```

### Serialization Rules

1. **Type Handling**: Rule types are serialized as strings
2. **Parameter Handling**: Parameters are serialized as objects
3. **Severity Handling**: Severity levels are serialized as strings
4. **Metadata**: Metadata is preserved during serialization
5. **Immutability**: Serialization preserves immutability guarantees
6. **Built-in Flag**: Built-in status is preserved

### Deserialization Rules

1. **Type Validation**: Rule types are validated during deserialization
2. **Parameter Validation**: Parameters are validated during deserialization
3. **Severity Validation**: Severity levels are validated during deserialization
4. **Metadata Integrity**: Metadata integrity is maintained
5. **Built-in Preservation**: Built-in status is preserved

## Metadata

| Field                | Value                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| **Version**          | 1.0.0                                                                                                   |
| **Last Updated**     | 2025-09-16                                                                                              |
| **Author**           | Schema Management Domain Team                                                                           |
| **Status**           | Draft                                                                                                   |
| **Dependencies**     | ValidationRuleType, ValidationRuleParameter, ValidationSeverity                                         |
| **Complexity**       | Medium                                                                                                  |
| **Testing Priority** | High                                                                                                    |
| **Review Required**  | Yes                                                                                                     |
| **Documentation**    | Complete                                                                                                |
| **Breaking Changes** | None                                                                                                    |
| **Location**         | `packages/domain/src/schema-management/schema-definition/value-objects/validation-rule.value-object.ts` |
