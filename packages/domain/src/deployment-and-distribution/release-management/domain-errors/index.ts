import { DomainError } from '../../../kernel/errors/domain.error.js'

// Release errors
export class InvalidReleaseError extends DomainError {
  constructor(message: string = 'Invalid release data') {
    super({ message })
  }
}

export class ReleaseNotFoundError extends DomainError {
  constructor(releaseId: string) {
    super({ message: `Release with ID ${releaseId} not found` })
  }
}

export class ReleaseAlreadyApprovedError extends DomainError {
  constructor(releaseId: string) {
    super({ message: `Release ${releaseId} is already approved` })
  }
}

export class ReleaseNotApprovedError extends DomainError {
  constructor(releaseId: string) {
    super({ message: `Release ${releaseId} is not approved` })
  }
}

export class EnvironmentAlreadyDeployedError extends DomainError {
  constructor(releaseId: string, environment: string) {
    super({ message: `Release ${releaseId} is already deployed to ${environment}` })
  }
}

export class DeploymentFailedError extends DomainError {
  constructor(releaseId: string, environment: string, reason: string) {
    super({ message: `Deployment of release ${releaseId} to ${environment} failed: ${reason}` })
  }
}

export class NoPreviousVersionError extends DomainError {
  constructor(releaseId: string, environment: string) {
    super({ message: `No previous version found for rollback of release ${releaseId} in ${environment}` })
  }
}

export class RollbackFailedError extends DomainError {
  constructor(releaseId: string, environment: string, reason: string) {
    super({ message: `Rollback of release ${releaseId} in ${environment} failed: ${reason}` })
  }
}

export class CannotModifyApprovedReleaseError extends DomainError {
  constructor(releaseId: string) {
    super({ message: `Cannot modify approved release ${releaseId}` })
  }
}

export class InvalidScheduleError extends DomainError {
  constructor(message: string = 'Invalid deployment schedule') {
    super({ message })
  }
}

// Schema errors
export class SchemaAlreadyExistsError extends DomainError {
  constructor(schemaId: string, releaseId: string) {
    super({ message: `Schema ${schemaId} already exists in release ${releaseId}` })
  }
}

export class SchemaNotFoundError extends DomainError {
  constructor(schemaId: string, releaseId: string) {
    super({ message: `Schema ${schemaId} not found in release ${releaseId}` })
  }
}

export class InvalidSchemaError extends DomainError {
  constructor(message: string = 'Invalid schema data') {
    super({ message })
  }
}

// Approval errors
export class InvalidApprovalError extends DomainError {
  constructor(message: string = 'Invalid approval data') {
    super({ message })
  }
}