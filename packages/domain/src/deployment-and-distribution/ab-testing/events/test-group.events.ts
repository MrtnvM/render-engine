import { DomainEvent } from '../../../kernel/events/base.domain-event.js'
import { ID } from '../../../kernel/value-objects/id.value-object.js'
import { Name } from '../../../kernel/value-objects/name.value-object.js'
import { GroupSize } from '../value-objects/group-size.value-object.js'

/**
 * TestGroupCreatedEvent
 *
 * Emitted when a new test group is created
 */
export class TestGroupCreatedEvent extends DomainEvent<{
  testGroupId: string
  experimentId: string
  name: string
  size: number
}> {
  constructor(testGroupId: ID, experimentId: ID, name: Name, size: GroupSize) {
    super({
      aggregateId: testGroupId,
      eventName: 'TestGroupCreated',
      payload: {
        testGroupId: testGroupId.toString(),
        experimentId: experimentId.toString(),
        name: name.toPrimitive(),
        size: size.toPrimitive(),
      },
    })
  }
}

/**
 * UserAddedToGroupEvent
 *
 * Emitted when a user is added to a test group
 */
export class UserAddedToGroupEvent extends DomainEvent<{
  testGroupId: string
  experimentId: string
  userId: string
  groupSize: number
}> {
  constructor(testGroupId: ID, experimentId: ID, userId: ID, groupSize: number) {
    super({
      aggregateId: testGroupId,
      eventName: 'UserAddedToGroup',
      payload: {
        testGroupId: testGroupId.toString(),
        experimentId: experimentId.toString(),
        userId: userId.toString(),
        groupSize,
      },
    })
  }
}

/**
 * UserRemovedFromGroupEvent
 *
 * Emitted when a user is removed from a test group
 */
export class UserRemovedFromGroupEvent extends DomainEvent<{
  testGroupId: string
  experimentId: string
  userId: string
  groupSize: number
}> {
  constructor(testGroupId: ID, experimentId: ID, userId: ID, groupSize: number) {
    super({
      aggregateId: testGroupId,
      eventName: 'UserRemovedFromGroup',
      payload: {
        testGroupId: testGroupId.toString(),
        experimentId: experimentId.toString(),
        userId: userId.toString(),
        groupSize,
      },
    })
  }
}

/**
 * TestGroupActivatedEvent
 *
 * Emitted when a test group is activated
 */
export class TestGroupActivatedEvent extends DomainEvent<{
  testGroupId: string
  experimentId: string
  activatedAt: string
}> {
  constructor(testGroupId: ID, experimentId: ID) {
    super({
      aggregateId: testGroupId,
      eventName: 'TestGroupActivated',
      payload: {
        testGroupId: testGroupId.toString(),
        experimentId: experimentId.toString(),
        activatedAt: new Date().toISOString(),
      },
    })
  }
}

/**
 * TestGroupDeactivatedEvent
 *
 * Emitted when a test group is deactivated
 */
export class TestGroupDeactivatedEvent extends DomainEvent<{
  testGroupId: string
  experimentId: string
  deactivatedAt: string
  currentUsers: number
}> {
  constructor(testGroupId: ID, experimentId: ID, currentUsers: number) {
    super({
      aggregateId: testGroupId,
      eventName: 'TestGroupDeactivated',
      payload: {
        testGroupId: testGroupId.toString(),
        experimentId: experimentId.toString(),
        deactivatedAt: new Date().toISOString(),
        currentUsers,
      },
    })
  }
}

/**
 * TestGroupCriteriaUpdatedEvent
 *
 * Emitted when segmentation criteria are updated
 */
export class TestGroupCriteriaUpdatedEvent extends DomainEvent<{
  testGroupId: string
  experimentId: string
  oldCriteria: unknown
  newCriteria: unknown
  affectedUsers: number
}> {
  constructor(testGroupId: ID, experimentId: ID, oldCriteria: unknown, newCriteria: unknown, affectedUsers: number) {
    super({
      aggregateId: testGroupId,
      eventName: 'TestGroupCriteriaUpdated',
      payload: {
        testGroupId: testGroupId.toString(),
        experimentId: experimentId.toString(),
        oldCriteria,
        newCriteria,
        affectedUsers,
      },
    })
  }
}

/**
 * TestGroupSizeUpdatedEvent
 *
 * Emitted when group size is updated
 */
export class TestGroupSizeUpdatedEvent extends DomainEvent<{
  testGroupId: string
  experimentId: string
  oldSize: number
  newSize: number
  currentUsers: number
}> {
  constructor(testGroupId: ID, experimentId: ID, oldSize: number, newSize: number, currentUsers: number) {
    super({
      aggregateId: testGroupId,
      eventName: 'TestGroupSizeUpdated',
      payload: {
        testGroupId: testGroupId.toString(),
        experimentId: experimentId.toString(),
        oldSize,
        newSize,
        currentUsers,
      },
    })
  }
}
