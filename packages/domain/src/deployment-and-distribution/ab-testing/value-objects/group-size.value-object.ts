import { ValueObject } from '../../../kernel/value-objects/base.value-object.js'
import { ValidationError } from '../../../kernel/errors/validation.error.js'
import { InvalidValueError } from '../../../kernel/errors/invalid-value.error.js'

/**
 * GroupSize Value Object
 *
 * Represents the maximum size of a test group with validation for statistical significance.
 * Ensures that group sizes are appropriate for A/B testing and provides meaningful statistical results.
 */
export class GroupSize extends ValueObject<number> {
  public static readonly MIN_SIZE = 100 // Minimum users for statistical significance
  public static readonly MAX_SIZE = 1000000 // Maximum practical group size
  public static readonly RECOMMENDED_SIZE = 1000 // Recommended size for most tests

  private constructor(value: number) {
    super(value)
  }

  get value(): number {
    return this._value
  }

  public static create(size: number): GroupSize {
    if (typeof size !== 'number' || !Number.isInteger(size)) {
      throw ValidationError.invalidType('size', size, 'integer')
    }

    if (size < this.MIN_SIZE) {
      throw InvalidValueError.forField('size', size, `must be at least ${this.MIN_SIZE} for statistical significance`)
    }

    if (size > this.MAX_SIZE) {
      throw InvalidValueError.forField('size', size, `must not exceed ${this.MAX_SIZE}`)
    }

    return new GroupSize(size)
  }

  public isStatisticallySignificant(): boolean {
    return this._value >= GroupSize.MIN_SIZE
  }

  public isRecommendedSize(): boolean {
    return this._value >= GroupSize.RECOMMENDED_SIZE
  }

  public canAccommodate(userCount: number): boolean {
    if (typeof userCount !== 'number' || !Number.isInteger(userCount) || userCount < 0) {
      return false
    }

    return this._value >= userCount
  }

  public getRemainingCapacity(currentUsers: number): number {
    if (typeof currentUsers !== 'number' || !Number.isInteger(currentUsers) || currentUsers < 0) {
      throw ValidationError.invalidType('currentUsers', currentUsers, 'non-negative integer')
    }

    if (currentUsers > this._value) {
      throw InvalidValueError.forField('currentUsers', currentUsers, `cannot exceed group size of ${this._value}`)
    }

    return this._value - currentUsers
  }

  public getUtilizationPercentage(currentUsers: number): number {
    if (typeof currentUsers !== 'number' || !Number.isInteger(currentUsers) || currentUsers < 0) {
      throw ValidationError.invalidType('currentUsers', currentUsers, 'non-negative integer')
    }

    if (currentUsers > this._value) {
      throw InvalidValueError.forField('currentUsers', currentUsers, `cannot exceed group size of ${this._value}`)
    }

    return Math.round((currentUsers / this._value) * 100)
  }

  public isFull(currentUsers: number): boolean {
    return this.getRemainingCapacity(currentUsers) === 0
  }

  public isEmpty(currentUsers: number): boolean {
    return currentUsers === 0
  }

  public getStatisticalPower(effectSize: number = 0.1): number {
    /**
     * Simple approximation of statistical power
     * This is a simplified calculation - in practice, you'd use more sophisticated methods
     *
     * Effect size: 0.1 = small, 0.3 = medium, 0.5 = large
     * Returns approximate power (0-1) for detecting the effect
     */

    if (effectSize <= 0 || effectSize > 1) {
      throw ValidationError.invalidType('effectSize', effectSize, 'number between 0 and 1')
    }

    // Simplified power calculation based on sample size
    // Larger samples have more power to detect smaller effects
    const sampleSizeFactor = Math.min(this._value / 1000, 10) // Cap at 10x factor
    const basePower = 0.8 // 80% power baseline
    const effectFactor = 1 / Math.max(effectSize, 0.05) // Smaller effects require more power

    const power = Math.min((basePower * sampleSizeFactor) / effectFactor, 0.99)
    return Math.round(power * 100) / 100
  }

  public withNewSize(newSize: number): GroupSize {
    return GroupSize.create(newSize)
  }

  public toJSON(): { value: number } {
    return { value: this._value }
  }

  public toPrimitive(): number {
    return this._value
  }

  public toString(): string {
    return this._value.toString()
  }

  public toDetailedString(): string {
    return `GroupSize(${this._value}, min=${GroupSize.MIN_SIZE}, recommended=${GroupSize.RECOMMENDED_SIZE})`
  }
}
