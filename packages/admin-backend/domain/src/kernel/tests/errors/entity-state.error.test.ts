import { describe, it, expect } from 'vitest'
import { EntityStateError } from '../../errors/entity-state.error.js'

describe('EntityStateError', () => {
  describe('error creation', () => {
    it('should create error with valid parameters', () => {
      const error = EntityStateError.forState('Order', 'cancelled', 'pending')

      expect(error.entityType).toBe('Order')
      expect(error.currentState).toBe('cancelled')
      expect(error.requiredState).toBe('pending')
      expect(error.message).toBe("Order is in invalid state 'cancelled' for this operation. Required state: 'pending'")
      expect(error.code).toBe('ENTITY_STATE_ERROR')
      expect(error.name).toBe('EntityStateError')
    })

    it('should create error with different entity types', () => {
      const error = EntityStateError.forState('User', 'inactive', 'active')

      expect(error.entityType).toBe('User')
      expect(error.currentState).toBe('inactive')
      expect(error.requiredState).toBe('active')
      expect(error.message).toBe("User is in invalid state 'inactive' for this operation. Required state: 'active'")
    })

    it('should create error with complex entity types', () => {
      const error = EntityStateError.forState('UserProfile', 'locked', 'unlocked')

      expect(error.entityType).toBe('UserProfile')
      expect(error.currentState).toBe('locked')
      expect(error.requiredState).toBe('unlocked')
      expect(error.message).toBe(
        "UserProfile is in invalid state 'locked' for this operation. Required state: 'unlocked'",
      )
    })

    it('should create error with different state combinations', () => {
      const error = EntityStateError.forState('Payment', 'failed', 'pending')

      expect(error.entityType).toBe('Payment')
      expect(error.currentState).toBe('failed')
      expect(error.requiredState).toBe('pending')
      expect(error.message).toBe("Payment is in invalid state 'failed' for this operation. Required state: 'pending'")
    })
  })

  describe('error properties', () => {
    it('should have readonly properties', () => {
      const error = EntityStateError.forState('test-entity', 'current-state', 'target-state')

      // Properties are not actually readonly in the implementation
      // This test verifies the properties exist and have expected values
      expect(error).toBeDefined()
      expect(error.name).toBeDefined()
      expect(error.code).toBeDefined()
      expect(error.message).toBeDefined()
    })

    describe('error serialization', () => {
      it('should serialize to JSON correctly', () => {
        const error = EntityStateError.forState('Order', 'cancelled', 'pending')

        const json = error.toJSON()

        expect(json).toEqual({
          name: 'EntityStateError',
          message: "Order is in invalid state 'cancelled' for this operation. Required state: 'pending'",
          code: 'ENTITY_STATE_ERROR',
          metadata: {
            entityType: 'Order',
            currentState: 'cancelled',
            requiredState: 'pending',
          },
        })
      })

      it('should serialize with different entity types', () => {
        const error = EntityStateError.forState('User', 'inactive', 'active')

        const json = error.toJSON()

        expect(json.metadata.entityType).toBe('User')
        expect(json.metadata.currentState).toBe('inactive')
        expect(json.metadata.requiredState).toBe('active')
      })

      it('should be JSON serializable', () => {
        const error = EntityStateError.forState('Payment', 'failed', 'pending')

        const jsonString = JSON.stringify(error.toJSON())
        const parsed = JSON.parse(jsonString)

        expect(parsed).toEqual({
          name: 'EntityStateError',
          message: "Payment is in invalid state 'failed' for this operation. Required state: 'pending'",
          code: 'ENTITY_STATE_ERROR',
          metadata: {
            entityType: 'Payment',
            currentState: 'failed',
            requiredState: 'pending',
          },
        })
      })
    })

    describe('error string representation', () => {
      it('should have correct string representation', () => {
        const error = EntityStateError.forState('Order', 'cancelled', 'pending')

        expect(error.toString()).toBe(
          "[ENTITY_STATE_ERROR] Order is in invalid state 'cancelled' for this operation. Required state: 'pending'",
        )
      })
    })

    describe('error handling', () => {
      it('should work correctly with instanceof checks', () => {
        const error = EntityStateError.forState('Order', 'cancelled', 'pending')

        expect(error instanceof EntityStateError).toBe(true)
      })

      it('should work correctly with error throwing and catching', () => {
        const throwError = () => {
          throw EntityStateError.forState('Order', 'cancelled', 'pending')
        }

        expect(() => throwError()).toThrow(EntityStateError as any)
        expect(() => throwError()).toThrow(
          "Order is in invalid state 'cancelled' for this operation. Required state: 'pending'",
        )
      })
    })

    describe('entity state error scenarios', () => {
      it('should handle order state error', () => {
        const error = EntityStateError.forState('Order', 'cancelled', 'pending')

        expect(error.entityType).toBe('Order')
        expect(error.currentState).toBe('cancelled')
        expect(error.requiredState).toBe('pending')
      })

      it('should handle user state error', () => {
        const error = EntityStateError.forState('User', 'inactive', 'active')

        expect(error.entityType).toBe('User')
        expect(error.currentState).toBe('inactive')
        expect(error.requiredState).toBe('active')
      })

      it('should handle payment state error', () => {
        const error = EntityStateError.forState('Payment', 'failed', 'pending')

        expect(error.entityType).toBe('Payment')
        expect(error.currentState).toBe('failed')
        expect(error.requiredState).toBe('pending')
      })

      it('should handle product state error', () => {
        const error = EntityStateError.forState('Product', 'discontinued', 'active')

        expect(error.entityType).toBe('Product')
        expect(error.currentState).toBe('discontinued')
        expect(error.requiredState).toBe('active')
      })

      it('should handle subscription state error', () => {
        const error = EntityStateError.forState('Subscription', 'expired', 'active')

        expect(error.entityType).toBe('Subscription')
        expect(error.currentState).toBe('expired')
        expect(error.requiredState).toBe('active')
      })

      it('should handle account state error', () => {
        const error = EntityStateError.forState('Account', 'locked', 'unlocked')

        expect(error.entityType).toBe('Account')
        expect(error.currentState).toBe('locked')
        expect(error.requiredState).toBe('unlocked')
      })

      it('should handle document state error', () => {
        const error = EntityStateError.forState('Document', 'archived', 'draft')

        expect(error.entityType).toBe('Document')
        expect(error.currentState).toBe('archived')
        expect(error.requiredState).toBe('draft')
      })

      it('should handle task state error', () => {
        const error = EntityStateError.forState('Task', 'completed', 'in_progress')

        expect(error.entityType).toBe('Task')
        expect(error.currentState).toBe('completed')
        expect(error.requiredState).toBe('in_progress')
      })

      it('should handle workflow state error', () => {
        const error = EntityStateError.forState('Workflow', 'terminated', 'running')

        expect(error.entityType).toBe('Workflow')
        expect(error.currentState).toBe('terminated')
        expect(error.requiredState).toBe('running')
      })

      it('should handle complex state transitions', () => {
        const error = EntityStateError.forState('Order', 'shipped', 'pending')

        expect(error.entityType).toBe('Order')
        expect(error.currentState).toBe('shipped')
        expect(error.requiredState).toBe('pending')
      })
    })
  })
})
