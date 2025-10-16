# Action API Test Plan

This document outlines comprehensive testing strategy for the Action API implementation across TypeScript and iOS SDK.

## Table of Contents

1. [TypeScript Runtime API Tests](#typescript-runtime-api-tests)
2. [TypeScript Transpiler Tests](#typescript-transpiler-tests)
3. [iOS SDK Action Tests](#ios-sdk-action-tests)
4. [Integration Tests](#integration-tests)
5. [End-to-End Tests](#end-to-end-tests)

---

## TypeScript Runtime API Tests

### File: `packages/render-admin-sdk/tests/runtime/store-api.test.ts`

#### Test Suite: Store Class

**Purpose**: Verify Store class methods create correct Action objects

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { store, StoreScope, StoreStorage, ActionContext, ActionType } from '../src/runtime'

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
```

---

### File: `packages/render-admin-sdk/tests/runtime/action-serialization.test.ts`

#### Test Suite: Action Serialization

**Purpose**: Verify Action.toDescriptor() serializes values correctly

```typescript
import { describe, it, expect } from 'vitest'
import { Action, ActionType, StoreScope, StoreStorage } from '../src/runtime'

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
```

---

## TypeScript Transpiler Tests

### File: `packages/render-admin-sdk/tests/transpiler/store-collector.test.ts`

#### Test Suite: Store Collector Plugin

**Purpose**: Verify store() declarations are detected and parsed

```typescript
import { describe, it, expect } from 'vitest'
import { transpile } from '../src/transpiler/transpiler'

describe('Store Collector Plugin', () => {
  it('should detect store declaration with app scope', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'

      const myStore = store({
        scope: StoreScope.App,
        storage: StoreStorage.Memory
      })

      export default function Main() {
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.stores).toBeDefined()
    expect(result.stores).toHaveLength(1)
    expect(result.stores![0].scope).toBe('app')
    expect(result.stores![0].storage).toBe('memory')
  })

  it('should detect store declaration with scenario scope', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'

      const sessionStore = store({
        scope: StoreScope.Scenario,
        storage: StoreStorage.UserPrefs
      })

      export default function Main() {
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.stores![0].scope).toBe('scenario')
    expect(result.stores![0].storage).toBe('userprefs')
  })

  it('should parse initialValue object', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'

      const cartStore = store({
        scope: StoreScope.Scenario,
        storage: StoreStorage.Memory,
        initialValue: {
          items: [],
          total: 0,
          userName: "Guest"
        }
      })

      export default function Main() {
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.stores![0].initialValue).toBeDefined()
    expect(result.stores![0].initialValue!.items).toEqual({ type: 'array', value: [] })
    expect(result.stores![0].initialValue!.total).toEqual({ type: 'integer', value: 0 })
    expect(result.stores![0].initialValue!.userName).toEqual({ type: 'string', value: 'Guest' })
  })

  it('should handle multiple store declarations', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'

      const appStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })
      const userStore = store({ scope: StoreScope.Scenario, storage: StoreStorage.UserPrefs })

      export default function Main() {
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.stores).toHaveLength(2)
  })

  it('should deduplicate stores with same scope+storage', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'

      const store1 = store({ scope: StoreScope.App, storage: StoreStorage.Memory })
      const store2 = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        return <View />
      }
    `

    const result = await transpile(code)

    // Should only have one store (deduplicated by scope+storage key)
    expect(result.stores).toHaveLength(1)
  })
})
```

---

### File: `packages/render-admin-sdk/tests/transpiler/action-collector.test.ts`

#### Test Suite: Action Collector Plugin

**Purpose**: Verify store method calls are converted to actions

```typescript
import { describe, it, expect } from 'vitest'
import { transpile } from '../src/transpiler/transpiler'

describe('Action Collector Plugin', () => {
  it('should collect set() action', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from './ui'

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.set('userName', 'Alice')
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.actions).toBeDefined()
    expect(result.actions).toHaveLength(1)
    expect(result.actions![0].type).toBe('store.set')
    expect(result.actions![0].scope).toBe('app')
    expect(result.actions![0].storage).toBe('memory')
    expect(result.actions![0].keyPath).toBe('userName')
    expect(result.actions![0].value).toEqual({ type: 'string', value: 'Alice' })
  })

  it('should collect remove() action', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from './ui'

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.remove('tempData')
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.actions![0].type).toBe('store.remove')
    expect(result.actions![0].keyPath).toBe('tempData')
    expect(result.actions![0].value).toBeUndefined()
  })

  it('should collect merge() action', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from './ui'

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.merge('user', { age: 31, city: 'NYC' })
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.actions![0].type).toBe('store.merge')
    expect(result.actions![0].keyPath).toBe('user')
    expect(result.actions![0].value).toEqual({
      type: 'object',
      value: {
        age: { type: 'integer', value: 31 },
        city: { type: 'string', value: 'NYC' }
      }
    })
  })

  it('should collect actions from different stores', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from './ui'

      const appStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })
      const userStore = store({ scope: StoreScope.Scenario, storage: StoreStorage.UserPrefs })

      export default function Main() {
        appStore.set('theme', 'dark')
        userStore.set('name', 'Bob')
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.actions).toHaveLength(2)
    expect(result.actions![0].scope).toBe('app')
    expect(result.actions![0].storage).toBe('memory')
    expect(result.actions![1].scope).toBe('scenario')
    expect(result.actions![1].storage).toBe('userprefs')
  })

  it('should generate unique action IDs', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from './ui'

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.set('key1', 'value1')
        myStore.set('key2', 'value2')
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.actions![0].id).toBe('app.memory_set_key1')
    expect(result.actions![1].id).toBe('app.memory_set_key2')
    expect(result.actions![0].id).not.toBe(result.actions![1].id)
  })

  it('should handle nested keyPaths', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from './ui'

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.set('user.profile.name', 'Alice')
        return <View />
      }
    `

    const result = await transpile(code)

    expect(result.actions![0].keyPath).toBe('user.profile.name')
    expect(result.actions![0].id).toBe('app.memory_set_user_profile_name')
  })
})
```

---

### File: `packages/render-admin-sdk/tests/transpiler/transaction-transpile.test.ts`

#### Test Suite: Transaction Transpilation

**Purpose**: Verify transaction() calls are transpiled (limited support)

```typescript
import { describe, it, expect } from 'vitest'
import { transpile } from '../src/transpiler/transpiler'

describe('Transaction Transpilation', () => {
  it('should detect transaction method call', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View } from './ui'

      const myStore = store({ scope: StoreScope.App, storage: StoreStorage.Memory })

      export default function Main() {
        myStore.transaction((store) => {
          // Nested actions - may not be fully transpiled statically
        })
        return <View />
      }
    `

    const result = await transpile(code)

    // Transaction detection is limited due to callback complexity
    // We expect the transaction call to be detected but nested actions may be empty
    const transactionAction = result.actions?.find(a => a.type === 'store.transaction')
    expect(transactionAction).toBeDefined()
  })

  // Note: Full static analysis of transaction callbacks is complex
  // Runtime execution is the primary mechanism for transaction support
})
```

---

## iOS SDK Action Tests

### File: `packages/render-ios-sdk/Tests/RenderEngineTests/Actions/ActionParserTests.swift`

#### Test Suite: Action JSON Parsing

**Purpose**: Verify Action models parse JSON correctly

```swift
import Testing
import Foundation
@testable import RenderEngine

@Suite("ActionParser Tests")
struct ActionParserTests {

    @Test("Parse simple set action from JSON")
    func testParseSetAction() throws {
        let json = """
        {
          "id": "app.memory_set_userName",
          "type": "store.set",
          "scope": "app",
          "storage": "memory",
          "keyPath": "userName",
          "value": {
            "type": "string",
            "value": "Alice"
          }
        }
        """

        let data = json.data(using: .utf8)!
        let action = try JSONDecoder().decode(Action.self, from: data)

        #expect(action.id == "app.memory_set_userName")
        #expect(action.type == .storeSet)
        #expect(action.scope == "app")
        #expect(action.storage == "memory")
        #expect(action.keyPath == "userName")
        #expect(action.value == .string("Alice"))
    }

    @Test("Parse remove action from JSON")
    func testParseRemoveAction() throws {
        let json = """
        {
          "id": "scenario.memory_remove_temp",
          "type": "store.remove",
          "scope": "scenario",
          "storage": "memory",
          "keyPath": "temp"
        }
        """

        let data = json.data(using: .utf8)!
        let action = try JSONDecoder().decode(Action.self, from: data)

        #expect(action.type == .storeRemove)
        #expect(action.keyPath == "temp")
        #expect(action.value == nil)
    }

    @Test("Parse merge action with object")
    func testParseMergeAction() throws {
        let json = """
        {
          "id": "app.memory_merge_user",
          "type": "store.merge",
          "scope": "app",
          "storage": "memory",
          "keyPath": "user",
          "value": {
            "type": "object",
            "value": {
              "age": { "type": "integer", "value": 31 },
              "city": { "type": "string", "value": "NYC" }
            }
          }
        }
        """

        let data = json.data(using: .utf8)!
        let action = try JSONDecoder().decode(Action.self, from: data)

        #expect(action.type == .storeMerge)
        guard case .object(let obj) = action.value else {
            Issue.record("Expected object value")
            return
        }
        #expect(obj["age"] == .integer(31))
        #expect(obj["city"] == .string("NYC"))
    }

    @Test("Parse transaction action with nested actions")
    func testParseTransactionAction() throws {
        let json = """
        {
          "id": "app.memory_transaction_123",
          "type": "store.transaction",
          "scope": "app",
          "storage": "memory",
          "keyPath": "",
          "actions": [
            {
              "id": "app.memory_set_key1",
              "type": "store.set",
              "scope": "app",
              "storage": "memory",
              "keyPath": "key1",
              "value": { "type": "string", "value": "value1" }
            },
            {
              "id": "app.memory_set_key2",
              "type": "store.set",
              "scope": "app",
              "storage": "memory",
              "keyPath": "key2",
              "value": { "type": "string", "value": "value2" }
            }
          ]
        }
        """

        let data = json.data(using: .utf8)!
        let action = try JSONDecoder().decode(Action.self, from: data)

        #expect(action.type == .storeTransaction)
        #expect(action.actions?.count == 2)
        #expect(action.actions?[0].type == .storeSet)
        #expect(action.actions?[1].type == .storeSet)
    }

    @Test("Parse array of actions")
    func testParseActionArray() throws {
        let json = """
        [
          {
            "id": "action1",
            "type": "store.set",
            "scope": "app",
            "storage": "memory",
            "keyPath": "key1",
            "value": { "type": "string", "value": "val1" }
          },
          {
            "id": "action2",
            "type": "store.remove",
            "scope": "app",
            "storage": "memory",
            "keyPath": "key2"
          }
        ]
        """

        let data = json.data(using: .utf8)!
        let actions = try ActionParser.parse(from: data)

        #expect(actions.count == 2)
        #expect(actions[0].id == "action1")
        #expect(actions[1].id == "action2")
    }

    @Test("Parse stores and actions from scenario")
    func testParseFromScenario() throws {
        let json = """
        {
          "key": "test-scenario",
          "version": "1.0.0",
          "main": {},
          "stores": [
            {
              "scope": "scenario",
              "storage": "memory",
              "initialValue": {
                "count": { "type": "integer", "value": 0 }
              }
            }
          ],
          "actions": [
            {
              "id": "action1",
              "type": "store.set",
              "scope": "scenario",
              "storage": "memory",
              "keyPath": "count",
              "value": { "type": "integer", "value": 1 }
            }
          ]
        }
        """

        let data = json.data(using: .utf8)!
        let (stores, actions) = try ActionParser.parseFromScenario(data: data)

        #expect(stores.count == 1)
        #expect(stores[0].scope == "scenario")
        #expect(stores[0].storage == "memory")

        #expect(actions.count == 1)
        #expect(actions[0].id == "action1")
    }
}
```

---

### File: `packages/render-ios-sdk/Tests/RenderEngineTests/Actions/StoreValueDescriptorTests.swift`

#### Test Suite: StoreValueDescriptor Conversion

**Purpose**: Verify StoreValueDescriptor → StoreValue conversion

```swift
import Testing
import Foundation
@testable import RenderEngine

@Suite("StoreValueDescriptor Tests")
struct StoreValueDescriptorTests {

    @Test("Convert string descriptor to StoreValue")
    func testStringConversion() {
        let descriptor = StoreValueDescriptor.string("hello")
        let storeValue = descriptor.toStoreValue()

        #expect(storeValue == .string("hello"))
    }

    @Test("Convert integer descriptor to StoreValue")
    func testIntegerConversion() {
        let descriptor = StoreValueDescriptor.integer(42)
        let storeValue = descriptor.toStoreValue()

        #expect(storeValue == .integer(42))
    }

    @Test("Convert number descriptor to StoreValue")
    func testNumberConversion() {
        let descriptor = StoreValueDescriptor.number(3.14)
        let storeValue = descriptor.toStoreValue()

        #expect(storeValue == .number(3.14))
    }

    @Test("Convert bool descriptor to StoreValue")
    func testBoolConversion() {
        let descriptor = StoreValueDescriptor.bool(true)
        let storeValue = descriptor.toStoreValue()

        #expect(storeValue == .bool(true))
    }

    @Test("Convert null descriptor to StoreValue")
    func testNullConversion() {
        let descriptor = StoreValueDescriptor.null
        let storeValue = descriptor.toStoreValue()

        #expect(storeValue == .null)
    }

    @Test("Convert array descriptor to StoreValue")
    func testArrayConversion() {
        let descriptor = StoreValueDescriptor.array([
            .integer(1),
            .string("two"),
            .bool(true)
        ])
        let storeValue = descriptor.toStoreValue()

        guard case .array(let arr) = storeValue else {
            Issue.record("Expected array value")
            return
        }

        #expect(arr.count == 3)
        #expect(arr[0] == .integer(1))
        #expect(arr[1] == .string("two"))
        #expect(arr[2] == .bool(true))
    }

    @Test("Convert object descriptor to StoreValue")
    func testObjectConversion() {
        let descriptor = StoreValueDescriptor.object([
            "name": .string("Alice"),
            "age": .integer(30),
            "active": .bool(true)
        ])
        let storeValue = descriptor.toStoreValue()

        guard case .object(let obj) = storeValue else {
            Issue.record("Expected object value")
            return
        }

        #expect(obj["name"] == .string("Alice"))
        #expect(obj["age"] == .integer(30))
        #expect(obj["active"] == .bool(true))
    }

    @Test("Convert nested object descriptor")
    func testNestedObjectConversion() {
        let descriptor = StoreValueDescriptor.object([
            "user": .object([
                "profile": .object([
                    "name": .string("Bob")
                ])
            ])
        ])
        let storeValue = descriptor.toStoreValue()

        guard case .object(let obj) = storeValue,
              case .object(let user) = obj["user"],
              case .object(let profile) = user["profile"] else {
            Issue.record("Expected nested object structure")
            return
        }

        #expect(profile["name"] == .string("Bob"))
    }
}
```

---

### File: `packages/render-ios-sdk/Tests/RenderEngineTests/Actions/ActionExecutorTests.swift`

#### Test Suite: Action Execution

**Purpose**: Verify ActionExecutor executes actions correctly on stores

```swift
import Testing
import Foundation
@testable import RenderEngine

@Suite("ActionExecutor Tests")
struct ActionExecutorTests {

    @Test("Execute set action")
    func testExecuteSetAction() async throws {
        let backend = MemoryStorageBackend()
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        let action = Action(
            id: "test_set",
            type: .storeSet,
            scope: "app",
            storage: "memory",
            keyPath: "userName",
            value: .string("Alice"),
            actions: nil
        )

        let result = try executor.execute(action, scenarioId: "test")

        #expect(result == true)

        // Verify value was set
        let store = factory.makeStore(scope: .app, storage: .memory)
        let value = store.get("userName")
        #expect(value == .string("Alice"))
    }

    @Test("Execute remove action")
    func testExecuteRemoveAction() async throws {
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        // Set initial value
        let store = factory.makeStore(scope: .app, storage: .memory)
        store.set("temp", .string("data"))

        // Execute remove action
        let action = Action(
            id: "test_remove",
            type: .storeRemove,
            scope: "app",
            storage: "memory",
            keyPath: "temp",
            value: nil,
            actions: nil
        )

        let result = try executor.execute(action)

        #expect(result == true)
        #expect(store.exists("temp") == false)
    }

    @Test("Execute merge action")
    func testExecuteMergeAction() async throws {
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        // Set initial value
        let store = factory.makeStore(scope: .app, storage: .memory)
        store.set("user", .object(["name": .string("Alice")]))

        // Execute merge action
        let action = Action(
            id: "test_merge",
            type: .storeMerge,
            scope: "app",
            storage: "memory",
            keyPath: "user",
            value: .object([
                "age": .integer(30),
                "city": .string("NYC")
            ]),
            actions: nil
        )

        let result = try executor.execute(action)

        #expect(result == true)

        // Verify merge
        let value = store.get("user")
        guard case .object(let obj) = value else {
            Issue.record("Expected object")
            return
        }

        #expect(obj["name"] == .string("Alice"))
        #expect(obj["age"] == .integer(30))
        #expect(obj["city"] == .string("NYC"))
    }

    @Test("Execute transaction action")
    func testExecuteTransactionAction() async throws {
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        let nestedAction1 = Action(
            id: "nested1",
            type: .storeSet,
            scope: "app",
            storage: "memory",
            keyPath: "key1",
            value: .string("value1"),
            actions: nil
        )

        let nestedAction2 = Action(
            id: "nested2",
            type: .storeSet,
            scope: "app",
            storage: "memory",
            keyPath: "key2",
            value: .string("value2"),
            actions: nil
        )

        let transaction = Action(
            id: "transaction",
            type: .storeTransaction,
            scope: "app",
            storage: "memory",
            keyPath: "",
            value: nil,
            actions: [nestedAction1, nestedAction2]
        )

        let result = try executor.execute(transaction)

        #expect(result == true)

        // Verify both actions were executed
        let store = factory.makeStore(scope: .app, storage: .memory)
        #expect(store.get("key1") == .string("value1"))
        #expect(store.get("key2") == .string("value2"))
    }

    @Test("Execute action with scenario scope")
    func testExecuteWithScenarioScope() throws {
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        let action = Action(
            id: "test",
            type: .storeSet,
            scope: "scenario",
            storage: "memory",
            keyPath: "data",
            value: .string("test"),
            actions: nil
        )

        let result = try executor.execute(action, scenarioId: "cart")

        #expect(result == true)

        // Verify store was created with correct scope
        let store = factory.makeStore(scope: .scenario(id: "cart"), storage: .memory)
        #expect(store.get("data") == .string("test"))
    }

    @Test("Execute multiple actions in sequence")
    func testExecuteAll() throws {
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        let actions = [
            Action(id: "1", type: .storeSet, scope: "app", storage: "memory",
                   keyPath: "a", value: .integer(1), actions: nil),
            Action(id: "2", type: .storeSet, scope: "app", storage: "memory",
                   keyPath: "b", value: .integer(2), actions: nil),
            Action(id: "3", type: .storeSet, scope: "app", storage: "memory",
                   keyPath: "c", value: .integer(3), actions: nil)
        ]

        try executor.executeAll(actions)

        let store = factory.makeStore(scope: .app, storage: .memory)
        #expect(store.get("a") == .integer(1))
        #expect(store.get("b") == .integer(2))
        #expect(store.get("c") == .integer(3))
    }

    @Test("Throw error for missing value")
    func testThrowErrorForMissingValue() {
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        let action = Action(
            id: "test",
            type: .storeSet,
            scope: "app",
            storage: "memory",
            keyPath: "key",
            value: nil, // Missing value
            actions: nil
        )

        #expect(throws: ActionError.self) {
            try executor.execute(action)
        }
    }
}
```

---

### File: `packages/render-ios-sdk/Tests/RenderEngineTests/Actions/StoreDescriptorTests.swift`

#### Test Suite: Store Descriptor Conversion

**Purpose**: Verify StoreDescriptor scope/storage conversion

```swift
import Testing
import Foundation
@testable import RenderEngine

@Suite("StoreDescriptor Tests")
struct StoreDescriptorTests {

    @Test("Convert app scope")
    func testAppScopeConversion() {
        let descriptor = StoreDescriptor(
            scope: "app",
            storage: "memory",
            initialValue: nil
        )

        let scope = descriptor.toScope()

        #expect(scope == .app)
    }

    @Test("Convert scenario scope")
    func testScenarioScopeConversion() {
        let descriptor = StoreDescriptor(
            scope: "scenario",
            storage: "memory",
            initialValue: nil
        )

        let scope = descriptor.toScope(scenarioId: "cart")

        #expect(scope == .scenario(id: "cart"))
    }

    @Test("Convert memory storage")
    func testMemoryStorageConversion() {
        let descriptor = StoreDescriptor(
            scope: "app",
            storage: "memory",
            initialValue: nil
        )

        let storage = descriptor.toStorage()

        #expect(storage == .memory)
    }

    @Test("Convert userPrefs storage")
    func testUserPrefsStorageConversion() {
        let descriptor = StoreDescriptor(
            scope: "app",
            storage: "userprefs",
            initialValue: nil
        )

        let storage = descriptor.toStorage()

        #expect(storage == .userPrefs(suite: nil))
    }

    @Test("Convert file storage")
    func testFileStorageConversion() {
        let descriptor = StoreDescriptor(
            scope: "scenario",
            storage: "file",
            initialValue: nil
        )

        let storage = descriptor.toStorage()

        guard case .file(let url) = storage else {
            Issue.record("Expected file storage")
            return
        }

        #expect(url.lastPathComponent.contains("store_scenario_file.json"))
    }

    @Test("Convert backend storage")
    func testBackendStorageConversion() {
        let descriptor = StoreDescriptor(
            scope: "app",
            storage: "backend",
            initialValue: nil
        )

        let storage = descriptor.toStorage()

        #expect(storage == .backend(namespace: "default"))
    }
}
```

---

## Integration Tests

### File: `packages/render-admin-sdk/tests/integration/transpile-and-execute.test.ts`

#### Test Suite: Transpile → Parse → Execute Flow

**Purpose**: Verify complete TypeScript → JSON → Swift flow

```typescript
import { describe, it, expect } from 'vitest'
import { transpile } from '../src/transpiler/transpiler'

describe('Transpile and Execute Integration', () => {
  it('should transpile store declaration and actions', async () => {
    const code = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View, Button } from './ui'

      export const SCENARIO_KEY = 'cart'

      type CartStore = {
        items: Array<{ id: number; name: string }>
        total: number
      }

      const cartStore = store<CartStore>({
        scope: StoreScope.Scenario,
        storage: StoreStorage.Memory,
        initialValue: {
          items: [],
          total: 0
        }
      })

      export default function Cart() {
        cartStore.set('total', 100)

        return (
          <View>
            <Button onPress={() => cartStore.set('total', 200)}>
              Update Total
            </Button>
          </View>
        )
      }
    `

    const result = await transpile(code)

    // Verify scenario structure
    expect(result.key).toBe('cart')
    expect(result.version).toBe('1.0.0')
    expect(result.main).toBeDefined()

    // Verify store
    expect(result.stores).toHaveLength(1)
    expect(result.stores![0].scope).toBe('scenario')
    expect(result.stores![0].storage).toBe('memory')
    expect(result.stores![0].initialValue).toBeDefined()
    expect(result.stores![0].initialValue!.items).toEqual({ type: 'array', value: [] })
    expect(result.stores![0].initialValue!.total).toEqual({ type: 'integer', value: 0 })

    // Verify actions
    expect(result.actions).toBeDefined()
    expect(result.actions!.length).toBeGreaterThan(0)

    // Verify JSON is valid
    const json = JSON.stringify(result)
    expect(() => JSON.parse(json)).not.toThrow()

    // Verify structure matches iOS expectations
    const parsed = JSON.parse(json)
    expect(parsed.stores).toBeInstanceOf(Array)
    expect(parsed.actions).toBeInstanceOf(Array)
    expect(parsed.stores[0]).toHaveProperty('scope')
    expect(parsed.stores[0]).toHaveProperty('storage')
    expect(parsed.actions[0]).toHaveProperty('id')
    expect(parsed.actions[0]).toHaveProperty('type')
    expect(parsed.actions[0]).toHaveProperty('keyPath')
  })
})
```

---

### File: `packages/render-ios-sdk/Tests/RenderEngineTests/Actions/RendererContextActionTests.swift`

#### Test Suite: RendererContext Action Integration

**Purpose**: Verify RendererContext action execution

```swift
import Testing
import Foundation
@testable import RenderEngine

@Suite("RendererContext Action Tests")
struct RendererContextActionTests {

    @Test("Initialize stores from descriptors")
    func testInitializeStores() {
        var context = RendererContext()
        let factory = DefaultStoreFactory()
        context.setStoreFactory(factory)

        let descriptors = [
            StoreDescriptor(
                scope: "scenario",
                storage: "memory",
                initialValue: [
                    "count": .integer(42),
                    "name": .string("Test")
                ]
            )
        ]

        context.initializeStores(from: descriptors, scenarioId: "test")

        // Verify store was created
        let store = factory.makeStore(scope: .scenario(id: "test"), storage: .memory)
        #expect(store.get("count") == .integer(42))
        #expect(store.get("name") == .string("Test"))
    }

    @Test("Execute action by ID")
    func testExecuteActionById() throws {
        var context = RendererContext()
        let factory = DefaultStoreFactory()
        context.setStoreFactory(factory)

        let action = Action(
            id: "test_action",
            type: .storeSet,
            scope: "app",
            storage: "memory",
            keyPath: "data",
            value: .string("test"),
            actions: nil
        )

        // Register action
        context.loadedActions = ["test_action": action]

        // Execute
        let result = try context.executeAction(id: "test_action")

        #expect(result == true)

        // Verify
        let store = factory.makeStore(scope: .app, storage: .memory)
        #expect(store.get("data") == .string("test"))
    }

    @Test("Throw error for missing action")
    func testThrowErrorForMissingAction() {
        let context = RendererContext()

        #expect(throws: ActionError.self) {
            try context.executeAction(id: "nonexistent")
        }
    }

    @Test("Execute multiple actions by IDs")
    func testExecuteMultipleActions() throws {
        var context = RendererContext()
        let factory = DefaultStoreFactory()
        context.setStoreFactory(factory)

        let actions = [
            Action(id: "action1", type: .storeSet, scope: "app", storage: "memory",
                   keyPath: "key1", value: .string("val1"), actions: nil),
            Action(id: "action2", type: .storeSet, scope: "app", storage: "memory",
                   keyPath: "key2", value: .string("val2"), actions: nil)
        ]

        context.loadedActions = Dictionary(uniqueKeysWithValues: actions.map { ($0.id, $0) })

        try context.executeActions(ids: ["action1", "action2"])

        let store = factory.makeStore(scope: .app, storage: .memory)
        #expect(store.get("key1") == .string("val1"))
        #expect(store.get("key2") == .string("val2"))
    }
}
```

---

## End-to-End Tests

### File: `packages/render-ios-sdk/Tests/RenderEngineTests/Actions/ButtonActionIntegrationTests.swift`

#### Test Suite: Button Action Integration

**Purpose**: Verify button press triggers action execution

```swift
import Testing
import UIKit
@testable import RenderEngine

@MainActor
@Suite("Button Action Integration Tests")
struct ButtonActionIntegrationTests {

    @Test("Button executes action on press")
    func testButtonExecutesAction() async throws {
        let factory = DefaultStoreFactory()
        var context = RendererContext()
        context.setStoreFactory(factory)

        let action = Action(
            id: "button_action",
            type: .storeSet,
            scope: "app",
            storage: "memory",
            keyPath: "clicked",
            value: .bool(true),
            actions: nil
        )

        context.loadedActions = ["button_action": action]

        let button = UIButton()
        button.onPressAction(actionId: "button_action", in: context)

        // Simulate button press
        button.sendActions(for: .touchUpInside)

        // Wait for async execution
        try await Task.sleep(nanoseconds: 100_000_000)

        // Verify action was executed
        let store = factory.makeStore(scope: .app, storage: .memory)
        #expect(store.get("clicked") == .bool(true))
    }

    @Test("RenderableButton sets up action handler from component data")
    func testRenderableButtonActionSetup() async throws {
        let factory = DefaultStoreFactory()
        var context = RendererContext()
        context.setStoreFactory(factory)

        let action = Action(
            id: "component_action",
            type: .storeSet,
            scope: "app",
            storage: "memory",
            keyPath: "pressed",
            value: .string("yes"),
            actions: nil
        )

        context.loadedActions = ["component_action": action]

        // Create component with onPress in data
        let component = Component(
            type: "Button",
            style: Config(),
            properties: Config(["title": "Click Me"]),
            data: Config(["onPress": "component_action"]),
            children: []
        )

        let button = RenderableButton(component: component, context: context)

        // setupActionHandler should be called in init → setupButton
        // Simulate press
        button.sendActions(for: .touchUpInside)

        try await Task.sleep(nanoseconds: 100_000_000)

        let store = factory.makeStore(scope: .app, storage: .memory)
        #expect(store.get("pressed") == .string("yes"))
    }
}
```

---

### File: `e2e-tests/cart-scenario.test.ts`

#### Test Suite: Complete Cart Scenario

**Purpose**: Full end-to-end test of cart scenario with actions

```typescript
import { describe, it, expect } from 'vitest'
import { transpile } from '@render-engine/admin-sdk'
import fs from 'fs'
import path from 'path'

describe('Cart Scenario E2E', () => {
  it('should transpile cart scenario with store and actions', async () => {
    const cartCode = `
      import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk'
      import { View, Row, Column, Text, Button } from './ui'

      export const SCENARIO_KEY = 'cart'
      export const SCENARIO_VERSION = '1.0.0'

      type CartStore = {
        items: Array<{ id: number; name: string; price: number }>
        total: number
      }

      const cartStore = store<CartStore>({
        scope: StoreScope.Scenario,
        storage: StoreStorage.Memory,
        initialValue: {
          items: [],
          total: 0
        }
      })

      export default function Cart() {
        const addItem = () => {
          cartStore.transaction((store) => {
            const newItem = { id: 1, name: 'Product', price: 100 }
            store.set('items', [newItem])
            store.set('total', 100)
          })
        }

        const clearCart = () => {
          cartStore.transaction((store) => {
            store.set('items', [])
            store.set('total', 0)
          })
        }

        return (
          <View>
            <Text>Shopping Cart</Text>

            <Row>
              <Button onPress={addItem}>Add Item</Button>
              <Button onPress={clearCart}>Clear Cart</Button>
            </Row>

            <Text>Total: {cartStore.get('total')}</Text>
          </View>
        )
      }
    `

    const result = await transpile(cartCode)

    // Verify complete structure
    expect(result.key).toBe('cart')
    expect(result.version).toBe('1.0.0')
    expect(result.main).toBeDefined()
    expect(result.main.type).toBe('View')
    expect(result.stores).toBeDefined()
    expect(result.actions).toBeDefined()

    // Write to file for iOS testing
    const outputPath = path.join(__dirname, '../../fixtures/cart-scenario.json')
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))

    // Verify JSON can be parsed by iOS
    const jsonString = JSON.stringify(result)
    expect(jsonString).toContain('"stores"')
    expect(jsonString).toContain('"actions"')
    expect(jsonString).toContain('"scope":"scenario"')
    expect(jsonString).toContain('"storage":"memory"')
  })
})
```

---

## Test Execution Summary

### TypeScript Tests

```bash
# Run all TypeScript tests
cd packages/render-admin-sdk
pnpm test

# Run specific test suites
pnpm test store-api
pnpm test action-serialization
pnpm test store-collector
pnpm test action-collector
```

**Expected Results:**
- All store API methods create correct actions
- Action serialization produces valid JSON
- Store collector detects store declarations
- Action collector detects method calls
- ~50 tests passing

### iOS SDK Tests

```bash
# Run all Swift tests
cd packages/render-ios-sdk
swift test

# Run specific test suites
swift test --filter ActionParserTests
swift test --filter ActionExecutorTests
swift test --filter StoreValueDescriptorTests
swift test --filter RendererContextActionTests
```

**Expected Results:**
- All action types parse correctly from JSON
- StoreValueDescriptor converts to StoreValue
- ActionExecutor executes all operation types
- RendererContext integrates actions properly
- Button integration works correctly
- ~30 tests passing

### Integration Tests

```bash
# Run integration tests
pnpm test:integration
```

**Expected Results:**
- TypeScript → JSON → Swift round-trip works
- Button actions execute on press
- Complete scenarios transpile and execute
- ~10 tests passing

---

## Test Coverage Goals

### TypeScript
- **Store API**: 100% coverage of public methods
- **Serialization**: 100% coverage of all StoreValue types
- **Transpiler Plugins**: 90%+ coverage of AST visitors

### iOS SDK
- **Action Models**: 100% coverage of Codable conformance
- **Action Execution**: 100% coverage of all action types
- **Integration**: 80%+ coverage of context and button integration

### Integration
- **E2E**: At least 3 complete scenario tests
- **Cross-platform**: Verify JSON compatibility between TS and Swift

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Action API Tests

on: [push, pull_request]

jobs:
  typescript-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: pnpm install
      - run: pnpm test --filter render-admin-sdk

  ios-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - run: swift test
        working-directory: packages/render-ios-sdk

  integration-tests:
    runs-on: macos-latest
    needs: [typescript-tests, ios-tests]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test:integration
```

---

## Manual Testing Checklist

### TypeScript
- [ ] Store creation with all scope/storage combinations
- [ ] All action types (set, remove, merge, transaction)
- [ ] Nested keyPaths (dot notation)
- [ ] Complex value types (nested objects, arrays)
- [ ] Multiple stores in one scenario
- [ ] ActionContext registration and retrieval

### iOS SDK
- [ ] Parse all action types from JSON
- [ ] Execute actions on memory store
- [ ] Execute actions on persistent stores (UserDefaults, File)
- [ ] Transaction execution with multiple nested actions
- [ ] Error handling for missing stores/actions
- [ ] Scope and storage enum conversions

### Integration
- [ ] Transpile simple scenario
- [ ] Transpile complex scenario with transactions
- [ ] Load transpiled JSON in iOS app
- [ ] Execute actions from button press
- [ ] Verify store updates trigger UI refresh
- [ ] Test with multiple concurrent actions

---

## Performance Testing

### Transpiler Performance
- Measure transpilation time for large scenarios (>1000 LOC)
- Verify AST traversal is efficient
- Profile memory usage during transpilation

### iOS Execution Performance
- Measure action execution time (should be <10ms)
- Test with large stores (>1000 keys)
- Verify transaction batching improves performance

### Memory Testing
- Monitor memory usage during action execution
- Verify no memory leaks in RendererContext
- Test with many concurrent actions

---

## Conclusion

This comprehensive test plan covers:
- **80+ unit tests** across TypeScript and iOS SDK
- **10+ integration tests** for cross-platform compatibility
- **3+ E2E tests** for complete scenarios
- **CI/CD integration** for automated testing
- **Manual testing checklists** for QA
- **Performance benchmarks** for optimization

Total estimated test coverage: **85%+** across all components.
