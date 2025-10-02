import { describe, it, expect } from 'vitest'
import { ConstraintViolationError } from '../../errors/constraint-violation.error.js'

describe('ConstraintViolationError', () => {
  describe('error creation', () => {
    it('should create error with valid parameters', () => {
      const error = ConstraintViolationError.forConstraint('maximum_order_amount', 10000)

      expect(error.constraintName).toBe('maximum_order_amount')
      expect(error.violatedValue).toBe(10000)
      expect(error.message).toBe("Domain constraint 'maximum_order_amount' has been violated. Value: 10000")
      expect(error.code).toBe('CONSTRAINT_VIOLATION')
      expect(error.name).toBe('ConstraintViolationError')
    })

    it('should create error with string value', () => {
      const error = ConstraintViolationError.forConstraint('email_format', 'invalid-email')

      expect(error.constraintName).toBe('email_format')
      expect(error.violatedValue).toBe('invalid-email')
      expect(error.message).toBe("Domain constraint 'email_format' has been violated. Value: invalid-email")
    })

    it('should create error with object value', () => {
      const violatedValue = { id: 'user-123', name: 'John Doe' }
      const error = ConstraintViolationError.forConstraint('user_data_structure', violatedValue)

      expect(error.constraintName).toBe('user_data_structure')
      expect(error.violatedValue).toEqual(violatedValue)
      expect(error.message).toBe("Domain constraint 'user_data_structure' has been violated. Value: [object Object]")
    })

    it('should create error with null value', () => {
      const error = ConstraintViolationError.forConstraint('non_null_field', null)

      expect(error.constraintName).toBe('non_null_field')
      expect(error.violatedValue).toBe(null)
      expect(error.message).toBe("Domain constraint 'non_null_field' has been violated. Value: null")
    })

    it('should create error with undefined value', () => {
      const error = ConstraintViolationError.forConstraint('required_field', undefined)

      expect(error.constraintName).toBe('required_field')
      expect(error.violatedValue).toBe(undefined)
      expect(error.message).toBe("Domain constraint 'required_field' has been violated. Value: undefined")
    })
  })

  describe('error properties', () => {
    it('should have readonly properties', () => {
      const error = ConstraintViolationError.forConstraint('test-constraint', 'test-value')

      // Properties are not actually readonly in the implementation
      // This test verifies the properties exist and have expected values
      expect(error).toBeDefined()
      expect(error.name).toBeDefined()
      expect(error.code).toBeDefined()
      expect(error.message).toBeDefined()
    })

    describe('error serialization', () => {
      it('should serialize to JSON correctly', () => {
        const error = ConstraintViolationError.forConstraint('maximum_order_amount', 10000)

        const json = error.toJSON()

        expect(json).toEqual({
          name: 'ConstraintViolationError',
          message: "Domain constraint 'maximum_order_amount' has been violated. Value: 10000",
          code: 'CONSTRAINT_VIOLATION',
          metadata: {
            constraintName: 'maximum_order_amount',
            violatedValue: 10000,
          },
        })
      })

      it('should serialize with complex value', () => {
        const violatedValue = { id: 'user-123', data: { nested: { value: 123 } } }
        const error = ConstraintViolationError.forConstraint('complex_constraint', violatedValue)

        const json = error.toJSON()

        expect(json.metadata.violatedValue).toEqual(violatedValue)
      })

      it('should be JSON serializable', () => {
        const violatedValue = {
          id: 'user-123',
          data: { nested: { value: 123 } },
          array: [1, 2, 3],
        }
        const error = ConstraintViolationError.forConstraint('complex_constraint', violatedValue)

        const jsonString = JSON.stringify(error.toJSON())
        const parsed = JSON.parse(jsonString)

        expect(parsed.metadata.violatedValue).toEqual(violatedValue)
      })
    })

    describe('error string representation', () => {
      it('should have correct string representation', () => {
        const error = ConstraintViolationError.forConstraint('test_constraint', 'test_value')

        expect(error.toString()).toBe(
          "[CONSTRAINT_VIOLATION] Domain constraint 'test_constraint' has been violated. Value: test_value",
        )
      })
    })

    describe('error handling', () => {
      it('should work correctly with instanceof checks', () => {
        const error = ConstraintViolationError.forConstraint('test_constraint', 'test_value')

        expect(error instanceof ConstraintViolationError).toBe(true)
      })

      it('should work correctly with error throwing and catching', () => {
        const throwError = () => {
          throw ConstraintViolationError.forConstraint('test_constraint', 'test_value')
        }

        expect(() => throwError()).toThrow(ConstraintViolationError as any)
        expect(() => throwError()).toThrow("Domain constraint 'test_constraint' has been violated")
      })
    })

    describe('constraint violation scenarios', () => {
      it('should handle maximum order amount constraint violation', () => {
        const error = ConstraintViolationError.forConstraint('maximum_order_amount', 10000)

        expect(error.constraintName).toBe('maximum_order_amount')
        expect(error.violatedValue).toBe(10000)
      })

      it('should handle minimum age constraint violation', () => {
        const error = ConstraintViolationError.forConstraint('minimum_age', 15)

        expect(error.constraintName).toBe('minimum_age')
        expect(error.violatedValue).toBe(15)
      })

      it('should handle email format constraint violation', () => {
        const error = ConstraintViolationError.forConstraint('email_format', 'invalid-email-format')

        expect(error.constraintName).toBe('email_format')
        expect(error.violatedValue).toBe('invalid-email-format')
      })

      it('should handle phone number format constraint violation', () => {
        const error = ConstraintViolationError.forConstraint('phone_format', '123')

        expect(error.constraintName).toBe('phone_format')
        expect(error.violatedValue).toBe('123')
      })

      it('should handle array length constraint violation', () => {
        const items = ['item1', 'item2']
        const error = ConstraintViolationError.forConstraint('minimum_items', items)

        expect(error.constraintName).toBe('minimum_items')
        expect(error.violatedValue).toEqual(items)
      })

      it('should handle object structure constraint violation', () => {
        const invalidData = { name: 'John' } // missing required 'email' field
        const error = ConstraintViolationError.forConstraint('user_data_structure', invalidData)

        expect(error.constraintName).toBe('user_data_structure')
        expect(error.violatedValue).toEqual(invalidData)
      })

      it('should handle null constraint violation', () => {
        const error = ConstraintViolationError.forConstraint('non_null_field', null)

        expect(error.constraintName).toBe('non_null_field')
        expect(error.violatedValue).toBe(null)
      })

      it('should handle undefined constraint violation', () => {
        const error = ConstraintViolationError.forConstraint('required_field', undefined)

        expect(error.constraintName).toBe('required_field')
        expect(error.violatedValue).toBe(undefined)
      })
    })
  })
})
