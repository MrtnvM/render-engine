# InvalidDataError Domain Error

## Overview

InvalidDataError represents failures that occur when data structures or data objects are invalid or malformed. This error is thrown when data validation fails due to incorrect structure, missing properties, or invalid data formats during data processing or entity creation.

## Error Details

- **Error Name**: InvalidDataError
- **Error Code**: `INVALID_DATA_ERROR`
- **Category**: ValidationError
- **Class Location**: `packages/domain/src/kernel/errors/invalid-data.error.ts`
- **Thrown By**: Data validators, entity constructors, data mappers, parsing services
- **Business Context**: Invalid data structure failures that prevent proper data processing or entity creation due to malformed or invalid data

## Error Properties

- `data`: unknown - The invalid data that failed validation
- `expectedFormat`: string - The expected format or structure for the data
- `parseContext`: string - The context where data validation failed

## Business Rules

1. **Data Structure Validation**: Data must conform to expected structure and format
2. **Format Specification**: Expected format must be clearly defined and documented
3. **Context Awareness**: Parse context must be specified to aid in debugging
4. **Data Preservation**: Invalid data must be preserved for analysis
5. **Immutability**: All error properties must be readonly and immutable

## Error Context

### When Thrown

- When data objects have invalid structure or format
- When required properties are missing from data objects
- When data validation fails during entity creation
- When parsing data with incorrect structure
- When data mapping operations encounter invalid data
- When data transformation fails due to invalid input

### Error Handling

- Display clear error messages indicating invalid data structure
- Provide guidance on expected data format and structure
- Prevent processing of invalid data
- Log invalid data errors for debugging and monitoring
- Include original data for analysis and debugging
- Provide context information for data validation analysis

## Dependencies

### Base Class

- **DomainError** - Abstract base class that all domain errors must extend

### Value Objects

- None directly, but may reference value objects in data structures

### Entities

- May reference entities in data structures

### Other Domain Errors

- **ValidationError** - Related error for general validation failures
- **ParseError** - Related error for parsing failures
- **RequiredFieldError** - Related error for missing required fields

## Factory Methods

### Static Factory Methods

- `static forData(data: unknown, expectedFormat: string, parseContext: string): InvalidDataError`
  - **Purpose**: Creates an invalid data error for general data validation failures
  - **Parameters**: Invalid data, expected format description, parse context
  - **Returns**: InvalidDataError with detailed data validation failure information
  - **Usage**: When general data validation fails

- `static missingProperty(property: string, data: unknown): InvalidDataError`
  - **Purpose**: Creates an invalid data error for missing required properties
  - **Parameters**: Missing property name and data object
  - **Returns**: InvalidDataError with missing property information
  - **Usage**: When required properties are missing from data objects

- `static invalidStructure(expectedStructure: string, data: unknown): InvalidDataError`
  - **Purpose**: Creates an invalid data error for invalid data structure
  - **Parameters**: Expected structure description and invalid data
  - **Returns**: InvalidDataError with invalid structure information
  - **Usage**: When data structure is invalid or malformed

## Tests

### Unit Tests

#### Error Creation

- Create error with valid parameters
- Create error with invalid parameters (should throw error)
- Verify error properties are set correctly
- Verify error code is set correctly
- Test all factory methods with valid parameters
- Test factory methods with edge cases (null values, empty objects)

#### Data Validation

- Test various invalid data scenarios
- Verify data and format information are preserved correctly
- Test different data types and structures
- Test missing property scenarios
- Test invalid structure scenarios

### Integration Tests

#### Error Throwing

- Verify error is thrown when data validation fails
- Verify error is not thrown when data validation passes
- Verify error properties contain correct data validation information
- Test various data validation failure scenarios

### Error Handling Tests

#### Error Catching

- Handler catches InvalidDataError correctly
- Handler processes data validation failure appropriately
- Handler displays user-friendly data validation error messages
- Handler prevents processing of invalid data

## Serialization

### JSON Format

```json
{
  "name": "InvalidDataError",
  "message": "Invalid data structure. Expected: object with properties 'id' and 'name'",
  "code": "INVALID_DATA_ERROR",
  "metadata": {
    "data": {
      "id": "user-123"
    },
    "expectedFormat": "object with properties 'id' and 'name'",
    "parseContext": "data structure validation"
  }
}
```

### Serialization Rules

- All data and format information must be serializable
- Use consistent expected format descriptions
- Include parse context for debugging
- Handle null and undefined values consistently
- Preserve original data for analysis

## Metadata

Version: 1.0.0
Last Updated: 2025-09-13
