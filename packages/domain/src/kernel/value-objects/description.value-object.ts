import { ValueObject } from './base.value-object.js'
import { ValidationError } from '../errors/validation.error.js'

/**
 * Description Value Object
 *
 * Optional descriptive text for domain entities. Supports empty values and validates length when present.
 */
export class Description extends ValueObject<string> {
  private static readonly MAX_LENGTH = 500

  private constructor(value: string) {
    super(value)
  }

  /**
   * Creates a new Description instance
   * @param value Description text (optional, max 500 characters)
   * @returns New Description instance
   * @throws ValidationError if value exceeds maximum length or is invalid type
   */
  static create(value: string | null | undefined): Description {
    // Handle null/undefined by creating empty description
    if (value === null || value === undefined) {
      return new Description('')
    }

    // Validate type
    if (typeof value !== 'string') {
      throw ValidationError.invalidType('description', value, 'string')
    }

    // Trim whitespace
    const trimmedValue = value.trim()

    // Validate length
    if (trimmedValue.length > this.MAX_LENGTH) {
      throw ValidationError.forField('description', value, `maximum length is ${this.MAX_LENGTH} characters`)
    }

    return new Description(trimmedValue)
  }

  /**
   * Creates an empty Description instance
   * @returns Empty Description instance
   */
  static empty(): Description {
    return new Description('')
  }

  /**
   * Checks if the description is empty
   * @returns true if description is empty, false otherwise
   */
  isEmpty(): boolean {
    return this._value === ''
  }
}
