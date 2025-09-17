# UserAssignmentService Domain Service

## Overview

The **UserAssignmentService** is a domain service responsible for managing consistent user assignment to variants within A/B testing experiments. It encapsulates the complex business logic of user eligibility validation, consistent hashing for assignment stability, and assignment persistence. This service ensures that users are consistently assigned to the same variant across multiple requests while maintaining fair distribution according to experiment configurations.

The service operates as a stateless business logic unit that coordinates between Experiment entities, user identification, and assignment tracking. It is essential for maintaining the integrity of A/B testing results and ensuring that user experiences remain consistent throughout the experiment lifecycle.

## Service Type

- **Type:** Implementation
- **Stateless:** Yes (domain services must be stateless)
- **Business Logic:** User assignment stability, eligibility validation, and assignment persistence management

## Methods

### Core Business Logic Methods

#### `assignUser(experiment: Experiment, userId: ID): ID`

Assigns a user to a variant within the specified experiment using consistent hashing.

**Parameters:**

- `experiment`: The experiment entity to assign the user to
- `userId`: The unique identifier of the user to assign

**Returns:** ID of the assigned variant

**Throws:**
- `ExperimentNotStartedError` if the experiment is not in RUNNING status
- `UserNotEligibleError` if the user doesn't meet experiment eligibility criteria
- `InvalidAssignmentError` if the assignment cannot be processed

**Business Rules:**
- User must be eligible for the experiment based on target audience criteria
- Assignment must use consistent hashing to ensure stability across requests
- Distribution percentages must be respected for fair variant allocation
- Assignment must be persisted for future consistency

**Emits:** `UserAssignedEvent`

#### `reassignUser(experiment: Experiment, userId: ID, newVariantId: ID): void`

Reassigns a user to a specific variant within an experiment.

**Parameters:**

- `experiment`: The experiment entity containing the user
- `userId`: The unique identifier of the user to reassign
- `newVariantId`: The ID of the variant to reassign the user to

**Returns:** void

**Throws:**
- `ExperimentNotStartedError` if the experiment is not in RUNNING status
- `UserNotInExperimentError` if the user is not currently assigned to any variant
- `InvalidVariantError` if the specified variant is not part of the experiment
- `ReassignmentNotAllowedError` if reassignment violates business rules

**Business Rules:**
- User must be currently assigned to a variant in the experiment
- New variant must exist and be active within the experiment
- Reassignment should only occur in exceptional circumstances
- Previous assignment history must be preserved for analysis integrity

**Emits:** `UserReassignedEvent`

### Assignment Query Methods

#### `getUserAssignment(experimentId: ID, userId: ID): ID | null`

Retrieves the current variant assignment for a user in an experiment.

**Parameters:**

- `experimentId`: The ID of the experiment to query
- `userId`: The ID of the user to query

**Returns:** ID of the assigned variant or null if not assigned

**Business Rules:**
- Must return null for users not assigned to any variant
- Must return the most recent assignment for users with multiple assignments
- Must respect experiment status (only return assignments for active experiments)

#### `getUserAssignmentHistory(experimentId: ID, userId: ID): UserAssignment[]`

Retrieves the complete assignment history for a user in an experiment.

**Parameters:**

- `experimentId`: The ID of the experiment to query
- `userId`: The ID of the user to query

**Returns:** Array of UserAssignment objects in chronological order

**Business Rules:**
- Must return all historical assignments including reassignments
- Must be ordered chronologically to show assignment evolution
- Must include metadata about assignment timing and reasons

### Validation Methods

#### `validateUserEligibility(experiment: Experiment, userId: ID): boolean`

Validates whether a user is eligible to participate in an experiment.

**Parameters:**

- `experiment`: The experiment to validate eligibility for
- `userId`: The ID of the user to validate

**Returns:** true if user is eligible, false otherwise

**Business Rules:**
- Must check target audience criteria (location, device type, user segments, etc.)
- Must verify user hasn't been excluded from testing
- Must ensure user hasn't reached maximum experiment participation limits
- Must respect user consent and privacy preferences

#### `validateAssignmentStability(experiment: Experiment, userId: ID, variantId: ID): boolean`

Validates that an assignment maintains stability consistency.

**Parameters:**

- `experiment`: The experiment context
- `userId`: The ID of the user
- `variantId`: The proposed variant assignment

**Returns:** true if assignment maintains stability, false otherwise

**Business Rules:**
- Must use consistent hashing algorithm for assignment determination
- Must return the same result for the same user/experiment combination
- Must respect distribution percentage constraints
- Must handle edge cases in hash distribution

### Calculation Methods

#### `calculateConsistentHash(experiment: Experiment, userId: ID): number`

Calculates a consistent hash value for user assignment.

**Parameters:**

- `experiment`: The experiment context for hashing
- `userId`: The user ID to hash

**Returns:** Numeric hash value between 0 and 1

**Business Rules:**
- Must use a deterministic hashing algorithm
- Must combine experiment ID and user ID for uniqueness
- Must produce uniform distribution for fair assignment
- Must be fast and computationally efficient

#### `calculateAssignmentDistribution(experiment: Experiment): Record<ID, number>`

Calculates the current actual distribution of users across variants.

**Parameters:**

- `experiment`: The experiment to analyze

**Returns:** Record mapping variant IDs to their actual user counts

**Business Rules:**
- Must include only active and valid assignments
- Must reflect current state, not historical assignments
- Must be efficient for large experiment populations
- Must support real-time monitoring needs

## Business Rules & Invariants

### Assignment Stability Invariants

1. **Consistent Hashing Rule**: Users must be assigned to the same variant across multiple requests for the same experiment
   - Use deterministic hashing algorithm combining experiment ID and user ID
   - Ensure hash function produces uniform distribution
   - Maintain assignment consistency regardless of request timing or source

2. **Distribution Fidelity Rule**: Actual user distribution must match configured distribution percentages
   - Respect variant distribution percentages within acceptable tolerance
   - Handle edge cases where exact distribution isn't possible
   - Provide mechanisms to correct distribution drift over time

3. **Assignment Persistence Rule**: User assignments must be persisted and retrievable
   - Store assignments with timestamps for audit purposes
   - Maintain assignment history for analysis integrity
   - Support efficient retrieval of current and historical assignments

### User Eligibility Invariants

4. **Target Audience Compliance Rule**: Only users matching target audience criteria can be assigned
   - Validate demographic, geographic, and behavioral criteria
   - Respect user segment definitions and exclusions
   - Handle complex audience rule combinations correctly

5. **User Consent Rule**: Users must have provided appropriate consent for experimentation
   - Verify explicit consent for A/B testing participation
   - Respect user preferences and privacy settings
   - Handle withdrawal of consent appropriately

6. **Participation Limits Rule**: Users cannot exceed maximum experiment participation limits
   - Track concurrent experiment participations
   - Prevent over-exposure to testing
   - Prioritize high-value experiments when limits are reached

### Experiment Integrity Invariants

7. **Experiment Status Rule**: Assignments can only be made to experiments in RUNNING status
   - Prevent assignments to DRAFT, STOPPED, or COMPLETED experiments
   - Handle experiment status transitions gracefully
   - Clean up assignments when experiments are stopped

8. **Variant Validity Rule**: Users can only be assigned to valid, active variants
   - Verify variant exists within the experiment
   - Check variant is active and not excluded
   - Respect variant-specific constraints

9. **Assignment Integrity Rule**: Assignment operations must maintain data consistency
   - Prevent duplicate active assignments for the same user/experiment
   - Ensure assignment updates are atomic
   - Maintain referential integrity between users, experiments, and variants

### Performance Invariants

10. **Scalability Rule**: Assignment operations must perform efficiently at scale
    - Support millions of users and experiments
    - Maintain sub-millisecond response times for assignments
    - Handle concurrent assignment requests safely

11. **Reliability Rule**: Assignment system must be highly reliable and fault-tolerant
    - Handle assignment service failures gracefully
    - Provide fallback mechanisms for assignment determination
    - Maintain assignment consistency during system disruptions

## Dependencies

### Entities

- `Experiment` - Main experiment entity containing variants and configuration
- `Variant` - Individual test variants within experiments

### Value Objects

- `ID` - Unique identifier for users, experiments, and variants
- `UserAssignment` - Value object representing a user-to-variant assignment
- `AssignmentTimestamp` - Timestamp for assignment tracking
- `AssignmentReason` - Reason for assignment or reassignment

### Domain Events

- `UserAssignedEvent` - Emitted when a user is assigned to a variant
- `UserReassignedEvent` - Emitted when a user is reassigned to a different variant
- `AssignmentValidationErrorEvent` - Emitted when assignment validation fails

### Domain Errors

- `ExperimentNotStartedError` - Thrown when attempting to assign users to non-running experiments
- `UserNotEligibleError` - Thrown when user doesn't meet experiment eligibility criteria
- `InvalidAssignmentError` - Thrown when assignment cannot be processed due to business rule violations
- `UserNotInExperimentError` - Thrown when attempting to reassign a user not in the experiment
- `InvalidVariantError` - Thrown when specified variant is not part of the experiment
- `ReassignmentNotAllowedError` - Thrown when reassignment violates business rules
- `AssignmentPersistenceError` - Thrown when assignment cannot be persisted

### Repository Interfaces

```typescript
interface IUserAssignmentRepository {
  // Assignment operations
  saveAssignment(assignment: UserAssignment): Promise<void>
  getAssignment(experimentId: ID, userId: ID): Promise<UserAssignment | null>
  getAssignmentHistory(experimentId: ID, userId: ID): Promise<UserAssignment[]>
  deleteAssignment(experimentId: ID, userId: ID): Promise<void>

  // Query operations
  getActiveAssignments(experimentId: ID): Promise<UserAssignment[]>
  getUserAssignments(userId: ID): Promise<UserAssignment[]>
  getVariantAssignments(variantId: ID): Promise<UserAssignment[]>

  // Statistics operations
  getAssignmentCount(experimentId: ID): Promise<number>
  getVariantAssignmentCount(variantId: ID): Promise<number>
  getDistributionStats(experimentId: ID): Promise<Record<ID, number>>
}
```

## Domain Events

### UserAssignedEvent

Emitted when a user is successfully assigned to a variant.

**Payload:**

```typescript
{
  experimentId: ID;
  userId: ID;
  variantId: ID;
  assignedAt: Date;
  assignmentMethod: 'consistent_hash' | 'manual' | 'reassignment';
  distributionPercentage: number;
  eligibilityCriteria: string[];
}
```

### UserReassignedEvent

Emitted when a user is reassigned to a different variant.

**Payload:**

```typescript
{
  experimentId: ID;
  userId: ID;
  previousVariantId: ID;
  newVariantId: ID;
  reassignedAt: Date;
  reassignmentReason: string;
  previousAssignmentDuration: number; // in milliseconds
}
```

### AssignmentValidationErrorEvent

Emitted when an assignment validation fails.

**Payload:**

```typescript
{
  experimentId: ID;
  userId: ID;
  attemptedVariantId?: ID;
  errorType: string;
  errorMessage: string;
  validationDetails: Record<string, unknown>;
  timestamp: Date;
}
```

## Service Characteristics

### Stateless Nature

- **No Instance State**: All data is passed as method parameters or retrieved from repositories
- **Deterministic Results**: Same inputs always produce the same outputs
- **Thread Safety**: Safe for concurrent use due to stateless design
- **Scalability**: Horizontal scaling is possible without state synchronization concerns

### Pure Logic

- **No I/O Operations**: Database operations are delegated to repositories
- **No External Service Calls**: All logic is self-contained within the domain
- **No Side Effects**: State changes only occur through domain events and repository operations
- **Testability**: Fully unit testable without infrastructure dependencies

### Performance Considerations

- **Consistent Hashing**: Uses efficient hashing algorithms for fast assignment
- **Caching Strategy**: Leverages repository caching for frequently accessed assignments
- **Bulk Operations**: Supports batch assignment operations for performance optimization
- **Monitoring**: Provides metrics for assignment performance and distribution accuracy

## Tests

### Unit Tests

#### Assignment Methods

- **assignUser:**
  - Assign user to valid running experiment
  - Reject assignment to non-running experiment (should throw ExperimentNotStartedError)
  - Reject ineligible user (should throw UserNotEligibleError)
  - Verify consistent hashing produces same result for same user/experiment
  - Verify assignment persistence is called correctly
  - Verify UserAssignedEvent is emitted with correct payload

- **reassignUser:**
  - Reassign user from current variant to new variant
  - Reject reassignment for user not in experiment (should throw UserNotInExperimentError)
  - Reject reassignment to invalid variant (should throw InvalidVariantError)
  - Reject reassignment when not allowed (should throw ReassignmentNotAllowedError)
  - Verify previous assignment is preserved in history
  - Verify UserReassignedEvent is emitted with correct payload

#### Validation Methods

- **validateUserEligibility:**
  - Approve eligible user matching all criteria
  - Reject user not matching target audience
  - Handle complex audience rule combinations
  - Respect user consent settings
  - Handle participation limits correctly

- **validateAssignmentStability:**
  - Return consistent results for same inputs
  - Handle hash collisions gracefully
  - Respect distribution percentage constraints
  - Maintain performance with large user bases

#### Calculation Methods

- **calculateConsistentHash:**
  - Produce deterministic hash values
  - Generate uniform distribution across 0-1 range
  - Handle edge cases in hash calculation
  - Maintain performance with high call volumes

- **calculateAssignmentDistribution:**
  - Calculate accurate current distribution
  - Handle large assignment sets efficiently
  - Provide real-time statistics
  - Support monitoring and alerting

### Business Logic Tests

#### Cross-Entity Rules

- Test user assignment across multiple experiments
- Verify experiment status transitions affect assignment eligibility
- Test variant activation/deactivation impacts on assignments
- Validate distribution percentage enforcement across variants

#### Assignment Integrity

- Test concurrent assignment requests for same user
- Verify assignment persistence and retrieval consistency
- Test assignment history tracking and accuracy
- Validate cleanup operations when experiments are stopped

#### Edge Cases

- Handle users at distribution boundaries
- Test with very large experiment populations
- Handle assignment service failures gracefully
- Test with malformed or invalid input data

### Integration Tests

#### Repository Integration

- Test with real repository implementations
- Verify assignment persistence and retrieval
- Test bulk assignment operations
- Validate repository error handling

#### Event Integration

- Verify domain event emission and handling
- Test event payload accuracy
- Validate event ordering and timing
- Test event-driven workflows

## Usage Examples

### Basic User Assignment

```typescript
const assignmentService = new UserAssignmentService(assignmentRepository)

// Assign a user to an experiment
const experiment = await experimentRepository.findById(experimentId)
const userId = ID.create()

try {
  const variantId = await assignmentService.assignUser(experiment, userId)
  console.log(`User assigned to variant: ${variantId}`)
} catch (error) {
  if (error instanceof ExperimentNotStartedError) {
    console.log('Experiment is not running')
  } else if (error instanceof UserNotEligibleError) {
    console.log('User is not eligible for this experiment')
  }
}
```

### User Reassignment

```typescript
// Reassign a user to a different variant
const experiment = await experimentRepository.findById(experimentId)
const userId = ID.create()
const newVariantId = ID.create()

try {
  await assignmentService.reassignUser(experiment, userId, newVariantId)
  console.log('User successfully reassigned')
} catch (error) {
  if (error instanceof UserNotInExperimentError) {
    console.log('User is not currently assigned to this experiment')
  } else if (error instanceof ReassignmentNotAllowedError) {
    console.log('Reassignment not allowed at this time')
  }
}
```

### Assignment Validation

```typescript
// Check if user is eligible for experiment
const experiment = await experimentRepository.findById(experimentId)
const userId = ID.create()

if (await assignmentService.validateUserEligibility(experiment, userId)) {
  console.log('User is eligible for experiment')
} else {
  console.log('User is not eligible for experiment')
}
```

## Implementation Details

### Type Definitions

```typescript
interface UserAssignment {
  experimentId: ID
  userId: ID
  variantId: ID
  assignedAt: Date
  assignmentMethod: 'consistent_hash' | 'manual' | 'reassignment'
  isActive: boolean
  metadata?: Record<string, unknown>
}

interface CreateAssignmentParams {
  experimentId: ID
  userId: ID
  variantId: ID
  assignmentMethod: 'consistent_hash' | 'manual' | 'reassignment'
  metadata?: Record<string, unknown>
}

interface ReassignmentParams {
  experimentId: ID
  userId: ID
  newVariantId: ID
  reason: string
  metadata?: Record<string, unknown>
}
```

### Consistent Hashing Implementation

```typescript
private calculateConsistentHash(experiment: Experiment, userId: ID): number {
  // Combine experiment ID and user ID for unique hashing
  const hashInput = `${experiment.id.value}-${userId.value}`

  // Use a fast, uniform hash function (e.g., xxHash or MurmurHash)
  const hash = this.hashFunction(hashInput)

  // Normalize to 0-1 range
  return (hash >>> 0) / 0xFFFFFFFF
}

private determineVariantFromHash(experiment: Experiment, hashValue: number): ID {
  let accumulatedPercentage = 0

  // Sort variants by distribution percentage for deterministic assignment
  const sortedVariants = experiment.variantIds
    .map(id => ({ id, percentage: this.getVariantDistribution(id) }))
    .sort((a, b) => a.percentage - b.percentage)

  // Find the variant that corresponds to the hash value
  for (const variant of sortedVariants) {
    accumulatedPercentage += variant.percentage
    if (hashValue <= accumulatedPercentage) {
      return variant.id
    }
  }

  // Fallback to the last variant (should rarely happen due to floating-point precision)
  return sortedVariants[sortedVariants.length - 1].id
}
```

## Metadata

| Field | Value |
| ----- | ----- |
| **Version** | 1.0.0 |
| **Last Updated** | 2025-09-17 |
| **Author** | Deployment Domain Team |
| **Status** | Draft |
| **Bounded Context** | A/B Testing |
| **Dependencies** | Experiment, Variant, ID, UserAssignment, IUserAssignmentRepository |
| **Complexity** | Medium |
| **Location** | `packages/domain/src/deployment-and-distribution/ab-testing/domain-services/user-assignment-service.service.ts` |
| **Testing Priority** | High |
| **Review Required** | Yes |
| **Documentation** | Complete |
| **Breaking Changes** | None |