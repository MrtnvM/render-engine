# ValidationRuleParameter Value Object

## Overview

The **ValidationRuleParameter** value object represents a parameter for validation rules in the server-driven UI framework. It defines the configuration values that control how validation rules behave, enabling flexible and reusable validation logic across different contexts.

ValidationRuleParameter ensures type safety for rule parameters, provides validation for parameter values, and supports a wide range of parameter types from simple primitives to complex objects and arrays.

## Properties

### Core Properties

| Property       | Type                              | Description                   | Constraints                                 |
| -------------- | --------------------------------- | ----------------------------- | ------------------------------------------- | ----------------------------------- |
| `name`         | `Name`                            | Parameter name                | Required, uses Name value object validation |
| `value`        | `unknown`                         | Parameter value               | Required, must match parameter type         |
| `type`         | `ParameterType`                   | Type of the parameter         | Required, must be valid ParameterType       |
| `description`  | `Description`                     | Parameter description         | Optional, uses Description value object     |
| `isRequired`   | `boolean`                         | Whether parameter is required | Required, default: false                    |
| `defaultValue` | `unknown                          | null`                         | Default parameter value                     | Optional, must match parameter type |
| `constraints`  | `ParameterConstraint[]`           | Parameter constraints         | Required array (can be empty)               |
| `metadata`     | `ValidationRuleParameterMetadata` | Additional parameter metadata | Required                                    |

### Derived Properties

| Property          | Type      | Description                              | Calculation              |
| ----------------- | --------- | ---------------------------------------- | ------------------------ |
| `hasDefaultValue` | `boolean` | Whether parameter has default value      | `defaultValue !== null`  |
| `constraintCount` | `number`  | Number of constraints                    | `constraints.length`     |
| `hasConstraints`  | `boolean` | Whether parameter has constraints        | `constraints.length > 0` |
| `isArrayType`     | `boolean` | Whether parameter type is array          | Based on ParameterType   |
| `isObjectType`    | `boolean` | Whether parameter type is object         | Based on ParameterType   |
| `isPrimitiveType` | `boolean` | Whether parameter type is primitive      | Based on ParameterType   |
| `isUsingDefault`  | `boolean` | Whether parameter is using default value | `value === defaultValue` |

## Methods

### Constructors

#### `constructor(props: ValidationRuleParameterProps)`

Creates a new ValidationRuleParameter instance with the provided properties.

**Parameters:**

- `props.name`: Parameter name (required)
- `props.value`: Parameter value (required)
- `props.type`: Parameter type (required)
- `props.description`: Parameter description (optional)
- `props.isRequired`: Whether parameter is required (default: false)
- `props.defaultValue`: Default parameter value (optional)
- `props.constraints`: Parameter constraints (required)
- `props.metadata`: Parameter metadata (required)

**Returns:** New ValidationRuleParameter instance

**Business Rules:**

- Parameter name must be valid (1-50 characters, alphanumeric + underscore/hyphen)
- Parameter value must match parameter type
- Parameter type must be valid ParameterType
- Default value must match parameter type if provided
- Constraints must be appropriate for parameter type

### Value Validation Methods

#### `validateValue(value: unknown): ParameterValidationResult`

Validates a value against this parameter's type and constraints.

**Parameters:**

- `value`: Value to validate

**Returns:** ParameterValidationResult with validation status

**Business Rules:**

- Value must match parameter type
- Value must satisfy all constraints
- Null/undefined handling based on required status
- Type coercion must be considered

#### `isValidValue(value: unknown): boolean`

Checks if a value is valid for this parameter.

**Parameters:**

- `value`: Value to check

**Returns:** True if value is valid, false otherwise

#### `coerceValue(value: unknown): unknown`

Coerces a value to match this parameter's type.

**Parameters:**

- `value`: Value to coerce

**Returns:** Coerced value or original value if coercion fails

**Business Rules:**

- Should attempt safe type conversion when possible
- Should return original value if coercion is not possible
- Should not throw exceptions for invalid values
- Should follow standard type conversion rules

### Constraint Management Methods

#### `addConstraint(constraint: ParameterConstraint): ValidationRuleParameter`

Creates a new ValidationRuleParameter with additional constraint.

**Parameters:**

- `constraint`: Constraint to add

**Returns:** New ValidationRuleParameter instance with added constraint

**Business Rules:**

- Constraint must be appropriate for parameter type
- Constraint must not conflict with existing constraints
- Returns new instance (immutability)
- Original parameter remains unchanged

#### `removeConstraint(name: string): ValidationRuleParameter`

Creates a new ValidationRuleParameter with constraint removed.

**Parameters:**

- `name`: Name of constraint to remove

**Returns:** New ValidationRuleParameter instance with constraint removed

**Business Rules:**

- Constraint must exist in the parameter
- Cannot remove required constraints
- Returns new instance (immutability)
- Original parameter remains unchanged

#### `getConstraint(name: string): ParameterConstraint | null`

Gets a constraint by name.

**Parameters:**

- `name`: Name of constraint to retrieve

**Returns:** Constraint if found, null otherwise

#### `hasConstraint(name: string): boolean`

Checks if the parameter has a specific constraint.

**Parameters:**

- `name`: Name of constraint to check

**Returns:** True if constraint exists, false otherwise

#### `validateConstraints(): ParameterValidationResult`

Validates that all constraints are satisfied by the current value.

**Returns:** ParameterValidationResult with constraint validation status

### Value Management Methods

#### `withValue(value: unknown): ValidationRuleParameter`

Creates a new ValidationRuleParameter with updated value.

**Parameters:**

- `value`: New parameter value

**Returns:** New ValidationRuleParameter instance with updated value

**Business Rules:**

- New value must be valid for parameter type
- New value must satisfy all constraints
- Returns new instance (immutability)
- Original parameter remains unchanged

#### `resetToDefault(): ValidationRuleParameter`

Creates a new ValidationRuleParameter with default value.

**Returns:** New ValidationRuleParameter instance with default value

**Business Rules:**

- Default value must be available
- Returns new instance (immutability)
- Original parameter remains unchanged

#### `isUsingDefaultValue(): boolean`

Checks if the parameter is currently using its default value.

**Returns:** True if using default value, false otherwise

### Type-Specific Methods

#### `asNumber(): number`

Gets the parameter value as a number.

**Returns:** Parameter value as number

**Business Rules:**

- Parameter type must be numeric
- Value must be convertible to number
- Should throw error for invalid conversions

#### `asString(): string`

Gets the parameter value as a string.

**Returns:** Parameter value as string

**Business Rules:**

- Value must be convertible to string
- Should handle all parameter types
- Should provide meaningful string representation

#### `asBoolean(): boolean`

Gets the parameter value as a boolean.

**Returns:** Parameter value as boolean

**Business Rules:**

- Parameter type must be boolean
- Value must be convertible to boolean
- Should throw error for invalid conversions

#### `asArray(): unknown[]`

Gets the parameter value as an array.

**Returns:** Parameter value as array

**Business Rules:**

- Parameter type must be array
- Value must be convertible to array
- Should throw error for invalid conversions

#### `asObject(): Record<string, unknown>`

Gets the parameter value as an object.

**Returns:** Parameter value as object

**Business Rules:**

- Parameter type must be object
- Value must be convertible to object
- Should throw error for invalid conversions

### Query Methods

#### `getTypeInfo(): TypeInfo`

Gets type information for this parameter.

**Returns:** TypeInfo with parameter type details

#### `getValueRange(): ValueRange | null`

Gets the valid value range for numeric parameters.

**Returns:** ValueRange if applicable, null otherwise

#### `getAllowedValues(): unknown[] | null`

Gets the allowed values for enum parameters.

**Returns:** Array of allowed values if applicable, null otherwise

#### `getPattern(): string | null`

Gets the regex pattern for string parameters.

**Returns:** Pattern string if applicable, null otherwise

#### `toJSON(): ValidationRuleParameterJSON`

Converts the validation rule parameter to a JSON representation.

**Returns:** JSON representation of the validation rule parameter

### Factory Methods

#### `ValidationRuleParameter.create(props: Omit<ValidationRuleParameterProps, 'metadata'>): ValidationRuleParameter`

Creates a new validation rule parameter with auto-generated metadata.

**Parameters:**

- `props`: Validation rule parameter properties (excluding metadata)

**Returns:** New ValidationRuleParameter instance

#### `ValidationRuleParameter.required(name: string, type: ParameterType, value: unknown): ValidationRuleParameter`

Creates a required validation rule parameter.

**Parameters:**

- `name`: Parameter name
- `type`: Parameter type
- `value`: Parameter value

**Returns:** New ValidationRuleParameter instance marked as required

#### `ValidationRuleParameter.optional(name: string, type: ParameterType, defaultValue?: unknown): ValidationRuleParameter`

Creates an optional validation rule parameter.

**Parameters:**

- `name`: Parameter name
- `type`: Parameter type
- `defaultValue`: Default parameter value (optional)

**Returns:** New ValidationRuleParameter instance marked as optional

#### `ValidationRuleParameter.withConstraints(name: string, type: ParameterType, value: unknown, constraints: ParameterConstraint[]): ValidationRuleParameter`

Creates a validation rule parameter with constraints.

**Parameters:**

- `name`: Parameter name
- `type`: Parameter type
- `value`: Parameter value
- `constraints`: Parameter constraints

**Returns:** New ValidationRuleParameter instance with constraints

### Base Class

The ValidationRuleParameter value object extends the base `ValueObject<ValidationRuleParameterProps>` class to ensure consistent behavior across all value objects in the domain.

### Domain Events

ValidationRuleParameter value objects do not emit domain events. Value objects are immutable and represent domain concepts without identity, making them unsuitable for event emission. Event emission should be handled by entities or domain services that orchestrate validation operations.

## Business Rules & Invariants

### Parameter Definition Invariants

1. **Name Uniqueness**: Parameter names must be unique within context

   - Names must be valid (alphanumeric + underscore/hyphen)
   - Names must be case-sensitive
   - Names must be descriptive
   - Names must follow consistent conventions

2. **Type Consistency**: Parameter types must be consistent and valid

   - Type must be valid ParameterType enum value
   - Type must match value structure
   - Type cannot be changed after creation
   - Type must be appropriate for validation context

3. **Value Integrity**: Parameter values must be valid and consistent
   - Values must match parameter type
   - Values must satisfy all constraints
   - Values must be serializable
   - Values must be immutable after creation

### Constraint Invariants

1. **Constraint Validity**: Constraints must be valid and applicable

   - Constraints must be appropriate for parameter type
   - Constraints must not conflict with each other
   - Constraints must be enforceable
   - Constraints must have clear semantics

2. **Default Value Integrity**: Default values must be valid and consistent
   - Default values must match parameter type
   - Default values must satisfy all constraints
   - Default values should be reasonable
   - Default values must be serializable

## Parameter Types and Constraints

### Primitive Types

- **string**: Text values

  - Common constraints: minLength, maxLength, pattern, enum
  - Example: `"hello"`, `"user@example.com"`

- \*\*number`: Numeric values

  - Common constraints: min, max, multipleOf, precision
  - Example: `42`, `3.14`, `-10`

- \*\*boolean`: Boolean values

  - Common constraints: enum (true/false)
  - Example: `true`, `false`

- **integer**: Integer values
  - Common constraints: min, max, multipleOf
  - Example: `42`, `-10`, `0`

### Complex Types

- **array**: Array values

  - Common constraints: minItems, maxItems, uniqueItems, itemTypes
  - Example: `[1, 2, 3]`, `["a", "b", "c"]`

- **object**: Object values

  - Common constraints: requiredProperties, additionalProperties, propertyTypes
  - Example: `{ "name": "John", "age": 30 }`

- **enum**: Enumerated values
  - Common constraints: allowedValues
  - Example: `"red"`, `"green"`, `"blue"`

### Special Types

- **regex**: Regular expression values

  - Common constraints: patternFlags, complexity
  - Example: `/^hello$/i`, `/\d+/`

- **date**: Date values

  - Common constraints: minDate, maxDate, format
  - Example: `"2025-09-16"`, `"2025-09-16T10:30:00Z"`

- **function**: Function references
  - Common constraints: parameterCount, returnType
  - Example: Function references (limited use)

## Dependencies

### External Dependencies

- `zod`: For type validation and schema definitions
- `date-fns`: For date validation and manipulation (optional)

### Internal Dependencies

- `ParameterType`: Value object for parameter types
- `ParameterConstraint`: Value object for parameter constraints
- `ValidationRuleParameterMetadata`: Value object for parameter metadata
- `ParameterValidationResult`: Value object for validation results
- `TypeInfo`: Value object for type information
- `ValueRange`: Value object for value ranges

## Errors

### Domain Errors

- `InvalidValidationRuleParameterError`: Thrown when validation rule parameter is invalid
- `InvalidParameterNameError`: Thrown when parameter name is invalid
- `InvalidParameterTypeError`: Thrown when parameter type is invalid
- `InvalidParameterValueError`: Thrown when parameter value is invalid
- `InvalidConstraintError`: Thrown when parameter constraint is invalid
- `InvalidDefaultValueError`: Thrown when default value is invalid

### Validation Errors

- `ParameterTypeError`: Thrown when parameter type doesn't match value
- `ConstraintViolationError`: Thrown when parameter constraint is violated
- `RequiredParameterMissingError`: Thrown when required parameter is missing
- `ValueCoercionError`: Thrown when value coercion fails
- `TypeConversionError`: Thrown when type conversion fails

## Tests

### Unit Tests

1. **Parameter Creation**

   - Should create parameter with valid properties
   - Should throw error for invalid names
   - Should throw error for invalid types
   - Should throw error for invalid values
   - Should auto-generate metadata

2. **Value Validation**

   - Should validate parameter values
   - Should handle different parameter types
   - Should apply constraints properly
   - Should handle null/undefined values
   - Should provide validation results

3. **Constraint Management**

   - Should add constraints
   - Should remove constraints
   - Should get constraints by name
   - Should check constraint existence
   - Should validate constraint satisfaction

4. **Value Management**

   - Should update parameter values
   - Should reset to default values
   - Should check default value usage
   - Should handle value coercion
   - Should maintain immutability

5. **Type-Specific Operations**
   - Should handle numeric parameters
   - Should handle string parameters
   - Should handle boolean parameters
   - Should handle array parameters
   - Should handle object parameters

### Integration Tests

1. **Rule Integration**

   - Should integrate with validation rules
   - Should support rule configuration
   - Should handle parameter serialization
   - Should maintain rule consistency
   - Should support rule validation

2. **Schema Integration**

   - Should integrate with schema parameters
   - Should handle schema-level constraints
   - Should support parameter inheritance
   - Should handle parameter validation
   - Should provide schema feedback

3. **Framework Integration**
   - Should integrate with framework validation
   - Should handle parameter workflows
   - Should support parameter events
   - Should handle parameter reporting
   - Should provide parameter utilities

## Serialization

### JSON Format

```typescript
interface ValidationRuleParameterJSON {
  name: string
  value: unknown
  type: string
  description?: string
  isRequired: boolean
  defaultValue?: unknown
  constraints?: ParameterConstraintJSON[]
  metadata: {
    createdAt: string
    updatedAt: string
    version: string
    [key: string]: any
  }
}
```

### Serialization Rules

1. **Type Handling**: Parameter types are serialized as strings
2. **Value Handling**: Values are serialized as JSON-compatible values
3. **Constraints**: Constraints are serialized as objects
4. **Defaults**: Default values are preserved if present
5. **Metadata**: Metadata is preserved during serialization
6. **Immutability**: Serialization preserves immutability guarantees

### Deserialization Rules

1. **Type Validation**: Parameter types are validated during deserialization
2. **Value Validation**: Values are validated during deserialization
3. **Constraint Validation**: Constraints are validated during deserialization
4. **Default Validation**: Default values are validated during deserialization
5. **Metadata Integrity**: Metadata integrity is maintained

## Metadata

| Field                | Value                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Version**          | 1.0.0                                                                                                             |
| **Last Updated**     | 2025-09-16                                                                                                        |
| **Author**           | Schema Management Domain Team                                                                                     |
| **Status**           | Draft                                                                                                             |
| **Dependencies**     | ParameterType, ParameterConstraint, ValidationRuleParameterMetadata                                               |
| **Complexity**       | Medium                                                                                                            |
| **Testing Priority** | High                                                                                                              |
| **Review Required**  | Yes                                                                                                               |
| **Documentation**    | Complete                                                                                                          |
| **Breaking Changes** | None                                                                                                              |
| **Location**         | `packages/domain/src/schema-management/schema-definition/value-objects/validation-rule-parameter.value-object.ts` |
