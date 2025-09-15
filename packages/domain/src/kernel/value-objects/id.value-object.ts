import { v4 as uuidv4, validate as validateUUID } from 'uuid'

import { ValueObject } from './base.value-object.js'
import { ValidationError } from '../errors/validation.error.js'
import { InvalidValueError } from '../errors/invalid-value.error.js'
import { InvalidDataError } from '../errors/invalid-data.error.js'

/**
 * ID Value Object
 *
 * Represents a unique identifier for entities and aggregates in the domain.
 * Encapsulates UUID string values and ensures they are properly validated,
 * formatted, and compared. IDs are immutable and provide type-safe identification
 * for domain objects.
 */
export class ID extends ValueObject<string> {
  /**
   * Private constructor to enforce factory method usage
   * @param value The UUID string value
   */
  private constructor(value: string) {
    super(value)
  }

  // ===== Factory Methods =====

  /**
   * Creates a new ID instance
   * @param id Optional UUID string. If not provided, generates a new UUID v4
   * @returns New ID instance
   * @throws ValidationError if provided ID is invalid format
   * @throws InvalidValueError if provided ID is not a valid UUID
   */
  static create(id?: string | null): ID {
    if (id === null || id === undefined) {
      return ID.generate()
    }

    if (typeof id !== 'string') {
      throw ValidationError.invalidType('id', id, 'string')
    }

    const trimmedId = id.trim()

    if (!trimmedId) {
      throw ValidationError.emptyValue('id')
    }

    if (!ID.isValidUUID(trimmedId)) {
      throw InvalidValueError.invalidUUID(trimmedId)
    }

    return new ID(trimmedId)
  }

  /**
   * Generates a new unique ID with UUID v4
   * @returns New ID instance with generated UUID
   */
  static generate(): ID {
    const uuid = uuidv4()
    return new ID(uuid)
  }

  /**
   * Creates ID from JSON data
   * @param data Object containing 'value' property with UUID string
   * @returns New ID instance
   * @throws InvalidDataError if data structure is invalid
   * @throws ValidationError if UUID format is invalid
   */
  static fromJSON(data: { value: string } | any): ID {
    if (data === null || data === undefined || typeof data !== 'object') {
      throw InvalidDataError.invalidStructure('object with value property', data)
    }

    if (!('value' in data)) {
      throw InvalidDataError.missingProperty('value', data)
    }

    return ID.create(data.value)
  }

  // ===== Property Accessors =====

  /**
   * Returns the UUID string value
   * @returns The UUID string
   */
  toString(): string {
    return this.value
  }

  // ===== Utility Methods =====

  /**
   * Converts ID to JSON-serializable object
   * @returns Plain object with value property
   */
  toJSON(): { value: string } {
    return { value: this.value }
  }

  /**
   * Converts ID to primitive string value
   * @returns The UUID string value
   */
  toPrimitive(): string {
    return this.value
  }

  // ===== Private Methods =====

  /**
   * Validates if a string is a valid UUID format (any version)
   * @param id The string to validate
   * @returns true if valid UUID format
   */
  private static isValidUUID(id: string): boolean {
    if (typeof id !== 'string') {
      return false
    }

    // Use uuid library's validate function for any valid UUID format
    return validateUUID(id)
  }
}
