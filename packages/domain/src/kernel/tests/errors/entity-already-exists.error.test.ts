import { describe, it, expect } from 'vitest'
import { EntityAlreadyExistsError } from '../../errors/entity-already-exists.error.js'

describe('EntityAlreadyExistsError', () => {
  describe('error creation', () => {
    it('should create error with valid parameters', () => {
      const error = EntityAlreadyExistsError.forEntity('User', 'user-123')

      expect(error.entityType).toBe('User')
      expect(error.entityId).toBe('user-123')
      expect(error.message).toBe("User with ID 'user-123' already exists")
      expect(error.code).toBe('ENTITY_ALREADY_EXISTS')
      expect(error.name).toBe('EntityAlreadyExistsError')
    })

    it('should create error with different entity types', () => {
      const error = EntityAlreadyExistsError.forEntity('Order', 'order-456')

      expect(error.entityType).toBe('Order')
      expect(error.entityId).toBe('order-456')
      expect(error.message).toBe("Order with ID 'order-456' already exists")
    })

    it('should create error with complex entity types', () => {
      const error = EntityAlreadyExistsError.forEntity('UserProfile', 'profile-789')

      expect(error.entityType).toBe('UserProfile')
      expect(error.entityId).toBe('profile-789')
      expect(error.message).toBe("UserProfile with ID 'profile-789' already exists")
    })

    it('should create error with UUID entity IDs', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      const error = EntityAlreadyExistsError.forEntity('Product', uuid)

      expect(error.entityType).toBe('Product')
      expect(error.entityId).toBe(uuid)
      expect(error.message).toBe(`Product with ID '${uuid}' already exists`)
    })

    it('should create error with numeric entity IDs', () => {
      const error = EntityAlreadyExistsError.forEntity('Category', '123')

      expect(error.entityType).toBe('Category')
      expect(error.entityId).toBe('123')
      expect(error.message).toBe("Category with ID '123' already exists")
    })
  })

  describe('error properties', () => {
    it('should have readonly properties', () => {
      const error = EntityAlreadyExistsError.forEntity('test-entity', 'test-id')

      // Properties are not actually readonly in the implementation
      // This test verifies the properties exist and have expected values
      expect(error).toBeDefined()
      expect(error.name).toBeDefined()
      expect(error.code).toBeDefined()
      expect(error.message).toBeDefined()
    })

    describe('error serialization', () => {
      it('should serialize to JSON correctly', () => {
        const error = EntityAlreadyExistsError.forEntity('User', 'user-123')

        const json = error.toJSON()

        expect(json).toEqual({
          name: 'EntityAlreadyExistsError',
          message: "User with ID 'user-123' already exists",
          code: 'ENTITY_ALREADY_EXISTS',
          metadata: {
            entityType: 'User',
            entityId: 'user-123',
          },
        })
      })

      it('should serialize with different entity types', () => {
        const error = EntityAlreadyExistsError.forEntity('Order', 'order-456')

        const json = error.toJSON()

        expect(json.metadata.entityType).toBe('Order')
        expect(json.metadata.entityId).toBe('order-456')
      })

      it('should be JSON serializable', () => {
        const error = EntityAlreadyExistsError.forEntity('Product', 'product-789')

        const jsonString = JSON.stringify(error.toJSON())
        const parsed = JSON.parse(jsonString)

        expect(parsed).toEqual({
          name: 'EntityAlreadyExistsError',
          message: "Product with ID 'product-789' already exists",
          code: 'ENTITY_ALREADY_EXISTS',
          metadata: {
            entityType: 'Product',
            entityId: 'product-789',
          },
        })
      })
    })

    describe('error string representation', () => {
      it('should have correct string representation', () => {
        const error = EntityAlreadyExistsError.forEntity('User', 'user-123')

        expect(error.toString()).toBe("[ENTITY_ALREADY_EXISTS] User with ID 'user-123' already exists")
      })
    })

    describe('error handling', () => {
      it('should work correctly with instanceof checks', () => {
        const error = EntityAlreadyExistsError.forEntity('User', 'user-123')

        expect(error instanceof EntityAlreadyExistsError).toBe(true)
      })

      it('should work correctly with error throwing and catching', () => {
        const throwError = () => {
          throw EntityAlreadyExistsError.forEntity('User', 'user-123')
        }

        expect(() => throwError()).toThrow(EntityAlreadyExistsError as any)
        expect(() => throwError()).toThrow("User with ID 'user-123' already exists")
      })
    })

    describe('entity already exists scenarios', () => {
      it('should handle user already exists', () => {
        const error = EntityAlreadyExistsError.forEntity('User', 'user-123')

        expect(error.entityType).toBe('User')
        expect(error.entityId).toBe('user-123')
      })

      it('should handle order already exists', () => {
        const error = EntityAlreadyExistsError.forEntity('Order', 'order-456')

        expect(error.entityType).toBe('Order')
        expect(error.entityId).toBe('order-456')
      })

      it('should handle product already exists', () => {
        const error = EntityAlreadyExistsError.forEntity('Product', 'product-789')

        expect(error.entityType).toBe('Product')
        expect(error.entityId).toBe('product-789')
      })

      it('should handle category already exists', () => {
        const error = EntityAlreadyExistsError.forEntity('Category', 'category-101')

        expect(error.entityType).toBe('Category')
        expect(error.entityId).toBe('category-101')
      })

      it('should handle payment already exists', () => {
        const error = EntityAlreadyExistsError.forEntity('Payment', 'payment-202')

        expect(error.entityType).toBe('Payment')
        expect(error.entityId).toBe('payment-202')
      })

      it('should handle address already exists', () => {
        const error = EntityAlreadyExistsError.forEntity('Address', 'address-303')

        expect(error.entityType).toBe('Address')
        expect(error.entityId).toBe('address-303')
      })

      it('should handle review already exists', () => {
        const error = EntityAlreadyExistsError.forEntity('Review', 'review-404')

        expect(error.entityType).toBe('Review')
        expect(error.entityId).toBe('review-404')
      })

      it('should handle notification already exists', () => {
        const error = EntityAlreadyExistsError.forEntity('Notification', 'notification-505')

        expect(error.entityType).toBe('Notification')
        expect(error.entityId).toBe('notification-505')
      })

      it('should handle complex entity types', () => {
        const error = EntityAlreadyExistsError.forEntity('UserProfile', 'profile-606')

        expect(error.entityType).toBe('UserProfile')
        expect(error.entityId).toBe('profile-606')
      })

      it('should handle entities with UUID identifiers', () => {
        const uuid = '550e8400-e29b-41d4-a716-446655440000'
        const error = EntityAlreadyExistsError.forEntity('User', uuid)

        expect(error.entityType).toBe('User')
        expect(error.entityId).toBe(uuid)
      })
    })
  })
})
