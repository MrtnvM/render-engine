# Release Entity

## Overview

The Release entity represents a deployment release containing schema versions, approval status, and deployment state. It manages the lifecycle of schema deployments from creation through approval to deployment across environments. Each release contains a collection of schemas with specific versions that are deployed together as a unit.

## Fields

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| id | ID | Yes | - | Unique identifier for the release |
| version | Version | Yes | - | Semantic version of the release |
| name | string | Yes | - | Human-readable name for the release |
| description | string | No | "" | Detailed description of the release |
| status | ReleaseStatus | Yes | - | Current status of the release |
| schemas | SchemaRelease[] | Yes | [] | Collection of schemas included in this release |
| environments | EnvironmentDeployment[] | Yes | [] | Deployment status across environments |
| approvals | Approval[] | Yes | [] | Approval workflow status |
| createdBy | ID | Yes | - | User who created the release |
| createdAt | Date | Yes | - | Timestamp when the release was created |
| updatedAt | Date | Yes | - | Timestamp when the release was last updated |
| scheduledAt | Date | No | - | Timestamp for scheduled deployment |
| deployedAt | Date | No | - | Timestamp when the release was deployed |

## Methods

### create(params: CreateReleaseParams): Release

Creates a new release with the specified parameters.

**Parameters:**
- `params`: Object containing:
  - `name`: Human-readable name for the release
  - `description`: Optional detailed description
  - `schemas`: Array of schemas to include in the release
  - `createdBy`: User ID of the creator

**Returns:** New Release instance

**Throws:**
- `InvalidReleaseError` if required parameters are missing or invalid

### approve(approval: Approval): void

Adds an approval to the release and updates status if all required approvals are received.

**Parameters:**
- `approval`: Approval object containing approver, status, and comments

**Returns:** void

**Throws:**
- `InvalidApprovalError` if approval is invalid
- `ReleaseAlreadyApprovedError` if release is already approved

### deployToEnvironment(environment: Environment, config: EnvironmentConfig): void

Deploys the release to a specific environment with the given configuration.

**Parameters:**
- `environment`: Target environment for deployment
- `config`: Environment-specific deployment configuration

**Returns:** void

**Throws:**
- `ReleaseNotApprovedError` if release is not approved
- `EnvironmentAlreadyDeployedError` if already deployed to environment
- `DeploymentFailedError` if deployment fails

### rollback(environment: Environment): void

Rolls back the release in the specified environment to the previous version.

**Parameters:**
- `environment`: Environment to rollback

**Returns:** void

**Throws:**
- `NoPreviousVersionError` if no previous version exists
- `RollbackFailedError` if rollback fails

### addSchema(schema: SchemaRelease): void

Adds a schema to the release.

**Parameters:**
- `schema`: Schema to add to the release

**Returns:** void

**Throws:**
- `SchemaAlreadyExistsError` if schema already exists in release
- `InvalidSchemaError` if schema is invalid

### removeSchema(schemaId: ID): void

Removes a schema from the release.

**Parameters:**
- `schemaId`: ID of the schema to remove

**Returns:** void

**Throws:**
- `SchemaNotFoundError` if schema not found in release
- `CannotModifyApprovedReleaseError` if release is already approved

### scheduleDeployment(environment: Environment, scheduledAt: Date): void

Schedules the release for deployment at a specific time.

**Parameters:**
- `environment`: Environment to schedule deployment for
- `scheduledAt`: Timestamp for scheduled deployment

**Returns:** void

**Throws:**
- `InvalidScheduleError` if scheduled time is in the past
- `ReleaseNotApprovedError` if release is not approved

## Business Rules & Invariants

1. **Version Uniqueness**: Each release must have a unique version number
2. **Approval Workflow**: Releases must follow the defined approval workflow before deployment
3. **Environment Isolation**: Each environment deployment is independent and isolated
4. **Rollback Capability**: Every deployment must have a rollback capability to the previous version
5. **Schema Consistency**: All schemas in a release must be compatible with each other
6. **Deployment Order**: Environments must be deployed in the correct order (e.g., staging before production)
7. **Schedule Validation**: Scheduled deployments must be in the future and respect deployment windows
8. **Approval Expiration**: Approvals expire after a defined period if not deployed

## Dependencies

- **ID**: From `@render-engine/domain` - Unique identifier
- **Version**: Value object for semantic versioning
- **ReleaseStatus**: Value object for release status
- **SchemaRelease**: Entity representing a schema in a release
- **Environment**: Entity representing deployment environments
- **EnvironmentConfig**: Value object for environment configuration
- **Approval**: Entity for approval workflow

## Events

### ReleaseCreatedEvent

Emitted when a new release is created.

**Payload:**
```typescript
{
  releaseId: ID;
  version: string;
  name: string;
  createdBy: ID;
  createdAt: Date;
}
```

### ReleaseApprovedEvent

Emitted when a release receives all required approvals.

**Payload:**
```typescript
{
  releaseId: ID;
  version: string;
  approvedBy: ID[];
  approvedAt: Date;
}
```

### ReleaseDeployedEvent

Emitted when a release is successfully deployed to an environment.

**Payload:**
```typescript
{
  releaseId: ID;
  version: string;
  environment: string;
  deployedAt: Date;
  deployedBy: ID;
}
```

### ReleaseRolledBackEvent

Emitted when a release is rolled back in an environment.

**Payload:**
```typescript
{
  releaseId: ID;
  version: string;
  environment: string;
  rolledBackAt: Date;
  rolledBackBy: ID;
  previousVersion: string;
}
```

## Tests

### Unit Tests

1. **Release Creation**
   - Should create release with valid parameters
   - Should throw error with missing required parameters
   - Should set initial status to DRAFT
   - Should generate unique ID

2. **Approval Workflow**
   - Should add approval to release
   - Should update status when all approvals received
   - Should throw error for duplicate approvals
   - Should throw error for release already approved

3. **Environment Deployment**
   - Should deploy to environment when approved
   - Should throw error when not approved
   - Should throw error for duplicate deployment
   - Should update deployment status

4. **Rollback Functionality**
   - Should rollback to previous version
   - Should throw error when no previous version
   - Should update environment status
   - Should emit rollback event

5. **Schema Management**
   - Should add schema to release
   - Should remove schema from release
   - Should throw error for duplicate schema
   - Should throw error for modifying approved release

6. **Scheduling**
   - Should schedule deployment for future date
   - Should throw error for past date
   - Should throw error for unapproved release
   - Should update scheduled timestamp

### Integration Tests

1. **End-to-End Release Workflow**
   - Should handle complete release lifecycle
   - Should integrate with approval system
   - Should handle environment deployments
   - Should support rollback scenarios

2. **Multi-Environment Deployment**
   - Should deploy to multiple environments
   - Should maintain environment isolation
   - Should handle environment-specific configurations
   - Should support environment-specific rollbacks

## Serialization

### JSON Format

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "version": "1.0.0",
  "name": "Feature Release v1.0",
  "description": "First feature release with new components",
  "status": "APPROVED",
  "schemas": [
    {
      "schemaId": "550e8400-e29b-41d4-a716-446655440001",
      "version": "1.0.0",
      "checksum": "abc123..."
    }
  ],
  "environments": [
    {
      "name": "production",
      "status": "DEPLOYED",
      "deployedAt": "2025-01-15T10:30:00Z",
      "deployedBy": "550e8400-e29b-41d4-a716-446655440002"
    }
  ],
  "approvals": [
    {
      "approverId": "550e8400-e29b-41d4-a716-446655440003",
      "status": "APPROVED",
      "comments": "Looks good for deployment",
      "approvedAt": "2025-01-15T09:00:00Z"
    }
  ],
  "createdBy": "550e8400-e29b-41d4-a716-446655440004",
  "createdAt": "2025-01-15T08:00:00Z",
  "updatedAt": "2025-01-15T10:30:00Z",
  "scheduledAt": null,
  "deployedAt": "2025-01-15T10:30:00Z"
}
```

### Serialization Rules

1. **ID Serialization**: IDs are serialized as UUID strings
2. **Date Serialization**: Dates are serialized as ISO 8601 strings
3. **Enum Serialization**: Status enums are serialized as strings
4. **Nested Objects**: Complex objects are serialized as nested objects
5. **Null Handling**: Optional null fields are included as null
6. **Array Handling**: Empty arrays are included as empty arrays

## Metadata

Version: 1.0.0
Last Updated: 2025-09-15
Status: Draft
Author: Deployment Domain Team
Bounded Context: Release Management