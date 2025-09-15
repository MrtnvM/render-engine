import { describe, it, expect, beforeEach } from 'vitest'
import { DomainEvent } from '../../events/index.js'
import { Entity } from '../../entities/index.js'
import { ID } from 'src/kernel/value-objects/id.value-object.js'
import { ValueObject } from '../../value-objects/base.value-object.js'

// Alias for BaseEntity to match existing code
const BaseEntity = Entity

// Test domain event for testing
class TestDomainEvent extends DomainEvent {
  static readonly eventName = 'test.event'
  readonly eventName = TestDomainEvent.eventName

  constructor(aggregateId: ID, occurredAt?: Date) {
    super({ aggregateId, eventName: TestDomainEvent.eventName, payload: {}, occurredAt })
  }
}

// Test-specific subclass that exposes protected methods for testing
class TestEntityWithExposedProtected extends Entity {
  private _name: string
  private _value: number

  private constructor(id: ID, name: string, value: number, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt)
    this._name = name
    this._value = value
  }

  static create(name: string, value: number): TestEntityWithExposedProtected {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required')
    }
    if (value < 0) {
      throw new Error('Value must be non-negative')
    }

    const entity = new TestEntityWithExposedProtected(ID.generate(), name.trim(), value)
    entity.addDomainEvent(new TestDomainEvent(entity.id))
    return entity
  }

  // Expose protected methods for testing
  public addDomainEventPublic(event: DomainEvent): void {
    this.addDomainEvent(event)
  }

  public static generateIdPublic(): string {
    return Entity.generateId()
  }

  get name(): string {
    return this._name
  }

  get value(): number {
    return this._value
  }

  toJSON(): object {
    return {
      id: this.id.toPrimitive(),
      name: this._name,
      value: this._value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  toPrimitive(): object {
    return this.toJSON()
  }

  isValid(): boolean {
    return this._name.trim().length > 0 && this._value >= 0
  }

  getBusinessRules(): string[] {
    return ['Name must not be empty', 'Value must be non-negative', 'Entity must have unique ID']
  }

  validateInvariants(): void {
    if (this._name.trim().length === 0) {
      throw new Error('Name is required')
    }
    if (this._value < 0) {
      throw new Error('Value must be non-negative')
    }
  }
}

// Concrete implementation for testing
class TestEntity extends Entity {
  private _name: string
  private _value: number

  private constructor(id: ID, name: string, value: number, createdAt?: Date, updatedAt?: Date) {
    super(id, createdAt, updatedAt)
    this._name = name
    this._value = value
  }

  static create(name: string, value: number): TestEntity {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required')
    }
    if (value < 0) {
      throw new Error('Value must be non-negative')
    }

    const entity = new TestEntity(ID.generate(), name.trim(), value)

    entity.addDomainEvent(new TestDomainEvent(entity.id))
    return entity
  }

  static fromPersistence(id: string, name: string, value: number, createdAt: Date, updatedAt: Date): TestEntity {
    return new TestEntity(ID.create(id), name, value, createdAt, updatedAt)
  }

  get name(): string {
    return this._name
  }

  get value(): number {
    return this._value
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Name is required')
    }
    this._name = newName.trim()
    this.addDomainEvent(new TestDomainEvent(this.id))
  }

  updateValue(newValue: number): void {
    if (newValue < 0) {
      throw new Error('Value must be non-negative')
    }
    this._value = newValue
    this.addDomainEvent(new TestDomainEvent(this.id))
  }

  toJSON(): object {
    return {
      id: this.id.toPrimitive(),
      name: this._name,
      value: this._value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }

  toPrimitive(): object {
    return this.toJSON()
  }

  isValid(): boolean {
    return this._name.trim().length > 0 && this._value >= 0
  }

  getBusinessRules(): string[] {
    return ['Name must not be empty', 'Value must be non-negative', 'Entity must have unique ID']
  }

  validateInvariants(): void {
    if (this._name.trim().length === 0) {
      throw new Error('Name is required')
    }
    if (this._value < 0) {
      throw new Error('Value must be non-negative')
    }
  }
}

describe('baseEntity', () => {
  describe('constructor', () => {
    it('should create entity with provided ID and timestamps', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000'
      const createdAt = new Date('2023-01-01T00:00:00Z')
      const updatedAt = new Date('2023-01-02T00:00:00Z')

      const entity = TestEntity.fromPersistence(id, 'Test', 42, createdAt, updatedAt)

      expect(entity.id.toPrimitive()).toBe(id)
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

      // This should not compile if ID is properly readonly
      expect(() => {
        // @ts-expect-error - Testing readonly property
        entity.id = 'new-id'
      }).toThrow()
    })
  })

  describe('identity Management', () => {
    it('should provide access to ID through getter', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000'
      const entity = TestEntity.fromPersistence(id, 'Test', 42, new Date(), new Date())

      expect(entity.id.toPrimitive()).toBe(id)
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
      class DifferentEntity extends Entity {
        constructor(id: ID) {
          super(id)
        }

        toJSON(): object {
          return { id: this.id }
        }

        toPrimitive(): object {
          return this.toJSON()
        }

        isValid(): boolean {
          return true
        }

        getBusinessRules(): string[] {
          return []
        }

        validateInvariants(): void {
          // No validation
        }
      }

      const entity1 = TestEntity.create('Test', 42)
      const entity2 = new DifferentEntity(entity1.id)

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
    it('should convert to JSON', () => {
      const entity = TestEntity.create('Test', 42)
      const json = entity.toJSON()

      expect(json).toEqual({
        id: entity.id.toPrimitive(),
        name: 'Test',
        value: 42,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      })
    })

    it('should convert to primitive', () => {
      const entity = TestEntity.create('Test', 42)
      const primitive = entity.toPrimitive()

      expect(primitive).toEqual({
        id: entity.id.toPrimitive(),
        name: 'Test',
        value: 42,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      })
    })

    it('should provide string representation', () => {
      const entity = TestEntity.create('Test', 42)
      const str = entity.toString()

      expect(str).toBe(`TestEntity(id=${entity.id.toPrimitive()})`)
    })
  })

  describe('utility Methods', () => {
    it('should generate unique IDs', () => {
      // Access static protected method through type assertion
      const BaseEntityAsAny = BaseEntity as any
      const id1 = BaseEntityAsAny.generateId()
      const id2 = BaseEntityAsAny.generateId()

      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
    })

    it('should generate UUID format IDs', () => {
      // Access static protected method through type assertion
      const BaseEntityAsAny = BaseEntity as any
      const id = BaseEntityAsAny.generateId()
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      expect(id).toMatch(uuidRegex)
    })
  })

  describe('abstract Methods', () => {
    let entity: TestEntity

    beforeEach(() => {
      entity = TestEntity.create('Test', 42)
    })

    it('should implement isValid method', () => {
      expect(entity.isValid()).toBe(true)

      const invalidEntity = TestEntity.fromPersistence(
        '550e8400-e29b-41d4-a716-446655440000',
        '',
        -1,
        new Date(),
        new Date(),
      )
      expect(invalidEntity.isValid()).toBe(false)
    })

    it('should implement getBusinessRules method', () => {
      const rules = entity.getBusinessRules()

      expect(Array.isArray(rules)).toBe(true)
      expect(rules).toContain('Name must not be empty')
      expect(rules).toContain('Value must be non-negative')
      expect(rules).toContain('Entity must have unique ID')
    })

    it('should implement validateInvariants method', () => {
      expect(() => entity.validateInvariants()).not.toThrow()

      const invalidEntity = TestEntity.fromPersistence(
        '550e8400-e29b-41d4-a716-446655440000',
        '',
        -1,
        new Date(),
        new Date(),
      )
      expect(() => invalidEntity.validateInvariants()).toThrow('Name is required')
    })
  })

  describe('generic Type Support', () => {
    it('should work with string ID type', () => {
      const entity = TestEntity.create('Test', 42)
      expect(typeof entity.id.toPrimitive()).toBe('string')
    })

    it('should work with custom ID type', () => {
      class CustomIdValueObject extends ValueObject<number> {
        constructor(value: number) {
          super(value)
        }

        get value(): number {
          return this._value
        }

        equals(other: ValueObject<number> | null | undefined): boolean {
          if (!other) return false
          return this._value === (other as CustomIdValueObject)._value
        }

        toJSON(): object {
          return { value: this._value }
        }

        toPrimitive(): number {
          return this._value
        }
      }

      class CustomIdEntity extends Entity<CustomIdValueObject> {
        constructor(id: CustomIdValueObject) {
          super(id)
        }

        toJSON(): object {
          return { id: this.id.value }
        }

        toPrimitive(): object {
          return this.toJSON()
        }

        isValid(): boolean {
          return true
        }

        getBusinessRules(): string[] {
          return []
        }

        validateInvariants(): void {
          // No validation
        }
      }

      const entity = new CustomIdEntity(new CustomIdValueObject(123))
      expect(typeof entity.id.value).toBe('number')
      expect(entity.id.value).toBe(123)
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

    it('should test static generateId using type assertion', () => {
      // Access static protected method through type assertion
      const BaseEntityAsAny = Entity as any
      const id1 = BaseEntityAsAny.generateId()
      const id2 = BaseEntityAsAny.generateId()

      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')

      // Verify UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      expect(id1).toMatch(uuidRegex)
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

      // Test static protected method through public wrapper
      const id1 = TestEntityWithExposedProtected.generateIdPublic()
      const id2 = TestEntityWithExposedProtected.generateIdPublic()

      expect(id1).toBeDefined()
      expect(id2).toBeDefined()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
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
