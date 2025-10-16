import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { store, StoreScope, StoreStorage, ActionContext, ActionType } from '../../src/runtime'

describe('Store API', () => {
  beforeEach(() => {
    ActionContext.reset()
  })

  afterEach(() => {
    ActionContext.reset()
  })

  describe('Store creation', () => {
    it('should create store with config', () => {
      const myStore = store({
        scope: StoreScope.App,
        storage: StoreStorage.Memory,
        initialValue: { count: 0 }
      })

      expect(myStore.config.scope).toBe(StoreScope.App)
      expect(myStore.config.storage).toBe(StoreStorage.Memory)
      expect(myStore.config.initialValue).toEqual({ count: 0 })
    })

    it('should generate correct identifier from scope and storage', () => {
      const appStore = store({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      expect(appStore.identifier).toBe('app.memory')

      const scenarioStore = store({
        scope: StoreScope.Scenario,
        storage: StoreStorage.UserPrefs
      })

      expect(scenarioStore.identifier).toBe('scenario.userPrefs')
    })

    it('should register store in ActionContext', () => {
      const myStore = store({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      const stores = ActionContext.getStores()
      expect(stores).toHaveLength(1)
      expect(stores[0].scope).toBe(StoreScope.App)
      expect(stores[0].storage).toBe(StoreStorage.Memory)
    })
  })

  describe('Store.set()', () => {
    it('should create set action with string value', () => {
      const myStore = store<{ name: string }>({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      const action = myStore.set('name', 'Alice')

      expect(action.id).toBe('app.memory_set_name')
      expect(action.type).toBe(ActionType.StoreSet)
      expect(action.scope).toBe(StoreScope.App)
      expect(action.storage).toBe(StoreStorage.Memory)
      expect(action.keyPath).toBe('name')
      expect(action.value).toBe('Alice')
    })

    it('should create set action with number value', () => {
      const myStore = store<{ count: number }>({
        scope: StoreScope.Scenario,
        storage: StoreStorage.Memory
      })

      const action = myStore.set('count', 42)

      expect(action.value).toBe(42)
    })

    it('should create set action with object value', () => {
      const myStore = store<{ user: { name: string; age: number } }>({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      const action = myStore.set('user', { name: 'Bob', age: 30 })

      expect(action.value).toEqual({ name: 'Bob', age: 30 })
    })

    it('should create set action with array value', () => {
      const myStore = store<{ items: number[] }>({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      const action = myStore.set('items', [1, 2, 3])

      expect(action.value).toEqual([1, 2, 3])
    })

    it('should handle nested keyPath', () => {
      const myStore = store({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      const action = myStore.set('user.profile.name', 'Alice')

      expect(action.id).toBe('app.memory_set_user_profile_name')
      expect(action.keyPath).toBe('user.profile.name')
    })

    it('should register action in ActionContext', () => {
      const myStore = store({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      myStore.set('key', 'value')

      const actions = ActionContext.getActions()
      expect(actions).toHaveLength(1)
      expect(actions[0].type).toBe(ActionType.StoreSet)
    })
  })

  describe('Store.remove()', () => {
    it('should create remove action', () => {
      const myStore = store({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      const action = myStore.remove('key')

      expect(action.id).toBe('app.memory_remove_key')
      expect(action.type).toBe(ActionType.StoreRemove)
      expect(action.keyPath).toBe('key')
      expect(action.value).toBeUndefined()
    })
  })

  describe('Store.merge()', () => {
    it('should create merge action with object', () => {
      const myStore = store({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      const action = myStore.merge('user', { age: 31 })

      expect(action.id).toBe('app.memory_merge_user')
      expect(action.type).toBe(ActionType.StoreMerge)
      expect(action.keyPath).toBe('user')
      expect(action.value).toEqual({ age: 31 })
    })
  })

  describe('Store.transaction()', () => {
    it('should create transaction action with nested actions', () => {
      const myStore = store({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      const action = myStore.transaction((store) => {
        store.set('name', 'Alice')
        store.set('age', 30)
        store.remove('temp')
      })

      expect(action.type).toBe(ActionType.StoreTransaction)
      expect(action.actions).toHaveLength(3)
      expect(action.actions![0].type).toBe(ActionType.StoreSet)
      expect(action.actions![1].type).toBe(ActionType.StoreSet)
      expect(action.actions![2].type).toBe(ActionType.StoreRemove)
    })

    it('should collect nested action IDs', () => {
      const myStore = store({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      const action = myStore.transaction((store) => {
        store.set('key1', 'value1')
        store.set('key2', 'value2')
      })

      expect(action.actions![0].id).toBe('app.memory_set_key1')
      expect(action.actions![1].id).toBe('app.memory_set_key2')
    })
  })

  describe('Store.get()', () => {
    it('should throw error (runtime-only method)', () => {
      const myStore = store({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      expect(() => myStore.get('key')).toThrow('only available at runtime')
    })
  })
})
