# TestGroup Entity

## Overview

The TestGroup entity manages user segmentation for A/B testing experiments, enabling targeted testing with specific user groups. As an aggregate root, it handles group membership, enforces mutual exclusivity rules, maintains size limits for statistical validity, and coordinates with the broader experiment ecosystem. Test groups ensure that users are properly segmented and that experiments maintain scientific rigor through proper user allocation.

## Data Structure

| Name         | Type         | Required | Default | Description                                          |
| ------------ | ------------ | -------- | ------- | ---------------------------------------------------- |
| id           | ID           | Yes      | -       | Unique identifier for the test group                 |
| name         | Name         | Yes      | -       | Human-readable name for the test group               |
| criteria     | TestCriteria | Yes      | -       | User segmentation criteria defining group membership |
| size         | GroupSize    | Yes      | -       | Maximum number of users in the group                 |
| experimentId | ID           | Yes      | -       | ID of the experiment this group belongs to           |
| userIds      | ID[]         | Yes      | []      | Array of user IDs currently in the group             |
| isActive     | boolean      | Yes      | true    | Whether the group is currently active                |
| createdAt    | Date         | Yes      | -       | Timestamp when the group was created                 |
| updatedAt    | Date         | Yes      | -       | Timestamp when the group was last updated            |

## Methods

### Factory Methods

#### create(params: CreateTestGroupParams): TestGroup

Creates a new test group with the specified parameters.

**Parameters:**

- `params`: Object containing:
  - `name`: Human-readable name for the test group
  - `criteria`: User segmentation criteria
  - `size`: Maximum number of users in the group
  - `experimentId`: ID of the experiment this group belongs to

**Returns:** New TestGroup instance

**Throws:**

- `TestGroupError.invalidParameters()` if required parameters are missing or invalid
- `TestGroupError.duplicateName()` if group name already exists in the same experiment
- `TestGroupError.invalidSize()` if group size is too small for statistical validity
- `TestGroupError.invalidCriteria()` if segmentation criteria are malformed

**Emits:** `TestGroupEvent.created()`

#### fromPersistence(data: TestGroupPersistenceData): TestGroup

Reconstructs a test group from persistent storage data.

**Parameters:**

- `data`: Object containing:
  - `id`: Test group ID
  - `name`: Test group name as string
  - `criteria`: Segmentation criteria
  - `size`: Group size as number
  - `experimentId`: Experiment ID
  - `userIds`: Array of user IDs
  - `isActive`: Whether the group is active
  - `createdAt`: Creation timestamp
  - `updatedAt`: Last update timestamp

**Returns:** Reconstructed TestGroup instance

**Throws:**

- `TestGroupError.invalidPersistenceData()` if persistent data is invalid
- `ValidationError` if any value object reconstruction fails

### Business Methods

#### addUser(userId: ID): void

Adds a user to the test group.

**Parameters:**

- `userId`: ID of the user to add to the group

**Throws:**

- `TestGroupError.userAlreadyInGroup()` if user is already in this group
- `TestGroupError.userInAnotherGroup()` if user is in another group within the same experiment
- `TestGroupError.groupFull()` if group has reached its size limit
- `TestGroupError.experimentRunning()` if experiment is currently running
- `TestGroupError.invalidUser()` if user doesn't exist or is invalid

**Emits:** `TestGroupEvent.userAdded()`

#### removeUser(userId: ID): void

Removes a user from the test group.

**Parameters:**

- `userId`: ID of the user to remove from the group

**Throws:**

- `TestGroupError.userNotInGroup()` if user is not in this group
- `TestGroupError.experimentRunning()` if experiment is currently running

**Emits:** `TestGroupEvent.userRemoved()`

#### activate(): void

Activates the test group for participation in experiments.

**Throws:**

- `TestGroupError.alreadyActive()` if group is already active
- `TestGroupError.experimentNotReady()` if experiment is not in a suitable state

**Emits:** `TestGroupEvent.activated()`

#### deactivate(): void

Deactivates the test group, stopping further user assignments.

**Throws:**

- `TestGroupError.alreadyInactive()` if group is already inactive
- `TestGroupError.experimentRunning()` if experiment is currently running

**Emits:** `TestGroupEvent.deactivated()`

#### updateCriteria(newCriteria: TestCriteria): void

Updates the segmentation criteria for the test group.

**Parameters:**

- `newCriteria`: New segmentation criteria to apply

**Throws:**

- `TestGroupError.experimentRunning()` if experiment is currently running
- `TestGroupError.invalidCriteria()` if new criteria are invalid
- `TestGroupError.criteriaUpdateConflict()` if new criteria would invalidate current user assignments

**Emits:** `TestGroupEvent.criteriaUpdated()`

#### updateSize(newSize: GroupSize): void

Updates the maximum size of the test group.

**Parameters:**

- `newSize`: New maximum group size

**Throws:**

- `TestGroupError.experimentRunning()` if experiment is currently running
- `TestGroupError.invalidSize()` if new size is too small for statistical validity
- `TestGroupError.sizeReductionConflict()` if new size is smaller than current user count

**Emits:** `TestGroupEvent.sizeUpdated()`

#### matchesUser(user: User): boolean

Determines if a user matches the group's segmentation criteria.

**Parameters:**

- `user`: User object to evaluate against criteria

**Returns:** True if user matches criteria, false otherwise

#### canAcceptUser(userId: ID): boolean

Checks if a user can be added to this group.

**Parameters:**

- `userId`: User ID to check

**Returns:** True if user can be added, false otherwise

**Business Rules:**

- User must not already be in this group
- User must not be in another group in the same experiment
- Group must not be full
- Group must be active
- Experiment must allow user additions

#### getCurrentSize(): number

Gets the current number of users in the group.

**Returns:** Current user count

#### getAvailableCapacity(): number

Gets the remaining capacity of the group.

**Returns:** Number of additional users that can be added

## Business Rules

1. **Mutual Exclusivity**: Users can only be in one test group per experiment
2. **Group Size Limits**: Groups must have minimum size for statistical validity (typically 100+ users)
3. **Size Modification Constraints**: Group size cannot be reduced below current user count
4. **Criteria Validation**: Segmentation criteria must be valid and evaluable
5. **Experiment State Coordination**: Group modifications restricted during running experiments
6. **Name Uniqueness**: Group names must be unique within an experiment
7. **User Existence**: All user IDs must reference valid users
8. **Active State Management**: Only active groups can accept new users
9. **Statistical Validity**: Group sizes must support meaningful statistical analysis
10. **Assignment Consistency**: User assignments must be consistent and trackable

## Events

- `TestGroupEvent.created()` - Emitted when a new test group is created
- `TestGroupEvent.userAdded()` - Emitted when a user is added to a group
- `TestGroupEvent.userRemoved()` - Emitted when a user is removed from a group
- `TestGroupEvent.activated()` - Emitted when a test group is activated
- `TestGroupEvent.deactivated()` - Emitted when a test group is deactivated
- `TestGroupEvent.criteriaUpdated()` - Emitted when segmentation criteria are updated
- `TestGroupEvent.sizeUpdated()` - Emitted when group size is updated

## Dependencies

### Base Classes

- `Entity<TestGroupData>` - Base entity class with ID management and domain events

### Value Objects

- `ID` - Unique identifier
- `Name` - Human-readable name from kernel
- `TestCriteria` - User segmentation criteria
- `GroupSize` - Maximum group size with validation
- `Date` - Timestamp management

### Domain Events

- `TestGroupEvent` - Single event object with factory methods:
  - `TestGroupEvent.created()`
  - `TestGroupEvent.userAdded()`
  - `TestGroupEvent.userRemoved()`
  - `TestGroupEvent.activated()`
  - `TestGroupEvent.deactivated()`
  - `TestGroupEvent.criteriaUpdated()`
  - `TestGroupEvent.sizeUpdated()`

### Domain Errors

- `TestGroupError` - Single error object with factory methods:
  - `TestGroupError.invalidParameters()`
  - `TestGroupError.duplicateName()`
  - `TestGroupError.invalidSize()`
  - `TestGroupError.invalidCriteria()`
  - `TestGroupError.userAlreadyInGroup()`
  - `TestGroupError.userInAnotherGroup()`
  - `TestGroupError.groupFull()`
  - `TestGroupError.experimentRunning()`
  - `TestGroupError.invalidUser()`
  - `TestGroupError.userNotInGroup()`
  - `TestGroupError.alreadyActive()`
  - `TestGroupError.alreadyInactive()`
  - `TestGroupError.experimentNotReady()`
  - `TestGroupError.criteriaUpdateConflict()`
  - `TestGroupError.sizeReductionConflict()`

## Aggregate Root Responsibilities

As an aggregate root, the TestGroup entity:

1. **Manages Group Lifecycle**: Controls creation, updates, and deletion of test groups
2. **Enforces Business Rules**: Validates all operations against domain rules and constraints
3. **Coordinates User Assignments**: Manages user membership and mutual exclusivity
4. **Ensures Data Consistency**: Maintains invariant integrity across the aggregate
5. **Handles State Transitions**: Manages active/inactive states and their constraints
6. **Emits Domain Events**: Coordinates events for significant state changes
7. **Provides Access Control**: Manages access to group data and operations

## Implementation Details

### Type Definitions

```typescript
interface TestGroupData extends EntityData {
  name: Name
  criteria: TestCriteria
  size: GroupSize
  experimentId: ID
  userIds: ID[]
  isActive: boolean
}

interface CreateTestGroupParams {
  name: Name
  criteria: TestCriteria
  size: GroupSize
  experimentId: ID
}

interface TestGroupPersistenceData {
  id: string
  name: string
  criteria: TestCriteria
  size: number
  experimentId: string
  userIds: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Factory Method Implementation

```typescript
static create(params: CreateTestGroupParams): TestGroup {
  // Validate required parameters
  if (!params.name || !params.criteria || !params.size || !params.experimentId) {
    throw TestGroupError.invalidParameters('All required parameters must be provided')
  }

  // Validate group size for statistical significance
  if (params.size.value < MINIMUM_GROUP_SIZE) {
    throw TestGroupError.invalidSize(
      `Group size must be at least ${MINIMUM_GROUP_SIZE} for statistical validity`
    )
  }

  // Create test group instance
  const testGroup = new TestGroup({
    name: params.name,
    criteria: params.criteria,
    size: params.size,
    experimentId: params.experimentId,
    userIds: [],
    isActive: true,
  })

  // Emit creation event
  testGroup.addDomainEvent(TestGroupEvent.created(
    testGroup.id,
    testGroup.experimentId,
    testGroup.name,
    testGroup.size
  ))

  return testGroup
}
```

### User Assignment Logic

```typescript
addUser(userId: ID): void {
  // Check if user is already in this group
  if (this.userIds.includes(userId)) {
    throw TestGroupError.userAlreadyInGroup('User is already in this test group')
  }

  // Check if group is full
  if (this.userIds.length >= this.size.value) {
    throw TestGroupError.groupFull('Test group has reached its maximum capacity')
  }

  // Check if group is active
  if (!this.isActive) {
    throw TestGroupError.alreadyInactive('Cannot add users to inactive test group')
  }

  // Add user to group
  this.userIds.push(userId)

  // Emit user added event
  this.addDomainEvent(TestGroupEvent.userAdded(
    this.id,
    this.experimentId,
    userId,
    this.userIds.length
  ))
}
```

## Tests

### Essential Tests

#### Creation Tests

- Create test group with valid parameters
- Create test group with invalid parameters (missing fields)
- Create test group with invalid group size
- Create test group with invalid criteria
- Create test group with duplicate name in same experiment
- Create test group with size below statistical minimum

#### User Management Tests

- Add user to group with valid user
- Add user already in group (should fail)
- Add user to full group (should fail)
- Add user to inactive group (should fail)
- Remove user from group
- Remove user not in group (should fail)
- User mutual exclusivity across groups in same experiment

#### Business Method Tests

- Activate/deactivate test group
- Update criteria when experiment is not running
- Update criteria when experiment is running (should fail)
- Update size with valid parameters
- Update size below current user count (should fail)
- User matching against criteria
- Capacity management and availability

#### Business Rule Tests

- Group size validation for statistical significance
- Mutual exclusivity enforcement
- Experiment state coordination
- Criteria validation and evaluation
- Name uniqueness within experiment
- Active state management constraints

#### Event Tests

- TestGroupCreatedEvent emission
- UserAddedToGroupEvent emission
- UserRemovedFromGroupEvent emission
- TestGroupActivatedEvent emission
- TestGroupDeactivatedEvent emission
- TestGroupCriteriaUpdatedEvent emission
- TestGroupSizeUpdatedEvent emission

#### Edge Case Tests

- Large group sizes and performance
- Complex segmentation criteria
- Concurrent user additions
- Group size boundary conditions
- Empty group scenarios
- Criteria that match no users

### Integration Tests

- TestGroup interactions with Experiment aggregate
- User assignment coordination across multiple groups
- Criteria evaluation with user attributes
- Statistical significance validation
- Experiment lifecycle coordination

## Serialization

### JSON Format

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Mobile Users Group",
  "criteria": {
    "platform": "mobile",
    "region": "us",
    "signupDate": {
      "after": "2025-01-01T00:00:00.000Z"
    }
  },
  "size": 1000,
  "experimentId": "550e8400-e29b-41d4-a716-446655440001",
  "userIds": ["550e8400-e29b-41d4-a716-446655440002", "550e8400-e29b-41d4-a716-446655440003"],
  "isActive": true,
  "createdAt": "2025-09-17T10:00:00.000Z",
  "updatedAt": "2025-09-17T10:00:00.000Z"
}
```

## Usage Examples

```typescript
// Create a new test group
const testGroup = TestGroup.create({
  name: Name.create('Mobile Users Group'),
  criteria: TestCriteria.create({
    platform: 'mobile',
    region: 'us',
    signupDate: { after: new Date('2025-01-01') },
  }),
  size: GroupSize.create(1000),
  experimentId: experiment.id,
})

// Add users to the group
try {
  testGroup.addUser(userId1)
  testGroup.addUser(userId2)
} catch (error) {
  if (error.code === 'GROUP_FULL') {
    console.log('Group is full, cannot add more users')
  }
}

// Check if user matches criteria
const user = await userRepository.findById(userId1)
if (testGroup.matchesUser(user)) {
  console.log('User matches test group criteria')
}

// Update group size when experiment is not running
if (testGroup.canModify()) {
  testGroup.updateSize(GroupSize.create(1500))
}

// Get group statistics
console.log(`Current size: ${testGroup.getCurrentSize()}`)
console.log(`Available capacity: ${testGroup.getAvailableCapacity()}`)
```

## Metadata

Version: 1.0.0
Last Updated: 2025-09-17
Location: `packages/domain/src/deployment-and-distribution/ab-testing/entities/test-group.entity.ts`
Bounded Context: A/B Testing
