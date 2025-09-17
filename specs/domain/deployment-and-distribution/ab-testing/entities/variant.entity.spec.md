# Variant Entity

## Overview

The Variant entity manages individual test variants within A/B testing experiments. It represents a specific version of a schema with its distribution percentage, enabling controlled testing of different schema versions against user segments. As an aggregate root, the Variant manages its own lifecycle, validates business rules, and ensures data integrity across the experiment.

## Data Structure

| Name               | Type                   | Required | Default | Description                                           |
| ------------------ | ---------------------- | -------- | ------- | ----------------------------------------------------- |
| id                 | ID                     | Yes      | -       | Unique identifier for the variant                     |
| name               | Name                   | Yes      | -       | Human-readable name for the variant                   |
| schemaVersion      | SemanticVersion        | Yes      | -       | Schema version this variant is testing                |
| distribution       | DistributionPercentage | Yes      | -       | Percentage of traffic/users allocated to this variant |
| experimentId       | ID                     | Yes      | -       | ID of the experiment this variant belongs to          |
| isControl          | boolean                | Yes      | false   | Whether this is the control variant                   |
| performanceMetrics | VariantMetrics         | No       | -       | Performance metrics for this variant                  |
| isActive           | boolean                | Yes      | true    | Whether the variant is currently active               |
| createdAt          | Date                   | Yes      | -       | Timestamp when the variant was created                |
| updatedAt          | Date                   | Yes      | -       | Timestamp when the variant was last updated           |

## Methods

### Factory Methods

#### create(params: CreateVariantParams): Variant

Creates a new variant with the specified parameters.

**Parameters:**

- `params`: Object containing:
  - `name`: Human-readable name for the variant
  - `schemaVersion`: Schema version this variant is testing
  - `distribution`: Traffic allocation percentage
  - `experimentId`: ID of the experiment this variant belongs to
  - `isControl`: Whether this is the control variant (optional, defaults to false)

**Returns:** New Variant instance

**Throws:**

- `VariantError.invalidParameters()` if required parameters are missing or invalid
- `VariantError.schemaVersionNotFound()` if the specified schema version doesn't exist
- `VariantError.invalidDistribution()` if distribution percentage is invalid

#### fromPersistence(data: VariantPersistenceData): Variant

Reconstructs a variant from persistent storage data.

**Parameters:**

- `data`: Object containing:
  - `id`: Variant ID
  - `name`: Variant name as string
  - `schemaVersion`: Schema version as string
  - `distribution`: Distribution percentage as number
  - `experimentId`: Experiment ID
  - `isControl`: Whether this is the control variant
  - `performanceMetrics`: Optional performance metrics
  - `isActive`: Whether the variant is active
  - `createdAt`: Creation timestamp
  - `updatedAt`: Last update timestamp

**Returns:** Reconstructed Variant instance

**Throws:**

- `VariantError.invalidPersistenceData()` if persistent data is invalid
- `ValidationError` if any value object reconstruction fails

### Business Methods

#### updateDistribution(newDistribution: DistributionPercentage): void

Updates the distribution percentage for this variant.

**Parameters:**

- `newDistribution`: New distribution percentage to set

**Throws:**

- `VariantError.experimentRunning()` if the experiment is currently running
- `VariantError.invalidDistribution()` if the new distribution is invalid
- `VariantError.distributionConstraint()` if the new distribution would violate total percentage rules

**Emits:** `VariantEvent.distributionUpdated()`

#### isCompatibleWith(other: Variant): boolean

Checks if this variant is compatible with another variant for schema comparison.

**Parameters:**

- `other`: Other variant to check compatibility with

**Returns:** True if variants are compatible, false otherwise

**Business Rules:**

- Variants are compatible if they belong to the same experiment
- Schema versions should be compatible for meaningful comparison
- Control variant compatibility has special handling

#### activate(): void

Activates the variant for testing.

**Throws:**

- `VariantError.alreadyActive()` if the variant is already active
- `VariantError.experimentNotReady()` if the experiment is not in a suitable state

**Emits:** `VariantEvent.activated()`

#### deactivate(): void

Deactivates the variant, stopping further testing.

**Throws:**

- `VariantError.alreadyInactive()` if the variant is already inactive
- `VariantError.experimentRunning()` if the experiment is currently running

**Emits:** `VariantEvent.deactivated()`

#### updatePerformanceMetrics(metrics: VariantMetrics): void

Updates the performance metrics for this variant.

**Parameters:**

- `metrics`: New performance metrics to set

**Emits:** `VariantEvent.metricsUpdated()`

#### canModifyDistribution(): boolean

Checks if the variant's distribution can be modified.

**Returns:** True if distribution can be modified, false otherwise

**Business Rules:**

- Distribution can be modified only when experiment is not running
- Control variant distribution changes have additional constraints
- Minimum distribution percentage must be maintained

## Business Rules

1. **Schema Version Existence**: The specified schema version must exist in the schema management system
2. **Distribution Validity**: Distribution percentage must be between 1% and 99%
3. **Experiment Running Constraint**: Distribution cannot be changed when the experiment is running
4. **Minimum Variants**: An experiment must have at least 2 variants to be valid
5. **Control Variant Limit**: Only one control variant allowed per experiment
6. **Total Distribution**: All variants in an experiment must sum to exactly 100%
7. **Active State Management**: Only active variants participate in testing
8. **Compatibility Check**: Variants must be compatible for meaningful comparison
9. **Schema Version Compatibility**: Schema versions should be compatible for A/B testing
10. **Performance Metrics**: Metrics should be tracked and updated for analysis

## Events

- `VariantEvent.created()` - Emitted when a new variant is created
- `VariantEvent.distributionUpdated()` - Emitted when distribution percentage is changed
- `VariantEvent.activated()` - Emitted when variant is activated
- `VariantEvent.deactivated()` - Emitted when variant is deactivated
- `VariantEvent.metricsUpdated()` - Emitted when performance metrics are updated

## Dependencies

### Base Classes

- `Entity<VariantData>` - Base entity class with ID management and domain events

### Value Objects

- `ID` - Unique identifier
- `Name` - Human-readable name
- `SemanticVersion` - Schema version management
- `DistributionPercentage` - Traffic allocation percentage
- `VariantMetrics` - Performance metrics tracking

### Domain Events

- `VariantEvent` - Single event object with factory methods:
  - `VariantEvent.created()`
  - `VariantEvent.distributionUpdated()`
  - `VariantEvent.activated()`
  - `VariantEvent.deactivated()`
  - `VariantEvent.metricsUpdated()`

### Domain Errors

- `VariantError` - Single error object with factory methods:
  - `VariantError.invalidParameters()`
  - `VariantError.schemaVersionNotFound()`
  - `VariantError.invalidDistribution()`
  - `VariantError.experimentRunning()`
  - `VariantError.distributionConstraint()`
  - `VariantError.alreadyActive()`
  - `VariantError.alreadyInactive()`
  - `VariantError.experimentNotReady()`

## Aggregate Root Responsibilities

As an aggregate root, the Variant entity:

1. **Manages Entity Lifecycle**: Controls creation, updates, and deletion of variants
2. **Enforces Business Rules**: Validates all operations against domain rules
3. **Coordinates Domain Events**: Emits events for significant state changes
4. **Ensures Data Consistency**: Maintains invariant integrity across the aggregate
5. **Provides Access Control**: Manages access to variant data and operations

## Implementation Details

### Type Definitions

```typescript
interface VariantData extends EntityData {
  name: Name
  schemaVersion: SemanticVersion
  distribution: DistributionPercentage
  experimentId: ID
  isControl: boolean
  performanceMetrics?: VariantMetrics
  isActive: boolean
}

interface CreateVariantParams {
  name: Name
  schemaVersion: SemanticVersion
  distribution: DistributionPercentage
  experimentId: ID
  isControl?: boolean
}

interface VariantPersistenceData {
  id: string
  name: string
  schemaVersion: string
  distribution: number
  experimentId: string
  isControl: boolean
  performanceMetrics?: VariantMetrics
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Factory Method Implementation

```typescript
static create(params: CreateVariantParams): Variant {
  // Validate required parameters
  if (!params.name || !params.schemaVersion || !params.distribution || !params.experimentId) {
    throw VariantError.invalidParameters('All required parameters must be provided')
  }

  // Create variant instance
  const variant = new Variant({
    name: params.name,
    schemaVersion: params.schemaVersion,
    distribution: params.distribution,
    experimentId: params.experimentId,
    isControl: params.isControl || false,
    isActive: true,
  })

  // Emit creation event
  variant.addDomainEvent(VariantEvent.created(
    variant.id,
    variant.experimentId,
    variant.name,
    variant.schemaVersion
  ))

  return variant
}
```

## Tests

### Essential Tests

#### Creation Tests

- Create variant with valid parameters
- Create variant with invalid parameters (missing fields)
- Create variant with invalid schema version
- Create variant with invalid distribution
- Create variant with duplicate name in same experiment

#### Business Method Tests

- Update distribution when experiment is not running
- Update distribution when experiment is running (should fail)
- Update distribution with invalid percentage (should fail)
- Check compatibility between variants
- Activate/deactivate variant
- Update performance metrics

#### Business Rule Tests

- Schema version validation
- Distribution percentage constraints
- Experiment running state constraints
- Total distribution validation
- Control variant limits
- Minimum variant requirements

#### Event Tests

- VariantCreatedEvent emission
- VariantDistributionUpdatedEvent emission
- VariantActivatedEvent emission
- VariantDeactivatedEvent emission
- VariantMetricsUpdatedEvent emission

#### Edge Case Tests

- Boundary values for distribution percentages
- Concurrent modification scenarios
- Large number of variants per experiment
- Schema version compatibility edge cases
- Performance metrics with extreme values

### Integration Tests

- Variant interactions with Experiment aggregate
- Schema version existence validation
- Distribution percentage coordination across variants
- Performance metrics tracking and analysis

## Serialization

### JSON Format

```json
{
  "id": "uuid-string",
  "name": "Control Variant",
  "schemaVersion": "1.2.3",
  "distribution": 0.5,
  "experimentId": "experiment-uuid",
  "isControl": true,
  "performanceMetrics": {
    "conversionRate": 0.15,
    "clickThroughRate": 0.25,
    "bounceRate": 0.3,
    "averageSessionDuration": 180,
    "sampleSize": 1000
  },
  "isActive": true,
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T10:00:00.000Z"
}
```

## Usage Examples

```typescript
// Create a new variant
const variant = Variant.create({
  name: Name.create('Control Variant'),
  schemaVersion: SemanticVersion.fromString('1.2.3'),
  distribution: DistributionPercentage.create(0.5),
  experimentId: experiment.id,
  isControl: true,
})

// Update distribution when experiment is not running
if (variant.canModifyDistribution()) {
  variant.updateDistribution(DistributionPercentage.create(0.6))
}

// Check compatibility with another variant
const isCompatible = variant.isCompatibleWith(otherVariant)

// Update performance metrics
const metrics = VariantMetrics.create({
  conversionRate: 0.15,
  clickThroughRate: 0.25,
  bounceRate: 0.3,
  averageSessionDuration: 180,
  sampleSize: 1000,
})
variant.updatePerformanceMetrics(metrics)
```

## Metadata

Version: 1.0.0
Last Updated: 2025-09-17
Location: `packages/domain/src/deployment-and-distribution/ab-testing/entities/variant.entity.ts`
Bounded Context: A/B Testing
