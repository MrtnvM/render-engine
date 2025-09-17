# ConversionRate Value Object Specification

## Overview

`ConversionRate` is a value object that represents conversion performance metrics, tracking the ratio of successful conversions to total users in a given context.

## Purpose

- To encapsulate conversion rate calculations and business logic
- To provide immutable conversion performance metrics
- To ensure data consistency through validation rules
- To support statistical analysis with confidence interval calculations

## Properties

| Name          | Type     | Description                         | Validation                          |
| ------------- | -------- | ----------------------------------- | ----------------------------------- |
| `conversions` | `number` | Number of successful conversions    | Must be non-negative integer        |
| `totalUsers`  | `number` | Total number of users in the cohort | Must be positive integer            |
| `rate`        | `number` | Calculated conversion rate          | Automatically calculated, immutable |

## Validation Rules

### Input Validation

- `conversions` must be a non-negative integer (≥ 0)
- `totalUsers` must be a positive integer (> 0)
- `conversions` must be ≤ `totalUsers`

### Rate Validation

- `rate` must be between 0.0 and 1.0 (inclusive)
- `rate` is calculated as `conversions / totalUsers`
- `rate` is rounded to 6 decimal places for precision

## Business Rules

### Immutability

- All properties are immutable after creation
- New instances must be created for any modifications
- Prevents accidental state changes and ensures data integrity

### Business Logic Constraints

- Conversion rate cannot be calculated for zero total users
- Conversions cannot exceed total users
- Rate is automatically derived from conversions and total users
- Supports statistical confidence calculations for decision making

## Methods

### Static Methods

#### `calculate(conversions: number, totalUsers: number): ConversionRate`

**Description**: Creates a new ConversionRate instance with automatic rate calculation

**Parameters**:

- `conversions`: Number of successful conversions (non-negative integer)
- `totalUsers`: Total number of users (positive integer)

**Returns**: New `ConversionRate` instance

**Throws**:

- `ConversionRateError.invalidInput()` when:
  - conversions < 0
  - totalUsers ≤ 0
  - conversions > totalUsers

### Instance Methods

#### `getConfidenceInterval(confidenceLevel: number = 0.95): [number, number]`

**Description**: Calculates confidence interval for the conversion rate using normal approximation

**Parameters**:

- `confidenceLevel`: Confidence level between 0 and 1 (default: 0.95)

**Returns**: Tuple containing [lowerBound, upperBound] of the confidence interval

**Throws**:

- `ConversionRateError.invalidConfidenceLevel()` when confidenceLevel is not between 0 and 1

#### `withConversions(newConversions: number): ConversionRate`

**Description**: Creates new instance with updated conversions, maintaining same total users

**Parameters**:

- `newConversions`: New conversion count

**Returns**: New `ConversionRate` instance

#### `withTotalUsers(newTotalUsers: number): ConversionRate`

**Description**: Creates new instance with updated total users, maintaining same conversions

**Parameters**:

- `newTotalUsers`: New total users count

**Returns**: New `ConversionRate` instance

#### `isStatisticallySignificant(other: ConversionRate, alpha: number = 0.05): boolean`

**Description**: Performs two-proportion z-test to determine if difference between conversion rates is statistically significant

**Parameters**:

- `other`: Another ConversionRate to compare against
- `alpha`: Significance level (default: 0.05)

**Returns**: True if the difference is statistically significant

#### `equals(other: ConversionRate): boolean`

**Description**: Compares two ConversionRate instances for equality

**Parameters**:

- `other`: Another ConversionRate instance

**Returns**: True if all properties are equal

### Getters

#### `get conversions(): number`

**Description**: Returns the number of conversions

#### `get totalUsers(): number`

**Description**: Returns the total number of users

#### `get rate(): number`

**Description**: Returns the calculated conversion rate

#### `get percentage(): number`

**Description**: Returns the conversion rate as percentage (0-100)

#### `get formattedPercentage(): string`

**Description**: Returns the conversion rate as formatted percentage string (e.g., "45.67%")

## Error Types

### `ConversionRateError`

Single error object with factory methods:

- `ConversionRateError.invalidInput()` - Thrown when validation fails during ConversionRate creation
- `ConversionRateError.invalidConfidenceLevel()` - Thrown when confidence level parameter is invalid

## Serialization

### `toJSON(): object`

Returns plain object representation for serialization

### `toString(): string`

Returns human-readable string representation

## Usage Examples

### Basic Usage

```typescript
const conversionRate = ConversionRate.calculate(45, 100)
console.log(conversionRate.rate) // 0.45
console.log(conversionRate.percentage) // 45
console.log(conversionRate.formattedPercentage) // "45.000000%"
```

### Confidence Interval

```typescript
const conversionRate = ConversionRate.calculate(45, 100)
const [lower, upper] = conversionRate.getConfidenceInterval(0.95)
console.log(`95% CI: [${lower.toFixed(4)}, ${upper.toFixed(4)}]`)
```

### Statistical Comparison

```typescript
const rateA = ConversionRate.calculate(45, 100)
const rateB = ConversionRate.calculate(55, 100)
const isSignificant = rateA.isStatisticallySignificant(rateB)
console.log(`Significant difference: ${isSignificant}`)
```

## Testing Requirements

### Unit Tests

- [ ] Validation of input parameters
- [ ] Rate calculation accuracy
- [ ] Immutability enforcement
- [ ] Confidence interval calculations
- [ ] Statistical significance testing
- [ ] Equality comparison
- [ ] Error handling for invalid inputs
- [ ] Serialization methods

### Edge Cases

- [ ] Zero conversions (rate = 0)
- [ ] Perfect conversion (rate = 1)
- [ ] Small sample sizes
- [ ] Large sample sizes
- [ ] Confidence level boundary values (0, 1)
- [ ] Very small rates with confidence intervals

## Dependencies

- `@render-engine/domain/kernel/value-objects/id.value-object.ts` (for base value object patterns)
- `@render-engine/domain/kernel/errors/domain.error.ts` (for error types)

## Related Specifications

- `specs/domain/deployment-and-distribution/ab-testing/value-objects/distribution-percentage.value-object.spec.md`
- `specs/domain/deployment-and-distribution/ab-testing/entities/ab-test.entity.spec.md`
