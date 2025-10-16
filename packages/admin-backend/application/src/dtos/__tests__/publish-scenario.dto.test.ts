import { describe, it, expect } from 'vitest'
import { PublishScenarioDtoSchema } from '../publish-scenario.dto.js'

describe('PublishScenarioDto', () => {
  describe('validation', () => {
    it('should validate complete scenario data', () => {
      const validData = {
        key: 'test-scenario',
        version: '1.0.0',
        mainComponent: { type: 'View', children: [] },
        components: { Button: { type: 'Button', props: {} } },
        metadata: { description: 'Test scenario' },
      }

      const result = PublishScenarioDtoSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.key).toBe('test-scenario')
        expect(result.data.version).toBe('1.0.0')
      }
    })

    it('should apply default version', () => {
      const dataWithoutVersion = {
        key: 'test-scenario',
        mainComponent: { type: 'View' },
        components: {},
      }

      const result = PublishScenarioDtoSchema.safeParse(dataWithoutVersion)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.version).toBe('1.0.0')
      }
    })

    it('should apply default metadata', () => {
      const dataWithoutMetadata = {
        key: 'test-scenario',
        mainComponent: { type: 'View' },
        components: {},
      }

      const result = PublishScenarioDtoSchema.safeParse(dataWithoutMetadata)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.metadata).toEqual({})
      }
    })

    it('should reject missing key', () => {
      const invalidData = {
        mainComponent: { type: 'View' },
        components: {},
      }

      const result = PublishScenarioDtoSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
    })

    it('should reject empty key', () => {
      const invalidData = {
        key: '',
        mainComponent: { type: 'View' },
        components: {},
      }

      const result = PublishScenarioDtoSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
    })

    it('should accept stores and actions', () => {
      const dataWithStoresAndActions = {
        key: 'test-scenario',
        mainComponent: { type: 'View' },
        components: {},
        stores: [{ name: 'userStore', scope: 'scenario', storage: 'memory' }],
        actions: [{ name: 'updateUser', type: 'StoreSet' }],
      }

      const result = PublishScenarioDtoSchema.safeParse(dataWithStoresAndActions)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.stores).toHaveLength(1)
        expect(result.data.actions).toHaveLength(1)
      }
    })
  })
})
