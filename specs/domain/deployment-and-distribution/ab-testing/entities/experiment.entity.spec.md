# Experiment Entity

## Overview

The Experiment entity manages A/B testing experiments for different schema versions. It handles experiment configuration, variant distribution, user segmentation, and result analysis to enable data-driven schema optimization.

## Fields

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| id | ID | Yes | - | Unique identifier for the experiment |
| name | string | Yes | - | Human-readable name for the experiment |
| description | string | No | "" | Detailed description of the experiment |
| status | ExperimentStatus | Yes | - | Current status of the experiment |
| variants | Variant[] | Yes | [] | Variants being tested in the experiment |
| testGroups | TestGroup[] | Yes | [] | User groups participating in the experiment |
| metrics | TestMetrics | Yes | - | Performance metrics for the experiment |
| startDate | Date | No | - | Timestamp when the experiment starts |
| endDate | Date | No | - | Timestamp when the experiment ends |
| targetAudience | TargetAudience | Yes | - | Target audience for the experiment |
| successCriteria | SuccessCriteria | Yes | - | Criteria for determining experiment success |
| createdBy | ID | Yes | - | User who created the experiment |
| createdAt | Date | Yes | - | Timestamp when the experiment was created |
| updatedAt | Date | Yes | - | Timestamp when the experiment was last updated |

## Methods

### create(params: CreateExperimentParams): Experiment

Creates a new experiment with the specified parameters.

**Parameters:**
- `params`: Object containing:
  - `name`: Human-readable name for the experiment
  - `description`: Optional detailed description
  - `variants`: Array of variants to test
  - `targetAudience`: Target audience configuration
  - `successCriteria`: Success criteria definition
  - `createdBy`: User ID of the creator

**Returns:** New Experiment instance

**Throws:**
- `InvalidExperimentError` if required parameters are missing or invalid
- `InsufficientVariantsError` if fewer than 2 variants are provided

### start(): void

Starts the experiment.

**Returns:** void

**Throws:**
- `ExperimentAlreadyStartedError` if experiment is already started
- `ExperimentConfigurationError` if experiment is not properly configured

### stop(): void

Stops the experiment and finalizes results.

**Returns:** void

**Throws:**
- `ExperimentNotStartedError` if experiment is not started
- `ExperimentAlreadyStoppedError` if experiment is already stopped

### addVariant(variant: Variant): void

Adds a new variant to the experiment.

**Parameters:**
- `variant`: Variant to add to the experiment

**Returns:** void

**Throws:**
- `InvalidVariantError` if variant is invalid
- `ExperimentAlreadyStartedError` if experiment is already started
- `DuplicateVariantError` if variant already exists

### removeVariant(variantId: ID): void

Removes a variant from the experiment.

**Parameters:**
- `variantId`: ID of the variant to remove

**Returns:** void

**Throws:**
- `VariantNotFoundError` if variant not found
- `ExperimentAlreadyStartedError` if experiment is already started
- `CannotRemoveLastVariantError` if removing the last variant

### updateVariant(variantId: ID, updates: Partial<Variant>): void

Updates a variant in the experiment.

**Parameters:**
- `variantId`: ID of the variant to update
- `updates`: Partial variant object with updates

**Returns:** void

**Throws:**
- `VariantNotFoundError` if variant not found
- `ExperimentAlreadyStartedError` if experiment is already started

### assignUserToVariant(userId: ID): Variant | null

Assigns a user to a variant based on distribution rules.

**Parameters:**
- `userId`: User ID to assign

**Returns:** Assigned variant or null if user not in target audience

**Throws:**
- `ExperimentNotStartedError` if experiment is not started

### recordMetric(userId: ID, metricName: string, value: number): void

Records a performance metric for a user.

**Parameters:**
- `userId`: User ID
- `metricName`: Name of the metric
- `value`: Metric value

**Returns:** void

**Throws:**
- `InvalidMetricError` if metric is invalid
- `UserNotInExperimentError` if user is not in the experiment

### calculateResults(): ExperimentResults

Calculates and returns the experiment results.

**Returns:** Experiment results with statistical analysis

**Throws:**
- `InsufficientDataError` if not enough data is available
- `ExperimentNotStoppedError` if experiment is still running

### isUserInExperiment(userId: ID): boolean

Checks if a user is participating in the experiment.

**Parameters:**
- `userId`: User ID to check

**Returns:** True if user is in the experiment, false otherwise

### getUserVariant(userId: ID): Variant | null

Gets the variant assigned to a user.

**Parameters:**
- `userId`: User ID

**Returns:** User's variant or null if not assigned

## Business Rules & Invariants

1. **Random Distribution**: Test variants must be randomly distributed among users
2. **Success Criteria**: Experiments must have clear, measurable success criteria
3. **Statistical Significance**: Results must meet statistical significance requirements
4. **Experiment Isolation**: Experiments must be isolated to prevent contamination
5. **Minimum Variants**: Experiments must have at least 2 variants to be valid
6. **User Consistency**: Users must be consistently assigned to the same variant
7. **Data Integrity**: All metrics and assignments must be accurately recorded
8. **Ethical Considerations**: Experiments must follow ethical guidelines for user testing

## Dependencies

- **ID**: From `@render-engine/domain` - Unique identifier
- **ExperimentStatus**: Value object for experiment status
- **Variant**: Entity for experiment variants
- **TestGroup**: Entity for user test groups
- **TestMetrics**: Value object for test metrics
- **TargetAudience**: Value object for target audience
- **SuccessCriteria**: Value object for success criteria

## Events

### ExperimentCreatedEvent

Emitted when a new experiment is created.

**Payload:**
```typescript
{
  experimentId: ID;
  name: string;
  variants: string[];
  targetAudience: string;
  createdBy: ID;
  createdAt: Date;
}
```

### ExperimentStartedEvent

Emitted when an experiment is started.

**Payload:**
```typescript
{
  experimentId: ID;
  startedAt: Date;
  variantDistribution: VariantDistribution[];
}
```

### ExperimentStoppedEvent

Emitted when an experiment is stopped.

**Payload:**
```typescript
{
  experimentId: ID;
  stoppedAt: Date;
  finalResults: ExperimentResults;
}
```

### UserAssignedEvent

Emitted when a user is assigned to a variant.

**Payload:**
```typescript
{
  experimentId: ID;
  userId: ID;
  variantId: ID;
  assignedAt: Date;
}
```

### MetricRecordedEvent

Emitted when a metric is recorded.

**Payload:**
```typescript
{
  experimentId: ID;
  userId: ID;
  metricName: string;
  value: number;
  recordedAt: Date;
}
```

## Tests

### Unit Tests

1. **Experiment Creation**
   - Should create experiment with valid parameters
   - Should throw error with missing required parameters
   - Should validate minimum variants
   - Should set initial status to DRAFT

2. **Experiment Lifecycle**
   - Should start experiment when configured
   - Should stop experiment and finalize results
   - Should handle lifecycle state transitions
   - Should validate configuration before starting

3. **Variant Management**
   - Should add variant to experiment
   - Should remove variant from experiment
   - Should update variant configuration
   - Should handle variant validation

4. **User Assignment**
   - Should assign users to variants randomly
   - Should maintain user consistency
   - Should handle target audience filtering
   - Should track user assignments

5. **Metrics Collection**
   - Should record user metrics
   - Should validate metric format
   - Should aggregate metrics by variant
   - Should handle metric persistence

6. **Results Calculation**
   - Should calculate experiment results
   - Should perform statistical analysis
   - Should determine statistical significance
   - Should handle insufficient data

### Integration Tests

1. **End-to-End Experiment**
   - Should handle complete experiment lifecycle
   - Should integrate with user management
   - Should handle real-time data collection
   - Should support result analysis

2. **Multi-Variant Testing**
   - Should handle multiple variants
   - Should maintain distribution balance
   - Should handle variant performance tracking
   - Should support dynamic variant allocation

## Serialization

### JSON Format

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Button Color A/B Test",
  "description": "Testing different button colors for conversion optimization",
  "status": "RUNNING",
  "variants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Control",
      "schemaVersion": "1.0.0",
      "distribution": 0.5
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Variant A",
      "schemaVersion": "1.1.0",
      "distribution": 0.5
    }
  ],
  "testGroups": [],
  "metrics": {
    "totalUsers": 1000,
    "conversions": {
      "Control": 150,
      "Variant A": 175
    },
    "conversionRates": {
      "Control": 0.15,
      "Variant A": 0.175
    }
  },
  "startDate": "2025-01-15T08:00:00Z",
  "endDate": null,
  "targetAudience": {
    "criteria": "users_in_us",
    "size": 10000
  },
  "successCriteria": {
    "metric": "conversion_rate",
    "improvement": 0.1,
    "significance": 0.95
  },
  "createdBy": "550e8400-e29b-41d4-a716-446655440003",
  "createdAt": "2025-01-15T08:00:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### Serialization Rules

1. **ID Serialization**: IDs are serialized as UUID strings
2. **Date Serialization**: Dates are serialized as ISO 8601 strings
3. **Enum Serialization**: Status enums are serialized as strings
4. **Nested Objects**: Complex objects are serialized as nested objects
5. **Array Handling**: Empty arrays are included as empty arrays
6. **Null Handling**: Optional null fields are included as null

## Metadata

Version: 1.0.0
Last Updated: 2025-09-15
Status: Draft
Author: Deployment Domain Team
Bounded Context: A/B Testing