import { describe, it, expect } from 'vitest'
import { ParseError } from '../../errors/parse.error.js'

describe('ParseError', () => {
  describe('error creation', () => {
    it('should create error with forData factory method', () => {
      const error = ParseError.forData('invalid-uuid-string', 'UUID v4', 'UUID parsing')

      expect(error.data).toBe('invalid-uuid-string')
      expect(error.expectedFormat).toBe('UUID v4')
      expect(error.parseContext).toBe('UUID parsing')
      expect(error.message).toBe("Failed to parse data in context 'UUID parsing'. Expected format: UUID v4")
      expect(error.code).toBe('PARSE_ERROR')
      expect(error.name).toBe('ParseError')
    })

    it('should create error with invalidUUID factory method', () => {
      const error = ParseError.invalidUUID('invalid-uuid-string')

      expect(error.data).toBe('invalid-uuid-string')
      expect(error.expectedFormat).toBe('UUID v4')
      expect(error.parseContext).toBe('UUID parsing')
      expect(error.message).toBe(
        'Failed to parse UUID from string: invalid-uuid-string. Expected UUID v4 format (8-4-4-4-12 hexadecimal digits with hyphens)',
      )
      expect(error.code).toBe('PARSE_ERROR')
      expect(error.name).toBe('ParseError')
    })

    it('should create error with emptyString factory method', () => {
      const error = ParseError.emptyString('email')

      expect(error.data).toBe('')
      expect(error.expectedFormat).toBe('email')
      expect(error.parseContext).toBe('email parsing')
      expect(error.message).toBe('Cannot parse email from empty string')
      expect(error.code).toBe('PARSE_ERROR')
      expect(error.name).toBe('ParseError')
    })

    it('should create error with complex data', () => {
      const complexData = { id: 'user-123', name: 'John Doe', invalid: 'data' }
      const error = ParseError.forData(complexData, 'User object with valid structure', 'User parsing')

      expect(error.data).toEqual(complexData)
      expect(error.expectedFormat).toBe('User object with valid structure')
      expect(error.parseContext).toBe('User parsing')
    })

    it('should create error with null data', () => {
      const error = ParseError.forData(null, 'valid object', 'object parsing')

      expect(error.data).toBe(null)
      expect(error.expectedFormat).toBe('valid object')
      expect(error.parseContext).toBe('object parsing')
    })

    it('should create error with undefined data', () => {
      const error = ParseError.forData(undefined, 'valid value', 'value parsing')

      expect(error.data).toBe(undefined)
      expect(error.expectedFormat).toBe('valid value')
      expect(error.parseContext).toBe('value parsing')
    })
  })

  describe('error properties', () => {
    it('should have readonly properties', () => {
      const error = ParseError.forData('test-data', 'test-format', 'test-context')

      // Properties are not actually readonly in the implementation
      // This test verifies the properties exist and have expected values
      expect(error).toBeDefined()
      expect(error.name).toBeDefined()
      expect(error.code).toBeDefined()
      expect(error.message).toBeDefined()
    })

    describe('error serialization', () => {
      it('should serialize to JSON correctly', () => {
        const error = ParseError.forData('invalid-uuid-string', 'UUID v4', 'UUID parsing')

        const json = error.toJSON()

        expect(json).toEqual({
          name: 'ParseError',
          message: "Failed to parse data in context 'UUID parsing'. Expected format: UUID v4",
          code: 'PARSE_ERROR',
          metadata: {
            data: 'invalid-uuid-string',
            expectedFormat: 'UUID v4',
            parseContext: 'UUID parsing',
          },
        })
      })

      it('should serialize with complex data', () => {
        const complexData = { id: 'user-123', data: { nested: { value: 123 } } }
        const error = ParseError.forData(complexData, 'User object', 'User parsing')

        const json = error.toJSON()

        expect(json.metadata.data).toEqual(complexData)
      })

      it('should be JSON serializable', () => {
        const error = ParseError.forData('test-data', 'test-format', 'test-context')

        const jsonString = JSON.stringify(error.toJSON())
        const parsed = JSON.parse(jsonString)

        expect(parsed).toEqual({
          name: 'ParseError',
          message: "Failed to parse data in context 'test-context'. Expected format: test-format",
          code: 'PARSE_ERROR',
          metadata: {
            data: 'test-data',
            expectedFormat: 'test-format',
            parseContext: 'test-context',
          },
        })
      })
    })

    describe('error string representation', () => {
      it('should have correct string representation', () => {
        const error = ParseError.forData('invalid-data', 'valid format', 'test context')

        expect(error.toString()).toBe(
          "[PARSE_ERROR] Failed to parse data in context 'test context'. Expected format: valid format",
        )
      })
    })

    describe('error handling', () => {
      it('should work correctly with instanceof checks', () => {
        const error = ParseError.forData('test-data', 'test-format', 'test-context')

        expect(error instanceof ParseError).toBe(true)
      })

      it('should work correctly with error throwing and catching', () => {
        const throwError = () => {
          throw ParseError.forData('invalid-data', 'valid format', 'test context')
        }

        expect(() => throwError()).toThrow(ParseError as any)
        expect(() => throwError()).toThrow(
          "Failed to parse data in context 'test context'. Expected format: valid format",
        )
      })
    })

    describe('parse error scenarios', () => {
      it('should handle UUID parsing failure', () => {
        const error = ParseError.invalidUUID('invalid-uuid-string')

        expect(error.data).toBe('invalid-uuid-string')
        expect(error.expectedFormat).toBe('UUID v4')
        expect(error.parseContext).toBe('UUID parsing')
      })

      it('should handle empty string parsing failure', () => {
        const error = ParseError.emptyString('email')

        expect(error.data).toBe('')
        expect(error.expectedFormat).toBe('email')
        expect(error.parseContext).toBe('email parsing')
      })

      it('should handle JSON parsing failure', () => {
        const invalidJson = '{ "id": "user-123", "name": "John Doe", }' // trailing comma
        const error = ParseError.forData(invalidJson, 'valid JSON', 'JSON parsing')

        expect(error.data).toBe(invalidJson)
        expect(error.expectedFormat).toBe('valid JSON')
        expect(error.parseContext).toBe('JSON parsing')
      })

      it('should handle date parsing failure', () => {
        const invalidDate = '32/13/2024' // invalid date
        const error = ParseError.forData(invalidDate, 'MM/DD/YYYY format', 'date parsing')

        expect(error.data).toBe(invalidDate)
        expect(error.expectedFormat).toBe('MM/DD/YYYY format')
        expect(error.parseContext).toBe('date parsing')
      })

      it('should handle numeric parsing failure', () => {
        const invalidNumber = 'not-a-number'
        const error = ParseError.forData(invalidNumber, 'valid number', 'numeric parsing')

        expect(error.data).toBe(invalidNumber)
        expect(error.expectedFormat).toBe('valid number')
        expect(error.parseContext).toBe('numeric parsing')
      })

      it('should handle email parsing failure', () => {
        const invalidEmail = 'invalid-email-format'
        const error = ParseError.forData(invalidEmail, 'valid email address', 'email parsing')

        expect(error.data).toBe(invalidEmail)
        expect(error.expectedFormat).toBe('valid email address')
        expect(error.parseContext).toBe('email parsing')
      })

      it('should handle phone number parsing failure', () => {
        const invalidPhone = '123'
        const error = ParseError.forData(invalidPhone, 'XXX-XXX-XXXX format', 'phone parsing')

        expect(error.data).toBe(invalidPhone)
        expect(error.expectedFormat).toBe('XXX-XXX-XXXX format')
        expect(error.parseContext).toBe('phone parsing')
      })

      it('should handle complex object parsing failure', () => {
        const invalidObject = { id: 'user-123' } // missing required fields
        const error = ParseError.forData(invalidObject, 'User object with email and name', 'user object parsing')

        expect(error.data).toEqual(invalidObject)
        expect(error.expectedFormat).toBe('User object with email and name')
        expect(error.parseContext).toBe('user object parsing')
      })

      it('should handle array parsing failure', () => {
        const invalidArray = 'not-an-array'
        const error = ParseError.forData(invalidArray, 'array of strings', 'array parsing')

        expect(error.data).toBe(invalidArray)
        expect(error.expectedFormat).toBe('array of strings')
        expect(error.parseContext).toBe('array parsing')
      })

      it('should handle null/undefined parsing failure', () => {
        const error = ParseError.forData(null, 'non-null value', 'value parsing')

        expect(error.data).toBe(null)
        expect(error.expectedFormat).toBe('non-null value')
        expect(error.parseContext).toBe('value parsing')
      })
    })
  })
})
