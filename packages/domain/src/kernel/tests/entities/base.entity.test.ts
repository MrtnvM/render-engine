import { describe, it, expect, beforeEach } from 'vitest'
import { DomainEvent } from '../../events/index.js'
import { Entity } from '../../entities/index.js'
import { ID } from '../../value-objects/id.value-object.js'

// Test domain event for testing
class TestDomainEvent extends DomainEvent {
  static readonly eventName = 'test.event'
  readonly eventName = TestDomainEvent.eventName

  constructor(aggregateId: ID, occurredAt?: Date) {
    super({ aggregateId, eventName: TestDomainEvent.eventName, payload: {}, occurredAt })
  }
}

// Test-specific subclass that exposes protected methods for testing
class TestEntityWithExposedProtected extends Entity<TestEntityData> {
  private constructor(data: TestEntityData) {
    super(data)
  }

  static create(name: string, value: number): TestEntityWithExposedProtected {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required')
    }
    if (value < 0) {
      throw new Error('Value must be non-negative')
    }

    const entity = new TestEntityWithExposedProtected({
      id: ID.generate(),
      name: name.trim(),
      value: value,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    entity.addDomainEvent(new TestDomainEvent(entity.id))
    return entity
  }

  // Expose protected methods for testing
  public addDomainEventPublic(event: DomainEvent): void {
    this.addDomainEvent(event)
  }

  get name(): string {
    return this.data.name as string
  }

  get value(): number {
    return this.data.value as number
  }
}

interface TestEntityData {
  id: ID
  name: string
  value: number
  createdAt: Date
  updatedAt: Date
  [key: string]: unknown
}

// Concrete implementation for testing
class TestEntity extends Entity<TestEntityData> {
  constructor(data: TestEntityData) {
    super(data)
  }

  static create(name: string, value: number): TestEntity {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required')
    }
    if (value < 0) {
      throw new Error('Value must be non-negative')
    }

    const entity = new TestEntity({
      id: ID.generate(),
      name: name.trim(),
      value: value,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    entity.addDomainEvent(new TestDomainEvent(entity.id))
    return entity
  }

  static fromPersistence(id: string, name: string, value: number, createdAt: Date, updatedAt: Date): TestEntity {
    return new TestEntity({
      id: ID.create(id),
      name,
      value,
      createdAt,
      updatedAt,
    })
  }

  get name(): string {
    return this.data.name as string
  }

  get value(): number {
    return this.data.value as number
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Name is required')
    }
    // Update the data object directly
    ;(this.data as any).name = newName.trim()
    this.addDomainEvent(new TestDomainEvent(this.id))
  }

  updateValue(newValue: number): void {
    if (newValue < 0) {
      throw new Error('Value must be non-negative')
    }
    // Update the data object directly
    ;(this.data as any).value = newValue
    this.addDomainEvent(new TestDomainEvent(this.id))
  }
}

describe('baseEntity', () => {
  describe('constructor', () => {
    it('should create entity with provided ID and timestamps', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000'
      const createdAt = new Date('2023-01-01T00:00:00Z')
      const updatedAt = new Date('2023-01-02T00:00:00Z')

      const entity = TestEntity.fromPersistence(id, 'Test', 42, createdAt, updatedAt)

      expect(entity.id.toString()).toBe(id)
      expect(entity.createdAt).toEqual(createdAt)
      expect(entity.updatedAt).toEqual(updatedAt)
    })

    it('should use current date for timestamps when not provided', () => {
      const before = new Date()
      const entity = TestEntity.create('Test', 42)
      const after = new Date()

      expect(entity.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(entity.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(entity.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })

    it('should store ID as readonly', () => {
      const entity = TestEntity.create('Test', 42)

      // ID should be readonly - attempting to modify should not work
      expect(() => {
        // @ts-expect-error - Testing readonly property
        entity.id = ID.create('new-id')
      }).toThrow()
    })

    it('should create entity with optional ID and timestamps', () => {
      const entity = new TestEntity({
        id: ID.generate(),
        name: 'Test',
        value: 42,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      expect(entity.id).toBeInstanceOf(ID)
      expect(entity.createdAt).toBeInstanceOf(Date)
      expect(entity.updatedAt).toBeInstanceOf(Date)
      expect(entity.name).toBe('Test')
      expect(entity.value).toBe(42)
    })
  })

  describe('identity Management', () => {
    it('should provide access to ID through getter', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000'
      const entity = TestEntity.fromPersistence(id, 'Test', 42, new Date(), new Date())

      expect(entity.id.toString()).toBe(id)
    })

    it('should provide access to creation timestamp', () => {
      const createdAt = new Date('2023-01-01T00:00:00Z')
      const entity = TestEntity.fromPersistence(
        '550e8400-e29b-41d4-a716-446655440000',
        'Test',
        42,
        createdAt,
        new Date(),
      )

      expect(entity.createdAt).toEqual(createdAt)
    })

    it('should provide access to update timestamp', () => {
      const updatedAt = new Date('2023-01-02T00:00:00Z')
      const entity = TestEntity.fromPersistence(
        '550e8400-e29b-41d4-a716-446655440000',
        'Test',
        42,
        new Date(),
        updatedAt,
      )

      expect(entity.updatedAt).toEqual(updatedAt)
    })

    it('should provide access to entity data', () => {
      const entity = TestEntity.create('Test', 42)
      const data = entity.toJSON()

      expect(data).toHaveProperty('id')
      expect(data).toHaveProperty('name', 'Test')
      expect(data).toHaveProperty('value', 42)
      expect(data).toHaveProperty('createdAt')
      expect(data).toHaveProperty('updatedAt')
    })
  })

  describe('equality Comparison', () => {
    it('should return true for equal entities with same ID and type', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000'
      const entity1 = TestEntity.fromPersistence(id, 'Test1', 42, new Date(), new Date())
      const entity2 = TestEntity.fromPersistence(id, 'Test2', 100, new Date(), new Date())

      expect(entity1.equals(entity2)).toBe(true)
    })

    it('should return false for entities with different IDs', () => {
      const entity1 = TestEntity.create('Test1', 42)
      const entity2 = TestEntity.create('Test2', 100)

      expect(entity1.equals(entity2)).toBe(false)
    })

    it('should return false for entities with different types', () => {
      interface DifferentEntityData {
        id: ID
        createdAt: Date
        updatedAt: Date
        [key: string]: unknown
      }

      class DifferentEntity extends Entity<DifferentEntityData> {
        constructor(data: DifferentEntityData) {
          super(data)
        }
      }

      const entity1 = TestEntity.create('Test', 42)
      const entity2 = new DifferentEntity({
        id: entity1.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      expect(entity1.equals(entity2)).toBe(false)
    })

    it('should return false when comparing with null', () => {
      const entity = TestEntity.create('Test', 42)

      expect(entity.equals(null)).toBe(false)
    })

    it('should return false when comparing with undefined', () => {
      const entity = TestEntity.create('Test', 42)

      expect(entity.equals(undefined as any)).toBe(false)
    })
  })

  describe('domain Event Management', () => {
    let entity: TestEntity

    beforeEach(() => {
      entity = TestEntity.create('Test', 42)
    })

    it('should start with domain events from creation', () => {
      const events = entity.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0]).toBeInstanceOf(TestDomainEvent)
    })

    it('should add domain events', () => {
      const event = new TestDomainEvent(ID.create('550e8400-e29b-41d4-a716-446655440000'))
      // Use type assertion to access protected method
      const entityAsAny = entity as any
      entityAsAny.addDomainEvent(event)

      const events = entity.getDomainEvents()
      expect(events).toHaveLength(2) // One from create, one from addDomainEvent
      expect(events[1]).toBe(event)
    })

    it('should add multiple domain events', () => {
      const event1 = new TestDomainEvent(ID.create('550e8400-e29b-41d4-a716-446655440000'))
      const event2 = new TestDomainEvent(ID.create('550e8400-e29b-41d4-a716-446655440000'))
      const entityAsAny = entity as any
      entityAsAny.addDomainEvent(event1)
      entityAsAny.addDomainEvent(event2)

      const events = entity.getDomainEvents()
      expect(events).toHaveLength(3) // One from create, two from addDomainEvent
      expect(events[1]).toBe(event1)
      expect(events[2]).toBe(event2)
    })

    it('should return readonly array of events', () => {
      const event = new TestDomainEvent(ID.create('550e8400-e29b-41d4-a716-446655440000'))
      const entityAsAny = entity as any
      entityAsAny.addDomainEvent(event)

      const events = entity.getDomainEvents() as any
      // The array should be readonly and frozen, so attempting to modify it should throw
      expect(() => {
        events.push(new TestDomainEvent(ID.create('550e8400-e29b-41d4-a716-446655440000')))
      }).toThrow()
    })

    it('should clear domain events', () => {
      const entityAsAny = entity as any
      entityAsAny.addDomainEvent(new TestDomainEvent(ID.create('550e8400-e29b-41d4-a716-446655440000')))
      entityAsAny.addDomainEvent(new TestDomainEvent(ID.create('550e8400-e29b-41d4-a716-446655440000')))

      expect(entity.getDomainEvents()).toHaveLength(3) // One from create, two from addDomainEvent

      entity.clearDomainEvents()

      expect(entity.getDomainEvents()).toHaveLength(0)
    })

    it('should emit events in command methods', () => {
      entity.updateName('New Name')

      const events = entity.getDomainEvents()
      expect(events).toHaveLength(2) // One from create, one from updateName
      expect(events[1]).toBeInstanceOf(TestDomainEvent)
    })
  })

  describe('serialization', () => {
    it('should convert to JSON with recursive serialization', () => {
      const entity = TestEntity.create('Test', 42)
      const json = entity.toJSON()

      expect(json).toEqual({
        id: { value: entity.id.toString() },
        name: 'Test',
        value: 42,
        createdAt: entity.createdAt.toISOString(),
        updatedAt: entity.updatedAt.toISOString(),
      })
    })

    it('should provide string representation', () => {
      const entity = TestEntity.create('Test', 42)
      const str = entity.toString()

      expect(str).toBe(`TestEntity(id=${entity.id.toString()})`)
    })

    it('should provide detailed string representation', () => {
      const entity = TestEntity.create('Test', 42)
      const detailedStr = entity.toDetailedString()

      expect(detailedStr).toContain(`TestEntity(id=${entity.id.toString()}`)
      expect(detailedStr).toContain('name="Test"')
      expect(detailedStr).toContain('value=42')
      expect(detailedStr).toContain('createdAt=')
      expect(detailedStr).toContain('updatedAt=')
    })
  })

  describe('generic Type Support', () => {
    it('should work with ID value object type', () => {
      const entity = TestEntity.create('Test', 42)
      expect(entity.id).toBeInstanceOf(ID)
      expect(typeof entity.id.toString()).toBe('string')
    })

    it('should work with custom entity data type', () => {
      interface CustomEntityData {
        id: ID
        customField: string
        createdAt: Date
        updatedAt: Date
        [key: string]: unknown
      }

      class CustomEntity extends Entity<CustomEntityData> {
        constructor(data: CustomEntityData) {
          super(data)
        }

        get customField(): string {
          return this.data.customField as string
        }
      }

      const entity = new CustomEntity({
        id: ID.generate(),
        customField: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      expect(entity.customField).toBe('test')
      expect(entity.id).toBeInstanceOf(ID)
    })
  })

  describe('error Handling', () => {
    it('should handle null values in equality comparison', () => {
      const entity = TestEntity.create('Test', 42)
      expect(entity.equals(null)).toBe(false)
    })

    it('should handle undefined values in equality comparison', () => {
      const entity = TestEntity.create('Test', 42)
      expect(entity.equals(undefined as any)).toBe(false)
    })
  })

  describe('protected Methods', () => {
    it('should test addDomainEvent using type assertion', () => {
      const entity = TestEntity.create('Test', 42)

      // Cast to any to access protected method
      const entityAsAny = entity as any
      const event = new TestDomainEvent(ID.create('550e8400-e29b-41d4-a716-446655440000'))
      entityAsAny.addDomainEvent(event)

      const events = entity.getDomainEvents()
      expect(events).toHaveLength(2) // One from create, one from addDomainEvent
      expect(events[1]).toBe(event)
    })

    it('should test addDomainEvent using reflection', () => {
      const entity = TestEntity.create('Test', 42)

      // Access protected method through prototype
      const prototype = Object.getPrototypeOf(entity)
      const event = new TestDomainEvent(ID.create('550e8400-e29b-41d4-a716-446655440000'))
      prototype.addDomainEvent.call(entity, event)

      const events = entity.getDomainEvents()
      expect(events).toHaveLength(2) // One from create, one from addDomainEvent
      expect(events[1]).toBe(event)
    })

    it('should test protected methods using test-specific subclass', () => {
      const entity = TestEntityWithExposedProtected.create('Test', 42)

      // Test instance protected method through public wrapper
      const event = new TestDomainEvent(ID.create('550e8400-e29b-41d4-a716-446655440000'))
      entity.addDomainEventPublic(event)

      const events = entity.getDomainEvents()
      expect(events).toHaveLength(2) // One from create, one from addDomainEventPublic
      expect(events[1]).toBe(event)
    })
  })

  describe('performance', () => {
    it('should handle large number of domain events efficiently', () => {
      const entity = TestEntity.create('Test', 42)
      const eventCount = 1000

      // Add many events using type assertion
      const entityAsAny = entity as any
      for (let i = 0; i < eventCount; i++) {
        entityAsAny.addDomainEvent(new TestDomainEvent(ID.create('550e8400-e29b-41d4-a716-446655440000')))
      }

      const events = entity.getDomainEvents()
      expect(events).toHaveLength(eventCount + 1) // +1 for the initial event from create

      // Clear events
      entity.clearDomainEvents()
      expect(entity.getDomainEvents()).toHaveLength(0)
    })

    it('should handle equality comparison efficiently', () => {
      const entity1 = TestEntity.create('Test1', 42)
      const entity2 = TestEntity.create('Test2', 100)

      // Perform many equality checks
      for (let i = 0; i < 1000; i++) {
        entity1.equals(entity2)
      }

      expect(entity1.equals(entity2)).toBe(false)
    })
  })
})
