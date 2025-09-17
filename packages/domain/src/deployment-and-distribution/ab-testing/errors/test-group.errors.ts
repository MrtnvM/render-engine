import { DomainError } from '../../../kernel/errors/domain.error.js'

/**
 * InvalidTestGroupError
 *
 * Thrown when test group data is invalid or malformed
 */
export class InvalidTestGroupError extends DomainError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super({
      message,
      code: 'INVALID_TEST_GROUP',
      metadata,
    })
  }
}

/**
 * DuplicateGroupNameError
 *
 * Thrown when attempting to create a test group with a name that already exists in the same experiment
 */
export class DuplicateGroupNameError extends DomainError {
  constructor(groupName: string, experimentId: string) {
    super({
      message: `Test group with name '${groupName}' already exists in experiment '${experimentId}'`,
      code: 'DUPLICATE_GROUP_NAME',
      metadata: { groupName, experimentId },
    })
  }
}

/**
 * InvalidGroupSizeError
 *
 * Thrown when group size is invalid or too small for statistical validity
 */
export class InvalidGroupSizeError extends DomainError {
  constructor(size: number, reason: string) {
    super({
      message: `Invalid group size ${size}: ${reason}`,
      code: 'INVALID_GROUP_SIZE',
      metadata: { size, reason },
    })
  }
}

/**
 * InvalidCriteriaError
 *
 * Thrown when segmentation criteria are malformed or invalid
 */
export class InvalidCriteriaError extends DomainError {
  constructor(criteria: unknown, reason: string) {
    super({
      message: `Invalid test criteria: ${reason}`,
      code: 'INVALID_CRITERIA',
      metadata: { criteria, reason },
    })
  }
}

/**
 * UserAlreadyInGroupError
 *
 * Thrown when attempting to add a user who is already in the test group
 */
export class UserAlreadyInGroupError extends DomainError {
  constructor(userId: string, groupId: string) {
    super({
      message: `User '${userId}' is already in test group '${groupId}'`,
      code: 'USER_ALREADY_IN_GROUP',
      metadata: { userId, groupId },
    })
  }
}

/**
 * UserInAnotherGroupError
 *
 * Thrown when attempting to add a user who is already in another group within the same experiment
 */
export class UserInAnotherGroupError extends DomainError {
  constructor(userId: string, currentGroupId: string, targetGroupId: string, experimentId: string) {
    super({
      message: `User '${userId}' is already in group '${currentGroupId}' and cannot be added to group '${targetGroupId}' in experiment '${experimentId}'`,
      code: 'USER_IN_ANOTHER_GROUP',
      metadata: { userId, currentGroupId, targetGroupId, experimentId },
    })
  }
}

/**
 * GroupFullError
 *
 * Thrown when attempting to add a user to a group that has reached its size limit
 */
export class GroupFullError extends DomainError {
  constructor(groupId: string, currentSize: number, maxSize: number) {
    super({
      message: `Test group '${groupId}' is full (${currentSize}/${maxSize} users)`,
      code: 'GROUP_FULL',
      metadata: { groupId, currentSize, maxSize },
    })
  }
}

/**
 * ExperimentRunningError
 *
 * Thrown when attempting to modify a test group while its experiment is running
 */
export class ExperimentRunningError extends DomainError {
  constructor(experimentId: string, operation: string) {
    super({
      message: `Cannot ${operation} test group while experiment '${experimentId}' is running`,
      code: 'EXPERIMENT_RUNNING',
      metadata: { experimentId, operation },
    })
  }
}

/**
 * InvalidUserError
 *
 * Thrown when user ID is invalid or user doesn't exist
 */
export class InvalidUserError extends DomainError {
  constructor(userId: string, reason: string) {
    super({
      message: `Invalid user '${userId}': ${reason}`,
      code: 'INVALID_USER',
      metadata: { userId, reason },
    })
  }
}

/**
 * UserNotInGroupError
 *
 * Thrown when attempting to remove a user who is not in the test group
 */
export class UserNotInGroupError extends DomainError {
  constructor(userId: string, groupId: string) {
    super({
      message: `User '${userId}' is not in test group '${groupId}'`,
      code: 'USER_NOT_IN_GROUP',
      metadata: { userId, groupId },
    })
  }
}

/**
 * TestGroupAlreadyActiveError
 *
 * Thrown when attempting to activate a test group that is already active
 */
export class TestGroupAlreadyActiveError extends DomainError {
  constructor(groupId: string) {
    super({
      message: `Test group '${groupId}' is already active`,
      code: 'TEST_GROUP_ALREADY_ACTIVE',
      metadata: { groupId },
    })
  }
}

/**
 * TestGroupAlreadyInactiveError
 *
 * Thrown when attempting to deactivate a test group that is already inactive
 */
export class TestGroupAlreadyInactiveError extends DomainError {
  constructor(groupId: string) {
    super({
      message: `Test group '${groupId}' is already inactive`,
      code: 'TEST_GROUP_ALREADY_INACTIVE',
      metadata: { groupId },
    })
  }
}

/**
 * ExperimentNotReadyError
 *
 * Thrown when attempting to activate a test group but the experiment is not in a ready state
 */
export class ExperimentNotReadyError extends DomainError {
  constructor(experimentId: string, reason: string) {
    super({
      message: `Experiment '${experimentId}' is not ready: ${reason}`,
      code: 'EXPERIMENT_NOT_READY',
      metadata: { experimentId, reason },
    })
  }
}

/**
 * CriteriaUpdateConflictError
 *
 * Thrown when updating criteria would invalidate current user assignments
 */
export class CriteriaUpdateConflictError extends DomainError {
  constructor(groupId: string, affectedUsers: number) {
    super({
      message: `Updating criteria for test group '${groupId}' would affect ${affectedUsers} currently assigned users`,
      code: 'CRITERIA_UPDATE_CONFLICT',
      metadata: { groupId, affectedUsers },
    })
  }
}

/**
 * SizeReductionConflictError
 *
 * Thrown when attempting to reduce group size below current user count
 */
export class SizeReductionConflictError extends DomainError {
  constructor(groupId: string, currentSize: number, requestedSize: number) {
    super({
      message: `Cannot reduce test group '${groupId}' size from ${currentSize} to ${requestedSize} - size cannot be below current user count`,
      code: 'SIZE_REDUCTION_CONFLICT',
      metadata: { groupId, currentSize, requestedSize },
    })
  }
}
