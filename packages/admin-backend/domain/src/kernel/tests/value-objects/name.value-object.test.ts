import { describe, it, expect } from 'vitest'
import { Name } from '../../value-objects/name.value-object.js'
import { ValidationError } from '../../errors/validation.error.js'

describe('Name value object', () => {
  // ===== Factory Methods Tests =====

  describe('name creation', () => {
    it('should create Name with valid string', () => {
      const nameValue = 'John Doe'
      const name = Name.create(nameValue)

      expect(name.toString()).toBe(nameValue)
      expect(name.toPrimitive()).toBe(nameValue)
    })

    it('should trim whitespace from name', () => {
      const nameValue = '  Jane Smith  '
      const name = Name.create(nameValue)

      expect(name.toString()).toBe('Jane Smith')
      expect(name.toPrimitive()).toBe('Jane Smith')
    })

    it('should throw ValidationError for name too short', () => {
      const shortNames = ['ab', 'a', '']

      shortNames.forEach((shortName) => {
        expect(() => Name.create(shortName)).toThrow("Field 'name' failed validation")
        expect(() => Name.create(shortName)).toThrow('length must be between 3 and 100 characters')
      })
    })

    it('should throw ValidationError for name too long', () => {
      const longName = 'a'.repeat(101) // 101 characters

      expect(() => Name.create(longName)).toThrow("Field 'name' failed validation")
      expect(() => Name.create(longName)).toThrow('length must be between 3 and 100 characters')
    })

    it('should accept names at boundary lengths', () => {
      const minName = 'abc' // exactly 3 characters
      const maxName = 'a'.repeat(100) // exactly 100 characters

      expect(() => Name.create(minName)).not.toThrow()
      expect(() => Name.create(maxName)).not.toThrow()

      const name1 = Name.create(minName)
      const name2 = Name.create(maxName)

      expect(name1.toString()).toBe(minName)
      expect(name2.toString()).toBe(maxName)
    })

    it('should accept valid names with various characters', () => {
      const validNames = [
        'John Doe',
        'Jane-Smith',
        "O'Connor",
        'José María',
        '李小明',
        'Name123',
        'Test-Name_With.Special',
        'Multiple   Spaces   Between   Words',
      ]

      validNames.forEach((validName) => {
        expect(() => Name.create(validName)).not.toThrow()
        const name = Name.create(validName)
        expect(name.toString()).toBe(validName.trim())
      })
    })

    it('should handle names with only whitespace', () => {
      const whitespaceNames = ['   ', '\t', '\n', ' \t \n ']

      whitespaceNames.forEach((whitespaceName) => {
        expect(() => Name.create(whitespaceName)).toThrow("Field 'name' failed validation")
        expect(() => Name.create(whitespaceName)).toThrow('length must be between 3 and 100 characters')
      })
    })
  })

  // ===== Property Accessors Tests =====

  describe('value access', () => {
    it('should return correct string representation', () => {
      const nameValue = 'John Doe'
      const name = Name.create(nameValue)

      expect(name.toString()).toBe(nameValue)
    })

    it('should return correct JSON structure', () => {
      const nameValue = 'John Doe'
      const name = Name.create(nameValue)
      const json = name.toJSON()

      expect(json).toEqual({ value: nameValue })
    })

    it('should return correct primitive value', () => {
      const nameValue = 'John Doe'
      const name = Name.create(nameValue)

      expect(name.toPrimitive()).toBe(nameValue)
    })

    it('should have accessible value property', () => {
      const nameValue = 'John Doe'
      const name = Name.create(nameValue)

      expect(name.value).toBe(nameValue)
    })
  })

  // ===== Utility Methods Tests =====

  describe('equality comparison', () => {
    it('should return true for equal names', () => {
      const nameValue = 'John Doe'
      const name1 = Name.create(nameValue)
      const name2 = Name.create(nameValue)

      expect(name1.equals(name2)).toBe(true)
    })

    it('should return false for different names', () => {
      const name1 = Name.create('John Doe')
      const name2 = Name.create('Jane Smith')

      expect(name1.equals(name2)).toBe(false)
    })

    it('should return false for null comparison', () => {
      const name = Name.create('John Doe')

      expect(name.equals(null)).toBe(false)
    })

    it('should return false for undefined comparison', () => {
      const name = Name.create('John Doe')

      expect(name.equals(undefined)).toBe(false)
    })

    it('should perform case-sensitive comparison', () => {
      const name1 = Name.create('John Doe')
      const name2 = Name.create('john doe')

      expect(name1.equals(name2)).toBe(false)
    })

    it('should handle equality with trimmed names', () => {
      const name1 = Name.create('John Doe')
      const name2 = Name.create('  John Doe  ')

      expect(name1.equals(name2)).toBe(true)
    })
  })

  // ===== Serialization Tests =====

  describe('serialization', () => {
    it('should produce valid JSON structure', () => {
      const name = Name.create('John Doe')
      const json = name.toJSON()

      expect(json).toHaveProperty('value')
      expect(typeof json.value).toBe('string')
      expect(json.value).toBe('John Doe')
    })

    it('should preserve data in round-trip serialization', () => {
      const originalName = Name.create('John Doe')
      const json = originalName.toJSON()
      const recreatedName = Name.create(json.value as string)
      const finalJson = recreatedName.toJSON()

      expect(json).toEqual(finalJson)
    })

    it('should return string value for toPrimitive', () => {
      const name = Name.create('John Doe')
      const primitive = name.toPrimitive()

      expect(typeof primitive).toBe('string')
      expect(primitive).toBe(name.toString())
    })
  })

  // ===== Edge Cases Tests =====

  describe('boundary conditions', () => {
    it('should handle minimum valid name length', () => {
      const minName = 'abc'
      const name = Name.create(minName)

      expect(name.toString()).toBe(minName)
    })

    it('should handle maximum valid name length', () => {
      const maxName = 'a'.repeat(100)
      const name = Name.create(maxName)

      expect(name.toString()).toBe(maxName)
    })

    it('should handle empty string', () => {
      expect(() => Name.create('')).toThrow("Field 'name' failed validation")
    })

    it('should handle null value', () => {
      expect(() => Name.create(null as any)).toThrow()
    })

    it('should handle undefined value', () => {
      expect(() => Name.create(undefined as any)).toThrow()
    })

    it('should trim whitespace and validate', () => {
      const nameValue = 'John Doe'
      const name = Name.create(`  ${nameValue}  `)

      expect(name.toString()).toBe(nameValue)
    })

    it('should handle names with special characters', () => {
      const specialNames = ['Jean-Pierre', "O'Malley", 'José María', '李小明', 'François', 'Müller', 'Ñoño']

      specialNames.forEach((specialName) => {
        expect(() => Name.create(specialName)).not.toThrow()
        const name = Name.create(specialName)
        expect(name.toString()).toBe(specialName)
      })
    })
  })

  describe('error scenarios', () => {
    it('should handle invalid name length gracefully', () => {
      expect(() => Name.create('ab')).toThrow("Field 'name' failed validation")
    })

    it('should provide meaningful error messages', () => {
      try {
        Name.create('ab')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect((error as ValidationError).message).toContain("Field 'name' failed validation")
        expect((error as ValidationError).message).toContain('length must be between 3 and 100 characters')
      }
    })

    it('should include field information in error', () => {
      try {
        Name.create('ab')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        const validationError = error as ValidationError
        expect(validationError.fields).toHaveLength(1)
        expect(validationError.fields[0].name).toBe('name')
        expect(validationError.fields[0].value).toBe('ab')
        expect(validationError.fields[0].rule).toContain('length must be between 3 and 100 characters')
      }
    })
  })

  // ===== Performance Tests =====

  describe('performance', () => {
    it('should handle large number of name creations efficiently', () => {
      const start = performance.now()
      const iterations = 1000

      for (let i = 0; i < iterations; i++) {
        Name.create(`Name ${i}`)
      }

      const end = performance.now()
      const duration = end - start

      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000) // 1 second
    })

    it('should handle frequent equality comparisons efficiently', () => {
      const name1 = Name.create('John Doe')
      const name2 = Name.create('Jane Smith')
      const start = performance.now()
      const iterations = 10000

      for (let i = 0; i < iterations; i++) {
        name1.equals(name2)
      }

      const end = performance.now()
      const duration = end - start

      // Should complete within reasonable time
      expect(duration).toBeLessThan(100) // 100ms
    })
  })

  // ===== Usage Examples Tests =====

  describe('usage examples', () => {
    it('should work with entity name pattern', () => {
      const name = Name.create('Project Alpha')

      // Simulate entity usage
      expect(name.toString()).toBe('Project Alpha')
      expect(typeof name.value).toBe('string')
    })

    it('should work with user name pattern', () => {
      const userName = Name.create('John Doe')

      // Simulate user entity usage
      expect(userName.toString()).toMatch(/^[a-z\s]+$/i)
    })

    it('should work with repository pattern', () => {
      const name = Name.create('Repository Name')

      // Simulate repository usage
      expect(typeof name.toPrimitive()).toBe('string')
      expect(name.toPrimitive()).toBe('Repository Name')
    })

    it('should work with domain service pattern', () => {
      const serviceName = Name.create('UserService')

      // Simulate domain service usage
      expect(serviceName.toString()).toBe('UserService')
    })
  })

  // ===== Constants Tests =====

  describe('constants', () => {
    it('should have correct minimum length constant', () => {
      expect(Name.MIN_LENGTH).toBe(3)
    })

    it('should have correct maximum length constant', () => {
      expect(Name.MAX_LENGTH).toBe(100)
    })

    it('should use constants in validation', () => {
      const tooShort = 'a'.repeat(Name.MIN_LENGTH - 1)
      const tooLong = 'a'.repeat(Name.MAX_LENGTH + 1)

      expect(() => Name.create(tooShort)).toThrow()
      expect(() => Name.create(tooLong)).toThrow()
    })
  })
})
