# FormatError Domain Error

## Overview

FormatError represents failures that occur when field values do not conform to the expected format or structure. This error is thrown when data format validation fails, such as invalid email formats, phone number formats, or other structured data patterns.

## Error Details

- **Error Name**: FormatError
- **Error Code**: `FORMAT_ERROR`
- **Category**: ValidationError
- **Class Location**: `packages/domain/src/kernel/errors/format.error.ts`
- **Thrown By**: Format validation services, field validators, value object constructors
- **Business Context**: Format validation failures that prevent proper data processing due to incorrect data structure or pattern

## Error Properties

- `fieldName`: string - The name of the field that has invalid format
- `value`: unknown - The actual value that failed format validation
- `expectedFormat`: string - The expected format description for the field

## Business Rules

1. **Format Validation**: Field values must conform to specified format patterns
2. **Format Specification**: Expected format must be clearly defined and documented
3. **Value Preservation**: Actual invalid value must be preserved for debugging
4. **Field Identification**: Field name must be specified for clear error reporting
5. **Immutability**: All error properties must be readonly and immutable

## Error Context

### When Thrown

- When email format is invalid (missing @, invalid domain)
- When phone number format is invalid (wrong pattern, missing digits)
- When date format is invalid (wrong format string)
- When URL format is invalid (missing protocol, invalid structure)
- When postal code format is invalid (wrong pattern for region)
- When credit card format is invalid (wrong number of digits, invalid checksum)

### Error Handling

- Display field-specific format error messages to users
- Highlight fields with invalid format in user interfaces
- Provide clear guidance on expected format patterns
- Prevent form submission with invalid format data
- Log format validation failures for monitoring
- Include format examples in error messages

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

- **ValidationError** - Related error for general validation failures
- **ParseError** - Related error for parsing failures
- **InvalidValueError** - Related error for invalid values

## Factory Methods

### Static Factory Methods

- `static forField(fieldName: string, value: unknown, expectedFormat: string): FormatError`
  - **Purpose**: Creates a format error for a field with invalid format
  - **Parameters**: Field name, actual value, expected format description
  - **Returns**: FormatError with detailed format failure information
  - **Usage**: When a field value does not match expected format pattern

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test factory method with valid parameters
- Test factory method with edge cases (null values, empty strings)

#### Format Validation

- Test various format validation scenarios
- Verify expected format descriptions are clear
- Test different field types and formats

### Integration Tests

#### Error Throwing

- Verify error is thrown when format validation fails
- Verify error is not thrown when format validation passes
- Verify error properties contain correct format information
- Test various format failure scenarios

### Error Handling Tests

#### Error Catching

- Handler catches FormatError correctly
- Handler processes format failure appropriately
- Handler displays user-friendly format error messages
- Handler prevents processing of invalid format data

## Serialization

### JSON Format

```json
{
  "name": "FormatError",
  "message": "Field 'email' has invalid format. Expected: valid email address, Got: invalid-email",
  "code": "FORMAT_ERROR",
  "metadata": {
    "fieldName": "email",
    "value": "invalid-email",
    "expectedFormat": "valid email address"
  }
}
```

### Serialization Rules

- All format data must be serializable
- Use consistent expected format descriptions
- Include field names for clear identification
- Handle null and undefined values consistently
- Preserve actual values for debugging

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
