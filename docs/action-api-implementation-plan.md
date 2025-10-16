# Action API Implementation Plan

## Overview

This document describes the implementation plan for a type-safe Action API that allows updating the Store through declarative actions. The system provides TypeScript type safety at authoring time and transpiles to JSON action descriptors that the iOS SDK can parse and execute.

## Goals

1. **Type Safety**: Full TypeScript type safety for store operations
2. **Declarative**: Actions defined alongside UI components
3. **Transpilable**: Convert TypeScript store operations to JSON descriptors
4. **Executable**: iOS SDK can parse and execute action JSON
5. **Reactive**: Actions trigger store updates which flow to UI via publishers

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ TypeScript (Authoring Time)                                 │
├─────────────────────────────────────────────────────────────┤
│ store<SessionStore>({ scope, storage, initialValue })       │
│   ↓                                                          │
│ sessionStore.set('userName', 'Alice')                        │
│   ↓                                                          │
│ <Button onPress={() => sessionStore.set(...)} />            │
└─────────────────────────────────────────────────────────────┘
                        ↓
                  [Transpiler]
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ JSON Action Descriptors                                      │
├─────────────────────────────────────────────────────────────┤
│ {                                                            │
│   "stores": [{                                               │
│     "scope": "scenario",                                     │
│     "storage": "memory",                                     │
│     "initialValue": { ... }                                  │
│   }],                                                        │
│   "actions": [{                                              │
│     "id": "action_set_userName",                             │
│     "type": "store.set",                                     │
│     "scope": "scenario",                                     │
│     "storage": "memory",                                     │
│     "keyPath": "userName",                                   │
│     "value": { "type": "string", "value": "Alice" }          │
│   }]                                                         │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                        ↓
                 [iOS SDK Parser]
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Swift (Runtime)                                              │
├─────────────────────────────────────────────────────────────┤
│ let store = storeFactory.getStore(scope, storage)            │
│ actionExecutor.execute(action, on: store)                    │
│   ↓                                                          │
│ store.set("userName", .string("Alice"))                      │
│   ↓                                                          │
│ [Publisher emits change] → UI updates                        │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decision: Store Identification

**Stores are identified by `scope + storage` combination (no separate ID field)**

This simplifies the design because:
- Each scenario can only have ONE store per (scope, storage) pair
- No need to generate/track store IDs
- Natural mapping to StoreFactory's existing `getOrCreateStore(scope, storage)` API
- Actions reference stores by (scope, storage) instead of ID

## Implementation Phases

### Phase 1: TypeScript API Layer

**Location**: `packages/render-admin-sdk/src/runtime/`

#### 1.1 Store API (`store.ts`)

```typescript
export interface StoreConfig<T = any> {
  scope: StoreScope
  storage: StoreStorage
  initialValue?: T
}

export enum StoreScope {
  App = 'app',
  Scenario = 'scenario'
}

export enum StoreStorage {
  Memory = 'memory',
  UserPrefs = 'userPrefs',
  File = 'file',
  Backend = 'backend'
}

export class Store<T = any> {
  constructor(
    public readonly config: StoreConfig<T>
  ) {}

  // Identifier is scope + storage
  get identifier(): string {
    return `${this.config.scope}.${this.config.storage}`
  }

  // Type-safe operations
  set<K extends keyof T>(keyPath: K, value: T[K]): Action
  set(keyPath: string, value: any): Action

  get<K extends keyof T>(keyPath: K): T[K] | undefined
  get(keyPath: string): any

  remove<K extends keyof T>(keyPath: K): Action
  remove(keyPath: string): Action

  merge<K extends keyof T>(
    keyPath: K,
    value: Partial<T[K]>
  ): Action
  merge(keyPath: string, value: Record<string, any>): Action

  transaction(block: (store: Store<T>) => void): Action
}

// Factory function
export function store<T = any>(config: StoreConfig<T>): Store<T> {
  const instance = new Store<T>(config)

  // Register store in action context for transpiler
  ActionContext.registerStore(instance)

  return instance
}
```

#### 1.2 Action Types (`action-types.ts`)

```typescript
export enum ActionType {
  StoreSet = 'store.set',
  StoreRemove = 'store.remove',
  StoreMerge = 'store.merge',
  StoreTransaction = 'store.transaction'
}

export interface ActionDescriptor {
  id: string
  type: ActionType
  scope: StoreScope      // Store identified by scope + storage
  storage: StoreStorage
  keyPath: string
  value?: StoreValueDescriptor
  actions?: ActionDescriptor[] // For transactions
}

export interface StoreValueDescriptor {
  type: 'string' | 'number' | 'integer' | 'bool' | 'color' | 'url' | 'array' | 'object' | 'null'
  value?: any
}

export interface StoreDescriptor {
  scope: StoreScope
  storage: StoreStorage
  initialValue?: Record<string, any>
}

export interface TranspiledScenarioWithActions extends TranspiledScenario {
  stores?: StoreDescriptor[]
  actions?: ActionDescriptor[]
}
```

#### 1.3 Action Context (`action-context.ts`)

```typescript
// Global context to collect stores and actions during component rendering
export class ActionContext {
  private static stores: Map<string, Store<any>> = new Map()
  private static actions: Map<string, ActionDescriptor> = new Map()

  static registerStore(store: Store<any>): void {
    this.stores.set(store.identifier, store)
  }

  static registerAction(action: Action): void {
    this.actions.set(action.id, action.toDescriptor())
  }

  static getStores(): StoreDescriptor[] {
    return Array.from(this.stores.values()).map(s => ({
      scope: s.config.scope,
      storage: s.config.storage,
      initialValue: s.config.initialValue
    }))
  }

  static getActions(): ActionDescriptor[] {
    return Array.from(this.actions.values())
  }

  static reset(): void {
    this.stores.clear()
    this.actions.clear()
  }
}

export class Action {
  constructor(
    public readonly id: string,
    public readonly type: ActionType,
    public readonly scope: StoreScope,
    public readonly storage: StoreStorage,
    public readonly keyPath: string,
    public readonly value?: any,
    public readonly actions?: Action[]
  ) {
    // Register action in context
    ActionContext.registerAction(this)
  }

  toDescriptor(): ActionDescriptor {
    return {
      id: this.id,
      type: this.type,
      scope: this.scope,
      storage: this.storage,
      keyPath: this.keyPath,
      value: this.value ? this.serializeValue(this.value) : undefined,
      actions: this.actions?.map(a => a.toDescriptor())
    }
  }

  private serializeValue(value: any): StoreValueDescriptor {
    if (value === null) return { type: 'null' }
    if (typeof value === 'string') return { type: 'string', value }
    if (typeof value === 'number') {
      return Number.isInteger(value)
        ? { type: 'integer', value }
        : { type: 'number', value }
    }
    if (typeof value === 'boolean') return { type: 'bool', value }
    if (Array.isArray(value)) {
      return {
        type: 'array',
        value: value.map(v => this.serializeValue(v))
      }
    }
    if (typeof value === 'object') {
      const obj: Record<string, StoreValueDescriptor> = {}
      for (const [k, v] of Object.entries(value)) {
        obj[k] = this.serializeValue(v)
      }
      return { type: 'object', value: obj }
    }
    throw new Error(`Unsupported value type: ${typeof value}`)
  }
}
```

#### 1.4 Store Implementation

```typescript
export class Store<T = any> {
  constructor(
    public readonly config: StoreConfig<T>
  ) {}

  get identifier(): string {
    return `${this.config.scope}.${this.config.storage}`
  }

  set(keyPath: string, value: any): Action {
    const actionId = `${this.identifier}_set_${keyPath.replace(/\./g, '_')}`
    return new Action(
      actionId,
      ActionType.StoreSet,
      this.config.scope,
      this.config.storage,
      keyPath,
      value
    )
  }

  get(keyPath: string): any {
    // Runtime helper - not transpiled
    throw new Error('Store.get() is only available at runtime in iOS SDK')
  }

  remove(keyPath: string): Action {
    const actionId = `${this.identifier}_remove_${keyPath.replace(/\./g, '_')}`
    return new Action(
      actionId,
      ActionType.StoreRemove,
      this.config.scope,
      this.config.storage,
      keyPath
    )
  }

  merge(keyPath: string, value: Record<string, any>): Action {
    const actionId = `${this.identifier}_merge_${keyPath.replace(/\./g, '_')}`
    return new Action(
      actionId,
      ActionType.StoreMerge,
      this.config.scope,
      this.config.storage,
      keyPath,
      value
    )
  }

  transaction(block: (store: Store<T>) => void): Action {
    const transactionId = `${this.identifier}_transaction_${Date.now()}`

    // Create temporary context to collect nested actions
    const nestedActions: Action[] = []
    const proxy = new Proxy(this, {
      get: (target, prop) => {
        if (prop === 'set' || prop === 'remove' || prop === 'merge') {
          return (...args: any[]) => {
            const action = target[prop as keyof Store<T>](...args) as Action
            nestedActions.push(action)
            return action
          }
        }
        return target[prop as keyof Store<T>]
      }
    })

    block(proxy)

    return new Action(
      transactionId,
      ActionType.StoreTransaction,
      this.config.scope,
      this.config.storage,
      '',
      undefined,
      nestedActions
    )
  }
}
```

### Phase 2: Transpiler Extensions

**Location**: `packages/render-admin-sdk/src/transpiler/`

#### 2.1 Detect `store()` Calls

Extend `babel-plugin-jsx-to-json.ts` with a new visitor:

```typescript
// Add to plugin state
interface PluginState {
  // ... existing properties
  stores: Map<string, StoreDescriptor>
  actions: Map<string, ActionDescriptor>
  storeVarToConfig: Map<string, { scope: string; storage: string }>
}

// New visitor for store() calls
const StoreCollector: Visitor<PluginState> = {
  // Detect: const myStore = store<Type>({ ... })
  VariableDeclarator(path, state) {
    const init = path.node.init
    if (
      t.isCallExpression(init) &&
      t.isIdentifier(init.callee) &&
      init.callee.name === 'store'
    ) {
      const storeVarName = (path.node.id as t.Identifier).name
      const configArg = init.arguments[0]

      if (t.isObjectExpression(configArg)) {
        const storeDescriptor = parseStoreConfig(configArg)
        const key = `${storeDescriptor.scope}.${storeDescriptor.storage}`
        state.stores.set(key, storeDescriptor)

        // Track variable name → (scope, storage) mapping
        state.storeVarToConfig.set(storeVarName, {
          scope: storeDescriptor.scope,
          storage: storeDescriptor.storage
        })
      }
    }
  }
}

function parseStoreConfig(node: t.ObjectExpression): StoreDescriptor {
  const props: Record<string, any> = {}

  for (const prop of node.properties) {
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      const key = prop.key.name
      const value = prop.value

      if (t.isMemberExpression(value)) {
        // StoreScope.App → 'app'
        props[key] = (value.property as t.Identifier).name.toLowerCase()
      } else if (t.isObjectExpression(value)) {
        props[key] = parseObjectExpression(value)
      }
    }
  }

  return {
    scope: props.scope || 'scenario',
    storage: props.storage || 'memory',
    initialValue: props.initialValue
  }
}
```

#### 2.2 Track Store Method Calls

```typescript
const ActionCollector: Visitor<PluginState> = {
  // Detect: myStore.set('key', value)
  CallExpression(path, state) {
    const callee = path.node.callee

    if (t.isMemberExpression(callee)) {
      const object = callee.object
      const property = callee.property

      if (
        t.isIdentifier(object) &&
        t.isIdentifier(property) &&
        state.storeVarToConfig.has(object.name)
      ) {
        const storeConfig = state.storeVarToConfig.get(object.name)!
        const methodName = property.name

        if (['set', 'remove', 'merge', 'transaction'].includes(methodName)) {
          const action = parseStoreAction(
            storeConfig.scope,
            storeConfig.storage,
            methodName,
            path.node.arguments
          )
          state.actions.set(action.id, action)
        }
      }
    }
  }
}

function parseStoreAction(
  scope: string,
  storage: string,
  method: string,
  args: Array<t.Expression | t.SpreadElement>
): ActionDescriptor {
  const keyPath = args[0]
  const value = args[1]

  const identifier = `${scope}.${storage}`
  const keyPathStr = extractStringValue(keyPath)

  return {
    id: `${identifier}_${method}_${keyPathStr.replace(/\./g, '_')}`,
    type: `store.${method}` as ActionType,
    scope: scope as StoreScope,
    storage: storage as StoreStorage,
    keyPath: keyPathStr,
    value: value ? serializeValue(value) : undefined
  }
}

function extractStringValue(node: t.Node): string {
  if (t.isStringLiteral(node)) return node.value
  if (t.isTemplateLiteral(node)) {
    // Handle template strings if needed
    return node.quasis[0]?.value.raw || ''
  }
  throw new Error('KeyPath must be a string literal')
}

function serializeValue(node: t.Node): StoreValueDescriptor {
  if (t.isStringLiteral(node)) {
    return { type: 'string', value: node.value }
  }
  if (t.isNumericLiteral(node)) {
    return Number.isInteger(node.value)
      ? { type: 'integer', value: node.value }
      : { type: 'number', value: node.value }
  }
  if (t.isBooleanLiteral(node)) {
    return { type: 'bool', value: node.value }
  }
  if (t.isNullLiteral(node)) {
    return { type: 'null' }
  }
  if (t.isArrayExpression(node)) {
    return {
      type: 'array',
      value: node.elements.map(el =>
        el && !t.isSpreadElement(el) ? serializeValue(el) : { type: 'null' }
      )
    }
  }
  if (t.isObjectExpression(node)) {
    const obj: Record<string, StoreValueDescriptor> = {}
    for (const prop of node.properties) {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        obj[prop.key.name] = serializeValue(prop.value as t.Expression)
      }
    }
    return { type: 'object', value: obj }
  }

  throw new Error(`Unsupported value type in action`)
}
```

#### 2.3 Inject into Transpiled Output

Update `transpiler.ts`:

```typescript
export function transpile(code: string): TranspiledScenarioWithActions {
  // ... existing transpilation logic

  const pluginState = {
    // ... existing state
    stores: new Map<string, StoreDescriptor>(),
    actions: new Map<string, ActionDescriptor>(),
    storeVarToConfig: new Map<string, { scope: string; storage: string }>()
  }

  // Run babel transform with additional visitors
  const result = transformFromAstSync(ast, code, {
    plugins: [
      [jsxToJsonPlugin, pluginState],
      [storeCollectorPlugin, pluginState],
      [actionCollectorPlugin, pluginState]
    ]
  })

  return {
    key: scenarioKey,
    version: scenarioVersion,
    main: mainComponent,
    components: componentMap,
    stores: Array.from(pluginState.stores.values()),
    actions: Array.from(pluginState.actions.values())
  }
}
```

### Phase 3: JSON Action Format

#### 3.1 Complete Schema

```json
{
  "key": "cart-scenario",
  "version": "1.0.0",
  "main": { ... },
  "components": { ... },
  "stores": [
    {
      "scope": "scenario",
      "storage": "memory",
      "initialValue": {
        "cartItems": {
          "type": "array",
          "value": []
        },
        "total": {
          "type": "integer",
          "value": 0
        }
      }
    }
  ],
  "actions": [
    {
      "id": "scenario.memory_set_total",
      "type": "store.set",
      "scope": "scenario",
      "storage": "memory",
      "keyPath": "total",
      "value": {
        "type": "integer",
        "value": 100
      }
    },
    {
      "id": "scenario.memory_merge_user",
      "type": "store.merge",
      "scope": "scenario",
      "storage": "memory",
      "keyPath": "user",
      "value": {
        "type": "object",
        "value": {
          "name": { "type": "string", "value": "Alice" },
          "age": { "type": "integer", "value": 30 }
        }
      }
    },
    {
      "id": "scenario.memory_transaction_1234567890",
      "type": "store.transaction",
      "scope": "scenario",
      "storage": "memory",
      "keyPath": "",
      "actions": [
        {
          "id": "scenario.memory_set_cartItems",
          "type": "store.set",
          "scope": "scenario",
          "storage": "memory",
          "keyPath": "cartItems",
          "value": { "type": "array", "value": [] }
        },
        {
          "id": "scenario.memory_set_total",
          "type": "store.set",
          "scope": "scenario",
          "storage": "memory",
          "keyPath": "total",
          "value": { "type": "integer", "value": 0 }
        }
      ]
    }
  ]
}
```

### Phase 4: iOS SDK Action System

**Location**: `packages/render-ios-sdk/Sources/RenderEngine/Actions/`

#### 4.1 Action Models (`Action.swift`)

```swift
import Foundation

/// Action types that can be executed on a Store
public enum ActionType: String, Codable, Sendable {
    case storeSet = "store.set"
    case storeRemove = "store.remove"
    case storeMerge = "store.merge"
    case storeTransaction = "store.transaction"
}

/// Represents an action to be executed
public struct Action: Codable, Equatable, Sendable {
    public let id: String
    public let type: ActionType
    public let scope: String
    public let storage: String
    public let keyPath: String
    public let value: StoreValueDescriptor?
    public let actions: [Action]? // For transactions

    enum CodingKeys: String, CodingKey {
        case id, type, scope, storage, keyPath, value, actions
    }
}

/// Descriptor for StoreValue in JSON (matches StoreValue enum)
public enum StoreValueDescriptor: Codable, Equatable, Sendable {
    case string(String)
    case number(Double)
    case integer(Int)
    case bool(Bool)
    case color(String)
    case url(String)
    case array([StoreValueDescriptor])
    case object([String: StoreValueDescriptor])
    case null

    enum CodingKeys: String, CodingKey {
        case type, value
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)

        switch type {
        case "string":
            let value = try container.decode(String.self, forKey: .value)
            self = .string(value)
        case "number":
            let value = try container.decode(Double.self, forKey: .value)
            self = .number(value)
        case "integer":
            let value = try container.decode(Int.self, forKey: .value)
            self = .integer(value)
        case "bool":
            let value = try container.decode(Bool.self, forKey: .value)
            self = .bool(value)
        case "color":
            let value = try container.decode(String.self, forKey: .value)
            self = .color(value)
        case "url":
            let value = try container.decode(String.self, forKey: .value)
            self = .url(value)
        case "array":
            let value = try container.decode([StoreValueDescriptor].self, forKey: .value)
            self = .array(value)
        case "object":
            let value = try container.decode([String: StoreValueDescriptor].self, forKey: .value)
            self = .object(value)
        case "null":
            self = .null
        default:
            throw DecodingError.dataCorruptedError(
                forKey: .type,
                in: container,
                debugDescription: "Invalid store value type: \(type)"
            )
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)

        switch self {
        case .string(let value):
            try container.encode("string", forKey: .type)
            try container.encode(value, forKey: .value)
        case .number(let value):
            try container.encode("number", forKey: .type)
            try container.encode(value, forKey: .value)
        case .integer(let value):
            try container.encode("integer", forKey: .type)
            try container.encode(value, forKey: .value)
        case .bool(let value):
            try container.encode("bool", forKey: .type)
            try container.encode(value, forKey: .value)
        case .color(let value):
            try container.encode("color", forKey: .type)
            try container.encode(value, forKey: .value)
        case .url(let value):
            try container.encode("url", forKey: .type)
            try container.encode(value, forKey: .value)
        case .array(let value):
            try container.encode("array", forKey: .type)
            try container.encode(value, forKey: .value)
        case .object(let value):
            try container.encode("object", forKey: .type)
            try container.encode(value, forKey: .value)
        case .null:
            try container.encode("null", forKey: .type)
        }
    }

    /// Convert descriptor to StoreValue
    func toStoreValue() -> StoreValue {
        switch self {
        case .string(let value): return .string(value)
        case .number(let value): return .number(value)
        case .integer(let value): return .integer(value)
        case .bool(let value): return .bool(value)
        case .color(let value): return .color(value)
        case .url(let value): return .url(value)
        case .array(let value): return .array(value.map { $0.toStoreValue() })
        case .object(let value): return .object(value.mapValues { $0.toStoreValue() })
        case .null: return .null
        }
    }
}

/// Store descriptor from JSON
public struct StoreDescriptor: Codable, Equatable, Sendable {
    public let scope: String
    public let storage: String
    public let initialValue: [String: StoreValueDescriptor]?

    /// Convert to Scope enum
    func toScope(scenarioId: String = "default") -> Scope {
        switch scope.lowercased() {
        case "app":
            return .app
        case "scenario":
            return .scenario(scenarioId)
        default:
            return .app
        }
    }

    /// Convert to Storage enum
    func toStorage() -> Storage {
        switch storage.lowercased() {
        case "memory":
            return .memory
        case "userprefs":
            return .userPrefs
        case "file":
            return .file(fileName: "store_\(scope)_\(storage).json")
        case "backend":
            return .backend
        default:
            return .memory
        }
    }
}
```

#### 4.2 Action Parser (`ActionParser.swift`)

```swift
import Foundation

/// Parses JSON action descriptors
public struct ActionParser {

    /// Parse actions from JSON data
    public static func parse(from data: Data) throws -> [Action] {
        let decoder = JSONDecoder()
        return try decoder.decode([Action].self, from: data)
    }

    /// Parse actions from scenario JSON
    public static func parseFromScenario(data: Data) throws -> (stores: [StoreDescriptor], actions: [Action]) {
        let decoder = JSONDecoder()

        struct ScenarioWrapper: Codable {
            let stores: [StoreDescriptor]?
            let actions: [Action]?
        }

        let wrapper = try decoder.decode(ScenarioWrapper.self, from: data)

        return (
            stores: wrapper.stores ?? [],
            actions: wrapper.actions ?? []
        )
    }
}
```

#### 4.3 Action Executor (`ActionExecutor.swift`)

```swift
import Foundation

/// Executes actions on stores
public final class ActionExecutor {

    private let storeFactory: StoreFactory
    private let logger: Logger?

    public init(storeFactory: StoreFactory, logger: Logger? = nil) {
        self.storeFactory = storeFactory
        self.logger = logger
    }

    /// Execute a single action
    @discardableResult
    public func execute(_ action: Action, scenarioId: String = "default") throws -> Bool {
        logger?.debug("Executing action: \(action.id) [\(action.type.rawValue)]", category: "ActionExecutor")

        // Convert scope/storage to Scope and Storage enums
        let scope = scopeFromString(action.scope, scenarioId: scenarioId)
        let storage = storageFromString(action.storage)

        // Get or create the store
        let store = storeFactory.getOrCreateStore(
            scope: scope,
            storage: storage
        )

        switch action.type {
        case .storeSet:
            return try executeSet(action, on: store)

        case .storeRemove:
            return try executeRemove(action, on: store)

        case .storeMerge:
            return try executeMerge(action, on: store)

        case .storeTransaction:
            return try executeTransaction(action, on: store, scenarioId: scenarioId)
        }
    }

    /// Execute multiple actions in sequence
    public func executeAll(_ actions: [Action], scenarioId: String = "default") throws {
        for action in actions {
            try execute(action, scenarioId: scenarioId)
        }
    }

    // MARK: - Private Helpers

    private func executeSet(_ action: Action, on store: Store) throws -> Bool {
        guard let valueDescriptor = action.value else {
            throw ActionError.missingValue(action.id)
        }

        let storeValue = valueDescriptor.toStoreValue()
        store.set(action.keyPath, storeValue)

        logger?.debug("Set \(action.keyPath) = \(storeValue)", category: "ActionExecutor")
        return true
    }

    private func executeRemove(_ action: Action, on store: Store) throws -> Bool {
        store.remove(action.keyPath)

        logger?.debug("Removed \(action.keyPath)", category: "ActionExecutor")
        return true
    }

    private func executeMerge(_ action: Action, on store: Store) throws -> Bool {
        guard let valueDescriptor = action.value,
              case .object(let objectDescriptor) = valueDescriptor else {
            throw ActionError.invalidValueType(action.id, expected: "object")
        }

        let storeObject = objectDescriptor.mapValues { $0.toStoreValue() }
        store.merge(action.keyPath, storeObject)

        logger?.debug("Merged \(action.keyPath)", category: "ActionExecutor")
        return true
    }

    private func executeTransaction(_ action: Action, on store: Store, scenarioId: String) throws -> Bool {
        guard let nestedActions = action.actions else {
            throw ActionError.missingNestedActions(action.id)
        }

        store.transaction { transactionalStore in
            for nestedAction in nestedActions {
                do {
                    let scope = scopeFromString(nestedAction.scope, scenarioId: scenarioId)
                    let storage = storageFromString(nestedAction.storage)

                    // Use the same store for all nested actions in transaction
                    try executeAction(nestedAction, on: transactionalStore)
                } catch {
                    logger?.error("Failed to execute nested action: \(error)", category: "ActionExecutor")
                }
            }
        }

        logger?.debug("Executed transaction with \(nestedActions.count) actions", category: "ActionExecutor")
        return true
    }

    private func executeAction(_ action: Action, on store: Store) throws {
        switch action.type {
        case .storeSet:
            try executeSet(action, on: store)
        case .storeRemove:
            try executeRemove(action, on: store)
        case .storeMerge:
            try executeMerge(action, on: store)
        case .storeTransaction:
            // Nested transactions not supported - execute actions directly
            if let nestedActions = action.actions {
                for nestedAction in nestedActions {
                    try executeAction(nestedAction, on: store)
                }
            }
        }
    }

    private func scopeFromString(_ scope: String, scenarioId: String) -> Scope {
        switch scope.lowercased() {
        case "app":
            return .app
        case "scenario":
            return .scenario(scenarioId)
        default:
            return .app
        }
    }

    private func storageFromString(_ storage: String) -> Storage {
        switch storage.lowercased() {
        case "memory":
            return .memory
        case "userprefs":
            return .userPrefs
        case "file":
            return .file(fileName: "store_\(storage).json")
        case "backend":
            return .backend
        default:
            return .memory
        }
    }
}

// MARK: - Errors

public enum ActionError: Error, LocalizedError {
    case storeNotFound(String)
    case missingValue(String)
    case invalidValueType(String, expected: String)
    case missingNestedActions(String)

    public var errorDescription: String? {
        switch self {
        case .storeNotFound(let identifier):
            return "Store not found: \(identifier)"
        case .missingValue(let actionId):
            return "Action \(actionId) is missing required value"
        case .invalidValueType(let actionId, let expected):
            return "Action \(actionId) has invalid value type, expected: \(expected)"
        case .missingNestedActions(let actionId):
            return "Transaction action \(actionId) is missing nested actions"
        }
    }
}
```

#### 4.4 Integration with Renderer (`RendererContext+Actions.swift`)

```swift
import Foundation

extension RendererContext {

    /// Action executor for this context
    public var actionExecutor: ActionExecutor {
        return ActionExecutor(storeFactory: container.storeFactory, logger: logger)
    }

    /// Initialize stores from scenario descriptors
    public func initializeStores(from descriptors: [StoreDescriptor], scenarioId: String) {
        for descriptor in descriptors {
            let scope = descriptor.toScope(scenarioId: scenarioId)
            let storage = descriptor.toStorage()

            // Get or create store
            let store = container.storeFactory.getOrCreateStore(
                scope: scope,
                storage: storage
            )

            // Set initial values if provided
            if let initialValue = descriptor.initialValue {
                let storeData = initialValue.mapValues { $0.toStoreValue() }
                store.replaceAll(with: storeData)
            }

            logger.debug("Initialized store: \(scope) [\(storage)]", category: "Renderer")
        }
    }

    /// Execute an action by ID
    @discardableResult
    public func executeAction(id: String, scenarioId: String = "default") throws -> Bool {
        // Find action in loaded scenario
        guard let action = loadedActions[id] else {
            throw ActionError.actionNotFound(id)
        }

        return try actionExecutor.execute(action, scenarioId: scenarioId)
    }

    /// Execute multiple actions
    public func executeActions(ids: [String], scenarioId: String = "default") throws {
        for id in ids {
            try executeAction(id: id, scenarioId: scenarioId)
        }
    }
}

// Add to RendererContext properties
extension RendererContext {
    private static var loadedActionsKey = "com.renderengine.loadedActions"

    var loadedActions: [String: Action] {
        get {
            return objc_getAssociatedObject(self, &Self.loadedActionsKey) as? [String: Action] ?? [:]
        }
        set {
            objc_setAssociatedObject(self, &Self.loadedActionsKey, newValue, .OBJC_ASSOCIATION_RETAIN)
        }
    }
}

extension ActionError {
    case actionNotFound(String)
}
```

#### 4.5 Button Integration (`Button+Actions.swift`)

```swift
import UIKit

extension Button {

    /// Configure button to execute an action on press
    public func onPress(actionId: String, in context: RendererContext, scenarioId: String = "default") {
        self.addTarget(self, action: #selector(handleActionPress), for: .touchUpInside)

        // Store action context
        objc_setAssociatedObject(
            self,
            &ActionButtonContext.key,
            ActionButtonContext(actionId: actionId, context: context, scenarioId: scenarioId),
            .OBJC_ASSOCIATION_RETAIN
        )
    }

    @objc private func handleActionPress() {
        guard let actionContext = objc_getAssociatedObject(self, &ActionButtonContext.key) as? ActionButtonContext else {
            return
        }

        do {
            try actionContext.context.executeAction(id: actionContext.actionId, scenarioId: actionContext.scenarioId)
        } catch {
            print("Failed to execute action: \(error)")
        }
    }
}

private struct ActionButtonContext {
    static var key = "com.renderengine.actionButtonContext"
    let actionId: String
    let context: RendererContext
    let scenarioId: String
}
```

### Phase 5: Integration & Testing

#### 5.1 End-to-End Example

**TypeScript (cart.tsx)**:

```typescript
import { View, Row, Column, Text, Button } from '../ui'
import { store, StoreScope, StoreStorage } from '@render-engine/admin-sdk/runtime'

type CartStore = {
  items: Array<{ id: number; name: string; price: number }>
  total: number
}

export const SCENARIO_KEY = 'cart'
export const SCENARIO_VERSION = '1.0.0'

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
    const newItem = { id: 1, name: 'Product', price: 100 }

    cartStore.transaction((store) => {
      const currentItems = store.get('items') || []
      store.set('items', [...currentItems, newItem])

      const currentTotal = store.get('total') || 0
      store.set('total', currentTotal + newItem.price)
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
      <Text>Cart Total: {cartStore.get('total')}</Text>

      <Row>
        <Button onPress={addItem}>Add Item</Button>
        <Button onPress={clearCart}>Clear Cart</Button>
      </Row>
    </View>
  )
}
```

**Transpiled JSON**:

```json
{
  "key": "cart",
  "version": "1.0.0",
  "stores": [
    {
      "scope": "scenario",
      "storage": "memory",
      "initialValue": {
        "items": { "type": "array", "value": [] },
        "total": { "type": "integer", "value": 0 }
      }
    }
  ],
  "actions": [
    {
      "id": "scenario.memory_transaction_addItem",
      "type": "store.transaction",
      "scope": "scenario",
      "storage": "memory",
      "keyPath": "",
      "actions": [
        {
          "id": "scenario.memory_set_items",
          "type": "store.set",
          "scope": "scenario",
          "storage": "memory",
          "keyPath": "items",
          "value": {
            "type": "array",
            "value": [...]
          }
        },
        {
          "id": "scenario.memory_set_total",
          "type": "store.set",
          "scope": "scenario",
          "storage": "memory",
          "keyPath": "total",
          "value": { "type": "integer", "value": 100 }
        }
      ]
    }
  ],
  "main": {
    "type": "View",
    "children": [...]
  }
}
```

**iOS SDK Execution**:

```swift
// In Renderer.swift
func loadScenario(from json: Data, scenarioId: String) throws {
    let decoder = JSONDecoder()
    let (stores, actions) = try ActionParser.parseFromScenario(data: json)

    // Initialize stores
    context.initializeStores(from: stores, scenarioId: scenarioId)

    // Load actions into context
    context.loadedActions = Dictionary(
        uniqueKeysWithValues: actions.map { ($0.id, $0) }
    )

    // Render UI
    let rootView = try renderComponent(scenario.main)

    // Button press triggers action execution
    // button.onPress(actionId: "scenario.memory_transaction_addItem", in: context, scenarioId: scenarioId)
}
```

#### 5.2 Test Coverage

**TypeScript Tests** (`packages/render-admin-sdk/tests/`):
- `store-api.test.ts` - Test Store class methods
- `action-transpiler.test.ts` - Test action transpilation
- `store-detector.test.ts` - Test store() call detection
- `action-collector.test.ts` - Test action collection from AST

**Swift Tests** (`packages/render-ios-sdk/Tests/`):
- `ActionParserTests.swift` - Parse JSON actions
- `ActionExecutorTests.swift` - Execute actions on stores
- `StoreDescriptorTests.swift` - Parse store descriptors
- `ActionIntegrationTests.swift` - End-to-end action flow

## Implementation Timeline

### Week 1: TypeScript Foundation
- Day 1-2: Implement Store API (`store.ts`, `action-types.ts`, `action-context.ts`)
- Day 3-4: Add TypeScript tests
- Day 5: Documentation and examples

### Week 2: Transpiler Extensions
- Day 1-2: Implement StoreCollector visitor
- Day 3-4: Implement ActionCollector visitor
- Day 5: Integration testing with cart example

### Week 3: iOS SDK Action System
- Day 1-2: Implement Action models and parser
- Day 3-4: Implement ActionExecutor
- Day 5: Integration with Renderer and Button

### Week 4: Testing & Documentation
- Day 1-3: Comprehensive test suites for both platforms
- Day 4: Integration tests and examples
- Day 5: Documentation and README updates

## Success Criteria

1. ✅ Type-safe store operations in TypeScript
2. ✅ Actions transpile correctly to JSON
3. ✅ iOS SDK can parse and execute all action types
4. ✅ Store updates trigger UI re-renders via publishers
5. ✅ Button components can trigger actions
6. ✅ Transactions batch multiple operations
7. ✅ 100% test coverage for critical paths
8. ✅ Documentation includes real-world examples

## Future Enhancements

1. **Conditional Actions**: Execute actions based on store state
2. **Action Composition**: Chain actions with dependencies
3. **Optimistic Updates**: UI updates before action execution
4. **Action History**: Undo/redo support
5. **Action Analytics**: Track action execution metrics
6. **Remote Actions**: Execute actions on backend
7. **Action Validation**: Runtime validation of action payloads
8. **Type Generation**: Generate TypeScript types from Swift Store schemas

## References

- Store API Specification: `specs/tech/render-engine/store.spec.md`
- Store Implementation: `packages/render-ios-sdk/Sources/RenderEngine/Store/`
- Transpiler: `packages/render-admin-sdk/src/transpiler/`
- Babel Plugin: `packages/render-admin-sdk/src/transpiler/babel-plugin-jsx-to-json.ts`
