// Entities
export { Release } from './entities/index.js'

// Value Objects
export { DeploymentStatus, DeploymentStatusEnum } from './value-objects/index.js'

// Domain Events
export {
  ReleaseCreatedEvent,
  ReleaseApprovedEvent,
  ReleaseDeployedEvent,
  ReleaseRolledBackEvent,
} from './domain-events/index.js'

// Domain Errors
export {
  InvalidReleaseError,
  ReleaseNotFoundError,
  ReleaseAlreadyApprovedError,
  ReleaseNotApprovedError,
  EnvironmentAlreadyDeployedError,
  DeploymentFailedError,
  NoPreviousVersionError,
  RollbackFailedError,
  CannotModifyApprovedReleaseError,
  InvalidScheduleError,
  SchemaAlreadyExistsError,
  SchemaNotFoundError,
  InvalidSchemaError,
  InvalidApprovalError,
} from './domain-errors/index.js'

// Shared Types
export type {
  CreateReleaseParams,
  SchemaRelease,
  EnvironmentDeployment,
  Approval,
  EnvironmentConfig,
  ReleaseStatus,
} from './shared/index.js'
