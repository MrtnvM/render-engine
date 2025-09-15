import { describe, it, expect } from 'vitest'
import { Name } from '../../value-objects/name.vo.js'

describe('Name Value Object', () => {
  describe('create', () => {
    it('should create a valid name', () => {
      const name = Name.create('Valid Schema Name')
      expect(name.value).toBe('Valid Schema Name')
    })

    it('should trim whitespace', () => {
      const name = Name.create('  Trimmed Name  ')
      expect(name.value).toBe('Trimmed Name')
    })

    it('should throw error for name shorter than minimum length', () => {
      expect(() => Name.create('ab')).toThrow('Name must be between 3 and 100 characters')
    })

    it('should throw error for name longer than maximum length', () => {
      const longName = 'a'.repeat(101)
      expect(() => Name.create(longName)).toThrow('Name must be between 3 and 100 characters')
    })

    it('should throw error for empty name', () => {
      expect(() => Name.create('')).toThrow('Name must be between 3 and 100 characters')
    })

    it('should throw error for whitespace-only name', () => {
      expect(() => Name.create('   ')).toThrow('Name must be between 3 and 100 characters')
    })
  })

  describe('equals', () => {
    it('should return true for equal names', () => {
      const name1 = Name.create('Test Name')
      const name2 = Name.create('Test Name')
      expect(name1.equals(name2)).toBe(true)
    })

    it('should return false for different names', () => {
      const name1 = Name.create('Name 1')
      const name2 = Name.create('Name 2')
      expect(name1.equals(name2)).toBe(false)
    })

    it('should return false for null or undefined', () => {
      const name = Name.create('Test Name')
      expect(name.equals(null)).toBe(false)
      expect(name.equals(undefined)).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const name = Name.create('Test Name')
      expect(name.toJSON()).toEqual({ value: 'Test Name' })
    })
  })

  describe('toPrimitive', () => {
    it('should return primitive value', () => {
      const name = Name.create('Test Name')
      expect(name.toPrimitive()).toBe('Test Name')
    })
  })

  describe('toString', () => {
    it('should return string representation', () => {
      const name = Name.create('Test Name')
      expect(name.toString()).toBe('Test Name')
    })
  })

  describe('constants', () => {
    it('should have correct MIN_LENGTH constant', () => {
      expect(Name.MIN_LENGTH).toBe(3)
    })

    it('should have correct MAX_LENGTH constant', () => {
      expect(Name.MAX_LENGTH).toBe(100)
    })
  })
})