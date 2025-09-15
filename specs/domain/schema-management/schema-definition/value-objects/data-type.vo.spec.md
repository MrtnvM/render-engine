# DataType Value Object

## Overview

The **DataType** value object represents the data types supported by the server-driven UI framework. It defines the valid data types for component properties, template parameters, and validation rules. DataType ensures type safety and consistency across all data definitions in the system.

DataType supports primitive types, complex types, platform-specific types, and custom types. It provides type checking, conversion, and validation capabilities to ensure data integrity and compatibility across different platforms and use cases.

## Properties

### Core Properties

| Property | Type | Description | Constraints |
|----------|------|-------------|-------------|
| `name` | `string` | Name of the data type | Required, min 1 char, max 50 chars |
| `type` | `DataTypeCategory` | Category of the data type | Required, must be valid DataTypeCategory |
| `baseType` | `DataType | null` | Base type for inheritance | Optional, must be valid if present |
| `constraints` | `DataTypeConstraint[]` | Type-specific constraints | Optional array |
| `defaultValue` | `unknown | null` | Default value for the type | Optional, must match type |
| `isBuiltIn` | `boolean` | Whether this is a built-in type | Required, default: false |
| `isAbstract` | `boolean` | Whether this is an abstract type | Required, default: false |
| `platformSupport` | `PlatformSupport[]` | Platforms that support this type | Required array |
| `metadata` | `DataTypeMetadata` | Additional type metadata | Required |

### Derived Properties

| Property | Type | Description | Calculation |
|----------|------|-------------|-------------|
| `constraintCount` | `number` | Number of constraints | `constraints.length` |
| `hasConstraints` | `boolean` | Whether type has constraints | `constraints.length > 0` |
| `hasDefaultValue` | `boolean` | Whether type has default value | `defaultValue !== null` |
| `isPrimitive` | `boolean` | Whether type is primitive | Based on DataTypeCategory |
| `isComplex` | `boolean` | Whether type is complex | Based on DataTypeCategory |
| `isPlatformSpecific` | `boolean` | Whether type is platform-specific | Based on platformSupport |
| `supportedOnWeb` | `boolean` | Whether type supports web platform | PlatformSupport includes 'web' |
| `supportedOnIOS` | `boolean` | Whether type supports iOS platform | PlatformSupport includes 'ios' |
| `supportedOnAndroid` | `boolean` | Whether type supports Android platform | PlatformSupport includes 'android' |

## Methods

### Constructors

#### `constructor(props: DataTypeProps)`

Creates a new DataType instance with the provided properties.

**Parameters:**
- `props.name`: Type name (required)
- `props.type`: Type category (required)
- `props.baseType`: Base type for inheritance (optional)
- `props.constraints`: Type constraints (optional)
- `props.defaultValue`: Default value (optional)
- `props.isBuiltIn`: Whether built-in type (default: false)
- `props.isAbstract`: Whether abstract type (default: false)
- `props.platformSupport`: Platform support (required)
- `props.metadata`: Type metadata (required)

**Returns:** New DataType instance

**Business Rules:**
- Type name must be valid (1-50 characters)
- Type category must be valid DataTypeCategory
- Base type must be compatible if present
- Constraints must be valid for type category
- Default value must match type if provided

### Type Validation Methods

#### `validateValue(value: unknown): TypeValidationResult`

Validates a value against this data type.

**Parameters:**
- `value`: Value to validate

**Returns:** TypeValidationResult with validation status and errors

**Business Rules:**
- Value must match type category
- Value must satisfy all constraints
- Null/undefined handling based on type requirements
- Platform-specific validation when applicable

#### `isValidValue(value: unknown): boolean`

Checks if a value is valid for this data type.

**Parameters:**
- `value`: Value to check

**Returns:** True if value is valid, false otherwise

#### `isCompatibleWith(other: DataType): boolean`

Checks if this data type is compatible with another.

**Parameters:**
- `other`: Data type to check compatibility with

**Returns:** True if types are compatible, false otherwise

**Business Rules:**
- Types must have compatible categories
- Constraints must be compatible
- Platform support must overlap
- Inheritance relationships must be respected

### Type Conversion Methods

#### `coerceValue(value: unknown): unknown`

Coerces a value to match this data type.

**Parameters:**
- `value`: Value to coerce

**Returns:** Coerced value or original value if coercion fails

**Business Rules:**
- Should attempt safe conversion when possible
- Should return original value if coercion is not possible
- Should not throw exceptions for invalid values
- Should follow standard type conversion rules

#### `convertFromString(value: string): unknown`

Converts a string value to this data type.

**Parameters:**
- `value`: String value to convert

**Returns:** Converted value or null if conversion fails

**Business Rules:**
- Should handle common string formats
- Should be consistent with JSON parsing rules
- Should handle locale-specific formats when applicable
- Should provide clear error feedback

#### `convertToString(value: unknown): string`

Converts a value of this type to string representation.

**Parameters:**
- `value`: Value to convert

**Returns:** String representation of the value

**Business Rules:**
- Should produce human-readable output
- Should be consistent with JavaScript toString behavior
- Should handle special cases (null, undefined)
- Should be reversible when possible

### Constraint Management Methods

#### `addConstraint(constraint: DataTypeConstraint): DataType`

Creates a new DataType with additional constraint.

**Parameters:**
- `constraint`: Constraint to add

**Returns:** New DataType instance with added constraint

**Business Rules:**
- Constraint must be valid for type category
- Constraint must not conflict with existing constraints
- Returns new instance (immutability)
- Original type remains unchanged

#### `removeConstraint(name: string): DataType`

Creates a new DataType with constraint removed.

**Parameters:**
- `name`: Name of constraint to remove

**Returns:** New DataType instance with constraint removed

**Business Rules:**
- Constraint must exist in the type
- Cannot remove built-in constraints
- Returns new instance (immutability)
- Original type remains unchanged

#### `getConstraint(name: string): DataTypeConstraint | null`

Gets a constraint by name.

**Parameters:**
- `name`: Name of constraint to retrieve

**Returns:** Constraint if found, null otherwise

#### `hasConstraint(name: string): boolean`

Checks if the type has a specific constraint.

**Parameters:**
- `name`: Name of constraint to check

**Returns:** True if constraint exists, false otherwise

### Platform Support Methods

#### `isSupportedOn(platform: PlatformSupport): boolean`

Checks if the type is supported on a specific platform.

**Parameters:**
- `platform`: Platform to check support for

**Returns:** True if supported, false otherwise

#### `getUnsupportedPlatforms(): PlatformSupport[]`

Gets platforms that do not support this type.

**Returns:** Array of unsupported platforms

#### `addPlatformSupport(platform: PlatformSupport): DataType`

Creates a new DataType with additional platform support.

**Parameters:**
- `platform`: Platform to add support for

**Returns:** New DataType instance with added platform support

**Business Rules:**
- Platform must be valid PlatformSupport enum value
- Cannot add platform already supported
- Returns new instance (immutability)
- Original type remains unchanged

### Query Methods

#### `getInheritanceChain(): DataType[]`

Gets the complete inheritance chain for this type.

**Returns:** Array of DataType instances from root to current type

#### `isInstanceOf(typeName: string): boolean`

Checks if this type is an instance of a specific type.

**Parameters:**
- `typeName`: Name of type to check

**Returns:** True if this type is an instance, false otherwise

#### `getCompatibleTypes(): DataType[]`

Gets all types compatible with this type.

**Returns:** Array of compatible DataType instances

#### `toJSON(): DataTypeJSON`

Converts the data type to a JSON representation.

**Returns:** JSON representation of the data type

### Factory Methods

#### `DataType.create(props: Omit<DataTypeProps, 'metadata'>): DataType`

Creates a new data type with auto-generated metadata.

**Parameters:**
- `props`: Data type properties (excluding metadata)

**Returns:** New DataType instance

#### `DataType.primitive(name: string, defaultValue?: unknown): DataType`

Creates a primitive data type.

**Parameters:**
- `name`: Type name
- `defaultValue`: Optional default value

**Returns:** New DataType instance for primitive type

**Business Rules:**
- Automatically sets type category to primitive
- Adds appropriate primitive constraints
- Sets platform support to all platforms
- Validates default value matches primitive type

#### `DataType.complex(name: string, baseType?: DataType): DataType`

Creates a complex data type.

**Parameters:**
- `name`: Type name
- `baseType`: Optional base type for inheritance

**Returns:** New DataType instance for complex type

**Business Rules:**
- Automatically sets type category to complex
- Handles inheritance from base type
- Adds appropriate complex constraints
- Sets platform support based on base type

#### `DataType.custom(name: string, category: DataTypeCategory, validator: (value: unknown) => boolean): DataType`

Creates a custom data type with custom validator.

**Parameters:**
- `name`: Type name
- `category`: Type category
- `validator`: Custom validation function

**Returns:** New DataType instance with custom validator

**Business Rules:**
- Custom types can have custom validation logic
- Custom types must be properly documented
- Custom types must specify platform support
- Custom types must have appropriate constraints

## Business Rules & Invariants

### Type Definition Invariants

1. **Name Uniqueness**: Type names must be unique within context
   - Names must be valid (1-50 characters)
   - Names must be case-sensitive
   - Built-in types have reserved names
   - Custom types must avoid naming conflicts

2. **Category Consistency**: Type categories must be consistent and valid
   - Category must be valid DataTypeCategory enum value
   - Category determines type behavior
   - Category cannot be changed after creation
   - Category must match type capabilities

3. **Platform Support**: Platform support must be accurate and complete
   - Platform support must be explicitly declared
   - Platform support must be truthful
   - Platform support affects availability
   - Platform support must be maintained

### Constraint Invariants

1. **Constraint Validity**: Constraints must be valid and applicable
   - Constraints must be valid for type category
   - Constraints must not conflict with each other
   - Constraints must be enforceable
   - Constraints must have clear semantics

2. **Default Value Integrity**: Default values must be valid and consistent
   - Default values must match type constraints
   - Default values must be of correct type
   - Default values should be reasonable
   - Default values must be serializable

## Dependencies

### External Dependencies

- `zod`: For type validation and schema definitions

### Internal Dependencies

- `DataTypeCategory`: Value object for type categories
- `DataTypeConstraint`: Value object for type constraints
- `PlatformSupport`: Value object for platform support
- `DataTypeMetadata`: Value object for type metadata
- `TypeValidationResult`: Value object for validation results

## Errors

### Domain Errors

- `InvalidDataTypeError`: Thrown when data type is invalid
- `InvalidTypeNameError`: Thrown when type name is invalid
- `InvalidTypeError`: Thrown when type category is invalid
- `InvalidConstraintError`: Thrown when constraint is invalid
- `InvalidDefaultValueError`: Thrown when default value is invalid
- `TypeCompatibilityError`: Thrown when types are incompatible
- `PlatformSupportError`: Thrown when platform support is invalid

### Validation Errors

- `TypeMismatchError`: Thrown when value type doesn't match
- `ConstraintViolationError`: Thrown when constraint is violated
- `InvalidValueError`: Thrown when value is invalid for type
- `ConversionError`: Thrown when type conversion fails

## Tests

### Unit Tests

1. **Type Creation**
   - Should create type with valid properties
   - Should throw error for invalid names
   - Should throw error for invalid categories
   - Should throw error for invalid constraints
   - Should auto-generate metadata

2. **Value Validation**
   - Should validate values correctly
   - Should handle different type categories
   - Should apply constraints properly
   - Should handle null/undefined values
   - Should provide validation results

3. **Type Conversion**
   - Should coerce values correctly
   - Should convert from strings
   - Should convert to strings
   - Should handle edge cases
   - Should provide conversion feedback

4. **Constraint Management**
   - Should add constraints
   - Should remove constraints
   - Should get constraints by name
   - Should check constraint existence
   - Should handle constraint conflicts

5. **Platform Support**
   - Should check platform support
   - Should get unsupported platforms
   - Should add platform support
   - Should handle platform-specific validation

### Integration Tests

1. **Property Integration**
   - Should integrate with property types
   - Should handle property validation
   - Should support property inheritance
   - Should handle property serialization

2. **Validation Integration**
   - Should integrate with validation rules
   - Should handle rule applicability
   - Should support rule composition
   - Should handle rule serialization

3. **Schema Integration**
   - Should integrate with schema types
   - Should handle schema validation
   - Should support schema versioning
   - Should handle schema constraints

## Serialization

### JSON Format

```typescript
interface DataTypeJSON {
  name: string;
  type: string;
  baseType?: string;
  constraints?: DataTypeConstraintJSON[];
  defaultValue?: unknown;
  isBuiltIn: boolean;
  isAbstract: boolean;
  platformSupport: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    [key: string]: any;
  };
}
```

### Serialization Rules

1. **Type Handling**: Type categories are serialized as strings
2. **Base Type**: Base types are serialized as references
3. **Constraints**: Constraints are serialized as objects
4. **Platform Support**: Platform support is serialized as string array
5. **Metadata**: Metadata is preserved during serialization
6. **Immutability**: Serialization preserves immutability guarantees

### Deserialization Rules

1. **Type Validation**: Type categories are validated during deserialization
2. **Base Type Resolution**: Base type references are resolved to actual types
3. **Constraint Validation**: Constraints are validated during deserialization
4. **Platform Validation**: Platform support is validated during deserialization
5. **Metadata Integrity**: Metadata integrity is maintained

## Metadata

| Field | Value |
|-------|-------|
| **Version** | 1.0.0 |
| **Last Updated** | 2025-09-15 |
| **Author** | Schema Management Domain Team |
| **Status** | Draft |
| **Dependencies** | DataTypeCategory, DataTypeConstraint, PlatformSupport |
| **Complexity** | Medium |
| **Testing Priority** | High |
| **Review Required** | Yes |
| **Documentation** | Complete |
| **Breaking Changes** | None |