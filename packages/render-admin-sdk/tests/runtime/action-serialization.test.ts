import { describe, it, expect } from 'vitest'
import { Action, ActionType, StoreScope, StoreStorage } from '../../src/runtime'

describe('Action Serialization', () => {
  describe('StoreValueDescriptor serialization', () => {
    it('should serialize string values', () => {
      const action = new Action(
        'test_id',
        ActionType.StoreSet,
        StoreScope.App,
        StoreStorage.Memory,
        'key',
        'hello'
      )

      const descriptor = action.toDescriptor()
      expect(descriptor.value).toEqual({ type: 'string', value: 'hello' })
    })

    it('should serialize integer values', () => {
      const action = new Action(
        'test_id',
        ActionType.StoreSet,
        StoreScope.App,
        StoreStorage.Memory,
        'key',
        42
      )

      const descriptor = action.toDescriptor()
      expect(descriptor.value).toEqual({ type: 'integer', value: 42 })
    })

    it('should serialize float values', () => {
      const action = new Action(
        'test_id',
        ActionType.StoreSet,
        StoreScope.App,
        StoreStorage.Memory,
        'key',
        3.14
      )

      const descriptor = action.toDescriptor()
      expect(descriptor.value).toEqual({ type: 'number', value: 3.14 })
    })

    it('should serialize boolean values', () => {
      const action = new Action(
        'test_id',
        ActionType.StoreSet,
        StoreScope.App,
        StoreStorage.Memory,
        'key',
        true
      )

      const descriptor = action.toDescriptor()
      expect(descriptor.value).toEqual({ type: 'bool', value: true })
    })

    it('should serialize null values', () => {
      const action = new Action(
        'test_id',
        ActionType.StoreSet,
        StoreScope.App,
        StoreStorage.Memory,
        'key',
        null
      )

      const descriptor = action.toDescriptor()
      expect(descriptor.value).toEqual({ type: 'null' })
    })

    it('should serialize array values', () => {
      const action = new Action(
        'test_id',
        ActionType.StoreSet,
        StoreScope.App,
        StoreStorage.Memory,
        'key',
        [1, 'two', true]
      )

      const descriptor = action.toDescriptor()
      expect(descriptor.value).toEqual({
        type: 'array',
        value: [
          { type: 'integer', value: 1 },
          { type: 'string', value: 'two' },
          { type: 'bool', value: true }
        ]
      })
    })

    it('should serialize object values', () => {
      const action = new Action(
        'test_id',
        ActionType.StoreSet,
        StoreScope.App,
        StoreStorage.Memory,
        'key',
        { name: 'Alice', age: 30, active: true }
      )

      const descriptor = action.toDescriptor()
      expect(descriptor.value).toEqual({
        type: 'object',
        value: {
          name: { type: 'string', value: 'Alice' },
          age: { type: 'integer', value: 30 },
          active: { type: 'bool', value: true }
        }
      })
    })

    it('should serialize nested objects', () => {
      const action = new Action(
        'test_id',
        ActionType.StoreSet,
        StoreScope.App,
        StoreStorage.Memory,
        'key',
        { user: { profile: { name: 'Bob' } } }
      )

      const descriptor = action.toDescriptor()
      expect(descriptor.value?.type).toBe('object')
      const obj = (descriptor.value as any).value
      expect(obj.user.type).toBe('object')
      expect(obj.user.value.profile.type).toBe('object')
      expect(obj.user.value.profile.value.name).toEqual({ type: 'string', value: 'Bob' })
    })
  })

  describe('Transaction action serialization', () => {
    it('should serialize nested actions', () => {
      const nestedAction1 = new Action(
        'nested_1',
        ActionType.StoreSet,
        StoreScope.App,
        StoreStorage.Memory,
        'key1',
        'value1'
      )

      const nestedAction2 = new Action(
        'nested_2',
        ActionType.StoreSet,
        StoreScope.App,
        StoreStorage.Memory,
        'key2',
        'value2'
      )

      const transaction = new Action(
        'transaction_id',
        ActionType.StoreTransaction,
        StoreScope.App,
        StoreStorage.Memory,
        '',
        undefined,
        [nestedAction1, nestedAction2]
      )

      const descriptor = transaction.toDescriptor()
      expect(descriptor.actions).toHaveLength(2)
      expect(descriptor.actions![0].id).toBe('nested_1')
      expect(descriptor.actions![1].id).toBe('nested_2')
    })
  })
})
