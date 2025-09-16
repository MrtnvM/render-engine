# ValidationError Domain Error

## Overview

ValidationError represents validation failures that occur when input data fails to meet validation rules or constraints. This error is thrown when fields or data structures do not conform to expected formats, types, or business rules during validation processes.

## Error Details

- **Error Name**: ValidationError
- **Error Code**: `VALIDATION_ERROR`
- **Category**: ValidationError
- **Class Location**: `packages/domain/src/kernel/errors/validation.error.ts`
- **Thrown By**: Validation services, domain services, value object constructors, entity constructors
- **Business Context**: Input validation failures that prevent proper data processing or entity creation

## Error Properties

- `fields`: FieldError[] - Array of field validation errors with details about each failed field

### FieldError Interface

- `name`: string - The name of the field that failed validation
- `value`: unknown - The value that failed validation
- `rule`: string - The validation rule that was violated

## Business Rules

1. **Field Validation**: Each field must pass its specific validation rules
2. **Multiple Fields**: Can contain multiple field validation errors in a single ValidationError
3. **Error Details**: Each field error must contain name, value, and violated rule
4. **Immutability**: All error properties must be readonly and immutable

## Error Context

### When Thrown

- When a field fails format validation (email, phone, etc.)
- When a field has an invalid type (string expected, got number)
- When required fields are empty or null
- When multiple fields fail validation simultaneously
- During entity or value object construction when validation rules are violated

### Error Handling

- Display field-specific error messages to users
- Highlight invalid fields in user interfaces
- Prevent form submission or data processing
- Log validation failures for debugging
- Provide clear guidance on expected formats or values

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend
  - **Location**: `packages/domain/src/kernel/errors/base.domain-error.ts`
  - **Purpose**: Provides common functionality for error structure, serialization, and metadata handling
  - **Required**: All domain errors must extend this class

### Value Objects

- None directly, but may reference field values that are value objects

### Entities

- None directly, but may be thrown during entity construction

### Other Domain Errors

- **FormatError** - Related error for format-specific validation failures
- **InvalidValueError** - Related error for value-specific validation failures
- **RequiredFieldError** - Related error for missing required fields

## Factory Methods

### Static Factory Methods

- `static forField(fieldName: string, fieldValue: unknown, rule: string): ValidationError`

  - **Purpose**: Creates a validation error for a single field
  - **Parameters**: Field name, field value, and validation rule description
  - **Returns**: ValidationError with single field error
  - **Usage**: When a single field fails validation

- `static forFields(fields: FieldError[]): ValidationError`

  - **Purpose**: Creates a validation error for multiple fields
  - **Parameters**: Array of FieldError objects
  - **Returns**: ValidationError with multiple field errors
  - **Usage**: When multiple fields fail validation simultaneously

- `static invalidFormat(fieldName: string, fieldValue: unknown, expectedFormat: string): ValidationError`

  - **Purpose**: Creates a validation error for format violations
  - **Parameters**: Field name, field value, expected format description
  - **Returns**: ValidationError with format-specific message
  - **Usage**: When field format is invalid (email, phone, etc.)

- `static emptyValue(fieldName: string): ValidationError`

  - **Purpose**: Creates a validation error for empty required fields
  - **Parameters**: Field name
  - **Returns**: ValidationError with empty value message
  - **Usage**: When a required field is empty or null

- `static invalidType(fieldName: string, fieldValue: unknown, expectedType: string): ValidationError`

  - **Purpose**: Creates a validation error for type mismatches
  - **Parameters**: Field name, field value, expected type
  - **Returns**: ValidationError with type-specific message
  - **Usage**: When field has wrong data type

- `static multipleEmptyFields(fieldNames: string[]): ValidationError`

  - **Purpose**: Creates a validation error for multiple empty fields
  - **Parameters**: Array of field names
  - **Returns**: ValidationError with multiple empty field errors
  - **Usage**: When multiple required fields are empty

- `static multipleInvalidTypes(fieldTypes: { name: string; value: unknown; expectedType: string }[]): ValidationError`

  - **Purpose**: Creates a validation error for multiple type mismatches
  - **Parameters**: Array of field type information
  - **Returns**: ValidationError with multiple type errors
  - **Usage**: When multiple fields have wrong types

- `static multipleInvalidFormats(fieldFormats: { name: string; value: unknown; expectedFormat: string }[]): ValidationError`
  - **Purpose**: Creates a validation error for multiple format violations
  - **Parameters**: Array of field format information
  - **Returns**: ValidationError with multiple format errors
  - **Usage**: When multiple fields have invalid formats

## Tests

### Unit Tests

#### Error Creation

- **Valid Parameters:**

  - Create error with single field validation failure
  - Create error with multiple field validation failures
  - Verify all properties are set correctly
  - Verify error code is VALIDATION_ERROR

- **Invalid Parameters:**

  - Create error with null field array (should throw error)
  - Create error with empty field array
  - Create error with invalid field error objects (should throw error)

- **Factory Methods:**
  - Test forField() with valid parameters
  - Test forField() with invalid parameters
  - Test forFields() with valid field array
  - Test forFields() with empty field array
  - Test forFields() with null field array (should throw error)
  - Test invalidFormat() with valid parameters
  - Test emptyValue() with valid field name
  - Test invalidType() with valid parameters
  - Test multipleEmptyFields() with valid field names
  - Test multipleInvalidTypes() with valid parameters
  - Test multipleInvalidFormats() with valid parameters

#### Error Properties Validation

- **Property Access:**

  - Verify fields property is readonly
  - Verify fields property returns correct array
  - Verify fields array contains correct FieldError objects
  - Test property immutability

- **Serialization:**
  - Test toJSON() returns correct structure
  - Test toString() returns correct format
  - Test serialization with different field combinations

#### Field Error Interface

- **FieldError Creation:**
  - Create FieldError with valid properties
  - Verify FieldError properties are accessible
  - Test FieldError serialization
  - Test FieldError with different field types

### Integration Tests

#### Error Throwing

- **Validation Context:**

  - Verify error is thrown when field validation fails
  - Verify error is not thrown when field validation passes
  - Test error throwing in entity constructor
  - Test error throwing in value object constructor

- **Error Information:**
  - Verify error contains correct field information
  - Verify error message is descriptive and helpful
  - Verify error metadata contains expected data
  - Test multiple field validation scenarios

### Error Handling Tests

#### Error Catching

- **Handler Behavior:**

  - Handler catches ValidationError correctly
  - Handler processes field errors appropriately
  - Handler displays user-friendly error messages
  - Handler prevents form submission with invalid data

- **Error Recovery:**
  - Handler allows user to correct invalid fields
  - Handler provides guidance on expected field formats
  - Handler clears error state when validation passes

### Edge Cases

#### Boundary Conditions

- **Field Names:**

  - Test with very long field names
  - Test with special characters in field names
  - Test with unicode characters in field names

- **Field Values:**
  - Test with very large field values
  - Test with empty field values
  - Test with null field values

#### Error Scenarios

- **System Failures:**
  - Test error creation when memory is low
  - Test error serialization when disk is full
  - Test error handling when network is unavailable

#### Performance Tests

- **Error Creation:**

  - Test error creation with many field errors
  - Test error creation performance with large datasets
  - Test memory usage with complex error objects

- **Error Handling:**
  - Test error handling performance with many errors
  - Test error serialization performance
  - Test error logging performance

## Serialization

### JSON Format

```json
{
  "name": "ValidationError",
  "message": "Field 'email' failed validation: format must be valid email",
  "code": "VALIDATION_ERROR",
  "metadata": {
    "fields": [
      {
        "name": "email",
        "value": "invalid-email",
        "rule": "format must be valid email"
      }
    ]
  }
}
```

### Serialization Rules

- All field errors must be serializable
- Use consistent field error structure
- Include all validation rule details
- Handle null and undefined values consistently
- Preserve field names and values for debugging

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
Location: `packages/domain/src/kernel/errors/validation.error.ts`
