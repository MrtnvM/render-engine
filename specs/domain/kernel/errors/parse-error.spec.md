# ParseError Domain Error

## Overview

ParseError represents failures that occur when data cannot be parsed into the expected format or structure. This error is thrown when parsing operations fail due to invalid data format, malformed input, or unexpected data structure during data transformation processes.

## Error Details

- **Error Name**: ParseError
- **Error Code**: `PARSE_ERROR`
- **Category**: ValidationError
- **Class Location**: `packages/domain/src/kernel/errors/parse.error.ts`
- **Thrown By**: Parsing services, data transformation services, value object constructors, entity factories
- **Business Context**: Data parsing failures that prevent proper data transformation or entity creation from raw data

## Error Properties

- `data`: unknown - The raw data that failed to parse
- `expectedFormat`: string - The expected format or structure for the data
- `parseContext`: string - The context or operation where parsing failed

## Business Rules

1. **Data Parsing**: Raw data must conform to expected format for successful parsing
2. **Format Specification**: Expected format must be clearly defined and documented
3. **Context Awareness**: Parse context must be specified to aid in debugging
4. **Error Details**: All parsing failure details must be preserved for analysis
5. **Immutability**: All error properties must be readonly and immutable

## Error Context

### When Thrown

- When UUID parsing fails due to invalid format
- When parsing empty strings where non-empty data is required
- When JSON parsing fails due to malformed structure
- When date parsing fails due to invalid format
- When numeric parsing fails due to invalid characters
- When parsing complex data structures with missing required fields

### Error Handling

- Provide clear error messages indicating expected format
- Include original data for debugging purposes
- Specify parse context to help identify the source of failure
- Prevent data processing with invalid parsed data
- Log parsing failures for system monitoring
- Provide guidance on correct data format

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend

### Value Objects

- None directly, but may be thrown during value object parsing

### Entities

- None directly, but may be thrown during entity creation from raw data

### Other Domain Errors

- **ValidationError** - Related error for validation failures
- **FormatError** - Related error for format-specific issues
- **InvalidDataError** - Related error for invalid data structures

## Factory Methods

### Static Factory Methods

- `static forData(data: unknown, expectedFormat: string, parseContext: string): ParseError`

  - **Purpose**: Creates a parse error for general data parsing failures
  - **Parameters**: Raw data, expected format description, parse context
  - **Returns**: ParseError with detailed parsing failure information
  - **Usage**: When general data parsing fails

- `static invalidUUID(input: string): ParseError`

  - **Purpose**: Creates a parse error for UUID parsing failures
  - **Parameters**: Input string that failed UUID parsing
  - **Returns**: ParseError with UUID-specific parsing failure information
  - **Usage**: When UUID string format is invalid

- `static emptyString(field: string): ParseError`
  - **Purpose**: Creates a parse error for empty string parsing failures
  - **Parameters**: Field name that cannot be parsed from empty string
  - **Returns**: ParseError with empty string parsing failure information
  - **Usage**: When trying to parse non-empty data from empty strings

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test all factory methods with valid parameters
- Test factory methods with edge cases (null values, empty strings)

#### Parse Context

- Verify parse context is preserved correctly
- Test different parse contexts (UUID, date, JSON, etc.)
- Verify expected format is clearly documented

### Integration Tests

#### Error Throwing

- Verify error is thrown when parsing fails
- Verify error is not thrown when parsing succeeds
- Verify error properties contain correct parsing information
- Test various parsing failure scenarios

### Error Handling Tests

#### Error Catching

- Handler catches ParseError correctly
- Handler processes parsing failure appropriately
- Handler provides meaningful error messages to users
- Handler prevents processing of invalid parsed data

## Serialization

### JSON Format

```json
{
  "name": "ParseError",
  "message": "Failed to parse data in context 'UUID parsing'. Expected format: UUID v4",
  "code": "PARSE_ERROR",
  "metadata": {
    "data": "invalid-uuid-string",
    "expectedFormat": "UUID v4",
    "parseContext": "UUID parsing"
  }
}
```

### Serialization Rules

- All parsing data must be serializable
- Use consistent expected format descriptions
- Include parse context for debugging
- Handle null and undefined values consistently
- Preserve original data for analysis

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
Location: `packages/domain/src/kernel/errors/parse.error.ts`
