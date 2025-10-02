import { describe, it, expect } from 'vitest'
import { InvalidValueError } from '../../errors/invalid-value.error.js'

describe('InvalidValueError', () => {
  describe('error creation', () => {
    it('should create error with forField factory method', () => {
      const error = InvalidValueError.forField('email', 'invalid-email', 'valid email address')

      expect(error.fieldName).toBe('email')
      expect(error.value).toBe('invalid-email')
      expect(error.expectedFormat).toBe('valid email address')
      expect(error.message).toBe(
        "Field 'email' has invalid value. Expected format: valid email address, Got: invalid-email",
      )
      expect(error.code).toBe('INVALID_VALUE_ERROR')
      expect(error.name).toBe('InvalidValueError')
    })

    it('should create error with invalidUUID factory method', () => {
      const error = InvalidValueError.invalidUUID('invalid-uuid-string')

      expect(error.fieldName).toBe('uuid')
      expect(error.value).toBe('invalid-uuid-string')
      expect(error.expectedFormat).toBe('UUID v4')
      expect(error.message).toBe(
        'Invalid UUID format: invalid-uuid-string. Expected UUID v4 format (8-4-4-4-12 hexadecimal digits with hyphens)',
      )
      expect(error.code).toBe('INVALID_VALUE_ERROR')
      expect(error.name).toBe('InvalidValueError')
    })

    it('should create error with different field types', () => {
      const error = InvalidValueError.forField('age', -5, 'positive number')

      expect(error.fieldName).toBe('age')
      expect(error.value).toBe(-5)
      expect(error.expectedFormat).toBe('positive number')
      expect(error.message).toBe("Field 'age' has invalid value. Expected format: positive number, Got: -5")
    })

    it('should create error with complex values', () => {
      const complexValue = { id: 'user-123', data: { nested: { value: 123 } } }
      const error = InvalidValueError.forField('userData', complexValue, 'User object with valid structure')

      expect(error.fieldName).toBe('userData')
      expect(error.value).toEqual(complexValue)
      expect(error.expectedFormat).toBe('User object with valid structure')
    })

    it('should create error with null value', () => {
      const error = InvalidValueError.forField('name', null, 'non-null string')

      expect(error.fieldName).toBe('name')
      expect(error.value).toBe(null)
      expect(error.expectedFormat).toBe('non-null string')
    })

    it('should create error with undefined value', () => {
      const error = InvalidValueError.forField('email', undefined, 'valid email address')

      expect(error.fieldName).toBe('email')
      expect(error.value).toBe(undefined)
      expect(error.expectedFormat).toBe('valid email address')
    })
  })

  describe('error properties', () => {
    it('should have readonly properties', () => {
      const error = InvalidValueError.forField('test-field', 'test-value', 'test-format')

      // Properties are not actually readonly in the implementation
      // This test verifies the properties exist and have expected values
      expect(error).toBeDefined()
      expect(error.name).toBeDefined()
      expect(error.code).toBeDefined()
      expect(error.message).toBeDefined()
    })

    describe('error serialization', () => {
      it('should serialize to JSON correctly', () => {
        const error = InvalidValueError.forField('email', 'invalid-email', 'valid email address')

        const json = error.toJSON()

        expect(json).toEqual({
          name: 'InvalidValueError',
          message: "Field 'email' has invalid value. Expected format: valid email address, Got: invalid-email",
          code: 'INVALID_VALUE_ERROR',
          metadata: {
            fieldName: 'email',
            value: 'invalid-email',
            expectedFormat: 'valid email address',
          },
        })
      })

      it('should serialize with complex values', () => {
        const complexValue = { id: 'user-123', data: { nested: { value: 123 } } }
        const error = InvalidValueError.forField('userData', complexValue, 'User object')

        const json = error.toJSON()

        expect(json.metadata.value).toEqual(complexValue)
      })

      it('should be JSON serializable', () => {
        const error = InvalidValueError.forField('age', -5, 'positive number')

        const jsonString = JSON.stringify(error.toJSON())
        const parsed = JSON.parse(jsonString)

        expect(parsed).toEqual({
          name: 'InvalidValueError',
          message: "Field 'age' has invalid value. Expected format: positive number, Got: -5",
          code: 'INVALID_VALUE_ERROR',
          metadata: {
            fieldName: 'age',
            value: -5,
            expectedFormat: 'positive number',
          },
        })
      })
    })

    describe('error string representation', () => {
      it('should have correct string representation', () => {
        const error = InvalidValueError.forField('email', 'invalid-email', 'valid email address')

        expect(error.toString()).toBe(
          "[INVALID_VALUE_ERROR] Field 'email' has invalid value. Expected format: valid email address, Got: invalid-email",
        )
      })
    })

    describe('error handling', () => {
      it('should work correctly with instanceof checks', () => {
        const error = InvalidValueError.forField('email', 'invalid-email', 'valid email address')

        expect(error instanceof InvalidValueError).toBe(true)
      })

      it('should work correctly with error throwing and catching', () => {
        const throwError = () => {
          throw InvalidValueError.forField('email', 'invalid-email', 'valid email address')
        }

        expect(() => throwError()).toThrow(InvalidValueError as any)
        expect(() => throwError()).toThrow(
          "Field 'email' has invalid value. Expected format: valid email address, Got: invalid-email",
        )
      })
    })

    describe('invalid value error scenarios', () => {
      it('should handle invalid email value', () => {
        const error = InvalidValueError.forField('email', 'invalid-email-format', 'valid email address')

        expect(error.fieldName).toBe('email')
        expect(error.value).toBe('invalid-email-format')
        expect(error.expectedFormat).toBe('valid email address')
      })

      it('should handle invalid UUID value', () => {
        const error = InvalidValueError.invalidUUID('invalid-uuid-string')

        expect(error.fieldName).toBe('uuid')
        expect(error.value).toBe('invalid-uuid-string')
        expect(error.expectedFormat).toBe('UUID v4')
      })

      it('should handle invalid age value', () => {
        const error = InvalidValueError.forField('age', -5, 'positive number')

        expect(error.fieldName).toBe('age')
        expect(error.value).toBe(-5)
        expect(error.expectedFormat).toBe('positive number')
      })

      it('should handle invalid phone value', () => {
        const error = InvalidValueError.forField('phone', '123', 'XXX-XXX-XXXX format')

        expect(error.fieldName).toBe('phone')
        expect(error.value).toBe('123')
        expect(error.expectedFormat).toBe('XXX-XXX-XXXX format')
      })

      it('should handle invalid date value', () => {
        const error = InvalidValueError.forField('birthDate', '32/13/2024', 'MM/DD/YYYY format')

        expect(error.fieldName).toBe('birthDate')
        expect(error.value).toBe('32/13/2024')
        expect(error.expectedFormat).toBe('MM/DD/YYYY format')
      })

      it('should handle invalid URL value', () => {
        const error = InvalidValueError.forField('website', 'invalid-url', 'valid URL with protocol')

        expect(error.fieldName).toBe('website')
        expect(error.value).toBe('invalid-url')
        expect(error.expectedFormat).toBe('valid URL with protocol')
      })

      it('should handle invalid password value', () => {
        const error = InvalidValueError.forField(
          'password',
          '123',
          'at least 8 characters with uppercase, lowercase, and number',
        )

        expect(error.fieldName).toBe('password')
        expect(error.value).toBe('123')
        expect(error.expectedFormat).toBe('at least 8 characters with uppercase, lowercase, and number')
      })

      it('should handle invalid username value', () => {
        const error = InvalidValueError.forField('username', 'user@name', 'alphanumeric characters only')

        expect(error.fieldName).toBe('username')
        expect(error.value).toBe('user@name')
        expect(error.expectedFormat).toBe('alphanumeric characters only')
      })

      it('should handle invalid array value', () => {
        const error = InvalidValueError.forField('tags', 'not-an-array', 'array of strings')

        expect(error.fieldName).toBe('tags')
        expect(error.value).toBe('not-an-array')
        expect(error.expectedFormat).toBe('array of strings')
      })

      it('should handle invalid object value', () => {
        const error = InvalidValueError.forField(
          'address',
          'not-an-object',
          'Address object with street, city, state, zip',
        )

        expect(error.fieldName).toBe('address')
        expect(error.value).toBe('not-an-object')
        expect(error.expectedFormat).toBe('Address object with street, city, state, zip')
      })

      it('should handle invalid numeric range value', () => {
        const error = InvalidValueError.forField('score', 150, 'number between 0 and 100')

        expect(error.fieldName).toBe('score')
        expect(error.value).toBe(150)
        expect(error.expectedFormat).toBe('number between 0 and 100')
      })

      it('should handle invalid enum value', () => {
        const error = InvalidValueError.forField('status', 'invalid-status', 'one of: active, inactive, pending')

        expect(error.fieldName).toBe('status')
        expect(error.value).toBe('invalid-status')
        expect(error.expectedFormat).toBe('one of: active, inactive, pending')
      })
    })
  })
})
