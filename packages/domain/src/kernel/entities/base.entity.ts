import { DomainEvent } from '../events/base.domain-event.js'
import { ID } from '../value-objects/id.value-object.js'
import { ValueObject } from '../value-objects/base.value-object.js'

/**
 * Base class for all entities
 * Entities have identity and are defined by their ID and attributes
 */
export abstract class Entity<Id extends ValueObject<any> = ID> {
  protected readonly _id: Id
  private readonly _domainEvents: DomainEvent[] = []
  private readonly _createdAt: Date
  private readonly _updatedAt: Date

  protected constructor(id: Id, createdAt?: Date, updatedAt?: Date) {
    this._id = id
    this._createdAt = createdAt ?? new Date()
    this._updatedAt = updatedAt ?? new Date()
  }

  /**
   * Get the unique identifier of the entity
   */
  get id(): Id {
    return this._id
  }

  /**
   * Get the creation timestamp
   */
  get createdAt(): Date {
    return this._createdAt
  }

  /**
   * Get the last update timestamp
   */
  get updatedAt(): Date {
    return this._updatedAt
  }

  /**
   * Check if this entity equals another entity
   * Entities are equal if they have the same ID and type
   */
  equals(other: Entity<Id> | null): boolean {
    if (other === null || other === undefined) {
      return false
    }

    if (this.constructor !== other.constructor) {
      return false
    }

    return this._id.equals(other._id)
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
   * Must be implemented by concrete entities
   */
  abstract toJSON(): object

  /**
   * Convert entity to primitive representation
   * Must be implemented by concrete entities
   */
  abstract toPrimitive(): object

  /**
   * String representation of the entity
   */
  toString(): string {
    return `${this.constructor.name}(id=${this._id})`
  }
}
