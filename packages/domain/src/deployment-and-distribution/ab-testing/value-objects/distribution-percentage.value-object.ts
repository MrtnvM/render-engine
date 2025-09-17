import { ValueObject } from '../../../kernel/value-objects/base.value-object.js'
import { ValidationError } from '../../../kernel/errors/validation.error.js'
import { InvalidValueError } from '../../../kernel/errors/invalid-value.error.js'

/**
 * DistributionPercentage Value Object
 *
 * Represents the percentage of traffic/users allocated to a variant.
 * Ensures valid percentage values between 0 and 1.
 */
export class DistributionPercentage extends ValueObject<number> {
  private constructor(value: number) {
    super(value)
  }

  /**
   * Creates a new DistributionPercentage instance
   */
  static create(value: number): DistributionPercentage {
    if (typeof value !== 'number') {
      throw ValidationError.invalidType('distributionPercentage', value, 'number')
    }

    if (value < 0 || value > 1) {
      throw InvalidValueError.forField('distributionPercentage', value, 'number between 0 and 1')
    }

    if (value === 0) {
      throw InvalidValueError.forField('distributionPercentage', value, 'non-zero number')
    }

    return new DistributionPercentage(value)
  }

  /**
   * Creates a DistributionPercentage from a percentage value (0-100)
   */
  static fromPercentage(percentage: number): DistributionPercentage {
    if (percentage < 0 || percentage > 100) {
      throw InvalidValueError.forField('percentage', percentage, 'number between 0 and 100')
    }

    return new DistributionPercentage(percentage / 100)
  }

  /**
   * Gets the value as a percentage (0-100)
   */
  get asPercentage(): number {
    return this._value * 100
  }

  /**
   * Gets the value as a decimal (0-1)
   */
  get asDecimal(): number {
    return this._value
  }

  /**
   * Checks if this percentage is equal to another
   */
  equals(other: ValueObject<number> | null | undefined): boolean {
    if (!other || !(other instanceof DistributionPercentage)) {
      return false
    }
    return Math.abs(this._value - other._value) < Number.EPSILON
  }

  /**
   * Adds another percentage to this one
   */
  add(other: DistributionPercentage): DistributionPercentage {
    const sum = this._value + other._value
    if (sum > 1) {
      throw InvalidValueError.forField('distributionPercentage', sum, 'sum that does not exceed 100%')
    }
    return new DistributionPercentage(sum)
  }

  /**
   * Subtracts another percentage from this one
   */
  subtract(other: DistributionPercentage): DistributionPercentage {
    const difference = this._value - other._value
    if (difference < 0) {
      throw InvalidValueError.forField('distributionPercentage', difference, 'non-negative result')
    }
    return new DistributionPercentage(difference)
  }

  /**
   * Returns a string representation
   */
  toString(): string {
    return `${(this._value * 100).toFixed(2)}%`
  }

  /**
   * Returns the decimal value for JSON serialization
   */
  toJSON(): Record<string, unknown> {
    return { value: this._value }
  }
}
