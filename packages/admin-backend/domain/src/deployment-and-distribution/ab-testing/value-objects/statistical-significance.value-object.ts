import { ValueObject } from '../../../kernel/value-objects/base.value-object.js'
import {
  InvalidStatisticalTestError,
  InvalidChiSquareTestError,
  InvalidTTestError,
} from './errors/statistical-significance.errors.js'

/**
 * StatisticalSignificance Value Object
 *
 * Encapsulates statistical validation results for hypothesis testing, providing a comprehensive representation
 * of statistical analysis outcomes with validation and business logic for decision-making in experiments.
 */
export class StatisticalSignificance extends ValueObject<{
  readonly pValue: number
  readonly confidence: number
  readonly isSignificant: boolean
  readonly testType: string
  readonly sampleSize: number
  readonly degreesOfFreedom: number | null
}> {
  private constructor(
    pValue: number,
    confidence: number,
    testType: string,
    sampleSize: number,
    degreesOfFreedom: number | null,
  ) {
    const isSignificant = pValue < 1 - confidence
    super({ pValue, confidence, isSignificant, testType, sampleSize, degreesOfFreedom })
  }

  /**
   * Creates a new StatisticalSignificance instance with automatic significance calculation
   * @param pValue Probability value from statistical test (0.0 to 1.0)
   * @param confidence Confidence level (0.0 to 1.0)
   * @param testType Type of statistical test performed
   * @param sampleSize Number of observations/samples
   * @param degreesOfFreedom Degrees of freedom (optional, defaults to null)
   * @returns New StatisticalSignificance instance
   * @throws InvalidStatisticalTestError when validation fails
   */
  static create(
    pValue: number,
    confidence: number,
    testType: string,
    sampleSize: number,
    degreesOfFreedom: number | null = null,
  ): StatisticalSignificance {
    // Validate p-value
    if (typeof pValue !== 'number' || pValue < 0 || pValue > 1) {
      throw new InvalidStatisticalTestError(
        pValue,
        confidence,
        testType,
        sampleSize,
        'pValue must be between 0.0 and 1.0',
      )
    }

    // Validate confidence
    if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
      throw new InvalidStatisticalTestError(
        pValue,
        confidence,
        testType,
        sampleSize,
        'confidence must be between 0.0 and 1.0',
      )
    }

    // Validate sample size
    if (!Number.isInteger(sampleSize) || sampleSize <= 0) {
      throw new InvalidStatisticalTestError(
        pValue,
        confidence,
        testType,
        sampleSize,
        'sampleSize must be a positive integer',
      )
    }

    // Validate degrees of freedom
    if (degreesOfFreedom !== null && (!Number.isInteger(degreesOfFreedom) || degreesOfFreedom < 0)) {
      throw new InvalidStatisticalTestError(
        pValue,
        confidence,
        testType,
        sampleSize,
        'degreesOfFreedom must be a non-negative integer or null',
      )
    }

    // Validate test type
    const validTestTypes = ['chi-square', 't-test', 'z-test', 'anova', 'mann-whitney', 'wilcoxon']
    if (!validTestTypes.includes(testType)) {
      throw new InvalidStatisticalTestError(
        pValue,
        confidence,
        testType,
        sampleSize,
        `Invalid testType. Must be one of: ${validTestTypes.join(', ')}`,
      )
    }

    return new StatisticalSignificance(pValue, confidence, testType, sampleSize, degreesOfFreedom)
  }

  /**
   * Performs chi-square test for independence and returns significance result
   * @param observed Array of observed frequencies
   * @param expected Array of expected frequencies
   * @returns New StatisticalSignificance instance with chi-square test results
   * @throws InvalidChiSquareTestError when chi-square test parameters are invalid
   */
  static chiSquareTest(observed: number[], expected: number[]): StatisticalSignificance {
    // Validate arrays
    if (!Array.isArray(observed) || !Array.isArray(expected)) {
      throw new InvalidChiSquareTestError(observed, expected, 'observed and expected must be arrays')
    }

    if (observed.length !== expected.length) {
      throw new InvalidChiSquareTestError(observed, expected, 'observed and expected arrays must have the same length')
    }

    if (observed.length < 2) {
      throw new InvalidChiSquareTestError(observed, expected, 'At least 2 observations required for chi-square test')
    }

    // Validate expected frequencies
    for (let i = 0; i < expected.length; i++) {
      if (expected[i] <= 0) {
        throw new InvalidChiSquareTestError(
          observed,
          expected,
          `Expected frequency at index ${i} must be positive (${expected[i]} <= 0)`,
        )
      }
    }

    // Check for more than 20% of expected frequencies less than 5
    let lowFreqCount = 0
    for (const freq of expected) {
      if (freq < 5) lowFreqCount++
    }
    if (lowFreqCount / expected.length > 0.2) {
      throw new InvalidChiSquareTestError(observed, expected, 'More than 20% of expected frequencies are less than 5')
    }

    // Calculate chi-square statistic
    let chiSquare = 0
    for (let i = 0; i < observed.length; i++) {
      const diff = observed[i] - expected[i]
      chiSquare += (diff * diff) / expected[i]
    }

    // Calculate degrees of freedom
    const df = observed.length - 1

    // Calculate p-value using chi-square approximation
    // For simplicity, using a basic approximation. In production, use a proper statistical library
    const pValue = this.chiSquarePValue(chiSquare, df)

    // Calculate total sample size
    const sampleSize = observed.reduce((sum, val) => sum + val, 0)

    return new StatisticalSignificance(pValue, 0.95, 'chi-square', sampleSize, df)
  }

  /**
   * Performs t-test comparing two samples
   * @param sample1 First sample data array
   * @param sample2 Second sample data array
   * @param paired Whether to perform paired t-test (default: false)
   * @returns New StatisticalSignificance instance with t-test results
   * @throws InvalidTTestError when t-test parameters are invalid
   */
  static tTest(sample1: number[], sample2: number[], paired: boolean = false): StatisticalSignificance {
    // Validate samples
    if (!Array.isArray(sample1) || !Array.isArray(sample2)) {
      throw new InvalidTTestError(sample1, sample2, 'Both samples must be arrays')
    }

    if (sample1.length < 2 || sample2.length < 2) {
      throw new InvalidTTestError(sample1, sample2, 'Each sample must have at least 2 observations')
    }

    if (paired && sample1.length !== sample2.length) {
      throw new InvalidTTestError(sample1, sample2, 'Paired t-test requires samples of equal size')
    }

    // Check minimum sample size for unpaired t-test
    if (!paired && (sample1.length < 30 || sample2.length < 30)) {
      console.warn(
        'Sample size < 30 may violate normality assumption for unpaired t-test. Consider non-parametric alternative.',
      )
    }

    // Calculate means
    const mean1 = sample1.reduce((sum, val) => sum + val, 0) / sample1.length
    const mean2 = sample2.reduce((sum, val) => sum + val, 0) / sample2.length

    let t: number
    let df: number

    if (paired) {
      // Paired t-test
      const differences = sample1.map((val, i) => val - sample2[i])
      const meanDiff = differences.reduce((sum, val) => sum + val, 0) / differences.length
      const variance = differences.reduce((sum, val) => sum + (val - meanDiff) ** 2, 0) / (differences.length - 1)
      const stdError = Math.sqrt(variance / differences.length)
      t = meanDiff / stdError
      df = differences.length - 1
    } else {
      // Unpaired t-test (assuming unequal variances - Welch's t-test)
      const variance1 = sample1.reduce((sum, val) => sum + (val - mean1) ** 2, 0) / (sample1.length - 1)
      const variance2 = sample2.reduce((sum, val) => sum + (val - mean2) ** 2, 0) / (sample2.length - 1)

      const standardError = Math.sqrt(variance1 / sample1.length + variance2 / sample2.length)
      t = Math.abs(mean1 - mean2) / standardError

      // Welch-Satterthwaite equation for degrees of freedom
      df =
        (variance1 / sample1.length + variance2 / sample2.length) ** 2 /
        ((variance1 / sample1.length) ** 2 / (sample1.length - 1) +
          (variance2 / sample2.length) ** 2 / (sample2.length - 1))
    }

    // Calculate p-value using t-distribution approximation
    const pValue = this.tDistributionPValue(Math.abs(t), df)

    const totalSampleSize = sample1.length + sample2.length

    return new StatisticalSignificance(pValue, 0.95, 't-test', totalSampleSize, Math.round(df))
  }

  /**
   * Compares two StatisticalSignificance instances for equality
   * @param other Another StatisticalSignificance instance
   * @returns True if all properties are equal
   */
  equals(other: StatisticalSignificance | null | undefined): boolean {
    if (!other || !(other instanceof StatisticalSignificance)) {
      return false
    }

    return (
      this.pValue === other.pValue &&
      this.confidence === other.confidence &&
      this.testType === other.testType &&
      this.sampleSize === other.sampleSize &&
      this.degreesOfFreedom === other.degreesOfFreedom
    )
  }

  /**
   * Creates new instance with updated confidence level
   * @param newConfidence New confidence level (0.0 to 1.0)
   * @returns New StatisticalSignificance instance
   */
  withConfidence(newConfidence: number): StatisticalSignificance {
    return StatisticalSignificance.create(
      this.pValue,
      newConfidence,
      this.testType,
      this.sampleSize,
      this.degreesOfFreedom,
    )
  }

  /**
   * Returns confidence interval bounds based on p-value and confidence level
   * @returns Tuple containing [lowerBound, upperBound] of confidence interval
   */
  getConfidenceInterval(): [number, number] {
    // This is a simplified approximation. In practice, confidence intervals depend on the specific test type.
    // For this implementation, we'll use a general approximation based on the p-value.
    const z = this.getZScore(this.confidence)
    const margin = z * Math.sqrt((this.pValue * (1 - this.pValue)) / this.sampleSize)

    const center = 1 - this.pValue
    const lower = Math.max(0, center - margin)
    const upper = Math.min(1, center + margin)

    return [Number(lower.toFixed(6)), Number(upper.toFixed(6))]
  }

  /**
   * Converts value object to string representation
   * @returns Human-readable string representation
   */
  toString(): string {
    const significance = this.isSignificant ? 'significant' : 'not significant'
    return `${this.testType}: p=${this.pValue.toFixed(6)}, ${(this.confidence * 100).toFixed(0)}% CI, n=${this.sampleSize} (${significance})`
  }

  /**
   * Converts value object to JSON-serializable object
   * @returns Plain object representation for serialization
   */
  toJSON(): {
    pValue: number
    confidence: number
    isSignificant: boolean
    testType: string
    sampleSize: number
    degreesOfFreedom: number | null
    confidenceInterval: [number, number]
  } {
    return {
      pValue: this.pValue,
      confidence: this.confidence,
      isSignificant: this.isSignificant,
      testType: this.testType,
      sampleSize: this.sampleSize,
      degreesOfFreedom: this.degreesOfFreedom,
      confidenceInterval: this.getConfidenceInterval(),
    }
  }

  // Getters
  get pValue(): number {
    return this._value.pValue
  }

  get confidence(): number {
    return this._value.confidence
  }

  get isSignificant(): boolean {
    return this._value.isSignificant
  }

  get testType(): string {
    return this._value.testType
  }

  get sampleSize(): number {
    return this._value.sampleSize
  }

  get degreesOfFreedom(): number | null {
    return this._value.degreesOfFreedom
  }

  /**
   * Approximates chi-square p-value using chi-square distribution
   * Note: This is a simplified approximation. In production, use a proper statistical library.
   */
  private static chiSquarePValue(chiSquare: number, df: number): number {
    // Using Wilson-Hilferty approximation for chi-square distribution
    const z = (chiSquare / df) ** (1 / 3) - 1 + 2 / (9 * df)
    const standardError = Math.sqrt(2 / (9 * df))
    const zScore = z / standardError

    return this.normalPValue(zScore)
  }

  /**
   * Approximates t-distribution p-value
   * Note: This is a simplified approximation. In production, use a proper statistical library.
   */
  private static tDistributionPValue(t: number, df: number): number {
    // For large df, approximate with normal distribution
    if (df > 30) {
      return this.normalPValue(t)
    }

    // For smaller df, use a more conservative approximation
    // This is a simplified approximation - real implementation would use more sophisticated methods
    const adjustedT = t * (1 - 1 / (4 * df))
    return this.normalPValue(adjustedT)
  }

  /**
   * Approximates normal distribution p-value (two-tailed test)
   */
  private static normalPValue(z: number): number {
    // Using Abramowitz and Stegun approximation for normal CDF
    const absZ = Math.abs(z)
    const p = 0.5 * (1 + Math.sign(z) * Math.sqrt(1 - Math.exp((-2 * absZ ** 2) / Math.PI)))
    return 2 * (1 - p) // Two-tailed test
  }

  /**
   * Gets z-score for given confidence level
   */
  private getZScore(confidenceLevel: number): number {
    // Common z-scores for typical confidence levels
    const zScores: Record<number, number> = {
      0.8: 1.28,
      0.85: 1.44,
      0.9: 1.645,
      0.95: 1.96,
      0.98: 2.33,
      0.99: 2.576,
      0.995: 2.81,
      0.999: 3.29,
    }

    // Return exact match if available
    if (zScores[confidenceLevel]) {
      return zScores[confidenceLevel]
    }

    // For other values, use linear interpolation between known values
    const levels = Object.keys(zScores)
      .map(Number)
      .sort((a, b) => a - b)

    for (let i = 0; i < levels.length - 1; i++) {
      if (confidenceLevel >= levels[i] && confidenceLevel <= levels[i + 1]) {
        const lowerLevel = levels[i]
        const upperLevel = levels[i + 1]
        const lowerZ = zScores[lowerLevel]
        const upperZ = zScores[upperLevel]

        const ratio = (confidenceLevel - lowerLevel) / (upperLevel - lowerLevel)
        return lowerZ + ratio * (upperZ - lowerZ)
      }
    }

    // Fallback for extreme values
    if (confidenceLevel < 0.8) return 1.28
    return 3.29
  }
}
