# Release Entity

## Overview

The Release entity represents a deployment release containing schema versions, approval status, and deployment state. It manages the lifecycle of schema deployments from creation through approval to deployment across environments. Each release contains a collection of schemas with specific versions that are deployed together as a unit.

## Data Structure

| Name         | Type                    | Required | Default | Description                                    |
| ------------ | ----------------------- | -------- | ------- | ---------------------------------------------- |
| id           | ID                      | Yes      | -       | Unique identifier for the release              |
| version      | Version                 | Yes      | -       | Semantic version of the release                |
| name         | Name                    | Yes      | -       | Human-readable name for the release            |
| description  | Description             | No       | -       | Detailed description of the release            |
| status       | ReleaseStatus           | Yes      | -       | Current status of the release                  |
| schemas      | SchemaRelease[]         | Yes      | []      | Collection of schemas included in this release |
| environments | EnvironmentDeployment[] | Yes      | []      | Deployment status across environments          |
| approvals    | Approval[]              | Yes      | []      | Approval workflow status                       |
| createdBy    | ID                      | Yes      | -       | User who created the release                   |
| createdAt    | Date                    | Yes      | -       | Timestamp when the release was created         |
| updatedAt    | Date                    | Yes      | -       | Timestamp when the release was last updated    |
| scheduledAt  | Date                    | No       | -       | Timestamp for scheduled deployment             |
| deployedAt   | Date                    | No       | -       | Timestamp when the release was deployed        |

## Methods

### Factory Methods

#### create(params: CreateReleaseParams): Release

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

**Emits:** ReleaseCreatedEvent

### Business Methods

#### approve(approval: Approval): void

Adds an approval to the release and updates status if all required approvals are received.

**Parameters:**

- `approval`: Approval object containing approver, status, and comments

**Returns:** void

**Throws:**

- `InvalidApprovalError` if approval is invalid
- `ReleaseAlreadyApprovedError` if release is already approved

**Emits:** ReleaseApprovedEvent (when all approvals received)

#### deployToEnvironment(environment: Environment, config: EnvironmentConfig): void

Deploys the release to a specific environment with the given configuration.

**Parameters:**

- `environment`: Target environment for deployment
- `config`: Environment-specific deployment configuration

**Returns:** void

**Throws:**

- `ReleaseNotApprovedError` if release is not approved
- `EnvironmentAlreadyDeployedError` if already deployed to environment
- `DeploymentFailedError` if deployment fails

**Emits:** ReleaseDeployedEvent

#### rollback(environment: Environment): void

Rolls back the release in the specified environment to the previous version.

**Parameters:**

- `environment`: Environment to rollback

**Returns:** void

**Throws:**

- `NoPreviousVersionError` if no previous version exists
- `RollbackFailedError` if rollback fails

**Emits:** ReleaseRolledBackEvent

#### addSchema(schema: SchemaRelease): void

Adds a schema to the release.

**Parameters:**

- `schema`: Schema to add to the release

**Returns:** void

**Throws:**

- `SchemaAlreadyExistsError` if schema already exists in release
- `InvalidSchemaError` if schema is invalid

#### removeSchema(schemaId: ID): void

Removes a schema from the release.

**Parameters:**

- `schemaId`: ID of the schema to remove

**Returns:** void

**Throws:**

- `SchemaNotFoundError` if schema not found in release
- `CannotModifyApprovedReleaseError` if release is already approved

#### scheduleDeployment(environment: Environment, scheduledAt: Date): void

Schedules the release for deployment at a specific time.

**Parameters:**

- `environment`: Environment to schedule deployment for
- `scheduledAt`: Timestamp for scheduled deployment

**Returns:** void

**Throws:**

- `InvalidScheduleError` if scheduled time is in the past
- `ReleaseNotApprovedError` if release is not approved

## Business Rules

1. **Version Uniqueness**: Each release must have a unique version number
2. **Approval Workflow**: Releases must follow the defined approval workflow before deployment
3. **Environment Isolation**: Each environment deployment is independent and isolated
4. **Rollback Capability**: Every deployment must have a rollback capability to the previous version
5. **Schema Consistency**: All schemas in a release must be compatible with each other
6. **Deployment Order**: Environments must be deployed in the correct order (e.g., staging before production)
7. **Schedule Validation**: Scheduled deployments must be in the future and respect deployment windows
8. **Approval Expiration**: Approvals expire after a defined period if not deployed

## Dependencies

### Base Classes

- `Entity<ID>` - Base entity class

### Value Objects

- `ID` - Unique identifier
- `Name` - Human-readable name from kernel
- `Description` - Human-readable description from kernel
- `Version` - Semantic versioning
- `ReleaseStatus` - Release status enumeration
- `EnvironmentConfig` - Environment configuration

### Domain Events

- `ReleaseCreatedEvent` - Emitted when release is created
- `ReleaseApprovedEvent` - Emitted when release is approved
- `ReleaseDeployedEvent` - Emitted when release is deployed
- `ReleaseRolledBackEvent` - Emitted when release is rolled back

### Domain Errors

- `InvalidReleaseError` - Invalid release parameters
- `InvalidApprovalError` - Invalid approval
- `ReleaseAlreadyApprovedError` - Release already approved
- `ReleaseNotApprovedError` - Release not approved
- `EnvironmentAlreadyDeployedError` - Environment already deployed
- `DeploymentFailedError` - Deployment failed
- `NoPreviousVersionError` - No previous version for rollback
- `RollbackFailedError` - Rollback failed
- `SchemaAlreadyExistsError` - Schema already exists
- `InvalidSchemaError` - Invalid schema
- `SchemaNotFoundError` - Schema not found
- `CannotModifyApprovedReleaseError` - Cannot modify approved release
- `InvalidScheduleError` - Invalid schedule time

## Events

### ReleaseCreatedEvent

Emitted when a new release is created.

**Payload:**

```typescript
{
  releaseId: ID
  version: string
  name: string
  createdBy: ID
  createdAt: Date
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
  releaseId: ID
  version: string
  environment: string
  deployedAt: Date
  deployedBy: ID
}
```

### ReleaseRolledBackEvent

Emitted when a release is rolled back in an environment.

**Payload:**

```typescript
{
  releaseId: ID
  version: string
  environment: string
  rolledBackAt: Date
  rolledBackBy: ID
  previousVersion: string
}
```

## Tests

### Essential Tests

- **Factory Methods**

  - Create release with valid parameters
  - Create release with invalid parameters (should throw errors)
  - Create release with empty schemas array

- **Business Methods**

  - Add approval to release
  - Approve release with all required approvals
  - Deploy to environment when approved
  - Deploy to environment when not approved (should throw error)
  - Rollback release in environment
  - Rollback when no previous version exists (should throw error)
  - Add schema to release
  - Remove schema from release
  - Modify approved release (should throw error)
  - Schedule deployment for future date
  - Schedule deployment for past date (should throw error)

- **Domain Events**

  - ReleaseCreatedEvent emitted on creation
  - ReleaseApprovedEvent emitted when fully approved
  - ReleaseDeployedEvent emitted on successful deployment
  - ReleaseRolledBackEvent emitted on rollback

- **Business Rules**
  - Version uniqueness validation
  - Approval workflow enforcement
  - Environment deployment isolation
  - Schema compatibility validation
  - Deployment order enforcement
  - Schedule validation rules

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
Last Updated: 2025-09-16
Location: `packages/domain/src/deployment-and-distribution/release-management/entities/release.entity.ts`
Bounded Context: Release Management
