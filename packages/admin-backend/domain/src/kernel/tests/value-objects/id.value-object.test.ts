import { describe, it, expect } from 'vitest'
import { ID } from '../../value-objects/id.value-object.js'
import { InvalidValueError } from '../../errors/invalid-value.error.js'

describe('id value object', () => {
  // ===== Factory Methods Tests =====

  describe('id creation', () => {
    it('should create ID with valid UUID string', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      const id = ID.create(uuid)

      expect(id.toString()).toBe(uuid)
      expect(id.toPrimitive()).toBe(uuid)
    })

    it('should generate new UUID when no ID provided', () => {
      const id = ID.create()

      expect(id.toString()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
      expect(id.toPrimitive()).toBe(id.toString())
    })

    it('should throw ValidationError for empty string', () => {
      expect(() => ID.create('')).toThrow("Field 'id' cannot be empty")
      expect(() => ID.create('   ')).toThrow("Field 'id' cannot be empty")
    })

    it('should throw InvalidValueError for invalid UUID format', () => {
      const invalidUuids = [
        'not-a-uuid',
        '550e8400-e29b-41d4-a716-44665544000', // too short
        '550e8400-e29b-41d4-a716-4466554400000', // too long
        '550e8400-e29b-41d4-a716-44665544000g', // invalid character
        '550e8400-e29b-41d4-a716-446655440000-', // extra hyphen
        '550e8400e29b41d4a716446655440000', // no hyphens
        '550e8400-e29b-41d4-a716-44665544000z', // invalid character at end
        'z50e8400-e29b-41d4-a716-446655440000', // invalid character at start
      ]

      invalidUuids.forEach((invalidUuid) => {
        expect(() => ID.create(invalidUuid)).toThrow('Invalid UUID format')
      })
    })

    it('should accept valid UUID format', () => {
      const validUuids = [
        '550e8400-e29b-41d4-a716-446655440000', // v4
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // v1
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8', // v1
        '00000000-0000-4000-8000-000000000000', // v4
        'ffffffff-ffff-ffff-ffff-ffffffffffff', // v4
      ]

      validUuids.forEach((validUuid) => {
        expect(() => ID.create(validUuid)).not.toThrow()
        const id = ID.create(validUuid)
        expect(id.toString()).toBe(validUuid)
      })
    })
  })

  describe('uUID Generation', () => {
    it('should generate new UUID', () => {
      const id = ID.generate()

      expect(id.toString()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('should generate valid UUID v4 format', () => {
      const id = ID.generate()
      const uuid = id.toString()

      // Check version 4 (4th group starts with 4)
      expect(uuid[14]).toBe('4')

      // Check variant (5th group starts with 8, 9, a, or b)
      const variantChar = uuid[19].toLowerCase()
      expect(['8', '9', 'a', 'b']).toContain(variantChar)
    })

    it('should generate different IDs on multiple calls', () => {
      const id1 = ID.generate()
      const id2 = ID.generate()
      const id3 = ID.generate()

      expect(id1.toString()).not.toBe(id2.toString())
      expect(id2.toString()).not.toBe(id3.toString())
      expect(id1.toString()).not.toBe(id3.toString())
    })

    it('should generate unique IDs', () => {
      const ids = new Set<string>()
      const iterations = 1000

      for (let i = 0; i < iterations; i++) {
        const id = ID.generate()
        ids.add(id.toString())
      }

      expect(ids.size).toBe(iterations)
    })
  })

  // ===== Property Accessors Tests =====

  describe('value Access', () => {
    it('should return correct string representation', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      const id = ID.create(uuid)

      expect(id.toString()).toBe(uuid)
    })

    it('should return correct JSON structure', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      const id = ID.create(uuid)
      const json = id.toJSON()

      expect(json).toEqual({ value: uuid })
    })

    it('should return correct primitive value', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      const id = ID.create(uuid)

      expect(id.toPrimitive()).toBe(uuid)
    })
  })

  // ===== Utility Methods Tests =====

  describe('equality Comparison', () => {
    it('should return true for equal IDs', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      const id1 = ID.create(uuid)
      const id2 = ID.create(uuid)

      expect(id1.equals(id2)).toBe(true)
    })

    it('should return false for different IDs', () => {
      const id1 = ID.generate()
      const id2 = ID.generate()

      expect(id1.equals(id2)).toBe(false)
    })

    it('should return false for null comparison', () => {
      const id = ID.generate()

      expect(id.equals(null)).toBe(false)
    })

    it('should return false for undefined comparison', () => {
      const id = ID.generate()

      expect(id.equals(undefined)).toBe(false)
    })

    it('should perform case-sensitive comparison', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      const upperUuid = uuid.toUpperCase()

      const id1 = ID.create(uuid)
      const id2 = ID.create(upperUuid)

      expect(id1.equals(id2)).toBe(false)
    })
  })

  describe('serialization', () => {
    it('should produce valid JSON structure', () => {
      const id = ID.generate()
      const json = id.toJSON()

      expect(json).toHaveProperty('value')
      expect(typeof json.value).toBe('string')
      expect(json.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('should return string value for toPrimitive', () => {
      const id = ID.generate()
      const primitive = id.toPrimitive()

      expect(typeof primitive).toBe('string')
      expect(primitive).toBe(id.toString())
    })
  })

  // ===== Edge Cases Tests =====

  describe('boundary conditions', () => {
    it('should handle minimum valid UUID', () => {
      const minUuid = '00000000-0000-4000-8000-000000000000'
      const id = ID.create(minUuid)

      expect(id.toString()).toBe(minUuid)
    })

    it('should handle maximum valid UUID', () => {
      const maxUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff'
      const id = ID.create(maxUuid)

      expect(id.toString()).toBe(maxUuid)
    })

    it('should handle empty string', () => {
      expect(() => ID.create('')).toThrow("Field 'id' cannot be empty")
    })

    it('should handle null value by generating new UUID', () => {
      const id = ID.create(null as any)
      expect(id.toString()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })

    it('should handle undefined value by generating new UUID', () => {
      const id = ID.create(undefined as any)
      expect(id.toString()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    })

    it('should trim whitespace and validate', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      const id = ID.create(`  ${uuid}  `)

      expect(id.toString()).toBe(uuid)
    })
  })

  describe('error scenarios', () => {
    it('should handle invalid UUID format gracefully', () => {
      expect(() => ID.create('invalid-uuid')).toThrow('Invalid UUID format')
    })

    it('should provide meaningful error messages', () => {
      try {
        ID.create('invalid-uuid')
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidValueError)
        expect((error as InvalidValueError).message).toContain('Invalid UUID format')
      }
    })
  })

  // ===== Performance Tests =====

  describe('performance', () => {
    it('should handle large number of ID generations efficiently', () => {
      const start = performance.now()
      const iterations = 1000

      for (let i = 0; i < iterations; i++) {
        ID.generate()
      }

      const end = performance.now()
      const duration = end - start

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(1000) // 1 second
    })

    it('should handle frequent equality comparisons efficiently', () => {
      const id1 = ID.generate()
      const id2 = ID.generate()
      const start = performance.now()
      const iterations = 10000

      for (let i = 0; i < iterations; i++) {
        id1.equals(id2)
      }

      const end = performance.now()
      const duration = end - start

      // Should complete within reasonable time
      expect(duration).toBeLessThan(100) // 100ms
    })
  })

  // ===== Usage Examples Tests =====

  describe('usage examples', () => {
    it('should work with entity ID pattern', () => {
      const id = ID.generate()

      // Simulate entity usage
      expect(id.toString()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('should work with domain event pattern', () => {
      const aggregateId = ID.generate()

      // Simulate domain event usage
      expect(aggregateId.toString()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('should work with repository pattern', () => {
      const id = ID.generate()

      // Simulate repository usage
      expect(typeof id.toPrimitive()).toBe('string')
      expect(id.toPrimitive()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })
  })
})
