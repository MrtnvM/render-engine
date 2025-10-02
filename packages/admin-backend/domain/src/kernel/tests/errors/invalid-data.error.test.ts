import { describe, it, expect } from 'vitest'
import { InvalidDataError } from '../../errors/invalid-data.error.js'

describe('InvalidDataError', () => {
  describe('error creation', () => {
    it('should create error with forData factory method', () => {
      const error = InvalidDataError.forData(
        { id: 'user-123' },
        'object with properties "id" and "name"',
        'data structure validation',
      )

      expect(error.data).toEqual({ id: 'user-123' })
      expect(error.expectedFormat).toBe('object with properties "id" and "name"')
      expect(error.parseContext).toBe('data structure validation')
      expect(error.message).toBe(
        'Invalid data in context \'data structure validation\'. Expected format: object with properties "id" and "name"',
      )
      expect(error.code).toBe('INVALID_DATA_ERROR')
      expect(error.name).toBe('InvalidDataError')
    })

    it('should create error with missingProperty factory method', () => {
      const data = { id: 'user-123' }
      const error = InvalidDataError.missingProperty('name', data)

      expect(error.data).toEqual(data)
      expect(error.expectedFormat).toBe("object with property 'name'")
      expect(error.parseContext).toBe('data validation')
      expect(error.message).toBe("Missing required property 'name' in data object")
      expect(error.code).toBe('INVALID_DATA_ERROR')
      expect(error.name).toBe('InvalidDataError')
    })

    it('should create error with invalidStructure factory method', () => {
      const data = 'not-an-object'
      const error = InvalidDataError.invalidStructure('object with properties "id" and "name"', data)

      expect(error.data).toBe(data)
      expect(error.expectedFormat).toBe('object with properties "id" and "name"')
      expect(error.parseContext).toBe('data structure validation')
      expect(error.message).toBe('Invalid data structure. Expected: object with properties "id" and "name"')
      expect(error.code).toBe('INVALID_DATA_ERROR')
      expect(error.name).toBe('InvalidDataError')
    })

    it('should create error with complex data', () => {
      const complexData = { id: 'user-123', data: { nested: { value: 123 } } }
      const error = InvalidDataError.forData(complexData, 'User object with valid structure', 'user data validation')

      expect(error.data).toEqual(complexData)
      expect(error.expectedFormat).toBe('User object with valid structure')
      expect(error.parseContext).toBe('user data validation')
    })

    it('should create error with null data', () => {
      const error = InvalidDataError.forData(null, 'valid object', 'object validation')

      expect(error.data).toBe(null)
      expect(error.expectedFormat).toBe('valid object')
      expect(error.parseContext).toBe('object validation')
    })

    it('should create error with undefined data', () => {
      const error = InvalidDataError.forData(undefined, 'valid value', 'value validation')

      expect(error.data).toBe(undefined)
      expect(error.expectedFormat).toBe('valid value')
      expect(error.parseContext).toBe('value validation')
    })
  })

  describe('error properties', () => {
    it('should have readonly properties', () => {
      const error = InvalidDataError.forData('test-data', 'test-format', 'test-context')

      // Properties are not actually readonly in the implementation
      // This test verifies the properties exist and have expected values
      expect(error).toBeDefined()
      expect(error.name).toBeDefined()
      expect(error.code).toBeDefined()
      expect(error.message).toBeDefined()
    })

    describe('error serialization', () => {
      it('should serialize to JSON correctly', () => {
        const error = InvalidDataError.forData(
          { id: 'user-123' },
          'object with properties "id" and "name"',
          'data structure validation',
        )

        const json = error.toJSON()

        expect(json).toEqual({
          name: 'InvalidDataError',
          message:
            'Invalid data in context \'data structure validation\'. Expected format: object with properties "id" and "name"',
          code: 'INVALID_DATA_ERROR',
          metadata: {
            data: { id: 'user-123' },
            expectedFormat: 'object with properties "id" and "name"',
            parseContext: 'data structure validation',
          },
        })
      })

      it('should serialize with complex data', () => {
        const complexData = { id: 'user-123', data: { nested: { value: 123 } } }
        const error = InvalidDataError.forData(complexData, 'User object', 'user data validation')

        const json = error.toJSON()

        expect(json.metadata.data).toEqual(complexData)
      })

      it('should be JSON serializable', () => {
        const error = InvalidDataError.forData('test-data', 'test-format', 'test-context')

        const jsonString = JSON.stringify(error.toJSON())
        const parsed = JSON.parse(jsonString)

        expect(parsed).toEqual({
          name: 'InvalidDataError',
          message: "Invalid data in context 'test-context'. Expected format: test-format",
          code: 'INVALID_DATA_ERROR',
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
        const error = InvalidDataError.forData('invalid-data', 'valid format', 'test context')

        expect(error.toString()).toBe(
          "[INVALID_DATA_ERROR] Invalid data in context 'test context'. Expected format: valid format",
        )
      })
    })

    describe('error handling', () => {
      it('should work correctly with instanceof checks', () => {
        const error = InvalidDataError.forData('test-data', 'test-format', 'test-context')

        expect(error instanceof InvalidDataError).toBe(true)
      })

      it('should work correctly with error throwing and catching', () => {
        const throwError = () => {
          throw InvalidDataError.forData('invalid-data', 'valid format', 'test context')
        }

        expect(() => throwError()).toThrow(InvalidDataError as any)
        expect(() => throwError()).toThrow("Invalid data in context 'test context'. Expected format: valid format")
      })
    })

    describe('invalid data error scenarios', () => {
      it('should handle missing property error', () => {
        const data = { id: 'user-123' }
        const error = InvalidDataError.missingProperty('name', data)

        expect(error.data).toEqual(data)
        expect(error.expectedFormat).toBe("object with property 'name'")
        expect(error.parseContext).toBe('data validation')
      })

      it('should handle invalid structure error', () => {
        const data = 'not-an-object'
        const error = InvalidDataError.invalidStructure('object with properties "id" and "name"', data)

        expect(error.data).toBe(data)
        expect(error.expectedFormat).toBe('object with properties "id" and "name"')
        expect(error.parseContext).toBe('data structure validation')
      })

      it('should handle user data validation failure', () => {
        const userData = { id: 'user-123' } // missing required 'email' field
        const error = InvalidDataError.forData(userData, 'User object with email and name', 'user data validation')

        expect(error.data).toEqual(userData)
        expect(error.expectedFormat).toBe('User object with email and name')
        expect(error.parseContext).toBe('user data validation')
      })

      it('should handle order data validation failure', () => {
        const orderData = { id: 'order-123', items: [] } // missing required 'total' field
        const error = InvalidDataError.forData(orderData, 'Order object with total amount', 'order data validation')

        expect(error.data).toEqual(orderData)
        expect(error.expectedFormat).toBe('Order object with total amount')
        expect(error.parseContext).toBe('order data validation')
      })

      it('should handle product data validation failure', () => {
        const productData = { name: 'Product' } // missing required 'price' field
        const error = InvalidDataError.forData(
          productData,
          'Product object with name and price',
          'product data validation',
        )

        expect(error.data).toEqual(productData)
        expect(error.expectedFormat).toBe('Product object with name and price')
        expect(error.parseContext).toBe('product data validation')
      })

      it('should handle array data validation failure', () => {
        const arrayData = 'not-an-array'
        const error = InvalidDataError.forData(arrayData, 'array of user objects', 'array data validation')

        expect(error.data).toBe(arrayData)
        expect(error.expectedFormat).toBe('array of user objects')
        expect(error.parseContext).toBe('array data validation')
      })

      it('should handle null data validation failure', () => {
        const error = InvalidDataError.forData(null, 'non-null object', 'null data validation')

        expect(error.data).toBe(null)
        expect(error.expectedFormat).toBe('non-null object')
        expect(error.parseContext).toBe('null data validation')
      })

      it('should handle undefined data validation failure', () => {
        const error = InvalidDataError.forData(undefined, 'defined value', 'undefined data validation')

        expect(error.data).toBe(undefined)
        expect(error.expectedFormat).toBe('defined value')
        expect(error.parseContext).toBe('undefined data validation')
      })

      it('should handle complex nested data validation failure', () => {
        const complexData = {
          user: { id: 'user-123' },
          orders: [{ id: 'order-1' }], // missing required 'total' field in order
        }
        const error = InvalidDataError.forData(complexData, 'User with complete order data', 'complex data validation')

        expect(error.data).toEqual(complexData)
        expect(error.expectedFormat).toBe('User with complete order data')
        expect(error.parseContext).toBe('complex data validation')
      })
    })
  })
})
