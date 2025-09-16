# DeploymentStatus Value Object

## Overview

The DeploymentStatus value object represents the current state of a deployment operation. It provides type safety and validation for deployment status transitions throughout the deployment lifecycle. This value object ensures that status changes follow the proper workflow and business rules.

## Properties

- `status`: DeploymentStatusEnum - Current deployment status
- `timestamp`: Date - Timestamp when this status was set
- `message`: string - Optional message describing the status
- `details`: Record<string, unknown> - Additional status details

## Methods

### Factory Methods

- `static create(status: DeploymentStatusEnum, message?: string, details?: Record<string, unknown>): DeploymentStatus`

  - **Parameters:**
    - `status`: The deployment status enum value
    - `message`: Optional status message
    - `details`: Optional additional details
  - **Throws:** ValidationError
  - **Business rules:** Validates status enum and optional fields
  - **Returns:** New DeploymentStatus instance

- `static draft(): DeploymentStatus`

  - **Returns:** DeploymentStatus instance with DRAFT status

- `static pending(): DeploymentStatus`

  - **Returns:** DeploymentStatus instance with PENDING status

- `static inProgress(): DeploymentStatus`

  - **Returns:** DeploymentStatus instance with IN_PROGRESS status

- `static success(message?: string): DeploymentStatus`

  - **Parameters:**
    - `message`: Optional success message
  - **Returns:** DeploymentStatus instance with SUCCESS status

- `static failed(message: string, details?: Record<string, unknown>): DeploymentStatus`

  - **Parameters:**
    - `message`: Error message
    - `details`: Optional error details
  - **Returns:** DeploymentStatus instance with FAILED status

- `static cancelled(message?: string): DeploymentStatus`

  - **Parameters:**
    - `message`: Optional cancellation message
  - **Returns:** DeploymentStatus instance with CANCELLED status

- `static rollingBack(message?: string): DeploymentStatus`

  - **Parameters:**
    - `message`: Optional rollback message
  - **Returns:** DeploymentStatus instance with ROLLING_BACK status

- `static rolledBack(message?: string): DeploymentStatus`
  - **Parameters:**
    - `message`: Optional rollback completion message
  - **Returns:** DeploymentStatus instance with ROLLED_BACK status

### Business Methods

#### canTransitionTo(newStatus: DeploymentStatusEnum): boolean

Checks if a transition to the new status is allowed.

**Parameters:**

- `newStatus`: The target status to transition to

**Returns:** True if transition is allowed, false otherwise

#### transitionTo(newStatus: DeploymentStatusEnum, message?: string, details?: Record<string, unknown>): DeploymentStatus

Creates a new DeploymentStatus instance with the updated status.

**Parameters:**

- `newStatus`: The new status to transition to
- `message`: Optional status message
- `details`: Optional additional details

**Returns:** New DeploymentStatus instance

**Throws:**

- `InvalidStatusTransitionError` if transition is not allowed

#### isTerminal(): boolean

Checks if the current status is a terminal state.

**Returns:** True if status is terminal, false otherwise

#### isActive(): boolean

Checks if the current status indicates an active deployment.

**Returns:** True if deployment is active, false otherwise

#### isFailed(): boolean

Checks if the current status indicates a failed deployment.

**Returns:** True if deployment failed, false otherwise

#### isSuccess(): boolean

Checks if the current status indicates a successful deployment.

**Returns:** True if deployment succeeded, false otherwise

#### equals(other: DeploymentStatus): boolean

Compares this status with another status for equality.

**Parameters:**

- `other`: Status to compare with

**Returns:** True if statuses are equal, false otherwise

## Business Rules

1. **Status Transitions**: Status changes must follow the defined workflow
2. **Terminal States**: Terminal states cannot be changed once reached
3. **Active States**: Only active states can transition to other states
4. **Failed States**: Failed states can only transition to retry states
5. **Success States**: Success states can only transition to rollback states
6. **Timestamp Validation**: Each status change must have a valid timestamp
7. **Message Validation**: Status messages must be non-empty when provided
8. **Details Validation**: Additional details must be serializable

## Dependencies

- **ValueObject<T>** - Base class (provides automatic toJSON serialization)
- **ValidationError** - Validation failures
- **InvalidStatusTransitionError** - Invalid status transition attempts

## Tests

### Essential Tests

- Create with valid/invalid status values
- Status transition validation
- Factory methods for each status type
- Equality comparison
- Terminal state detection
- Active state detection
- Failed state detection
- Success state detection
- Serialization with timestamp and details

## Serialization

### JSON Format

```json
{
  "status": "IN_PROGRESS",
  "timestamp": "2025-01-15T10:30:00Z",
  "message": "Deployment is currently in progress",
  "details": {
    "progress": 75,
    "currentStep": "Deploying schemas",
    "estimatedCompletion": "2025-01-15T11:00:00Z"
  }
}
```

### Serialization Rules

1. **Enum Serialization**: Status enum is serialized as string
2. **Date Serialization**: Timestamp is serialized as ISO 8601 string
3. **String Serialization**: Message is serialized as string
4. **Object Serialization**: Details are serialized as JSON object
5. **Null Handling**: Null values are serialized as null

## Metadata

Version: 1.0.0
Last Updated: 2025-09-16
Location: `packages/domain/src/deployment-and-distribution/release-management/value-objects/deployment-status.value-object.ts`
Status: Draft
Author: Deployment Domain Team
Bounded Context: Release Management
