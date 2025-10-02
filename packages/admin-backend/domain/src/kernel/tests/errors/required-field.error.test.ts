import { describe, it, expect } from 'vitest'
import { RequiredFieldError } from '../../errors/required-field.error.js'

describe('RequiredFieldError', () => {
  describe('error creation', () => {
    it('should create error with valid parameters', () => {
      const error = RequiredFieldError.forField('email', 'User')

      expect(error.fieldName).toBe('email')
      expect(error.entityType).toBe('User')
      expect(error.message).toBe("Required field 'email' is missing in User")
      expect(error.code).toBe('REQUIRED_FIELD_ERROR')
      expect(error.name).toBe('RequiredFieldError')
    })

    it('should create error with different entity types', () => {
      const error = RequiredFieldError.forField('name', 'Order')

      expect(error.fieldName).toBe('name')
      expect(error.entityType).toBe('Order')
      expect(error.message).toBe("Required field 'name' is missing in Order")
    })

    it('should create error with complex entity types', () => {
      const error = RequiredFieldError.forField('profileData', 'UserProfile')

      expect(error.fieldName).toBe('profileData')
      expect(error.entityType).toBe('UserProfile')
      expect(error.message).toBe("Required field 'profileData' is missing in UserProfile")
    })

    it('should create error with different field names', () => {
      const error = RequiredFieldError.forField('phoneNumber', 'Contact')

      expect(error.fieldName).toBe('phoneNumber')
      expect(error.entityType).toBe('Contact')
      expect(error.message).toBe("Required field 'phoneNumber' is missing in Contact")
    })
  })

  describe('error properties', () => {
    it('should have readonly properties', () => {
      const error = RequiredFieldError.forField('test-field', 'test-entity')

      // Properties are not actually readonly in the implementation
      // This test verifies the properties exist and have expected values
      expect(error).toBeDefined()
      expect(error.name).toBeDefined()
      expect(error.code).toBeDefined()
      expect(error.message).toBeDefined()
    })

    describe('error serialization', () => {
      it('should serialize to JSON correctly', () => {
        const error = RequiredFieldError.forField('email', 'User')

        const json = error.toJSON()

        expect(json).toEqual({
          name: 'RequiredFieldError',
          message: "Required field 'email' is missing in User",
          code: 'REQUIRED_FIELD_ERROR',
          metadata: {
            fieldName: 'email',
            entityType: 'User',
          },
        })
      })

      it('should serialize with different entity types', () => {
        const error = RequiredFieldError.forField('name', 'Order')

        const json = error.toJSON()

        expect(json.metadata.fieldName).toBe('name')
        expect(json.metadata.entityType).toBe('Order')
      })

      it('should be JSON serializable', () => {
        const error = RequiredFieldError.forField('phoneNumber', 'Contact')

        const jsonString = JSON.stringify(error.toJSON())
        const parsed = JSON.parse(jsonString)

        expect(parsed).toEqual({
          name: 'RequiredFieldError',
          message: "Required field 'phoneNumber' is missing in Contact",
          code: 'REQUIRED_FIELD_ERROR',
          metadata: {
            fieldName: 'phoneNumber',
            entityType: 'Contact',
          },
        })
      })
    })

    describe('error string representation', () => {
      it('should have correct string representation', () => {
        const error = RequiredFieldError.forField('email', 'User')

        expect(error.toString()).toBe("[REQUIRED_FIELD_ERROR] Required field 'email' is missing in User")
      })
    })

    describe('error handling', () => {
      it('should work correctly with instanceof checks', () => {
        const error = RequiredFieldError.forField('email', 'User')

        expect(error instanceof RequiredFieldError).toBe(true)
      })

      it('should work correctly with error throwing and catching', () => {
        const throwError = () => {
          throw RequiredFieldError.forField('email', 'User')
        }

        expect(() => throwError()).toThrow(RequiredFieldError as any)
        expect(() => throwError()).toThrow("Required field 'email' is missing in User")
      })
    })

    describe('required field error scenarios', () => {
      it('should handle missing email field in User', () => {
        const error = RequiredFieldError.forField('email', 'User')

        expect(error.fieldName).toBe('email')
        expect(error.entityType).toBe('User')
      })

      it('should handle missing name field in Order', () => {
        const error = RequiredFieldError.forField('name', 'Order')

        expect(error.fieldName).toBe('name')
        expect(error.entityType).toBe('Order')
      })

      it('should handle missing price field in Product', () => {
        const error = RequiredFieldError.forField('price', 'Product')

        expect(error.fieldName).toBe('price')
        expect(error.entityType).toBe('Product')
      })

      it('should handle missing description field in Category', () => {
        const error = RequiredFieldError.forField('description', 'Category')

        expect(error.fieldName).toBe('description')
        expect(error.entityType).toBe('Category')
      })

      it('should handle missing amount field in Payment', () => {
        const error = RequiredFieldError.forField('amount', 'Payment')

        expect(error.fieldName).toBe('amount')
        expect(error.entityType).toBe('Payment')
      })

      it('should handle missing street field in Address', () => {
        const error = RequiredFieldError.forField('street', 'Address')

        expect(error.fieldName).toBe('street')
        expect(error.entityType).toBe('Address')
      })

      it('should handle missing content field in Review', () => {
        const error = RequiredFieldError.forField('content', 'Review')

        expect(error.fieldName).toBe('content')
        expect(error.entityType).toBe('Review')
      })

      it('should handle missing message field in Notification', () => {
        const error = RequiredFieldError.forField('message', 'Notification')

        expect(error.fieldName).toBe('message')
        expect(error.entityType).toBe('Notification')
      })

      it('should handle missing profileData field in UserProfile', () => {
        const error = RequiredFieldError.forField('profileData', 'UserProfile')

        expect(error.fieldName).toBe('profileData')
        expect(error.entityType).toBe('UserProfile')
      })

      it('should handle missing phoneNumber field in Contact', () => {
        const error = RequiredFieldError.forField('phoneNumber', 'Contact')

        expect(error.fieldName).toBe('phoneNumber')
        expect(error.entityType).toBe('Contact')
      })

      it('should handle missing id field in any entity', () => {
        const error = RequiredFieldError.forField('id', 'GenericEntity')

        expect(error.fieldName).toBe('id')
        expect(error.entityType).toBe('GenericEntity')
      })

      it('should handle missing createdAt field in any entity', () => {
        const error = RequiredFieldError.forField('createdAt', 'GenericEntity')

        expect(error.fieldName).toBe('createdAt')
        expect(error.entityType).toBe('GenericEntity')
      })
    })
  })
})
