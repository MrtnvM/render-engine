import { ValueObject } from '../../../kernel/value-objects/base.value-object.js'
import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { ValidationError } from '../../../kernel/errors/validation.error.js'

/**
 * UserAssignment Value Object
 *
 * Represents a user's assignment to a specific variant within an experiment.
 * This value object encapsulates the assignment relationship and provides
 * methods for validation and comparison.
 */
export class UserAssignment extends ValueObject<{
  experimentId: ID
  userId: ID
  variantId: ID
  assignedAt: Date
  assignmentMethod: 'consistent_hash' | 'manual' | 'reassignment'
  isActive: boolean
  metadata?: Record<string, unknown>
}> {
  private constructor(props: {
    experimentId: ID
    userId: ID
    variantId: ID
    assignedAt: Date
    assignmentMethod: 'consistent_hash' | 'manual' | 'reassignment'
    isActive: boolean
    metadata?: Record<string, unknown>
  }) {
    super(props)
  }

  /**
   * Creates a new UserAssignment instance
   */
  static create(params: {
    experimentId: ID
    userId: ID
    variantId: ID
    assignmentMethod: 'consistent_hash' | 'manual' | 'reassignment'
    metadata?: Record<string, unknown>
  }): UserAssignment {
    if (!params.experimentId || !params.userId || !params.variantId) {
      throw ValidationError.forField('UserAssignment', params, 'requires experimentId, userId, and variantId')
    }

    if (!['consistent_hash', 'manual', 'reassignment'].includes(params.assignmentMethod)) {
      throw ValidationError.forField(
        'assignmentMethod',
        params.assignmentMethod,
        'must be one of: consistent_hash, manual, reassignment',
      )
    }

    return new UserAssignment({
      experimentId: params.experimentId,
      userId: params.userId,
      variantId: params.variantId,
      assignedAt: new Date(),
      assignmentMethod: params.assignmentMethod,
      isActive: true,
      metadata: params.metadata,
    })
  }

  /**
   * Creates a UserAssignment from existing data (for reconstruction from persistence)
   */
  static fromExisting(params: {
    experimentId: ID
    userId: ID
    variantId: ID
    assignedAt: Date
    assignmentMethod: 'consistent_hash' | 'manual' | 'reassignment'
    isActive: boolean
    metadata?: Record<string, unknown>
  }): UserAssignment {
    return new UserAssignment(params)
  }

  /**
   * Deactivates this assignment
   */
  deactivate(): UserAssignment {
    return new UserAssignment({
      ...this._value,
      isActive: false,
    })
  }

  /**
   * Checks if this assignment is currently active
   */
  get isActive(): boolean {
    return this._value.isActive
  }

  /**
   * Gets the experiment ID
   */
  get experimentId(): ID {
    return this._value.experimentId
  }

  /**
   * Gets the user ID
   */
  get userId(): ID {
    return this._value.userId
  }

  /**
   * Gets the variant ID
   */
  get variantId(): ID {
    return this._value.variantId
  }

  /**
   * Gets the assignment timestamp
   */
  get assignedAt(): Date {
    return this._value.assignedAt
  }

  /**
   * Gets the assignment method
   */
  get assignmentMethod(): 'consistent_hash' | 'manual' | 'reassignment' {
    return this._value.assignmentMethod
  }

  /**
   * Gets the metadata
   */
  get metadata(): Record<string, unknown> | undefined {
    return this._value.metadata
  }

  /**
   * Converts the assignment to a JSON-serializable format
   */
  toJSON(): Record<string, unknown> {
    return {
      experimentId: this._value.experimentId.toJSON(),
      userId: this._value.userId.toJSON(),
      variantId: this._value.variantId.toJSON(),
      assignedAt: this._value.assignedAt.toISOString(),
      assignmentMethod: this._value.assignmentMethod,
      isActive: this._value.isActive,
      metadata: this._value.metadata,
    }
  }

  /**
   * Returns a string representation of the assignment
   */
  toString(): string {
    return `UserAssignment(experiment=${this._value.experimentId}, user=${this._value.userId}, variant=${this._value.variantId}, active=${this._value.isActive})`
  }
}
