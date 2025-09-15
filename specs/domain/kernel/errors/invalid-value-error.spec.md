# InvalidValueError Domain Error

## Overview

InvalidValueError represents failures that occur when field values are invalid or do not meet specific value requirements. This error is thrown when value validation fails due to incorrect values, invalid formats, or values that don't meet business constraints.

## Error Details

- **Error Name**: InvalidValueError
- **Error Code**: `INVALID_VALUE_ERROR`
- **Category**: ValidationError
- **Class Location**: `packages/domain/src/kernel/errors/invalid-value.error.ts`
- **Thrown By**: Value validators, field validators, value object constructors, entity constructors
- **Business Context**: Invalid value failures that prevent proper data processing or entity creation due to incorrect field values

## Error Properties

- `fieldName`: string - The name of the field that has an invalid value
- `value`: unknown - The actual value that failed validation
- `expectedFormat`: string - The expected format or constraint for the value

## Business Rules

1. **Value Validation**: Field values must meet specific value requirements and constraints
2. **Value Identification**: Field name must be clearly specified
3. **Value Preservation**: Actual invalid value must be preserved for debugging
4. **Format Specification**: Expected format or constraint must be clearly defined
5. **Immutability**: All error properties must be readonly and immutable

## Error Context

### When Thrown

- When field values do not meet specific value requirements
- When values violate business constraints or rules
- When value formats are invalid (UUID, email, etc.)
- When values are outside allowed ranges or limits
- When values don't match expected patterns or formats
- When value validation fails during entity creation

### Error Handling

- Display clear error messages indicating invalid values
- Provide guidance on expected value formats and constraints
- Highlight fields with invalid values in user interfaces
- Prevent processing of invalid values
- Log value validation failures for debugging
- Include actual values for analysis and debugging

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend

### Value Objects

- May reference field values that are value objects

### Entities

- May reference entities in value validation

### Other Domain Errors

- **ValidationError** - Related error for general validation failures
- **FormatError** - Related error for format-specific validation failures
- **ParseError** - Related error for parsing failures

## Factory Methods

### Static Factory Methods

- `static forField(fieldName: string, value: unknown, expectedFormat: string): InvalidValueError`
  - **Purpose**: Creates an invalid value error for a field with invalid value
  - **Parameters**: Field name, actual value, expected format or constraint
  - **Returns**: InvalidValueError with detailed value validation failure information
  - **Usage**: When a field value does not meet specific value requirements

- `static invalidUUID(value: unknown): InvalidValueError`
  - **Purpose**: Creates an invalid value error for invalid UUID format
  - **Parameters**: Invalid UUID value
  - **Returns**: InvalidValueError with UUID-specific validation failure information
  - **Usage**: When UUID value format is invalid

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test factory methods with valid parameters
- Test factory methods with different value types

#### Value Validation

- Test various invalid value scenarios
- Verify field name and value are preserved correctly
- Test different value types and formats
- Test UUID validation scenarios

### Integration Tests

#### Error Throwing

- Verify error is thrown when value validation fails
- Verify error is not thrown when value validation passes
- Verify error properties contain correct value validation information
- Test various value validation failure scenarios

### Error Handling Tests

#### Error Catching

- Handler catches InvalidValueError correctly
- Handler processes value validation failure appropriately
- Handler displays user-friendly value validation error messages
- Handler prevents processing of invalid values

## Serialization

### JSON Format

```json
{
  "name": "InvalidValueError",
  "message": "Field 'email' has invalid value. Expected format: valid email address, Got: invalid-email",
  "code": "INVALID_VALUE_ERROR",
  "metadata": {
    "fieldName": "email",
    "value": "invalid-email",
    "expectedFormat": "valid email address"
  }
}
```

### Serialization Rules

- All value and format data must be serializable
- Use consistent expected format descriptions
- Include field names for clear identification
- Handle null and undefined values consistently
- Preserve actual values for debugging

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
