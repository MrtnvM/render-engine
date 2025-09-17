# Experiment Entity

## Overview

The Experiment entity manages A/B testing experiments for different schema versions. It handles experiment configuration, variant distribution, user segmentation, and result analysis to enable data-driven schema optimization.

## Data Structure

| Name            | Type             | Required | Default | Description                                        |
| --------------- | ---------------- | -------- | ------- | -------------------------------------------------- |
| id              | ID               | Yes      | -       | Unique identifier for the experiment               |
| name            | Name             | Yes      | -       | Human-readable name for the experiment             |
| description     | Description      | No       | -       | Detailed description of the experiment             |
| status          | ExperimentStatus | Yes      | -       | Current status of the experiment                   |
| variantIds      | ID[]             | Yes      | []      | IDs of variants being tested in the experiment     |
| testGroupIds    | ID[]             | Yes      | []      | IDs of user groups participating in the experiment |
| metrics         | TestMetrics      | Yes      | -       | Performance metrics for the experiment             |
| startDate       | Date             | No       | -       | Timestamp when the experiment starts               |
| endDate         | Date             | No       | -       | Timestamp when the experiment ends                 |
| targetAudience  | TargetAudience   | Yes      | -       | Target audience for the experiment                 |
| successCriteria | SuccessCriteria  | Yes      | -       | Criteria for determining experiment success        |
| createdBy       | ID               | Yes      | -       | User who created the experiment                    |
| createdAt       | Date             | Yes      | -       | Timestamp when the experiment was created          |
| updatedAt       | Date             | Yes      | -       | Timestamp when the experiment was last updated     |

## Methods

### Factory Methods

#### create(params: CreateExperimentParams): Experiment

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

**Emits:** ExperimentCreatedEvent

### Business Methods

#### start(): void

Starts the experiment.

**Returns:** void

**Throws:**

- `ExperimentAlreadyStartedError` if experiment is already started
- `ExperimentConfigurationError` if experiment is not properly configured

**Emits:** ExperimentStartedEvent

#### stop(): void

Stops the experiment and finalizes results.

**Returns:** void

**Throws:**

- `ExperimentNotStartedError` if experiment is not started
- `ExperimentAlreadyStoppedError` if experiment is already stopped

**Emits:** ExperimentStoppedEvent

#### addVariant(variantId: ID): void

Adds a new variant to the experiment by ID.

**Parameters:**

- `variantId`: ID of the variant to add to the experiment

**Returns:** void

**Throws:**

- `InvalidVariantError` if variant is invalid
- `ExperimentAlreadyStartedError` if experiment is already started
- `DuplicateVariantError` if variant already exists

#### removeVariant(variantId: ID): void

Removes a variant from the experiment.

**Parameters:**

- `variantId`: ID of the variant to remove

**Returns:** void

**Throws:**

- `VariantNotFoundError` if variant not found
- `ExperimentAlreadyStartedError` if experiment is already started
- `CannotRemoveLastVariantError` if removing the last variant

#### updateVariant(variantId: ID, updates: Partial<Variant>): void

Updates a variant in the experiment.

**Parameters:**

- `variantId`: ID of the variant to update
- `updates`: Partial variant object with updates

**Returns:** void

**Throws:**

- `VariantNotFoundError` if variant not found
- `ExperimentAlreadyStartedError` if experiment is already started

#### assignUserToVariant(userId: ID): ID | null

Assigns a user to a variant based on distribution rules using consistent hashing.

**Parameters:**

- `userId`: User ID to assign

**Returns:** ID of the assigned variant or null if user not in target audience

**Throws:**

- `ExperimentNotStartedError` if experiment is not started

**Emits:** UserAssignedEvent

#### recordMetric(userId: ID, metricName: string, value: number): void

Records a performance metric for a user.

**Parameters:**

- `userId`: User ID
- `metricName`: Name of the metric
- `value`: Metric value

**Returns:** void

**Throws:**

- `InvalidMetricError` if metric is invalid
- `UserNotInExperimentError` if user is not in the experiment

**Emits:** MetricRecordedEvent

#### validateStatisticalSignificance(): StatisticalSignificance

Validates whether the experiment results meet statistical significance requirements.

**Returns:** StatisticalSignificance object containing validation results

**Throws:**

- `InsufficientDataError` if not enough data is available
- `ExperimentNotStoppedError` if experiment is still running

**Business Rules:**

- Uses chi-square test for categorical data
- Uses t-test for continuous data
- Requires minimum sample size of 1000 users per variant
- Requires 95% confidence interval (p-value < 0.05)

#### calculateResults(): ExperimentResults

Calculates and returns the experiment results with statistical analysis.

**Returns:** Experiment results with statistical analysis

**Throws:**

- `InsufficientDataError` if not enough data is available
- `ExperimentNotStoppedError` if experiment is still running

#### getUserVariant(userId: ID): ID | null

Gets the variant ID assigned to a user.

**Parameters:**

- `userId`: User ID

**Returns:** User's variant ID or null if not assigned

## Business Rules

1. **Random Distribution**: Test variants must be randomly distributed among users
2. **Success Criteria**: Experiments must have clear, measurable success criteria
3. **Statistical Significance**: Results must meet statistical significance requirements
4. **Experiment Isolation**: Experiments must be isolated to prevent contamination
5. **Minimum Variants**: Experiments must have at least 2 variants to be valid
6. **User Consistency**: Users must be consistently assigned to the same variant
7. **Data Integrity**: All metrics and assignments must be accurately recorded
8. **Ethical Considerations**: Experiments must follow ethical guidelines for user testing

## Dependencies

### Base Classes

- `Entity`

### Value Objects

- `ID` - Unique identifier
- `Name` - Human-readable name from kernel
- `Description` - Human-readable description from kernel
- `SemanticVersion` - Semantic versioning from kernel
- `ExperimentStatus`, `TestMetrics`, `TargetAudience`, `SuccessCriteria`
- `DistributionPercentage`, `ConversionRate`, `StatisticalSignificance`

### Domain Events

- `ExperimentCreatedEvent`, `ExperimentStartedEvent`, `ExperimentStoppedEvent`, `UserAssignedEvent`, `MetricRecordedEvent`

### Domain Errors

- `InvalidExperimentError`, `InsufficientVariantsError`, `ExperimentAlreadyStartedError`, `ExperimentConfigurationError`, `ExperimentNotStartedError`, `ExperimentAlreadyStoppedError`, `InvalidVariantError`, `DuplicateVariantError`, `VariantNotFoundError`, `CannotRemoveLastVariantError`, `InvalidMetricError`, `UserNotInExperimentError`, `InsufficientDataError`, `ExperimentNotStoppedError`

### Repository Interface

```typescript
interface IExperimentRepository {
  // CRUD operations
  findById(id: ID): Promise<Experiment | null>
  save(experiment: Experiment): Promise<void>
  delete(id: ID): Promise<void>

  // Query operations
  findByStatus(status: ExperimentStatus): Promise<Experiment[]>
  findByVariant(variantId: ID): Promise<Experiment[]>
  findActiveExperiments(): Promise<Experiment[]>
  findExperimentsByUser(userId: ID): Promise<Experiment[]>

  // Statistics operations
  getExperimentStatistics(experimentId: ID): Promise<ExperimentResults>
  getUserAssignmentHistory(userId: ID, experimentId: ID): Promise<UserAssignment[]>
}
```

## Events

### ExperimentCreatedEvent

Emitted when a new experiment is created.

**Payload:**

```typescript
{
  experimentId: ID;
  name: string;
  variantIds: ID[];
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
  experimentId: ID
  stoppedAt: Date
  finalResults: ExperimentResults
}
```

### UserAssignedEvent

Emitted when a user is assigned to a variant.

**Payload:**

```typescript
{
  experimentId: ID
  userId: ID
  variantId: ID
  assignedAt: Date
}
```

### MetricRecordedEvent

Emitted when a metric is recorded.

**Payload:**

```typescript
{
  experimentId: ID
  userId: ID
  metricName: string
  value: number
  recordedAt: Date
}
```

## Tests

### Essential Tests

- Factory method with valid/invalid parameters
- Business method behavior and events
- Serialization and equality
- Variant management operations
- User assignment and consistency
- Metrics collection and validation
- Results calculation and analysis
- Statistical significance validation
- User assignment consistency across multiple requests
- Experiment isolation and contamination prevention

## Serialization

### JSON Format

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Button Color A/B Test",
  "description": "Testing different button colors for conversion optimization",
  "status": "RUNNING",
  "variantIds": ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"],
  "testGroupIds": [],
  "metrics": {
    "totalUsers": 1000,
    "conversions": {
      "550e8400-e29b-41d4-a716-446655440001": 150,
      "550e8400-e29b-41d4-a716-446655440002": 175
    },
    "conversionRates": {
      "550e8400-e29b-41d4-a716-446655440001": 0.15,
      "550e8400-e29b-41d4-a716-446655440002": 0.175
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
Last Updated: 2025-09-16
Location: `packages/domain/src/deployment-and-distribution/ab-testing/entities/experiment.entity.ts`
Status: Draft
Author: Deployment Domain Team
Bounded Context: A/B Testing
