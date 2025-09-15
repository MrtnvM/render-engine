# DeploymentStatus Value Object

## Overview

The DeploymentStatus value object represents the current state of a deployment operation. It provides type safety and validation for deployment status transitions throughout the deployment lifecycle. This value object ensures that status changes follow the proper workflow and business rules.

## Properties

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| status | DeploymentStatusEnum | Yes | - | Current deployment status |
| timestamp | Date | Yes | - | Timestamp when this status was set |
| message | string | No | "" | Optional message describing the status |
| details | Record<string, unknown> | No | {} | Additional status details |

## Methods

### create(status: DeploymentStatusEnum, message?: string, details?: Record<string, unknown>): DeploymentStatus

Creates a new DeploymentStatus instance.

**Parameters:**
- `status`: The deployment status enum value
- `message`: Optional status message
- `details`: Optional additional details

**Returns:** New DeploymentStatus instance

### canTransitionTo(newStatus: DeploymentStatusEnum): boolean

Checks if a transition to the new status is allowed.

**Parameters:**
- `newStatus`: The target status to transition to

**Returns:** True if transition is allowed, false otherwise

### transitionTo(newStatus: DeploymentStatusEnum, message?: string, details?: Record<string, unknown>): DeploymentStatus

Creates a new DeploymentStatus instance with the updated status.

**Parameters:**
- `newStatus`: The new status to transition to
- `message`: Optional status message
- `details`: Optional additional details

**Returns:** New DeploymentStatus instance

**Throws:**
- `InvalidStatusTransitionError` if transition is not allowed

### isTerminal(): boolean

Checks if the current status is a terminal state.

**Returns:** True if status is terminal, false otherwise

### isActive(): boolean

Checks if the current status indicates an active deployment.

**Returns:** True if deployment is active, false otherwise

### isFailed(): boolean

Checks if the current status indicates a failed deployment.

**Returns:** True if deployment failed, false otherwise

### isSuccess(): boolean

Checks if the current status indicates a successful deployment.

**Returns:** True if deployment succeeded, false otherwise

### equals(other: DeploymentStatus): boolean

Compares this status with another status for equality.

**Parameters:**
- `other`: Status to compare with

**Returns:** True if statuses are equal, false otherwise

## Business Rules & Invariants

1. **Status Transitions**: Status changes must follow the defined workflow
2. **Terminal States**: Terminal states cannot be changed once reached
3. **Active States**: Only active states can transition to other states
4. **Failed States**: Failed states can only transition to retry states
5. **Success States**: Success states can only transition to rollback states
6. **Timestamp Validation**: Each status change must have a valid timestamp
7. **Message Validation**: Status messages must be non-empty when provided
8. **Details Validation**: Additional details must be serializable

## Dependencies

- None - This is a primitive value object

## Factory Methods

### draft(): DeploymentStatus

Returns a draft status for new deployments.

**Returns:** DeploymentStatus instance with DRAFT status

### pending(): DeploymentStatus

Returns a pending status for deployments waiting to start.

**Returns:** DeploymentStatus instance with PENDING status

### inProgress(): DeploymentStatus

Returns an in-progress status for active deployments.

**Returns:** DeploymentStatus instance with IN_PROGRESS status

### success(message?: string): DeploymentStatus

Returns a success status for completed deployments.

**Parameters:**
- `message`: Optional success message

**Returns:** DeploymentStatus instance with SUCCESS status

### failed(message: string, details?: Record<string, unknown>): DeploymentStatus

Returns a failed status for failed deployments.

**Parameters:**
- `message`: Error message
- `details`: Optional error details

**Returns:** DeploymentStatus instance with FAILED status

### cancelled(message?: string): DeploymentStatus

Returns a cancelled status for cancelled deployments.

**Parameters:**
- `message`: Optional cancellation message

**Returns:** DeploymentStatus instance with CANCELLED status

### rollingBack(message?: string): DeploymentStatus

Returns a rolling-back status for deployments being rolled back.

**Parameters:**
- `message`: Optional rollback message

**Returns:** DeploymentStatus instance with ROLLING_BACK status

### rolledBack(message?: string): DeploymentStatus

Returns a rolled-back status for completed rollbacks.

**Parameters:**
- `message`: Optional rollback completion message

**Returns:** DeploymentStatus instance with ROLLED_BACK status

## Tests

### Unit Tests

1. **Status Creation**
   - Should create valid status from enum
   - Should handle optional message and details
   - Should set timestamp automatically
   - Should validate required parameters

2. **Status Transitions**
   - Should allow valid transitions
   - Should block invalid transitions
   - Should handle terminal states
   - Should maintain transition history

3. **Status Checks**
   - Should identify terminal states
   - Should identify active states
   - Should identify failed states
   - Should identify success states

4. **Factory Methods**
   - Should create draft status
   - Should create pending status
   - Should create in-progress status
   - Should create success status
   - Should create failed status
   - Should create cancelled status
   - Should create rolling-back status
   - Should create rolled-back status

5. **Equality**
   - Should compare equal statuses
   - Should compare different statuses
   - Should handle different timestamps
   - Should handle different messages

6. **Edge Cases**
   - Should handle empty messages
   - Should handle empty details
   - Should handle invalid transitions
   - Should handle null parameters

### Integration Tests

1. **Deployment Workflow**
   - Should handle complete deployment lifecycle
   - Should integrate with deployment service
   - Should handle status persistence
   - Should support status queries

2. **Error Handling**
   - Should handle invalid status transitions
   - Should provide meaningful error messages
   - Should handle concurrent status changes
   - Should support retry mechanisms

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
Last Updated: 2025-09-15
Status: Draft
Author: Deployment Domain Team
Bounded Context: Release Management