import { DomainEvent } from '../../../kernel/events/base.domain-event.js'
import { ID } from '../../../kernel/value-objects/id.value-object.js'

interface ReleaseCreatedPayload {
  releaseId: ID
  version: string
  name: string
  createdBy: ID
  createdAt: Date
  [key: string]: unknown
}

export class ReleaseCreatedEvent extends DomainEvent<ReleaseCreatedPayload> {
  constructor(
    public readonly releaseId: ID,
    public readonly version: string,
    public readonly name: string,
    public readonly createdBy: ID,
    public readonly createdAt: Date
  ) {
    super({
      aggregateId: releaseId,
      eventName: 'ReleaseCreated',
      payload: {
        releaseId,
        version,
        name,
        createdBy,
        createdAt
      }
    })
  }
}

interface ReleaseApprovedPayload {
  releaseId: ID
  version: string
  approvedBy: ID[]
  approvedAt: Date
  [key: string]: unknown
}

export class ReleaseApprovedEvent extends DomainEvent<ReleaseApprovedPayload> {
  constructor(
    public readonly releaseId: ID,
    public readonly version: string,
    public readonly approvedBy: ID[],
    public readonly approvedAt: Date
  ) {
    super({
      aggregateId: releaseId,
      eventName: 'ReleaseApproved',
      payload: {
        releaseId,
        version,
        approvedBy,
        approvedAt
      }
    })
  }
}

interface ReleaseDeployedPayload {
  releaseId: ID
  version: string
  environment: string
  deployedAt: Date
  deployedBy: ID
  [key: string]: unknown
}

export class ReleaseDeployedEvent extends DomainEvent<ReleaseDeployedPayload> {
  constructor(
    public readonly releaseId: ID,
    public readonly version: string,
    public readonly environment: string,
    public readonly deployedAt: Date,
    public readonly deployedBy: ID
  ) {
    super({
      aggregateId: releaseId,
      eventName: 'ReleaseDeployed',
      payload: {
        releaseId,
        version,
        environment,
        deployedAt,
        deployedBy
      }
    })
  }
}

interface ReleaseRolledBackPayload {
  releaseId: ID
  version: string
  environment: string
  rolledBackAt: Date
  rolledBackBy: ID
  previousVersion: string
  [key: string]: unknown
}

export class ReleaseRolledBackEvent extends DomainEvent<ReleaseRolledBackPayload> {
  constructor(
    public readonly releaseId: ID,
    public readonly version: string,
    public readonly environment: string,
    public readonly rolledBackAt: Date,
    public readonly rolledBackBy: ID,
    public readonly previousVersion: string
  ) {
    super({
      aggregateId: releaseId,
      eventName: 'ReleaseRolledBack',
      payload: {
        releaseId,
        version,
        environment,
        rolledBackAt,
        rolledBackBy,
        previousVersion
      }
    })
  }
}