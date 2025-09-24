/**
 * ID Value Object
 *
 * Represents a unique identifier for domain entities.
 * Uses UUID v4 for generating unique IDs.
 */

export class ID {
  private constructor(private readonly value: string) {}

  static generate(): ID {
    // Simple UUID v4 generator for this example
    // In production, use a proper UUID library
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    return new ID(uuid)
  }

  static create(id: string): ID {
    return new ID(id)
  }

  toPrimitive(): string {
    return this.value
  }

  toString(): string {
    return this.value
  }

  equals(other: ID): boolean {
    return this.value === other.value
  }

  toJSON(): string {
    return this.value
  }
}