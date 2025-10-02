import { DomainEvent } from '../events/base.domain-event.js'
import { ID } from '../value-objects/id.value-object.js'

export interface EntityData {
  id: ID
  createdAt: Date
  updatedAt: Date
}

/**
 * Base class for all entities.
 * Entities have identity and are defined by their ID.
 * Entities has data and domain events and can be serialized to JSON.
 */
export abstract class Entity<Data extends EntityData = EntityData> {
  private readonly _data: Data
  private readonly _domainEvents: DomainEvent[] = []

  protected constructor(
    data: Omit<Data, 'id' | 'createdAt' | 'updatedAt'> & { id?: ID; createdAt?: Date; updatedAt?: Date },
  ) {
    this._data = {
      ...data,
      id: data.id ?? ID.generate(),
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    } as Data
  }

  /**
   * Get the unique identifier of the entity
   */
  get id(): ID {
    return this._data.id
  }

  /**
   * Get the creation timestamp
   */
  get createdAt(): Date {
    return this._data.createdAt
  }

  /**
   * Get the last update timestamp
   */
  get updatedAt(): Date {
    return this._data.updatedAt
  }

  /**
   * Get the data of the entity
   */
  protected get data(): Data {
    return this._data
  }

  /**
   * Check if this entity equals another entity
   * Entities are equal if they have the same ID and type
   */
  equals(other: Entity | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false
    }

    if (this.constructor !== other.constructor) {
      return false
    }

    return this._data.id.equals(other._data.id)
  }

  /**
   * Add a domain event to the entity
   * Events are collected and can be retrieved for processing
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }

  /**
   * Get all domain events for this entity
   */
  getDomainEvents(): readonly DomainEvent[] {
    return Object.freeze([...this._domainEvents])
  }

  /**
   * Clear all domain events from this entity
   * Should be called after events are processed
   */
  clearDomainEvents(): void {
    this._domainEvents.length = 0
  }

  /**
   * Convert entity to JSON representation
   * Recursively serializes all properties, handling dates, value objects, and nested structures
   */
  toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {}

    for (const key in this._data) {
      const value = this._data[key]
      json[key] = this.serializeValue(value)
    }

    return json
  }

  /**
   * Serialize a value to JSON-compatible format
   * Handles dates, value objects, arrays, and nested objects
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
   * String representation of the entity
   * Provides a concise, readable format showing the entity type and key identifiers
   */
  toString(): string {
    const className = this.constructor.name
    const id = this._data.id.toString()
    return `${className}(id=${id})`
  }

  /**
   * Detailed string representation of the entity
   * Includes all data properties for debugging purposes
   */
  toDetailedString(): string {
    const className = this.constructor.name
    const id = this._data.id.toString()
    const dataKeys = Object.keys(this._data).filter((key) => key !== 'id')
    const dataInfo = dataKeys
      .map((key) => {
        const value = (this._data as Record<string, unknown>)[key]
        if (value instanceof Date) {
          return `${key}=${value.toISOString()}`
        }
        if (typeof value === 'object' && value !== null && 'toString' in value) {
          return `${key}=${value.toString()}`
        }
        return `${key}=${JSON.stringify(value)}`
      })
      .join(', ')

    return `${className}(id=${id}${dataInfo ? `, ${dataInfo}` : ''})`
  }
}
