import { describe, it, expect } from 'vitest'
import { Description } from '../../value-objects/description.vo.js'

describe('Description Value Object', () => {
  describe('create', () => {
    it('should create a valid description', () => {
      const description = Description.create('Valid description text')
      expect(description.value).toBe('Valid description text')
    })

    it('should create empty string description for empty string', () => {
      const description = Description.create('')
      expect(description.value).toBe('')
    })

    it('should create empty string description for undefined', () => {
      const description = Description.create()
      expect(description.value).toBe('')
    })

    it('should create empty string description for whitespace-only string', () => {
      const description = Description.create('   ')
      expect(description.value).toBe('')
    })

    it('should trim whitespace from valid description', () => {
      const description = Description.create('  Trimmed Description  ')
      expect(description.value).toBe('Trimmed Description')
    })

    it('should throw error for description longer than maximum length', () => {
      const longDescription = 'a'.repeat(501)
      expect(() => Description.create(longDescription)).toThrow('Description must be less than 500 characters')
    })
  })

  describe('equals', () => {
    it('should return true for equal descriptions', () => {
      const desc1 = Description.create('Same description')
      const desc2 = Description.create('Same description')
      expect(desc1.equals(desc2)).toBe(true)
    })

    it('should return true for two empty descriptions', () => {
      const desc1 = Description.create('')
      const desc2 = Description.create()
      expect(desc1.equals(desc2)).toBe(true)
    })

    it('should return false for different descriptions', () => {
      const desc1 = Description.create('Description 1')
      const desc2 = Description.create('Description 2')
      expect(desc1.equals(desc2)).toBe(false)
    })

    it('should return false for empty vs non-empty descriptions', () => {
      const desc1 = Description.create('Some description')
      const desc2 = Description.create('')
      expect(desc1.equals(desc2)).toBe(false)
    })

    it('should return false for null or undefined', () => {
      const description = Description.create('Test description')
      expect(description.equals(null)).toBe(false)
      expect(description.equals(undefined)).toBe(false)
    })
  })

  describe('toJSON', () => {
    it('should return correct JSON representation for non-null description', () => {
      const description = Description.create('Test description')
      expect(description.toJSON()).toEqual({ value: 'Test description' })
    })

    it('should return correct JSON representation for empty description', () => {
      const description = Description.create('')
      expect(description.toJSON()).toEqual({ value: '' })
    })
  })

  describe('toPrimitive', () => {
    it('should return primitive value for non-null description', () => {
      const description = Description.create('Test description')
      expect(description.toPrimitive()).toBe('Test description')
    })

    it('should return empty string for empty description', () => {
      const description = Description.create('')
      expect(description.toPrimitive()).toBe('')
    })
  })

  describe('toString', () => {
    it('should return string representation for non-null description', () => {
      const description = Description.create('Test description')
      expect(description.toString()).toBe('Test description')
    })

    it('should return empty string for empty description', () => {
      const description = Description.create('')
      expect(description.toString()).toBe('')
    })
  })

  describe('constants', () => {
    it('should have correct MAX_LENGTH constant', () => {
      expect(Description.MAX_LENGTH).toBe(500)
    })
  })
})
