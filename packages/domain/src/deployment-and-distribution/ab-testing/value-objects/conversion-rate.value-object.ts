import { ValueObject } from '../../../kernel/value-objects/base.value-object.js'
import { InvalidConversionRateError, InvalidConfidenceLevelError } from './errors/conversion-rate.errors.js'

/**
 * ConversionRate Value Object
 *
 * Represents conversion performance metrics, tracking the ratio of successful conversions
 * to total users in a given context. Provides immutable conversion performance metrics
 * with validation rules and statistical analysis capabilities.
 */
export class ConversionRate extends ValueObject<{
  readonly conversions: number
  readonly totalUsers: number
  readonly rate: number
}> {
  private constructor(conversions: number, totalUsers: number, rate: number) {
    super({ conversions, totalUsers, rate })
  }

  /**
   * Creates a new ConversionRate instance with automatic rate calculation
   * @param conversions Number of successful conversions (non-negative integer)
   * @param totalUsers Total number of users (positive integer)
   * @returns New ConversionRate instance
   * @throws InvalidConversionRateError when validation fails
   */
  static calculate(conversions: number, totalUsers: number): ConversionRate {
    // Validate conversions
    if (!Number.isInteger(conversions) || conversions < 0) {
      throw new InvalidConversionRateError(conversions, totalUsers, 'conversions must be a non-negative integer')
    }

    // Validate total users
    if (!Number.isInteger(totalUsers) || totalUsers <= 0) {
      throw new InvalidConversionRateError(conversions, totalUsers, 'totalUsers must be a positive integer')
    }

    // Validate conversions <= total users
    if (conversions > totalUsers) {
      throw new InvalidConversionRateError(conversions, totalUsers, 'conversions cannot exceed totalUsers')
    }

    // Calculate rate rounded to 6 decimal places
    const rate = Number((conversions / totalUsers).toFixed(6))

    return new ConversionRate(conversions, totalUsers, rate)
  }

  /**
   * Calculates confidence interval for the conversion rate using normal approximation
   * @param confidenceLevel Confidence level between 0 and 1 (default: 0.95)
   * @returns Tuple containing [lowerBound, upperBound] of the confidence interval
   * @throws InvalidConfidenceLevelError when confidenceLevel is invalid
   */
  getConfidenceInterval(confidenceLevel: number = 0.95): [number, number] {
    if (confidenceLevel <= 0 || confidenceLevel >= 1) {
      throw new InvalidConfidenceLevelError(confidenceLevel)
    }

    const { totalUsers } = this._value
    const rate = this.rate

    // For small samples, use Wilson score interval for better accuracy
    if (totalUsers < 30) {
      return this.getWilsonScoreInterval(confidenceLevel)
    }

    // For larger samples, use normal approximation
    const z = this.getZScore(confidenceLevel)
    const standardError = Math.sqrt((rate * (1 - rate)) / totalUsers)
    const margin = z * standardError

    const lower = Math.max(0, rate - margin)
    const upper = Math.min(1, rate + margin)

    return [Number(lower.toFixed(6)), Number(upper.toFixed(6))]
  }

  /**
   * Creates new instance with updated conversions, maintaining same total users
   * @param newConversions New conversion count
   * @returns New ConversionRate instance
   */
  withConversions(newConversions: number): ConversionRate {
    return ConversionRate.calculate(newConversions, this.totalUsers)
  }

  /**
   * Creates new instance with updated total users, maintaining same conversions
   * @param newTotalUsers New total users count
   * @returns New ConversionRate instance
   */
  withTotalUsers(newTotalUsers: number): ConversionRate {
    return ConversionRate.calculate(this.conversions, newTotalUsers)
  }

  /**
   * Performs two-proportion z-test to determine if difference between conversion rates is statistically significant
   * @param other Another ConversionRate to compare against
   * @param alpha Significance level (default: 0.05)
   * @returns True if the difference is statistically significant
   */
  isStatisticallySignificant(other: ConversionRate, alpha: number = 0.05): boolean {
    if (!(other instanceof ConversionRate)) {
      return false
    }

    const p1 = this.rate
    const p2 = other.rate
    const n1 = this.totalUsers
    const n2 = other.totalUsers

    // Calculate pooled proportion
    const pooledP = (this.conversions + other.conversions) / (n1 + n2)

    // Calculate standard error
    const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2))

    // Calculate z-score
    const zScore = Math.abs(p1 - p2) / standardError

    // Get critical z-value for two-tailed test
    const criticalZ = this.getZScore(1 - alpha / 2)

    return zScore > criticalZ
  }

  /**
   * Compares two ConversionRate instances for equality
   * @param other Another ConversionRate instance
   * @returns True if all properties are equal
   */
  equals(other: ConversionRate | null | undefined): boolean {
    if (!other || !(other instanceof ConversionRate)) {
      return false
    }

    return this.conversions === other.conversions && this.totalUsers === other.totalUsers && this.rate === other.rate
  }

  /**
   * Converts value object to JSON-serializable object
   * @returns Plain object representation for serialization
   */
  toJSON(): { conversions: number; totalUsers: number; rate: number; percentage: number; formattedPercentage: string } {
    return {
      conversions: this.conversions,
      totalUsers: this.totalUsers,
      rate: this.rate,
      percentage: this.percentage,
      formattedPercentage: this.formattedPercentage,
    }
  }

  /**
   * Converts value object to string representation
   * @returns Human-readable string representation
   */
  toString(): string {
    return `${this.conversions}/${this.totalUsers} (${this.formattedPercentage})`
  }

  // Getters
  get conversions(): number {
    return this._value.conversions
  }

  get totalUsers(): number {
    return this._value.totalUsers
  }

  get rate(): number {
    return this._value.rate
  }

  get percentage(): number {
    return Number((this.rate * 100).toFixed(6))
  }

  get formattedPercentage(): string {
    return `${this.percentage.toFixed(6)}%`
  }

  /**
   * Calculates Wilson score interval for small samples
   * @param confidenceLevel Confidence level
   * @returns Wilson score interval [lower, upper]
   */
  private getWilsonScoreInterval(confidenceLevel: number): [number, number] {
    const { conversions, totalUsers } = this._value
    const z = this.getZScore(confidenceLevel)

    const p = conversions / totalUsers
    const z2 = z * z
    const z2_over_n = z2 / (4 * totalUsers)

    const adjustedP = p + z2_over_n
    const adjustedDenominator = 1 + z2 / totalUsers

    const center = adjustedP / adjustedDenominator
    const margin = (z / adjustedDenominator) * Math.sqrt((p * (1 - p) + z2_over_n) / totalUsers)

    const lower = Math.max(0, center - margin)
    const upper = Math.min(1, center + margin)

    return [Number(lower.toFixed(6)), Number(upper.toFixed(6))]
  }

  /**
   * Gets z-score for given confidence level using approximation
   * @param confidenceLevel Confidence level
   * @returns Z-score
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
