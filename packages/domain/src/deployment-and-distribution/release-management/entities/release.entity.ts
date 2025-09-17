import { Entity, EntityData } from '../../../kernel/entities/base.entity.js'
import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { SemanticVersion } from '../../../kernel/value-objects/semantic-version.value-object.js'
import { SchemaRelease, EnvironmentDeployment, Approval, EnvironmentConfig, ReleaseStatus } from '../shared/types.js'
import {
  InvalidReleaseError,
  ReleaseAlreadyApprovedError,
  ReleaseNotApprovedError,
  EnvironmentAlreadyDeployedError,
  DeploymentFailedError,
  NoPreviousVersionError,
  RollbackFailedError,
  SchemaAlreadyExistsError,
  SchemaNotFoundError,
  InvalidSchemaError,
  CannotModifyApprovedReleaseError,
  InvalidScheduleError,
  InvalidApprovalError,
} from '../domain-errors/index.js'
import {
  ReleaseCreatedEvent,
  ReleaseApprovedEvent,
  ReleaseDeployedEvent,
  ReleaseRolledBackEvent,
} from '../domain-events/index.js'
import { Name, Description } from '../../../kernel/index.js'

interface ReleaseData extends EntityData {
  version: SemanticVersion
  name: Name
  description: Description
  status: ReleaseStatus
  schemas: SchemaRelease[]
  environments: EnvironmentDeployment[]
  approvals: Approval[]
  createdBy: ID
  scheduledAt?: Date
  deployedAt?: Date
}

/**
 * Release Entity
 *
 * Represents a deployment release containing schema versions, approval status, and deployment state.
 * Manages the lifecycle of schema deployments from creation through approval to deployment across environments.
 */
export class Release extends Entity<ReleaseData> {
  private constructor(
    data: Omit<ReleaseData, 'id' | 'createdAt' | 'updatedAt'> & { id?: ID; createdAt?: Date; updatedAt?: Date },
  ) {
    super(data)
  }

  static create(params: { name: string; description?: string; schemas: SchemaRelease[]; createdBy: ID }): Release {
    // Business Rule: Release must have at least one schema
    if (!params.schemas || params.schemas.length === 0) {
      throw new InvalidReleaseError('Release must contain at least one schema')
    }

    // Business Rule: Release name must be non-empty
    if (!params.name || params.name.toString().trim() === '') {
      throw new InvalidReleaseError('Release name cannot be empty')
    }

    const id = ID.create()
    const version = SemanticVersion.initial()
    const now = new Date()

    const release = new Release({
      id,
      version,
      name: Name.create(params.name),
      description: Description.create(params.description),
      status: 'DRAFT',
      schemas: params.schemas,
      environments: [],
      approvals: [],
      createdBy: params.createdBy,
      createdAt: now,
      updatedAt: now,
      scheduledAt: undefined,
      deployedAt: undefined,
    })

    // Emit domain event
    release.addDomainEvent(new ReleaseCreatedEvent(id, version.toString(), release.name, params.createdBy, now))

    return release
  }

  /**
   * Adds an approval to the release and updates status if all required approvals are received
   */
  approve(approval: Approval): void {
    // Business Rule: Cannot approve already approved release
    if (this.data.status === 'APPROVED') {
      throw new ReleaseAlreadyApprovedError(this.id.toString())
    }

    // Business Rule: Validate approval data
    if (!approval.approverId || !approval.status) {
      throw new InvalidApprovalError('Approval must have approver and status')
    }

    // Business Rule: Check if approver already approved
    const existingApproval = this.data.approvals.find((a) => a.approverId.equals(approval.approverId))
    if (existingApproval) {
      throw new InvalidApprovalError('Approver has already submitted approval')
    }

    // Add approval
    const newApproval: Approval = {
      approverId: approval.approverId,
      status: approval.status,
      comments: approval.comments?.trim(),
      approvedAt: approval.status === 'APPROVED' ? new Date() : undefined,
    }

    this.data.approvals.push(newApproval)
    this.data.updatedAt = new Date()

    // Check if all required approvals are received (business rule: 2 approvals required)
    const requiredApprovals = 2
    const approvedCount = this.data.approvals.filter((a) => a.status === 'APPROVED').length

    if (approvedCount >= requiredApprovals) {
      this.data.status = 'APPROVED'

      // Emit domain event
      this.addDomainEvent(
        new ReleaseApprovedEvent(
          this.id,
          this.data.version.toString(),
          this.data.approvals.filter((a) => a.status === 'APPROVED').map((a) => a.approverId),
          new Date(),
        ),
      )
    }
  }

  /**
   * Deploys the release to a specific environment with the given configuration
   */
  deployToEnvironment(environment: string, config: EnvironmentConfig): void {
    // Business Rule: Release must be approved before deployment
    if (this.data.status !== 'APPROVED') {
      throw new ReleaseNotApprovedError(this.id.toString())
    }

    // Business Rule: Check if already deployed to environment
    const existingDeployment = this.data.environments.find((e: EnvironmentDeployment) => e.environment === environment)
    if (existingDeployment && existingDeployment.status === 'DEPLOYED') {
      throw new EnvironmentAlreadyDeployedError(this.id.toString(), environment)
    }

    // Simulate deployment (in real implementation, this would call deployment service)
    try {
      const deployment: EnvironmentDeployment = {
        environment,
        status: 'DEPLOYED',
        deployedAt: new Date(),
        deployedBy: this.data.createdBy,
      }

      // Update or add deployment
      if (existingDeployment) {
        Object.assign(existingDeployment, deployment)
      } else {
        this.data.environments.push(deployment)
      }

      this.data.status = 'DEPLOYED'
      this.data.deployedAt = new Date()
      this.data.updatedAt = new Date()

      // Emit domain event
      this.addDomainEvent(
        new ReleaseDeployedEvent(this.id, this.data.version.toString(), environment, new Date(), this.data.createdBy),
      )
    } catch (error) {
      // Handle deployment failure
      const failedDeployment: EnvironmentDeployment = {
        environment,
        status: 'FAILED',
        deployedAt: new Date(),
      }

      if (existingDeployment) {
        Object.assign(existingDeployment, failedDeployment)
      } else {
        this.data.environments.push(failedDeployment)
      }

      this.data.status = 'FAILED'
      this.data.updatedAt = new Date()

      throw new DeploymentFailedError(
        this.id.toString(),
        environment,
        error instanceof Error ? error.message : 'Unknown error',
      )
    }
  }

  /**
   * Rolls back the release in the specified environment to the previous version
   */
  rollback(environment: string): void {
    // Business Rule: Must have a deployed version to rollback
    const deployment = this.data.environments.find((e: EnvironmentDeployment) => e.environment === environment)
    if (!deployment || deployment.status !== 'DEPLOYED') {
      throw new NoPreviousVersionError(this.id.toString(), environment)
    }

    // Simulate rollback (in real implementation, this would call rollback service)
    try {
      deployment.status = 'ROLLED_BACK'
      deployment.rollbackInfo = {
        previousVersion: this.data.version.toString(),
        rolledBackAt: new Date(),
        rolledBackBy: this.data.createdBy,
      }

      this.data.updatedAt = new Date()

      // Emit domain event
      this.addDomainEvent(
        new ReleaseRolledBackEvent(
          this.id,
          this.data.version.toString(),
          environment,
          new Date(),
          this.data.createdBy,
          this.data.version.toString(),
        ),
      )
    } catch (error) {
      throw new RollbackFailedError(
        this.id.toString(),
        environment,
        error instanceof Error ? error.message : 'Unknown error',
      )
    }
  }

  /**
   * Adds a schema to the release
   */
  addSchema(schema: SchemaRelease): void {
    // Business Rule: Cannot modify approved release
    if (this.data.status === 'APPROVED') {
      throw new CannotModifyApprovedReleaseError(this.id.toString())
    }

    // Business Rule: Check if schema already exists
    const existingSchema = this.data.schemas.find((s: SchemaRelease) => s.schemaId.equals(schema.schemaId))
    if (existingSchema) {
      throw new SchemaAlreadyExistsError(schema.schemaId.toString(), this.id.toString())
    }

    // Business Rule: Validate schema
    if (!schema.schemaId || !schema.version || !schema.checksum) {
      throw new InvalidSchemaError('Schema must have ID, version, and checksum')
    }

    this.data.schemas.push(schema)
    this.data.updatedAt = new Date()
  }

  /**
   * Removes a schema from the release
   */
  removeSchema(schemaId: ID): void {
    // Business Rule: Cannot modify approved release
    if (this.data.status === 'APPROVED') {
      throw new CannotModifyApprovedReleaseError(this.id.toString())
    }

    const schemaIndex = this.data.schemas.findIndex((s: SchemaRelease) => s.schemaId.equals(schemaId))
    if (schemaIndex === -1) {
      throw new SchemaNotFoundError(schemaId.toString(), this.id.toString())
    }

    this.data.schemas.splice(schemaIndex, 1)
    this.data.updatedAt = new Date()
  }

  /**
   * Schedules the release for deployment at a specific time
   */
  scheduleDeployment(environment: string, scheduledAt: Date): void {
    // Business Rule: Cannot schedule unapproved release
    if (this.data.status !== 'APPROVED') {
      throw new ReleaseNotApprovedError(this.id.toString())
    }

    // Business Rule: Scheduled time must be in the future
    if (scheduledAt <= new Date()) {
      throw new InvalidScheduleError('Scheduled deployment time must be in the future')
    }

    this.data.scheduledAt = scheduledAt
    this.data.updatedAt = new Date()
  }

  // Getters
  get version(): SemanticVersion {
    return this.data.version
  }

  get name(): string {
    return this.data.name.toPrimitive()
  }

  get description(): string {
    return this.data.description.toPrimitive()
  }

  get status(): ReleaseStatus {
    return this.data.status
  }

  get schemas(): readonly SchemaRelease[] {
    return [...this.data.schemas]
  }

  get environments(): readonly EnvironmentDeployment[] {
    return [...this.data.environments]
  }

  get approvals(): readonly Approval[] {
    return [...this.data.approvals]
  }

  get createdBy(): ID {
    return this.data.createdBy
  }

  get createdAt(): Date {
    return this.data.createdAt
  }

  get updatedAt(): Date {
    return this.data.updatedAt
  }

  get scheduledAt(): Date | undefined {
    return this.data.scheduledAt
  }

  get deployedAt(): Date | undefined {
    return this.data.deployedAt
  }
}
