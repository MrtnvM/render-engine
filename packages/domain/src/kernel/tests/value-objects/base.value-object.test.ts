import { describe, it, expect } from 'vitest'
import { ValueObject } from '../../value-objects/index'

// Test implementation of ValueObject for testing purposes
class TestValueObject extends ValueObject<string> {
  constructor(value: string) {
    super(value)
  }

  toJSON(): { value: string } {
    return { value: this.value }
  }

  toPrimitive(): string {
    return this.value
  }
}

class AnotherValueObject extends ValueObject<number> {
  constructor(value: number) {
    super(value)
  }

  toJSON(): { value: number } {
    return { value: this.value }
  }

  toPrimitive(): number {
    return this.value
  }
}

describe('valueObject', () => {
  describe('constructor', () => {
    it('should store the value correctly', () => {
      const valueObject = new TestValueObject('test')
      expect(valueObject.toPrimitive()).toBe('test')
    })
  })

  describe('equals', () => {
    it('should return true for equal value objects', () => {
      const valueObject1 = new TestValueObject('test')
      const valueObject2 = new TestValueObject('test')
      expect(valueObject1.equals(valueObject2)).toBe(true)
    })

    it('should return false for different value objects', () => {
      const valueObject1 = new TestValueObject('test')
      const valueObject2 = new TestValueObject('different')
      expect(valueObject1.equals(valueObject2)).toBe(false)
    })

    it('should return false for null comparison', () => {
      const valueObject = new TestValueObject('test')
      expect(valueObject.equals(null)).toBe(false)
    })

    it('should return false for undefined comparison', () => {
      const valueObject = new TestValueObject('test')
      expect(valueObject.equals(undefined as any)).toBe(false)
    })

    it('should return false for different constructor types', () => {
      const valueObject1 = new TestValueObject('test')
      const valueObject2 = new AnotherValueObject(123)
      expect(valueObject1.equals(valueObject2 as any)).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const valueObject = new TestValueObject('test')
      expect(valueObject.toJSON()).toEqual({ value: 'test' })
    })
  })

  describe('toPrimitive', () => {
    it('should return primitive value', () => {
      const valueObject = new TestValueObject('test')
      expect(valueObject.toPrimitive()).toBe('test')
    })
  })

  describe('toString', () => {
    it('should return string representation', () => {
      const valueObject = new TestValueObject('test')
      expect(valueObject.toString()).toBe('test')
    })

    it('should handle different value types', () => {
      const valueObject = new AnotherValueObject(123)
      expect(valueObject.toString()).toBe('123')
    })
  })

  describe('deepEquals', () => {
    it('should handle primitive values', () => {
      const valueObject1 = new TestValueObject('test')
      const valueObject2 = new TestValueObject('test')
      expect(valueObject1.equals(valueObject2)).toBe(true)
    })

    it('should handle object values', () => {
      class ObjectValueObject extends ValueObject<{ name: string; age: number }> {
        constructor(value: { name: string; age: number }) {
          super(value)
        }

        toJSON(): { value: { name: string; age: number } } {
          return { value: this.value }
        }

        toPrimitive(): { name: string; age: number } {
          return this.value
        }
      }

      const valueObject1 = new ObjectValueObject({ name: 'John', age: 30 })
      const valueObject2 = new ObjectValueObject({ name: 'John', age: 30 })
      const valueObject3 = new ObjectValueObject({ name: 'Jane', age: 30 })

      expect(valueObject1.equals(valueObject2)).toBe(true)
      expect(valueObject1.equals(valueObject3)).toBe(false)
    })

    it('should handle array values', () => {
      class ArrayValueObject extends ValueObject<string[]> {
        constructor(value: string[]) {
          super(value)
        }

        toJSON(): { value: string[] } {
          return { value: this.value }
        }

        toPrimitive(): string[] {
          return this.value
        }
      }

      const valueObject1 = new ArrayValueObject(['a', 'b', 'c'])
      const valueObject2 = new ArrayValueObject(['a', 'b', 'c'])
      const valueObject3 = new ArrayValueObject(['a', 'b', 'd'])

      expect(valueObject1.equals(valueObject2)).toBe(true)
      expect(valueObject1.equals(valueObject3)).toBe(false)
    })

    it('should handle nested object values', () => {
      class NestedValueObject extends ValueObject<{ user: { name: string; details: { age: number } } }> {
        constructor(value: { user: { name: string; details: { age: number } } }) {
          super(value)
        }

        toJSON(): { value: { user: { name: string; details: { age: number } } } } {
          return { value: this.value }
        }

        toPrimitive(): { user: { name: string; details: { age: number } } } {
          return this.value
        }
      }

      const valueObject1 = new NestedValueObject({ user: { name: 'John', details: { age: 30 } } })
      const valueObject2 = new NestedValueObject({ user: { name: 'John', details: { age: 30 } } })
      const valueObject3 = new NestedValueObject({ user: { name: 'John', details: { age: 31 } } })

      expect(valueObject1.equals(valueObject2)).toBe(true)
      expect(valueObject1.equals(valueObject3)).toBe(false)
    })

    it('should handle mixed array and object values', () => {
      class MixedValueObject extends ValueObject<{ items: string[]; config: { enabled: boolean } }> {
        constructor(value: { items: string[]; config: { enabled: boolean } }) {
          super(value)
        }

        toJSON(): { value: { items: string[]; config: { enabled: boolean } } } {
          return { value: this.value }
        }

        toPrimitive(): { items: string[]; config: { enabled: boolean } } {
          return this.value
        }
      }

      const valueObject1 = new MixedValueObject({ items: ['a', 'b'], config: { enabled: true } })
      const valueObject2 = new MixedValueObject({ items: ['a', 'b'], config: { enabled: true } })
      const valueObject3 = new MixedValueObject({ items: ['a', 'c'], config: { enabled: true } })

      expect(valueObject1.equals(valueObject2)).toBe(true)
      expect(valueObject1.equals(valueObject3)).toBe(false)
    })
  })
})
