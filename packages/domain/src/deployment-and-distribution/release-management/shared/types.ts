import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { Name } from '../../../kernel/value-objects/name.value-object.js'
import { SemanticVersion } from '../../../kernel/value-objects/semantic-version.value-object.js'

export interface CreateReleaseParams {
  name: Name
  description?: string
  schemas: SchemaRelease[]
  createdBy: ID
}

export interface SchemaRelease {
  schemaId: ID
  version: SemanticVersion
  checksum: string
}

export interface EnvironmentDeployment {
  environment: string
  status: 'NOT_DEPLOYED' | 'DEPLOYING' | 'DEPLOYED' | 'FAILED' | 'ROLLED_BACK'
  deployedAt?: Date
  deployedBy?: ID
  rollbackInfo?: {
    previousVersion?: string
    rolledBackAt?: Date
    rolledBackBy?: ID
  }
}

export interface Approval {
  approverId: ID
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  comments?: string
  approvedAt?: Date
}

export interface EnvironmentConfig {
  environment: string
  deploymentStrategy: 'BLUE_GREEN' | 'CANARY' | 'ROLLING' | 'IMMEDIATE'
  autoRollback: boolean
  healthCheckEndpoints?: string[]
  customSettings?: Record<string, unknown>
}

export type ReleaseStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'DEPLOYING' | 'DEPLOYED' | 'FAILED' | 'ROLLED_BACK' | 'CANCELLED'