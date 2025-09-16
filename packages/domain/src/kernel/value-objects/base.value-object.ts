/**
 * ValueObject Abstract Base Class
 *
 * The ValueObject is an abstract base class that provides the foundation for all value objects in the system.
 * It implements common functionality for immutability, equality comparison, serialization, and deep value comparison,
 * ensuring consistency across all value objects while enforcing the core principles of domain-driven design and value object patterns.
 */

export abstract class ValueObject<T> {
  protected readonly _value: T

  /**
   * Protected constructor for value objects
   * @param value The initial value for the value object
   */
  protected constructor(value: T) {
    this._value = value
  }

  /**
   * Get the value of the value object
   * @returns The immutable value T
   */
  protected get value(): T {
    return this._value
  }

  /**
   * Determines if two value objects are equal
   * @param other Another value object of the same type or null
   * @returns true if objects are equal, false otherwise
   */
  equals(other: ValueObject<T> | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false
    }

    if (this.constructor !== other.constructor) {
      return false
    }

    return this.deepEquals(this._value, other._value)
  }

  /**
   * Converts value object to JSON-serializable object
   * Recursively serializes all properties, handling dates, value objects, and nested structures
   * @returns Plain object suitable for JSON serialization
   */
  toJSON(): Record<string, unknown> {
    return this.serializeValue(this._value) as Record<string, unknown>
  }

  /**
   * Converts value object to its primitive representation
   * @returns The primitive value of type T
   */
  toPrimitive(): T {
    return this._value
  }

  /**
   * Converts value object to string representation
   * @returns String representation of the underlying value
   */
  toString(): string {
    return String(this._value)
  }

  /**
   * Serialize a value to JSON-compatible format
   * Handles dates, value objects, arrays, and nested objects
   * @param value The value to serialize
   * @returns JSON-compatible representation
   */
  private serializeValue(value: unknown): unknown {
    // Handle null and undefined
    if (value === null || value === undefined) {
      return value
    }

    // Handle primitives
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value
    }

    // Handle dates
    if (value instanceof Date) {
      return value.toISOString()
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((item) => this.serializeValue(item))
    }

    // Handle objects with toJSON method (value objects, etc.)
    if (typeof value === 'object' && 'toJSON' in value && typeof value.toJSON === 'function') {
      return (value as { toJSON: () => unknown }).toJSON()
    }

    // Handle plain objects
    if (typeof value === 'object' && value.constructor === Object) {
      const serialized: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value)) {
        serialized[k] = this.serializeValue(v)
      }
      return serialized
    }

    // Handle other objects (classes without toJSON)
    if (typeof value === 'object') {
      // For custom objects without toJSON, try to serialize their enumerable properties
      const serialized: Record<string, unknown> = {}
      for (const k in value as Record<string, unknown>) {
        if (Object.prototype.hasOwnProperty.call(value, k)) {
          serialized[k] = this.serializeValue((value as Record<string, unknown>)[k])
        }
      }
      return serialized
    }

    // Fallback for any other type
    return value
  }

  /**
   * Performs deep equality comparison of complex values
   * @param a First value to compare
   * @param b Second value to compare
   * @returns true if values are deeply equal, false otherwise
   */
  private deepEquals(a: any, b: any): boolean {
    // Reference equality check first (fast path)
    if (a === b) {
      return true
    }

    // Null/undefined handling
    if (a == null || b == null) {
      return false
    }

    // Type checking
    if (typeof a !== typeof b) {
      return false
    }

    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false
      }

      for (let i = 0; i < a.length; i++) {
        if (!this.deepEquals(a[i], b[i])) {
          return false
        }
      }

      return true
    }

    // Handle objects
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)

      // Compare object key counts
      if (keysA.length !== keysB.length) {
        return false
      }

      // Check that all keys exist in both objects
      for (const key of keysA) {
        if (!keysB.includes(key)) {
          return false
        }

        // Recursively compare all property values
        if (!this.deepEquals(a[key], b[key])) {
          return false
        }
      }

      return true
    }

    // Direct comparison for primitive types
    return a === b
  }
}
