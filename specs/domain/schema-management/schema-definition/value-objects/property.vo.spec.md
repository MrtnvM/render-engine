# Property Value Object

## Overview

The **Property** value object represents a property definition for UI components within the server-driven UI framework. Properties define the configurable aspects of components, including their data types, default values, validation rules, and binding capabilities. Properties are immutable and ensure type safety and consistency across all component definitions.

Properties are fundamental building blocks that enable dynamic configuration of UI components while maintaining strict type checking and validation. They support various data types, complex validation rules, and can be bound to data sources for reactive updates.

## Properties

### Core Properties

| Property | Type | Description | Constraints |
|----------|------|-------------|-------------|
| `name` | `string` | Unique name for the property within the component | Required, min 1 char, max 50 chars, alphanumeric + underscore/hyphen |
| `type` | `DataType` | Data type of the property | Required, must be valid DataType |
| `displayName` | `string` | Human-readable display name | Required, min 3 chars, max 100 chars |
| `description` | `string | null` | Optional description of the property | Optional, max 500 chars |
| `defaultValue` | `unknown | null` | Default value for the property | Optional, must match data type |
| `isRequired` | `boolean` | Whether the property is required | Required, default: false |
| `isReadOnly` | `boolean` | Whether the property is read-only | Required, default: false |
| `validationRules` | `ValidationRule[]` | Array of validation rules for the property | Optional array |
| `bindingOptions` | `BindingOptions | null` | Data binding configuration | Optional |
| `uiHint` | `UIHint | null` | UI rendering hints | Optional |
| `metadata` | `PropertyMetadata` | Additional property metadata | Required |

### Derived Properties

| Property | Type | Description | Calculation |
|----------|------|-------------|-------------|
| `hasDefaultValue` | `boolean` | Whether property has a default value | `defaultValue !== null` |
| `validationRuleCount` | `number` | Number of validation rules | `validationRules.length` |
| `isBindable` | `boolean` | Whether property supports data binding | `bindingOptions !== null` |
| `isComplex` | `boolean` | Whether property is a complex data type | Based on DataType |
| `isPrimitive` | `boolean` | Whether property is a primitive data type | Based on DataType |

## Methods

### Constructors

#### `constructor(props: PropertyProps)`

Creates a new Property instance with the provided properties.

**Parameters:**
- `props.name`: Property name (required)
- `props.type`: Data type (required)
- `props.displayName`: Display name (required)
- `props.description`: Optional description
- `props.defaultValue`: Optional default value
- `props.isRequired`: Whether required (default: false)
- `props.isReadOnly`: Whether read-only (default: false)
- `props.validationRules`: Validation rules (optional)
- `props.bindingOptions`: Binding configuration (optional)
- `props.uiHint`: UI rendering hints (optional)
- `props.metadata`: Property metadata (required)

**Returns:** New Property instance

**Business Rules:**
- Property name must be valid (alphanumeric + underscore/hyphen)
- Data type must be valid DataType
- Display name must be valid (3-100 characters)
- Default value must match data type if provided
- Required properties cannot have null default values

### Validation Methods

#### `validateValue(value: unknown): PropertyValidationResult`

Validates a value against the property definition.

**Parameters:**
- `value`: Value to validate

**Returns:** PropertyValidationResult with validation status and errors

**Business Rules:**
- Value must match property data type
- Value must pass all validation rules
- Required properties cannot have null/undefined values
- Read-only properties cannot be modified after creation

#### `validateDefaultValue(): boolean`

Validates that the default value is valid for the property.

**Returns:** True if default value is valid, false otherwise

**Business Rules:**
- Default value must match property data type
- Default value must pass all validation rules
- Required properties must have valid default values

#### `isCompatibleWith(other: Property): boolean`

Checks if this property is compatible with another property.

**Parameters:**
- `other`: Property to check compatibility with

**Returns:** True if properties are compatible, false otherwise

**Business Rules:**
- Properties must have the same data type
- Validation rules must be compatible
- Required status must be compatible (can become required)
- Read-only status must be compatible (can become read-only)

### Value Processing Methods

#### `coerceValue(value: unknown): unknown`

Coerces a value to match the property data type.

**Parameters:**
- `value`: Value to coerce

**Returns:** Coerced value

**Business Rules:**
- Value should be converted to match property type if possible
- Should return original value if coercion is not possible
- Should not throw exceptions for invalid values
- Type coercion should follow JavaScript conventions where possible

#### `getEffectiveValue(value: unknown | null): unknown`

Gets the effective value, using default if provided value is null/undefined.

**Parameters:**
- `value`: Value to process

**Returns:** Effective value (value or default value)

**Business Rules:**
- If value is provided and not null/undefined, return it
- If value is null/undefined and default exists, return default
- If no default and value is null/undefined, return null
- Required properties must have non-null effective values

#### `serializeValue(value: unknown): string`

Serializes a property value to a string representation.

**Parameters:**
- `value`: Value to serialize

**Returns:** Serialized string representation

**Business Rules:**
- Serialized value should be JSON-compatible
- Complex types should be serialized appropriately
- Date values should use ISO format
- Binary data should use base64 encoding

#### `deserializeValue(serialized: string): unknown`

Deserializes a string value back to the property data type.

**Parameters:**
- `serialized`: Serialized string value

**Returns:** Deserialized value

**Business Rules:**
- Should reverse serialization process
- Should handle invalid serialized values gracefully
- Should validate deserialized value matches property type
- Should throw appropriate errors for invalid formats

### Binding Methods

#### `supportsBinding(): boolean`

Checks if the property supports data binding.

**Returns:** True if property supports binding, false otherwise

#### `getBindingExpression(): string | null`

Gets the binding expression for the property.

**Returns:** Binding expression if available, null otherwise

#### `setBindingExpression(expression: string): Property`

Creates a new property with the specified binding expression.

**Parameters:**
- `expression`: Binding expression to set

**Returns:** New Property instance with binding expression

**Business Rules:**
- Property must support data binding
- Expression must be valid binding syntax
- Expression must be compatible with property data type

### Query Methods

#### `hasValidationRule(ruleName: string): boolean`

Checks if the property has a specific validation rule.

**Parameters:**
- `ruleName`: Name of validation rule to check

**Returns:** True if rule exists, false otherwise

#### `getValidationRule(ruleName: string): ValidationRule | null`

Gets a specific validation rule by name.

**Parameters:**
- `ruleName`: Name of validation rule to get

**Returns:** ValidationRule if found, null otherwise

#### `getRequiredValidationRules(): ValidationRule[]`

Gets all required validation rules for the property.

**Returns:** Array of required validation rules

#### `getOptionalValidationRules(): ValidationRule[]`

Gets all optional validation rules for the property.

**Returns:** Array of optional validation rules

#### `toJSON(): PropertyJSON`

Converts the property to a JSON representation.

**Returns:** JSON representation of the property

### Factory Methods

#### `Property.create(props: Omit<PropertyProps, 'metadata'>): Property`

Creates a new property with auto-generated metadata.

**Parameters:**
- `props`: Property properties (excluding metadata)

**Returns:** New Property instance

#### `Property.fromType(type: DataType, name: string, displayName: string): Property`

Creates a property with default settings for the specified data type.

**Parameters:**
- `type`: Data type for the property
- `name`: Property name
- `displayName`: Display name

**Returns:** New Property instance with default settings for the type

**Business Rules:**
- Default validation rules are added based on data type
- Appropriate UI hints are set based on data type
- Required status is set based on data type conventions

#### `Property.clone(original: Property, newName?: string): Property`

Creates a clone of an existing property with optional new name.

**Parameters:**
- `original`: Original property to clone
- `newName`: Optional new name for the property

**Returns:** New Property instance that is a copy of the original

**Business Rules:**
- All properties are copied from original
- New name must be provided and valid
- Original property remains unchanged
- Metadata is updated with clone information

## Business Rules & Invariants

### Type Safety Invariants

1. **Type Consistency**: Property type must be consistent and valid
   - Type must be valid DataType enum value
   - Type cannot be changed after creation
   - All values must match the declared type
   - Type validation must be strict

2. **Value Validation**: All property values must be properly validated
   - Values must match property data type
   - Values must pass all validation rules
   - Required properties must have non-null values
   - Read-only properties must be protected

3. **Default Value Integrity**: Default values must be valid and consistent
   - Default values must match property type
   - Required properties must have valid defaults
   - Default values must pass validation
   - Default values should be reasonable

### Name and Identity Invariants

1. **Name Validity**: Property names must be valid and consistent
   - Names must be alphanumeric with underscore/hyphen
   - Names must be unique within component
   - Names must be case-sensitive
   - Names cannot be reserved keywords

2. **Display Name Quality**: Display names must be user-friendly
   - Display names must be human-readable
   - Display names must be properly capitalized
   - Display names should be descriptive
   - Display names must be unique within component

### Validation Invariants

1. **Rule Consistency**: Validation rules must be consistent and valid
   - Rules must be compatible with property type
   - Rules must not conflict with each other
   - Required rules must be satisfied
   - Rule execution order must be predictable

2. **Binding Safety**: Data binding must be safe and valid
   - Binding expressions must be syntactically valid
   - Binding types must match property types
   - Binding cycles must be prevented
   - Binding performance must be considered

## Dependencies

### External Dependencies

- `zod`: For type validation and schema definitions

### Internal Dependencies

- `DataType`: Value object for data type definitions
- `ValidationRule`: Value object for validation rules
- `BindingOptions`: Value object for binding configuration
- `UIHint`: Value object for UI rendering hints
- `PropertyMetadata`: Value object for property metadata
- `PropertyValidationResult`: Value object for validation results

## Errors

### Domain Errors

- `InvalidPropertyError`: Thrown when property definition is invalid
- `InvalidPropertyNameError`: Thrown when property name is invalid
- `InvalidDataTypeError`: Thrown when data type is invalid
- `InvalidDefaultValueError`: Thrown when default value is invalid
- `PropertyTypeError`: Thrown when property type is invalid
- `ValidationError`: Thrown when property validation fails
- `BindingError`: Thrown when data binding is invalid

### Validation Errors

- `RequiredPropertyError`: Thrown when required property is missing
- `TypeMismatchError`: Thrown when value type doesn't match property type
- `InvalidValueError`: Thrown when value is invalid for property type
- `ValidationRuleError`: Thrown when validation rule fails
- `ReadOnlyPropertyError`: Thrown when read-only property is modified

## Tests

### Unit Tests

1. **Property Creation**
   - Should create property with valid properties
   - Should throw error for invalid names
   - Should throw error for invalid data types
   - Should throw error for invalid default values
   - Should auto-generate metadata

2. **Value Validation**
   - Should validate values against property type
   - Should validate required properties
   - Should validate read-only properties
   - Should apply validation rules
   - Should return comprehensive validation results

3. **Value Processing**
   - Should coerce values to match property type
   - Should get effective values with defaults
   - Should serialize values to strings
   - Should deserialize values from strings
   - Should handle edge cases gracefully

4. **Data Binding**
   - Should support data binding when configured
   - Should validate binding expressions
   - Should handle binding type compatibility
   - Should prevent binding cycles
   - Should provide binding metadata

5. **Property Compatibility**
   - Should check property compatibility
   - Should handle type compatibility
   - Should handle validation rule compatibility
   - Should handle required/readonly compatibility
   - Should provide compatibility details

### Integration Tests

1. **Component Integration**
   - Should integrate with component validation
   - Should handle component property conflicts
   - Should support component inheritance
   - Should handle component serialization

2. **Schema Integration**
   - Should integrate with schema validation
   - Should handle schema-level constraints
   - Should support schema versioning
   - Should handle schema serialization

3. **Platform Integration**
   - Should support platform-specific validation
   - Should handle platform-specific data types
   - Should support platform-specific binding
   - Should handle platform-specific UI hints

## Serialization

### JSON Format

```typescript
interface PropertyJSON {
  name: string;
  type: string;
  displayName: string;
  description?: string;
  defaultValue?: unknown;
  isRequired: boolean;
  isReadOnly: boolean;
  validationRules?: ValidationRuleJSON[];
  bindingOptions?: BindingOptionsJSON;
  uiHint?: UIHintJSON;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    [key: string]: any;
  };
}
```

### Serialization Rules

1. **Type Handling**: Data types are serialized as strings
2. **Value Handling**: Values are serialized as JSON-compatible values
3. **Validation Rules**: Validation rules are serialized as objects
4. **Binding Options**: Binding options are serialized as objects
5. **Metadata**: Metadata is preserved during serialization
6. **Immutability**: Serialization preserves immutability guarantees

### Deserialization Rules

1. **Type Validation**: Data types are validated during deserialization
2. **Value Validation**: Values are validated against property types
3. **Rule Reconstruction**: Validation rules are properly reconstructed
4. **Binding Restoration**: Binding options are properly restored
5. **Metadata Integrity**: Metadata integrity is maintained

## Metadata

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Last Updated** | 2025-09-15 |
| **Author** | Schema Management Domain Team |
| **Status** | Draft |
| **Dependencies** | DataType, ValidationRule, BindingOptions, UIHint |
| **Complexity** | Medium |
| **Testing Priority** | High |
| **Review Required** | Yes |
| **Documentation** | Complete |
| **Breaking Changes** | None |