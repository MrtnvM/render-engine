# ValidationRuleType Value Object

## Overview

The **ValidationRuleType** value object represents the different types of validation rules available in the server-driven UI framework. It defines the categories of validation logic that can be applied to data, ranging from basic type checking to complex pattern matching and business rule validation.

ValidationRuleType ensures type safety for validation rules, provides metadata about rule capabilities, and enables the framework to understand how to apply different validation strategies consistently across the system.

## Properties

### Core Properties

| Property             | Type                         | Description                                      | Constraints                                    |
| -------------------- | ---------------------------- | ------------------------------------------------ | ---------------------------------------------- | ------------------------------------------- |
| `name`               | `Name`                       | Name of the validation rule type                 | Required, uses Name value object validation    |
| `category`           | `ValidationRuleCategory`     | Category of validation logic                     | Required, must be valid ValidationRuleCategory |
| `dataType`           | `DataType                    | null`                                            | Primary data type this rule applies to         | Optional, must be valid DataType if present |
| `supportedDataTypes` | `DataType[]`                 | Array of compatible data types                   | Required array (can be empty)                  |
| `description`        | `Description`                | Description of the rule type                     | Optional, uses Description value object        |
| `isBuiltIn`          | `boolean`                    | Whether this is a built-in rule type             | Required, default: false                       |
| `supportsAsync`      | `boolean`                    | Whether this rule type supports async validation | Required, default: false                       |
| `parametersSchema`   | `ValidationParameterSchema   | null`                                            | Schema for rule parameters                     | Optional                                    |
| `metadata`           | `ValidationRuleTypeMetadata` | Additional type metadata                         | Required                                       |

### Derived Properties

| Property                | Type      | Description                               | Calculation                       |
| ----------------------- | --------- | ----------------------------------------- | --------------------------------- |
| `supportsParameters`    | `boolean` | Whether rule type supports parameters     | `parametersSchema !== null`       |
| `parameterCount`        | `number`  | Number of defined parameters              | Based on parametersSchema         |
| `isTypeSpecific`        | `boolean` | Whether rule is specific to a data type   | `dataType !== null`               |
| `supportsMultipleTypes` | `boolean` | Whether rule supports multiple data types | `supportedDataTypes.length > 1`   |
| `isAsyncCapable`        | `boolean` | Whether rule can perform async validation | `supportsAsync`                   |
| `isUniversal`           | `boolean` | Whether rule applies to all data types    | `supportedDataTypes.length === 0` |

## Methods

### Constructors

#### `constructor(props: ValidationRuleTypeProps)`

Creates a new ValidationRuleType instance with the provided properties.

**Parameters:**

- `props.name`: Type name (required)
- `props.category`: Validation category (required)
- `props.dataType`: Primary data type (optional)
- `props.supportedDataTypes`: Compatible data types (required)
- `props.description`: Type description (optional)
- `props.isBuiltIn`: Whether built-in type (default: false)
- `props.supportsAsync`: Whether supports async validation (default: false)
- `props.parametersSchema`: Parameter schema (optional)
- `props.metadata`: Type metadata (required)

**Returns:** New ValidationRuleType instance

**Business Rules:**

- Type name must be valid (1-50 characters, alphanumeric + underscore/hyphen)
- Category must be valid ValidationRuleCategory
- Data type must be compatible with category if provided
- Supported data types must be compatible with category
- Parameters schema must be valid if provided

### Type Compatibility Methods

#### `isCompatibleWith(dataType: DataType): boolean`

Checks if this rule type is compatible with a specific data type.

**Parameters:**

- `dataType`: Data type to check compatibility for

**Returns:** True if compatible, false otherwise

**Business Rules:**

- Universal types are compatible with all data types
- Type-specific types must match the primary data type
- Multi-type support must include the specified data type
- Category must be appropriate for the data type

#### `getSupportedDataTypes(): DataType[]`

Gets all data types supported by this rule type.

**Returns:** Array of supported DataType instances

#### `requiresParameters(): boolean`

Checks if this rule type requires parameters to function.

**Returns:** True if parameters are required, false otherwise

### Parameter Schema Methods

#### `getParameterDefinition(name: string): ParameterDefinition | null`

Gets the definition for a specific parameter.

**Parameters:**

- `name`: Parameter name to retrieve

**Returns:** Parameter definition if found, null otherwise

#### `hasParameter(name: string): boolean`

Checks if the rule type has a specific parameter.

**Parameters:**

- `name`: Parameter name to check

**Returns:** True if parameter exists, false otherwise

#### `validateParameters(parameters: ValidationRuleParameter[]): ValidationResult`

Validates an array of parameters against this rule type's schema.

**Parameters:**

- `parameters`: Parameters to validate

**Returns:** ValidationResult with validation status

**Business Rules:**

- All required parameters must be present
- Parameter values must match schema definitions
- Parameter types must be compatible
- Extra parameters must be allowed or rejected

### Validation Logic Methods

#### `createValidator(parameters: ValidationRuleParameter[]): (value: unknown) => boolean`

Creates a validator function for this rule type with given parameters.

**Parameters:**

- `parameters`: Parameters to configure the validator

**Returns:** Validator function that takes a value and returns boolean

**Business Rules:**

- Parameters must be valid for this rule type
- Validator function must be deterministic
- Validator function must handle edge cases
- Validator function must be efficient

#### `createAsyncValidator(parameters: ValidationRuleParameter[]): (value: unknown) => Promise<boolean>`

Creates an async validator function for this rule type with given parameters.

**Parameters:**

- `parameters`: Parameters to configure the validator

**Returns:** Async validator function that takes a value and returns Promise<boolean>

**Business Rules:**

- Rule type must support async validation
- Async validator must handle cancellation
- Async validator must provide progress feedback
- Async validator must handle errors gracefully

### Query Methods

#### `getDefaultErrorMessage(): string`

Gets the default error message for this rule type.

**Returns:** Default error message string

#### `getParameterExamples(): Record<string, unknown[]>`

Gets example values for each parameter.

**Returns:** Record mapping parameter names to example value arrays

#### `toJSON(): ValidationRuleTypeJSON`

Converts the validation rule type to a JSON representation.

**Returns:** JSON representation of the validation rule type

### Factory Methods

#### `ValidationRuleType.create(props: Omit<ValidationRuleTypeProps, 'metadata'>): ValidationRuleType`

Creates a new validation rule type with auto-generated metadata.

**Parameters:**

- `props`: Validation rule type properties (excluding metadata)

**Returns:** New ValidationRuleType instance

#### `ValidationRuleType.builtIn(name: string, category: ValidationRuleCategory, dataType?: DataType): ValidationRuleType`

Creates a built-in validation rule type.

**Parameters:**

- `name`: Type name
- `category`: Validation category
- `dataType`: Primary data type (optional)

**Returns:** New ValidationRuleType instance marked as built-in

**Business Rules:**

- Built-in types cannot be modified
- Built-in types have predefined schemas
- Built-in types are available globally
- Built-in types have system-generated metadata

### Base Class

The ValidationRuleType value object extends the base `ValueObject<ValidationRuleTypeProps>` class to ensure consistent behavior across all value objects in the domain.

### Domain Events

ValidationRuleType value objects do not emit domain events. Value objects are immutable and represent domain concepts without identity, making them unsuitable for event emission. Event emission should be handled by entities or domain services that orchestrate validation operations.

## Business Rules & Invariants

### Type Definition Invariants

1. **Name Uniqueness**: Type names must be unique within context

   - Names must be valid (alphanumeric + underscore/hyphen)
   - Names must be case-sensitive
   - Built-in types have reserved names
   - Custom types must avoid naming conflicts

2. **Category Consistency**: Categories must be consistent and valid

   - Category must be valid ValidationRuleCategory enum value
   - Category determines validation behavior
   - Category cannot be changed after creation
   - Category must match validation capabilities

3. **Data Type Compatibility**: Data type relationships must be valid
   - Primary data type must be compatible with category
   - Supported data types must be compatible with category
   - Type compatibility must be enforced
   - Circular dependencies must be prevented

### Parameter Schema Invariants

1. **Schema Validity**: Parameter schemas must be valid and complete

   - Schemas must define all required parameters
   - Schemas must specify parameter types
   - Schemas must define validation rules
   - Schemas must be consistent with rule type

2. **Parameter Integrity**: Parameter definitions must be sound
   - Parameter names must be unique within schema
   - Parameter types must be appropriate for validation
   - Parameter validation must be comprehensive
   - Parameter defaults must be valid

## Validation Logic by Type

### String Validation Types

- **minLength**: Validates minimum string length

  - Parameters: `min` (number)
  - Logic: `value.length >= min`
  - Data types: string

- **maxLength**: Validates maximum string length

  - Parameters: `max` (number)
  - Logic: `value.length <= max`
  - Data types: string

- **pattern**: Validates string against regex pattern

  - Parameters: `pattern` (string), `flags` (string optional)
  - Logic: `new RegExp(pattern, flags).test(value)`
  - Data types: string

- **email**: Validates email format
  - Parameters: none
  - Logic: Standard email regex validation
  - Data types: string

### Numeric Validation Types

- **min**: Validates minimum numeric value

  - Parameters: `min` (number)
  - Logic: `value >= min`
  - Data types: number, integer

- **max**: Validates maximum numeric value

  - Parameters: `max` (number)
  - Logic: `value <= max`
  - Data types: number, integer

- **range**: Validates numeric range

  - Parameters: `min` (number), `max` (number)
  - Logic: `value >= min && value <= max`
  - Data types: number, integer

- **multipleOf**: Validates value is multiple of given number
  - Parameters: `multiple` (number)
  - Logic: `value % multiple === 0`
  - Data types: number, integer

### Array Validation Types

- **minItems**: Validates minimum array length

  - Parameters: `min` (number)
  - Logic: `value.length >= min`
  - Data types: array

- **maxItems**: Validates maximum array length

  - Parameters: `max` (number)
  - Logic: `value.length <= max`
  - Data types: array

- **uniqueItems**: Validates array items are unique
  - Parameters: none
  - Logic: `new Set(value).size === value.length`
  - Data types: array

### Object Validation Types

- **required**: Validates required properties exist

  - Parameters: `properties` (string[])
  - Logic: `properties.every(prop => prop in value)`
  - Data types: object

- **additionalProperties**: Validates additional property rules
  - Parameters: `allowed` (boolean), `schema` (object optional)
  - Logic: Complex object property validation
  - Data types: object

### Universal Validation Types

- **required**: Validates value is not null/undefined

  - Parameters: none
  - Logic: `value != null`
  - Data types: all

- **custom**: Applies custom validation logic
  - Parameters: `validator` (function), `message` (string optional)
  - Logic: Custom function execution
  - Data types: all

## Dependencies

### External Dependencies

- `zod`: For type validation and schema definitions

### Internal Dependencies

- `Name`: Value object for validation rule type names from kernel
- `ValidationRuleCategory`: Value object for validation categories
- `DataType`: Value object for data type definitions
- `ValidationRuleParameter`: Value object for rule parameters
- `ValidationParameterSchema`: Value object for parameter schemas
- `ValidationRuleTypeMetadata`: Value object for type metadata
- `ValidationResult`: Value object for validation results
- `ParameterDefinition`: Value object for parameter definitions

## Errors

### Domain Errors

- `InvalidValidationRuleTypeError`: Thrown when validation rule type is invalid
- `InvalidRuleTypeNameError`: Thrown when rule type name is invalid
- `InvalidRuleCategoryError`: Thrown when rule category is invalid
- `InvalidDataTypeError`: Thrown when data type is invalid
- `InvalidParameterSchemaError`: Thrown when parameter schema is invalid
- `TypeCompatibilityError`: Thrown when types are incompatible

### Validation Errors

- `ParameterValidationError`: Thrown when parameter validation fails
- `RequiredParameterMissingError`: Thrown when required parameter is missing
- `InvalidParameterValueError`: Thrown when parameter value is invalid
- `ParameterTypeError`: Thrown when parameter type is invalid
- `SchemaValidationError`: Thrown when schema validation fails

## Tests

### Unit Tests

1. **Type Creation**

   - Should create type with valid properties
   - Should throw error for invalid names
   - Should throw error for invalid categories
   - Should throw error for invalid data types
   - Should auto-generate metadata

2. **Type Compatibility**

   - Should check data type compatibility
   - Should get supported data types
   - Should handle universal types
   - Should handle type-specific rules
   - Should validate type relationships

3. **Parameter Schema**

   - Should validate parameters against schema
   - Should get parameter definitions
   - Should check parameter existence
   - Should handle required parameters
   - Should handle optional parameters

4. **Validator Creation**

   - Should create synchronous validators
   - Should create asynchronous validators
   - Should handle validator configuration
   - Should validate validator behavior
   - Should handle edge cases

5. **Built-in Types**
   - Should create built-in rule types
   - Should handle predefined schemas
   - Should validate built-in constraints
   - Should maintain built-in immutability
   - Should provide built-in examples

### Integration Tests

1. **Rule Integration**

   - Should integrate with validation rules
   - Should handle rule creation
   - Should support rule configuration
   - Should maintain rule consistency
   - Should handle rule serialization

2. **Schema Integration**

   - Should integrate with schema validation
   - Should handle schema-level validation
   - Should support schema composition
   - Should handle schema constraints
   - Should provide schema feedback

3. **Framework Integration**
   - Should integrate with framework validation
   - Should handle platform-specific validation
   - Should support validation workflows
   - Should handle validation events
   - Should provide validation reporting

## Serialization

### JSON Format

```typescript
interface ValidationRuleTypeJSON {
  name: string
  category: string
  dataType?: string
  supportedDataTypes: string[]
  description?: string
  isBuiltIn: boolean
  supportsAsync: boolean
  parametersSchema?: ValidationParameterSchemaJSON
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
2. **Category Handling**: Categories are serialized as strings
3. **Data Types**: Data types are serialized as references
4. **Parameters**: Parameter schemas are serialized as objects
5. **Metadata**: Metadata is preserved during serialization
6. **Immutability**: Serialization preserves immutability guarantees

### Deserialization Rules

1. **Type Validation**: Rule types are validated during deserialization
2. **Category Validation**: Categories are validated during deserialization
3. **Data Type Resolution**: Data type references are resolved
4. **Parameter Validation**: Parameter schemas are validated
5. **Metadata Integrity**: Metadata integrity is maintained

## Metadata

| Field                | Value                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Version**          | 1.0.0                                                                                                        |
| **Last Updated**     | 2025-09-16                                                                                                   |
| **Author**           | Schema Management Domain Team                                                                                |
| **Status**           | Draft                                                                                                        |
| **Dependencies**     | ValidationRuleCategory, DataType, ValidationRuleParameter                                                    |
| **Complexity**       | Medium                                                                                                       |
| **Testing Priority** | High                                                                                                         |
| **Review Required**  | Yes                                                                                                          |
| **Documentation**    | Complete                                                                                                     |
| **Breaking Changes** | None                                                                                                         |
| **Location**         | `packages/domain/src/schema-management/schema-definition/value-objects/validation-rule-type.value-object.ts` |
