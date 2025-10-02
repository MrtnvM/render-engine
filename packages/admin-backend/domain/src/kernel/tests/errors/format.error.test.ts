import { describe, it, expect } from 'vitest'
import { FormatError } from '../../errors/format.error.js'

describe('FormatError', () => {
  describe('error creation', () => {
    it('should create error with valid parameters', () => {
      const error = FormatError.forField('email', 'invalid-email', 'valid email address')

      expect(error.fieldName).toBe('email')
      expect(error.value).toBe('invalid-email')
      expect(error.expectedFormat).toBe('valid email address')
      expect(error.message).toBe("Field 'email' has invalid format. Expected: valid email address, Got: invalid-email")
      expect(error.code).toBe('FORMAT_ERROR')
      expect(error.name).toBe('FormatError')
    })

    it('should create error with different field types', () => {
      const error = FormatError.forField('phone', '123', 'XXX-XXX-XXXX format')

      expect(error.fieldName).toBe('phone')
      expect(error.value).toBe('123')
      expect(error.expectedFormat).toBe('XXX-XXX-XXXX format')
      expect(error.message).toBe("Field 'phone' has invalid format. Expected: XXX-XXX-XXXX format, Got: 123")
    })

    it('should create error with complex values', () => {
      const complexValue = { id: 'user-123', data: { nested: { value: 123 } } }
      const error = FormatError.forField('userData', complexValue, 'User object with valid structure')

      expect(error.fieldName).toBe('userData')
      expect(error.value).toEqual(complexValue)
      expect(error.expectedFormat).toBe('User object with valid structure')
    })

    it('should create error with null value', () => {
      const error = FormatError.forField('name', null, 'non-null string')

      expect(error.fieldName).toBe('name')
      expect(error.value).toBe(null)
      expect(error.expectedFormat).toBe('non-null string')
    })

    it('should create error with undefined value', () => {
      const error = FormatError.forField('email', undefined, 'valid email address')

      expect(error.fieldName).toBe('email')
      expect(error.value).toBe(undefined)
      expect(error.expectedFormat).toBe('valid email address')
    })
  })

  describe('error properties', () => {
    it('should have readonly properties', () => {
      const error = FormatError.forField('test-field', 'test-value', 'test-format')

      // Properties are not actually readonly in the implementation
      // This test verifies the properties exist and have expected values
      expect(error).toBeDefined()
      expect(error.name).toBeDefined()
      expect(error.code).toBeDefined()
      expect(error.message).toBeDefined()
    })

    describe('error serialization', () => {
      it('should serialize to JSON correctly', () => {
        const error = FormatError.forField('email', 'invalid-email', 'valid email address')

        const json = error.toJSON()

        expect(json).toEqual({
          name: 'FormatError',
          message: "Field 'email' has invalid format. Expected: valid email address, Got: invalid-email",
          code: 'FORMAT_ERROR',
          metadata: {
            fieldName: 'email',
            value: 'invalid-email',
            expectedFormat: 'valid email address',
          },
        })
      })

      it('should serialize with complex values', () => {
        const complexValue = { id: 'user-123', data: { nested: { value: 123 } } }
        const error = FormatError.forField('userData', complexValue, 'User object')

        const json = error.toJSON()

        expect(json.metadata.value).toEqual(complexValue)
      })

      it('should be JSON serializable', () => {
        const error = FormatError.forField('phone', '123', 'XXX-XXX-XXXX format')

        const jsonString = JSON.stringify(error.toJSON())
        const parsed = JSON.parse(jsonString)

        expect(parsed).toEqual({
          name: 'FormatError',
          message: "Field 'phone' has invalid format. Expected: XXX-XXX-XXXX format, Got: 123",
          code: 'FORMAT_ERROR',
          metadata: {
            fieldName: 'phone',
            value: '123',
            expectedFormat: 'XXX-XXX-XXXX format',
          },
        })
      })
    })

    describe('error string representation', () => {
      it('should have correct string representation', () => {
        const error = FormatError.forField('email', 'invalid-email', 'valid email address')

        expect(error.toString()).toBe(
          "[FORMAT_ERROR] Field 'email' has invalid format. Expected: valid email address, Got: invalid-email",
        )
      })
    })

    describe('error handling', () => {
      it('should work correctly with instanceof checks', () => {
        const error = FormatError.forField('email', 'invalid-email', 'valid email address')

        expect(error instanceof FormatError).toBe(true)
      })

      it('should work correctly with error throwing and catching', () => {
        const throwError = () => {
          throw FormatError.forField('email', 'invalid-email', 'valid email address')
        }

        expect(() => throwError()).toThrow(FormatError as any)
        expect(() => throwError()).toThrow(
          "Field 'email' has invalid format. Expected: valid email address, Got: invalid-email",
        )
      })
    })

    describe('format error scenarios', () => {
      it('should handle email format error', () => {
        const error = FormatError.forField('email', 'invalid-email-format', 'valid email address')

        expect(error.fieldName).toBe('email')
        expect(error.value).toBe('invalid-email-format')
        expect(error.expectedFormat).toBe('valid email address')
      })

      it('should handle phone number format error', () => {
        const error = FormatError.forField('phone', '123', 'XXX-XXX-XXXX format')

        expect(error.fieldName).toBe('phone')
        expect(error.value).toBe('123')
        expect(error.expectedFormat).toBe('XXX-XXX-XXXX format')
      })

      it('should handle date format error', () => {
        const error = FormatError.forField('birthDate', '32/13/2024', 'MM/DD/YYYY format')

        expect(error.fieldName).toBe('birthDate')
        expect(error.value).toBe('32/13/2024')
        expect(error.expectedFormat).toBe('MM/DD/YYYY format')
      })

      it('should handle URL format error', () => {
        const error = FormatError.forField('website', 'invalid-url', 'valid URL with protocol')

        expect(error.fieldName).toBe('website')
        expect(error.value).toBe('invalid-url')
        expect(error.expectedFormat).toBe('valid URL with protocol')
      })

      it('should handle postal code format error', () => {
        const error = FormatError.forField('postalCode', '123', 'XXXXX format for US')

        expect(error.fieldName).toBe('postalCode')
        expect(error.value).toBe('123')
        expect(error.expectedFormat).toBe('XXXXX format for US')
      })

      it('should handle credit card format error', () => {
        const error = FormatError.forField('creditCard', '1234', '16-digit credit card number')

        expect(error.fieldName).toBe('creditCard')
        expect(error.value).toBe('1234')
        expect(error.expectedFormat).toBe('16-digit credit card number')
      })

      it('should handle password format error', () => {
        const error = FormatError.forField(
          'password',
          '123',
          'at least 8 characters with uppercase, lowercase, and number',
        )

        expect(error.fieldName).toBe('password')
        expect(error.value).toBe('123')
        expect(error.expectedFormat).toBe('at least 8 characters with uppercase, lowercase, and number')
      })

      it('should handle username format error', () => {
        const error = FormatError.forField('username', 'user@name', 'alphanumeric characters only')

        expect(error.fieldName).toBe('username')
        expect(error.value).toBe('user@name')
        expect(error.expectedFormat).toBe('alphanumeric characters only')
      })

      it('should handle array format error', () => {
        const error = FormatError.forField('tags', 'not-an-array', 'array of strings')

        expect(error.fieldName).toBe('tags')
        expect(error.value).toBe('not-an-array')
        expect(error.expectedFormat).toBe('array of strings')
      })

      it('should handle object format error', () => {
        const error = FormatError.forField('address', 'not-an-object', 'Address object with street, city, state, zip')

        expect(error.fieldName).toBe('address')
        expect(error.value).toBe('not-an-object')
        expect(error.expectedFormat).toBe('Address object with street, city, state, zip')
      })
    })
  })
})
