# DistributionPercentage Value Object

## Overview

Represents the percentage allocation for experiment variants, ensuring proper distribution validation and total percentage constraints. This value object enforces business rules for A/B testing experiments where variant allocations must sum to exactly 100% and individual percentages must be within valid ranges.

## Properties

- `value: number` - The percentage value between 0.01 and 0.99
- `precision: number` - Decimal precision for the percentage (default: 2)

## Methods

### Factory Methods

#### create(value: number, precision?: number): DistributionPercentage

Creates a new distribution percentage with the specified value and precision.

**Parameters:**

- `value`: The percentage value (must be between 0.01 and 0.99)
- `precision`: Number of decimal places (optional, defaults to 2)

**Returns:** New DistributionPercentage instance

**Throws:**

- `DistributionPercentageError.invalidValue()` if value is outside valid range (0.01 to 0.99)
- `DistributionPercentageError.invalidPrecision()` if precision is negative or greater than 4

#### fromString(percentageString: string): DistributionPercentage

Creates a distribution percentage from a string representation.

**Parameters:**

- `percentageString`: String representation (e.g., "0.5", "50%", "15.5%")

**Returns:** New DistributionPercentage instance

**Throws:**

- `DistributionPercentageError.invalidFormat()` if string format is invalid
- `DistributionPercentageError.invalidValue()` if converted value is outside valid range

#### equal(parts: number): DistributionPercentage

Creates equal distribution percentages for the specified number of parts.

**Parameters:**

- `parts`: Number of equal parts to divide into

**Returns:** New DistributionPercentage instance with value = 1/parts

**Throws:**

- `DistributionPercentageError.insufficientParts()` if parts is less than 2

#### minimum(): DistributionPercentage

Returns the minimum allowed distribution percentage (0.01).

**Returns:** DistributionPercentage instance with value 0.01

#### maximum(): DistributionPercentage

Returns the maximum allowed distribution percentage (0.99).

**Returns:** DistributionPercentage instance with value 0.99

### Business Methods

#### validateTotal(distributions: DistributionPercentage[]): boolean

Validates that the sum of all distribution percentages equals exactly 1.0.

**Parameters:**

- `distributions`: Array of distribution percentages to validate

**Returns:** True if sum equals 1.0 within precision tolerance, false otherwise

#### canAdd(other: DistributionPercentage): boolean

Checks if adding another distribution percentage would stay within valid bounds.

**Parameters:**

- `other`: Distribution percentage to check addition with

**Returns:** True if sum would be <= 0.99, false otherwise

#### add(other: DistributionPercentage): DistributionPercentage

Adds another distribution percentage to this one.

**Parameters:**

- `other`: Distribution percentage to add

**Returns:** New DistributionPercentage instance with sum of values

**Throws:**

- `DistributionPercentageError.exceedsMaximum()` if sum would exceed 0.99

#### subtract(other: DistributionPercentage): DistributionPercentage

Subtracts another distribution percentage from this one.

**Parameters:**

- `other`: Distribution percentage to subtract

**Returns:** New DistributionPercentage instance with difference of values

**Throws:**

- `DistributionPercentageError.belowMinimum()` if result would be less than 0.01

#### multiply(factor: number): DistributionPercentage

Multiplies the distribution percentage by a factor.

**Parameters:**

- `factor`: Multiplication factor

**Returns:** New DistributionPercentage instance with multiplied value

**Throws:**

- `DistributionPercentageError.invalidValue()` if result would be outside valid range

#### equals(other: DistributionPercentage): boolean

Compares this distribution percentage with another for equality.

**Parameters:**

- `other`: Distribution percentage to compare with

**Returns:** True if values are equal within precision tolerance, false otherwise

#### isGreaterThan(other: DistributionPercentage): boolean

Checks if this distribution percentage is greater than another.

**Parameters:**

- `other`: Distribution percentage to compare with

**Returns:** True if this value is greater than other, false otherwise

#### isLessThan(other: DistributionPercentage): boolean

Checks if this distribution percentage is less than another.

**Parameters:**

- `other`: Distribution percentage to compare with

**Returns:** True if this value is less than other, false otherwise

#### toPercentageString(): string

Returns the percentage as a formatted string with % symbol.

**Returns:** String representation (e.g., "50%", "15.5%")

#### toDecimalString(): string

Returns the percentage as a formatted decimal string.

**Returns:** String representation (e.g., "0.50", "0.155")

## Business Rules

1. **Range Validation**: Individual percentages must be between 0.01 (1%) and 0.99 (99%)
2. **Sum Validation**: Total distribution percentages must sum to exactly 1.0 (100%)
3. **Precision Limit**: Maximum precision is 4 decimal places to prevent floating-point precision issues
4. **Minimum Parts**: Equal distribution requires at least 2 parts
5. **Immutable Operations**: All operations return new instances, preserving immutability
6. **Floating Point Tolerance**: Uses precision-based tolerance for equality comparisons (±0.0001)

## Dependencies

- `ValueObject<{ value: number; precision: number }>` - Base class with automatic serialization
- `DistributionPercentageError` - Single error object with factory methods for all distribution-related validation failures

## Tests

### Essential Tests

- Create with valid/invalid percentage values
- Create from string representations with various formats
- Equal distribution with valid/invalid part counts
- Arithmetic operations (add, subtract, multiply) with boundary validation
- Total validation for experiment distributions
- Precision handling and edge cases
- Equality comparisons with precision tolerance
- String formatting for different output formats
- Immutability preservation across operations

### Edge Case Tests

- Minimum and maximum boundary values
- Precision edge cases (0.005 rounding)
- Floating point precision tolerance
- Sum validation with precision tolerance (0.9999 ≈ 1.0)
- Large number of small distributions
- Zero and negative value validation

## Serialization

### JSON Format

```json
{
  "value": 0.5,
  "precision": 2
}
```

### Serialization Rules

1. **Number Serialization**: Value is serialized as a number
2. **Precision Serialization**: Precision is serialized as an integer
3. **Immutability**: All properties are read-only in serialized form
4. **Validation**: Deserialized values must pass validation rules

## Usage Examples

```typescript
// Create individual percentages
const controlPercentage = DistributionPercentage.create(0.5)
const variantPercentage = DistributionPercentage.fromString('25%')

// Create equal distributions
const threeVariantEqual = DistributionPercentage.equal(3) // ~0.333 each

// Validate experiment distributions
const distributions = [
  DistributionPercentage.create(0.5),
  DistributionPercentage.create(0.3),
  DistributionPercentage.create(0.2),
]

const isValid = DistributionPercentage.validateTotal(distributions) // true

// Arithmetic operations
const increased = controlPercentage.add(DistributionPercentage.minimum())
const decreased = variantPercentage.subtract(DistributionPercentage.create(0.05))

// String formatting
const display = controlPercentage.toPercentageString() // "50.00%"
const decimal = variantPercentage.toDecimalString() // "0.25"
```

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
Location: `packages/domain/src/deployment-and-distribution/ab-testing/value-objects/distribution-percentage.value-object.ts`
Bounded Context: A/B Testing
