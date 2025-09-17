# StatisticalSignificance Value Object

## Overview

`StatisticalSignificance` is a value object that encapsulates statistical validation results for hypothesis testing, providing a comprehensive representation of statistical analysis outcomes with validation and business logic for decision-making in experiments.

## Purpose

- To encapsulate statistical test results and significance calculations
- To provide immutable statistical validation for A/B testing and experiments
- To ensure data consistency through rigorous validation rules
- To support multiple statistical test types (chi-square, t-test, z-test, etc.)
- To facilitate statistical decision-making with confidence levels

## Properties

| Name               | Type             | Description                                 | Validation                  |
| ------------------ | ---------------- | ------------------------------------------- | --------------------------- |
| `pValue`           | `number`         | Probability value from statistical test     | Must be between 0.0 and 1.0 |
| `confidence`       | `number`         | Confidence level for the test               | Must be between 0.0 and 1.0 |
| `isSignificant`    | `boolean`        | Whether result is statistically significant | Automatically calculated    |
| `testType`         | `string`         | Type of statistical test performed          | Must be valid test type     |
| `sampleSize`       | `number`         | Number of observations/samples              | Must be positive integer    |
| `degreesOfFreedom` | `number \| null` | Degrees of freedom for the test             | Non-negative or null        |

## Validation Rules

### Input Validation

- `pValue` must be between 0.0 and 1.0 (inclusive)
- `confidence` must be between 0.0 and 1.0 (inclusive)
- `sampleSize` must be a positive integer (> 0)
- `degreesOfFreedom` must be non-negative integer or null
- `testType` must be a valid statistical test type

### Statistical Validation

- `isSignificant` is automatically calculated as `pValue < (1 - confidence)`
- Minimum sample size requirements based on test type
- Confidence level must be reasonable for statistical analysis

### Test Type Validation

Supported test types:

- `'chi-square'` - Chi-square test for independence
- `'t-test'` - Student's t-test
- `'z-test'` - Z-test for proportions
- `'anova'` - Analysis of variance
- `'mann-whitney'` - Mann-Whitney U test
- `'wilcoxon'` - Wilcoxon signed-rank test

## Business Rules

### Statistical Significance Thresholds

- Standard 95% confidence level (p-value < 0.05)
- Alternative confidence levels must be explicitly justified
- Results must report both p-value and confidence level

### Sample Size Requirements

- Chi-square tests: minimum expected frequency of 5 per cell
- T-tests: minimum sample size of 30 per group for normality assumption
- Z-tests: minimum sample size of 30 per group
- Smaller samples require appropriate non-parametric tests

### Reporting Standards

- Always report exact p-values (not just "p < 0.05")
- Include confidence intervals where applicable
- Document test assumptions and limitations

## Methods

### Static Methods

#### `create(pValue: number, confidence: number, testType: string, sampleSize: number, degreesOfFreedom?: number): StatisticalSignificance`

**Description**: Creates a new StatisticalSignificance instance with automatic significance calculation

**Parameters**:

- `pValue`: Probability value from statistical test (0.0 to 1.0)
- `confidence`: Confidence level (0.0 to 1.0)
- `testType`: Type of statistical test performed
- `sampleSize`: Number of observations/samples
- `degreesOfFreedom`: Degrees of freedom (optional, defaults to null)

**Returns**: New `StatisticalSignificance` instance

**Throws**:

- `StatisticalSignificanceError.invalidInput()` when:
  - pValue is not between 0.0 and 1.0
  - confidence is not between 0.0 and 1.0
  - sampleSize is not positive
  - degreesOfFreedom is negative
  - testType is invalid

#### `chiSquareTest(observed: number[], expected: number[]): StatisticalSignificance`

**Description**: Performs chi-square test for independence and returns significance result

**Parameters**:

- `observed`: Array of observed frequencies
- `expected`: Array of expected frequencies

**Returns**: New `StatisticalSignificance` instance with chi-square test results

**Throws**:

- `StatisticalSignificanceError.invalidChiSquareTest()` when:
  - Arrays have different lengths
  - Any expected frequency is less than 1
  - More than 20% of expected frequencies are less than 5
  - Sample size is insufficient

#### `tTest(sample1: number[], sample2: number[], paired: boolean = false): StatisticalSignificance`

**Description**: Performs t-test comparing two samples

**Parameters**:

- `sample1`: First sample data array
- `sample2`: Second sample data array
- `paired`: Whether to perform paired t-test (default: false)

**Returns**: New `StatisticalSignificance` instance with t-test results

**Throws**:

- `StatisticalSignificanceError.invalidTTest()` when:
  - Samples are too small (< 30 per group for unpaired)
  - Samples have insufficient variance
  - Normality assumption violated

### Instance Methods

#### `equals(other: StatisticalSignificance): boolean`

**Description**: Compares two StatisticalSignificance instances for equality

**Parameters**:

- `other`: Another StatisticalSignificance instance

**Returns**: True if all properties are equal

#### `withConfidence(newConfidence: number): StatisticalSignificance`

**Description**: Creates new instance with updated confidence level

**Parameters**:

- `newConfidence`: New confidence level (0.0 to 1.0)

**Returns**: New `StatisticalSignificance` instance

#### `getConfidenceInterval(): [number, number]`

**Description**: Returns confidence interval bounds based on p-value and confidence level

**Returns**: Tuple containing [lowerBound, upperBound] of confidence interval

#### `toString(): string`

**Description**: Returns human-readable string representation

**Returns**: Formatted string with test results

### Getters

#### `get pValue(): number`

**Description**: Returns the p-value

#### `get confidence(): number`

**Description**: Returns the confidence level

#### `get isSignificant(): boolean`

**Description**: Returns whether the result is statistically significant

#### `get testType(): string`

**Description**: Returns the statistical test type

#### `get sampleSize(): number`

**Description**: Returns the sample size

#### `get degreesOfFreedom(): number \| null`

**Description**: Returns the degrees of freedom

## Error Types

### `StatisticalSignificanceError`

Single error object with factory methods:

- `StatisticalSignificanceError.invalidInput()` - Thrown when validation fails during StatisticalSignificance creation
- `StatisticalSignificanceError.invalidChiSquareTest()` - Thrown when chi-square test parameters are invalid
- `StatisticalSignificanceError.invalidTTest()` - Thrown when t-test parameters are invalid

## Serialization

### `toJSON(): object`

Returns plain object representation for serialization

## Usage Examples

### Basic Usage

```typescript
const significance = StatisticalSignificance.create(
  0.032, // p-value
  0.95, // 95% confidence
  't-test', // test type
  100, // sample size
  98, // degrees of freedom
)

console.log(significance.isSignificant) // true (0.032 < 0.05)
console.log(significance.pValue) // 0.032
```

### Chi-Square Test

```typescript
const observed = [45, 55, 30, 70]
const expected = [50, 50, 50, 50]

const chiSquareResult = StatisticalSignificance.chiSquareTest(observed, expected)
console.log(`Chi-square p-value: ${chiSquareResult.pValue}`)
console.log(`Significant: ${chiSquareResult.isSignificant}`)
```

### T-Test Comparison

```typescript
const groupA = [85, 90, 88, 92, 87, 89, 91, 86, 88, 90]
const groupB = [78, 82, 80, 85, 79, 83, 84, 77, 81, 82]

const tTestResult = StatisticalSignificance.tTest(groupA, groupB)
console.log(`T-test p-value: ${tTestResult.pValue}`)
console.log(`Confidence: ${(tTestResult.confidence * 100).toFixed(0)}%`)
```

### Confidence Intervals

```typescript
const significance = StatisticalSignificance.create(0.023, 0.95, 'z-test', 200)
const [lower, upper] = significance.getConfidenceInterval()
console.log(`95% CI: [${lower.toFixed(4)}, ${upper.toFixed(4)}]`)
```

## Testing Requirements

### Unit Tests

- [ ] Validation of input parameters (p-value, confidence, sample size)
- [ ] Automatic significance calculation
- [ ] Chi-square test implementation
- [ ] T-test implementation
- [ ] Confidence interval calculations
- [ ] Equality comparison
- [ ] Error handling for invalid inputs
- [ ] Serialization methods

### Statistical Accuracy Tests

- [ ] Chi-square test accuracy against known values
- [ ] T-test accuracy against reference implementations
- [ ] Confidence interval boundary calculations
- [ ] P-value precision and rounding
- [ ] Sample size minimum requirements

### Edge Cases

- [ ] Boundary values (p-value = 0.0, 1.0)
- [ ] Confidence level boundaries (0.0, 1.0)
- [ ] Minimum sample sizes
- [ ] Zero degrees of freedom
- [ ] Very small p-values (near machine epsilon)
- [ ] Invalid test type handling

## Dependencies

- `@render-engine/domain/kernel/value-objects/value-object.ts` (base class)
- `@render-engine/domain/kernel/errors/domain.error.ts` (error types)
- Statistical calculation libraries (to be determined during implementation)

## Related Specifications

- `specs/domain/deployment-and-distribution/ab-testing/value-objects/conversion-rate.value-object.spec.md`
- `specs/domain/deployment-and-distribution/ab-testing/value-objects/distribution-percentage.value-object.spec.md`
- `specs/domain/deployment-and-distribution/ab-testing/entities/ab-test.entity.spec.md`

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
Location: `packages/domain/src/deployment-and-distribution/ab-testing/value-objects/statistical-significance.value-object.ts`
