import { DomainError } from '../../../kernel/errors/domain.error.js'

/**
 * Error thrown when attempting to assign users to an experiment that is not running
 */
export class ExperimentNotStartedError extends DomainError {
  constructor(experimentId: string) {
    super({
      message: `Experiment ${experimentId} is not in RUNNING status. User assignments can only be made to running experiments.`,
      code: 'EXPERIMENT_NOT_STARTED',
      metadata: { experimentId },
    })
  }
}

/**
 * Error thrown when a user does not meet experiment eligibility criteria
 */
export class UserNotEligibleError extends DomainError {
  constructor(userId: string, experimentId: string, reason: string) {
    super({
      message: `User ${userId} is not eligible for experiment ${experimentId}: ${reason}`,
      code: 'USER_NOT_ELIGIBLE',
      metadata: { userId, experimentId, reason },
    })
  }
}

/**
 * Error thrown when an assignment cannot be processed due to business rule violations
 */
export class InvalidAssignmentError extends DomainError {
  constructor(userId: string, experimentId: string, reason: string) {
    super({
      message: `Invalid assignment for user ${userId} in experiment ${experimentId}: ${reason}`,
      code: 'INVALID_ASSIGNMENT',
      metadata: { userId, experimentId, reason },
    })
  }
}

/**
 * Error thrown when attempting to reassign a user who is not currently in the experiment
 */
export class UserNotInExperimentError extends DomainError {
  constructor(userId: string, experimentId: string) {
    super({
      message: `User ${userId} is not currently assigned to any variant in experiment ${experimentId}`,
      code: 'USER_NOT_IN_EXPERIMENT',
      metadata: { userId, experimentId },
    })
  }
}

/**
 * Error thrown when the specified variant is not part of the experiment
 */
export class InvalidVariantError extends DomainError {
  constructor(variantId: string, experimentId: string) {
    super({
      message: `Variant ${variantId} is not part of experiment ${experimentId}`,
      code: 'INVALID_VARIANT',
      metadata: { variantId, experimentId },
    })
  }
}

/**
 * Error thrown when reassignment violates business rules
 */
export class ReassignmentNotAllowedError extends DomainError {
  constructor(userId: string, experimentId: string, reason: string) {
    super({
      message: `Reassignment not allowed for user ${userId} in experiment ${experimentId}: ${reason}`,
      code: 'REASSIGNMENT_NOT_ALLOWED',
      metadata: { userId, experimentId, reason },
    })
  }
}

/**
 * Error thrown when assignment cannot be persisted
 */
export class AssignmentPersistenceError extends DomainError {
  constructor(userId: string, experimentId: string, variantId: string, underlyingError: string) {
    super({
      message: `Failed to persist assignment for user ${userId} to variant ${variantId} in experiment ${experimentId}: ${underlyingError}`,
      code: 'ASSIGNMENT_PERSISTENCE_ERROR',
      metadata: { userId, experimentId, variantId, underlyingError },
    })
  }
}
