import { DomainEvent } from '../../../kernel/events/base.domain-event.js'
import { ID } from '../../../kernel/value-objects/id.value-object.js'

/**
 * Emitted when a user is successfully assigned to a variant
 */
export class UserAssignedEvent extends DomainEvent {
  constructor(
    public readonly experimentId: ID,
    public readonly userId: ID,
    public readonly variantId: ID,
    public readonly assignedAt: Date,
    public readonly assignmentMethod: 'consistent_hash' | 'manual' | 'reassignment',
    public readonly distributionPercentage: number,
    public readonly eligibilityCriteria: string[],
  ) {
    super({
      aggregateId: experimentId,
      eventName: 'user.assigned',
      payload: {
        experimentId: experimentId.toPrimitive(),
        userId: userId.toPrimitive(),
        variantId: variantId.toPrimitive(),
        assignedAt: assignedAt.toISOString(),
        assignmentMethod,
        distributionPercentage,
        eligibilityCriteria,
      },
    })
  }
}

/**
 * Emitted when a user is reassigned to a different variant
 */
export class UserReassignedEvent extends DomainEvent {
  constructor(
    public readonly experimentId: ID,
    public readonly userId: ID,
    public readonly previousVariantId: ID,
    public readonly newVariantId: ID,
    public readonly reassignedAt: Date,
    public readonly reassignmentReason: string,
    public readonly previousAssignmentDuration: number,
  ) {
    super({
      aggregateId: experimentId,
      eventName: 'user.reassigned',
      payload: {
        experimentId: experimentId.toPrimitive(),
        userId: userId.toPrimitive(),
        previousVariantId: previousVariantId.toPrimitive(),
        newVariantId: newVariantId.toPrimitive(),
        reassignedAt: reassignedAt.toISOString(),
        reassignmentReason,
        previousAssignmentDuration,
      },
    })
  }
}

/**
 * Emitted when an assignment validation fails
 */
export class AssignmentValidationErrorEvent extends DomainEvent {
  constructor(
    public readonly experimentId: ID,
    public readonly userId: ID,
    public readonly attemptedVariantId: ID | undefined,
    public readonly errorType: string,
    public readonly errorMessage: string,
    public readonly validationDetails: Record<string, unknown>,
    public readonly timestamp: Date,
  ) {
    super({
      aggregateId: experimentId,
      eventName: 'assignment.validation_error',
      payload: {
        experimentId: experimentId.toPrimitive(),
        userId: userId.toPrimitive(),
        attemptedVariantId: attemptedVariantId?.toPrimitive(),
        errorType,
        errorMessage,
        validationDetails,
        timestamp: timestamp.toISOString(),
      },
    })
  }
}
