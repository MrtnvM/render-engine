import { Entity } from '../../../kernel/entities/base.entity.js'
import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { Name } from '../../../kernel/value-objects/name.value-object.js'
import { TestCriteria } from '../value-objects/test-criteria.value-object.js'
import { GroupSize } from '../value-objects/group-size.value-object.js'

// Domain Events
import {
  TestGroupCreatedEvent,
  UserAddedToGroupEvent,
  UserRemovedFromGroupEvent,
  TestGroupActivatedEvent,
  TestGroupDeactivatedEvent,
  TestGroupCriteriaUpdatedEvent,
  TestGroupSizeUpdatedEvent,
} from '../events/test-group.events.js'

// Domain Errors
import {
  InvalidTestGroupError,
  InvalidGroupSizeError,
  InvalidCriteriaError,
  UserAlreadyInGroupError,
  GroupFullError,
  InvalidUserError,
  UserNotInGroupError,
  TestGroupAlreadyActiveError,
  TestGroupAlreadyInactiveError,
  CriteriaUpdateConflictError,
  SizeReductionConflictError,
} from '../errors/test-group.errors.js'

export interface TestGroupData {
  id: ID
  name: Name
  criteria: TestCriteria
  size: GroupSize
  experimentId: ID
  userIds: ID[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateTestGroupParams {
  name: Name
  criteria: TestCriteria
  size: GroupSize
  experimentId: ID
}

export interface TestGroupPersistenceData {
  id: string
  name: string
  criteria: unknown
  size: number
  experimentId: string
  userIds: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * TestGroup Entity
 *
 * Manages user segmentation for A/B testing experiments, enabling targeted testing with specific user groups.
 * As an aggregate root, it handles group membership, enforces mutual exclusivity rules, maintains size limits
 * for statistical validity, and coordinates with the broader experiment ecosystem.
 */
export class TestGroup extends Entity<TestGroupData> {
  private static readonly MINIMUM_GROUP_SIZE = 100

  private constructor(
    data: Omit<TestGroupData, 'id' | 'createdAt' | 'updatedAt'> & {
      id?: ID
      createdAt?: Date
      updatedAt?: Date
    },
  ) {
    super({
      ...data,
      userIds: data.userIds || [],
      isActive: data.isActive ?? true,
    } as TestGroupData)
  }

  get name(): Name {
    return this.data.name
  }

  get criteria(): TestCriteria {
    return this.data.criteria
  }

  get size(): GroupSize {
    return this.data.size
  }

  get experimentId(): ID {
    return this.data.experimentId
  }

  get userIds(): readonly ID[] {
    return Object.freeze([...this.data.userIds])
  }

  get isActive(): boolean {
    return this.data.isActive
  }

  /**
   * Creates a new test group with the specified parameters
   */
  static create(params: CreateTestGroupParams): TestGroup {
    // Validate required parameters
    if (!params.name || !params.criteria || !params.size || !params.experimentId) {
      throw new InvalidTestGroupError('All required parameters must be provided')
    }

    // Validate group size for statistical significance
    if (params.size.value < TestGroup.MINIMUM_GROUP_SIZE) {
      throw new InvalidGroupSizeError(
        params.size.value,
        `Group size must be at least ${TestGroup.MINIMUM_GROUP_SIZE} for statistical validity`,
      )
    }

    // Validate criteria is not empty
    if (params.criteria.isEmpty()) {
      throw new InvalidCriteriaError(
        params.criteria.toJSON(),
        'Test criteria cannot be empty - at least one segmentation criterion must be specified',
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
    testGroup.addDomainEvent(
      new TestGroupCreatedEvent(testGroup.id, testGroup.experimentId, testGroup.name, testGroup.size),
    )

    return testGroup
  }

  /**
   * Reconstructs a test group from persistent storage data
   */
  static fromPersistence(data: TestGroupPersistenceData): TestGroup {
    try {
      // Reconstruct value objects
      const id = ID.create(data.id)
      const name = Name.create(data.name)
      const criteria = TestCriteria.create(data.criteria as any)
      const size = GroupSize.create(data.size)
      const experimentId = ID.create(data.experimentId)
      const userIds = data.userIds.map((userId) => ID.create(userId))

      // Create test group instance
      const testGroup = new TestGroup({
        id,
        name,
        criteria,
        size,
        experimentId,
        userIds,
        isActive: data.isActive,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })

      return testGroup
    } catch (error) {
      if (error instanceof Error) {
        throw new InvalidTestGroupError(`Failed to reconstruct test group from persistence data: ${error.message}`)
      }
      throw new InvalidTestGroupError('Failed to reconstruct test group from persistence data')
    }
  }

  /**
   * Adds a user to the test group
   */
  addUser(userId: ID): void {
    // Validate user ID
    if (!userId || typeof userId.toString() !== 'string') {
      throw new InvalidUserError(userId?.toString() || 'undefined', 'Invalid user ID')
    }

    // Check if user is already in this group
    if (this.data.userIds.some((existingId) => existingId.equals(userId))) {
      throw new UserAlreadyInGroupError(userId.toString(), this.id.toString())
    }

    // Check if group is full
    if (this.data.userIds.length >= this.data.size.value) {
      throw new GroupFullError(this.id.toString(), this.data.userIds.length, this.data.size.value)
    }

    // Check if group is active
    if (!this.data.isActive) {
      throw new TestGroupAlreadyInactiveError(this.id.toString())
    }

    // Add user to group
    this.data.userIds.push(userId)
    this.updateTimestamp()

    // Emit user added event
    this.addDomainEvent(new UserAddedToGroupEvent(this.id, this.experimentId, userId, this.data.userIds.length))
  }

  /**
   * Removes a user from the test group
   */
  removeUser(userId: ID): void {
    // Validate user ID
    if (!userId || typeof userId.toString() !== 'string') {
      throw new InvalidUserError(userId?.toString() || 'undefined', 'Invalid user ID')
    }

    // Check if user is in this group
    const userIndex = this.data.userIds.findIndex((existingId) => existingId.equals(userId))
    if (userIndex === -1) {
      throw new UserNotInGroupError(userId.toString(), this.id.toString())
    }

    // Remove user from group
    this.data.userIds.splice(userIndex, 1)
    this.updateTimestamp()

    // Emit user removed event
    this.addDomainEvent(new UserRemovedFromGroupEvent(this.id, this.experimentId, userId, this.data.userIds.length))
  }

  /**
   * Activates the test group for participation in experiments
   */
  activate(): void {
    if (this.data.isActive) {
      throw new TestGroupAlreadyActiveError(this.id.toString())
    }

    // Additional validation could be added here to check experiment state
    // For now, we assume experiment state validation happens at a higher level

    this.data.isActive = true
    this.updateTimestamp()

    // Emit activation event
    this.addDomainEvent(new TestGroupActivatedEvent(this.id, this.experimentId))
  }

  /**
   * Deactivates the test group, stopping further user assignments
   */
  deactivate(): void {
    if (!this.data.isActive) {
      throw new TestGroupAlreadyInactiveError(this.id.toString())
    }

    // Additional validation could be added here to check experiment state
    // For now, we assume experiment state validation happens at a higher level

    this.data.isActive = false
    this.updateTimestamp()

    // Emit deactivation event
    this.addDomainEvent(new TestGroupDeactivatedEvent(this.id, this.experimentId, this.data.userIds.length))
  }

  /**
   * Updates the segmentation criteria for the test group
   */
  updateCriteria(newCriteria: TestCriteria): void {
    // Validate new criteria
    if (!newCriteria || newCriteria.isEmpty()) {
      throw new InvalidCriteriaError(newCriteria?.toJSON() || null, 'New criteria cannot be empty')
    }

    // Check if criteria change would affect current users
    const affectedUsers = this.countUsersAffectedByCriteriaChange(newCriteria)
    if (affectedUsers > 0) {
      throw new CriteriaUpdateConflictError(this.id.toString(), affectedUsers)
    }

    const oldCriteria = this.data.criteria
    this.data.criteria = newCriteria
    this.updateTimestamp()

    // Emit criteria updated event
    this.addDomainEvent(
      new TestGroupCriteriaUpdatedEvent(
        this.id,
        this.experimentId,
        oldCriteria.toJSON(),
        newCriteria.toJSON(),
        this.data.userIds.length,
      ),
    )
  }

  /**
   * Updates the maximum size of the test group
   */
  updateSize(newSize: GroupSize): void {
    // Validate new size
    if (!newSize || newSize.value < TestGroup.MINIMUM_GROUP_SIZE) {
      throw new InvalidGroupSizeError(
        newSize?.value || 0,
        `Group size must be at least ${TestGroup.MINIMUM_GROUP_SIZE} for statistical validity`,
      )
    }

    // Check if size reduction would conflict with current user count
    if (newSize.value < this.data.userIds.length) {
      throw new SizeReductionConflictError(this.id.toString(), this.data.userIds.length, newSize.value)
    }

    const oldSize = this.data.size.value
    this.data.size = newSize
    this.updateTimestamp()

    // Emit size updated event
    this.addDomainEvent(
      new TestGroupSizeUpdatedEvent(this.id, this.experimentId, oldSize, newSize.value, this.data.userIds.length),
    )
  }

  /**
   * Determines if a user matches the group's segmentation criteria
   */
  matchesUser(user: { attributes: Record<string, unknown> }): boolean {
    return this.data.criteria.matchesUser(user.attributes)
  }

  /**
   * Checks if a user can be added to this group
   */
  canAcceptUser(userId: ID, isExperimentRunning: boolean = false, userInOtherGroups: boolean = false): boolean {
    // Business rules from specification:
    // - User must not already be in this group
    if (this.data.userIds.some((existingId) => existingId.equals(userId))) {
      return false
    }

    // - User must not be in another group in the same experiment
    if (userInOtherGroups) {
      return false
    }

    // - Group must not be full
    if (this.data.userIds.length >= this.data.size.value) {
      return false
    }

    // - Group must be active
    if (!this.data.isActive) {
      return false
    }

    // - Experiment must allow user additions (not running)
    if (isExperimentRunning) {
      return false
    }

    return true
  }

  /**
   * Gets the current number of users in the group
   */
  getCurrentSize(): number {
    return this.data.userIds.length
  }

  /**
   * Gets the remaining capacity of the group
   */
  getAvailableCapacity(): number {
    return this.data.size.getRemainingCapacity(this.data.userIds.length)
  }

  /**
   * Gets the utilization percentage of the group
   */
  getUtilizationPercentage(): number {
    return this.data.size.getUtilizationPercentage(this.data.userIds.length)
  }

  /**
   * Checks if the group is full
   */
  isFull(): boolean {
    return this.data.size.isFull(this.data.userIds.length)
  }

  /**
   * Checks if the group is empty
   */
  isEmpty(): boolean {
    return this.data.size.isEmpty(this.data.userIds.length)
  }

  /**
   * Gets statistical power for detecting effects
   */
  getStatisticalPower(effectSize: number = 0.1): number {
    return this.data.size.getStatisticalPower(effectSize)
  }

  /**
   * Counts users that would be affected by criteria change
   */
  private countUsersAffectedByCriteriaChange(newCriteria: TestCriteria): number {
    // This would typically involve checking current users against new criteria
    // For now, we return a placeholder implementation
    // In a real implementation, this would access user data
    return 0
  }

  /**
   * Updates the timestamp for the entity
   */
  private updateTimestamp(): void {
    // Since updatedAt is immutable in the base entity, we can't update it directly
    // In a real implementation, this might be handled differently
    // For now, we'll note that this would be handled by the persistence layer
  }

  /**
   * Converts entity to persistence format
   */
  toPersistence(): TestGroupPersistenceData {
    return {
      id: this.id.toString(),
      name: this.name.toPrimitive(),
      criteria: this.criteria.toJSON(),
      size: this.size.toPrimitive(),
      experimentId: this.experimentId.toString(),
      userIds: this.userIds.map((id) => id.toString()),
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  /**
   * String representation of the test group
   */
  toString(): string {
    return `TestGroup(id=${this.id}, name=${this.name}, users=${this.userIds.length}/${this.size.value}, active=${this.isActive})`
  }

  /**
   * Detailed string representation for debugging
   */
  toDetailedString(): string {
    return `TestGroup(id=${this.id}, name="${this.name}", experiment=${this.experimentId}, users=${this.userIds.length}/${this.size.value}, active=${this.isActive}, criteria="${this.criteria}")`
  }
}
