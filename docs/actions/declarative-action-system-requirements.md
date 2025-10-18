# Requirements: Declarative Action System for Render Engine

## 1. Executive Summary

**Goal:** Convert arbitrary JavaScript event handler code into declarative JSON actions at transpile time, enabling cross-platform execution without JavaScript runtime on mobile devices.

**Core Principle:** JavaScript code in handlers is **transpile-time DSL** that gets analyzed and converted to **declarative action descriptors**. The iOS/Android SDKs execute these actions using native code, not JavaScript interpretation.

---

## 2. System Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Authoring Layer (TypeScript/JSX)                            │
├─────────────────────────────────────────────────────────────┤
│ <Button onPress={() => {                                    │
│   if (cartStore.get('total') > 1000) {                      │
│     cartStore.set('discount', 0.1)                          │
│     navigate('checkout', { promoApplied: true })            │
│   } else {                                                   │
│     showToast('Add more items for discount')                │
│   }                                                          │
│ }} />                                                        │
└─────────────────────────────────────────────────────────────┘
                        ↓ Transpiler Analysis
┌─────────────────────────────────────────────────────────────┐
│ JSON Action Descriptors                                      │
├─────────────────────────────────────────────────────────────┤
│ {                                                            │
│   "kind": "conditional",                                     │
│   "condition": {                                             │
│     "type": "greaterThan",                                   │
│     "left": { "kind": "storeValue", "keyPath": "total" },   │
│     "right": { "kind": "literal", "value": 1000 }           │
│   },                                                         │
│   "then": [                                                  │
│     { "kind": "store.set", "keyPath": "discount", ... },    │
│     { "kind": "navigation.push", "screen": "checkout" }     │
│   ],                                                         │
│   "else": [                                                  │
│     { "kind": "ui.showToast", "message": "..." }            │
│   ]                                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                        ↓ Native Execution
┌─────────────────────────────────────────────────────────────┐
│ iOS/Android SDK (Native Code)                               │
├─────────────────────────────────────────────────────────────┤
│ ConditionalActionExecutor.execute(action) {                 │
│   let conditionResult = evaluateCondition(action.condition) │
│   if (conditionResult) {                                    │
│     executeActionSequence(action.then)                      │
│   } else {                                                   │
│     executeActionSequence(action.else)                      │
│   }                                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Action Type Taxonomy

### 3.1 Base Action Interface

```typescript
interface BaseAction {
  id: string              // Unique action identifier (generated)
  kind: ActionKind        // Discriminator for action type
  metadata?: {
    sourceLocation?: { line: number; column: number }
    description?: string
  }
}

type ActionKind =
  | 'store.set' | 'store.remove' | 'store.merge' | 'store.transaction'
  | 'navigation.push' | 'navigation.pop' | 'navigation.replace' | 'navigation.modal'
  | 'ui.showToast' | 'ui.showAlert' | 'ui.showSheet'
  | 'system.share' | 'system.openUrl' | 'system.haptic'
  | 'api.request'
  | 'sequence' | 'conditional' | 'switch'
```

### 3.2 Store Actions

```typescript
// Already implemented, keeping for reference
interface StoreSetAction extends BaseAction {
  kind: 'store.set'
  storeRef: StoreReference
  keyPath: string
  value: ValueDescriptor
}

interface StoreRemoveAction extends BaseAction {
  kind: 'store.remove'
  storeRef: StoreReference
  keyPath: string
}

interface StoreMergeAction extends BaseAction {
  kind: 'store.merge'
  storeRef: StoreReference
  keyPath: string
  value: ValueDescriptor  // Must be object type
}

interface StoreTransactionAction extends BaseAction {
  kind: 'store.transaction'
  storeRef: StoreReference
  actions: StoreAction[]  // Nested store operations
}

interface StoreReference {
  scope: 'app' | 'scenario'
  storage: 'memory' | 'userPrefs' | 'file' | 'backend'
}
```

### 3.3 Navigation Actions

```typescript
interface NavigationPushAction extends BaseAction {
  kind: 'navigation.push'
  screenId: string        // Reference to another scenario key
  params?: Record<string, ValueDescriptor>
  animated?: boolean
}

interface NavigationPopAction extends BaseAction {
  kind: 'navigation.pop'
  count?: number          // Number of screens to pop (default: 1)
  animated?: boolean
}

interface NavigationReplaceAction extends BaseAction {
  kind: 'navigation.replace'
  screenId: string
  params?: Record<string, ValueDescriptor>
}

interface NavigationModalAction extends BaseAction {
  kind: 'navigation.modal'
  screenId: string
  params?: Record<string, ValueDescriptor>
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet'
}
```

### 3.4 UI Actions

```typescript
interface ShowToastAction extends BaseAction {
  kind: 'ui.showToast'
  message: ValueDescriptor  // String value or store reference
  duration?: number         // Milliseconds
  position?: 'top' | 'center' | 'bottom'
}

interface ShowAlertAction extends BaseAction {
  kind: 'ui.showAlert'
  title: ValueDescriptor
  message?: ValueDescriptor
  buttons: AlertButton[]
}

interface AlertButton {
  text: string
  style: 'default' | 'cancel' | 'destructive'
  action?: ActionDescriptor  // Action to execute on press
}

interface ShowSheetAction extends BaseAction {
  kind: 'ui.showSheet'
  title?: ValueDescriptor
  options: SheetOption[]
}

interface SheetOption {
  text: string
  icon?: string
  action?: ActionDescriptor
}
```

### 3.5 System Actions

```typescript
interface ShareAction extends BaseAction {
  kind: 'system.share'
  content: {
    text?: ValueDescriptor
    url?: ValueDescriptor
    image?: ValueDescriptor
  }
}

interface OpenUrlAction extends BaseAction {
  kind: 'system.openUrl'
  url: ValueDescriptor
  inApp?: boolean  // Open in in-app browser vs external
}

interface HapticAction extends BaseAction {
  kind: 'system.haptic'
  style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
}
```

### 3.6 API Actions

```typescript
interface ApiRequestAction extends BaseAction {
  kind: 'api.request'
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, ValueDescriptor>
  body?: ValueDescriptor
  onSuccess?: SequenceAction    // Actions to execute on 2xx response
  onError?: SequenceAction      // Actions to execute on error
  responseMapping?: {
    targetStoreRef: StoreReference
    keyPath: string
    transform?: ResponseTransform
  }
}

interface ResponseTransform {
  type: 'jsonPath' | 'template'
  expression: string
}
```

### 3.7 Control Flow Actions

```typescript
interface SequenceAction extends BaseAction {
  kind: 'sequence'
  actions: ActionDescriptor[]
  strategy: 'serial' | 'parallel'
  stopOnError?: boolean
}

interface ConditionalAction extends BaseAction {
  kind: 'conditional'
  condition: ConditionDescriptor
  then: ActionDescriptor[]
  else?: ActionDescriptor[]
}

interface SwitchAction extends BaseAction {
  kind: 'switch'
  value: ValueDescriptor
  cases: Array<{
    match: ValueDescriptor
    actions: ActionDescriptor[]
  }>
  default?: ActionDescriptor[]
}
```

### 3.8 Value & Condition Descriptors

```typescript
type ValueDescriptor =
  | LiteralValue
  | StoreValueRef
  | ComputedValue
  | EventDataRef

interface LiteralValue {
  kind: 'literal'
  type: 'string' | 'number' | 'integer' | 'bool' | 'null'
  value: string | number | boolean | null
}

interface StoreValueRef {
  kind: 'storeValue'
  storeRef: StoreReference
  keyPath: string
  defaultValue?: LiteralValue
}

interface ComputedValue {
  kind: 'computed'
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'concat' | 'template'
  operands: ValueDescriptor[]
  template?: string  // For template operation: "Hello, {0}!"
}

interface EventDataRef {
  kind: 'eventData'
  path: string  // e.g., "value", "checked", "selectedIndex"
}

// Condition descriptors for conditional actions
interface ConditionDescriptor {
  type: ConditionType
  left?: ValueDescriptor
  right?: ValueDescriptor
  conditions?: ConditionDescriptor[]  // For 'and', 'or', 'not'
}

type ConditionType =
  | 'equals' | 'notEquals'
  | 'greaterThan' | 'greaterThanOrEqual'
  | 'lessThan' | 'lessThanOrEqual'
  | 'contains' | 'startsWith' | 'endsWith'  // String operations
  | 'isEmpty' | 'isNull'
  | 'and' | 'or' | 'not'
```

---

## 4. Transpiler Requirements

### 4.1 Handler Analysis Pipeline

```
JavaScript Handler
    ↓
┌─────────────────────────┐
│ 1. Parse to AST         │ ← Already done by Babel
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ 2. Validate Handler     │ ← New: Check if handler is analyzable
│    - No external refs   │
│    - No async/await     │
│    - No complex loops   │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ 3. Analyze Statements   │ ← New: Convert each statement to action
│    - if → conditional   │
│    - store.set → action │
│    - navigate() → action│
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ 4. Build Action Graph   │ ← New: Create ActionDescriptor tree
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ 5. Validate & Optimize  │ ← New: Check action graph validity
└─────────────────────────┘
    ↓
Action Descriptors (JSON)
```

### 4.2 Supported Handler Patterns

#### ✅ **Pattern 1: Simple Store Operation**

```typescript
// Input
<Button onPress={() => store.set('count', 5)} />

// Output
{
  "kind": "store.set",
  "storeRef": { "scope": "scenario", "storage": "memory" },
  "keyPath": "count",
  "value": { "kind": "literal", "type": "integer", "value": 5 }
}
```

#### ✅ **Pattern 2: Conditional Logic**

```typescript
// Input
<Button onPress={() => {
  if (store.get('count') > 10) {
    store.set('status', 'high')
  } else {
    store.set('status', 'low')
  }
}} />

// Output
{
  "kind": "conditional",
  "condition": {
    "type": "greaterThan",
    "left": { "kind": "storeValue", "keyPath": "count", ... },
    "right": { "kind": "literal", "value": 10 }
  },
  "then": [
    { "kind": "store.set", "keyPath": "status", "value": { ... } }
  ],
  "else": [
    { "kind": "store.set", "keyPath": "status", "value": { ... } }
  ]
}
```

#### ✅ **Pattern 3: Action Sequence**

```typescript
// Input
<Button onPress={() => {
  store.set('loading', true)
  apiCall('/user')
  navigate('profile')
}} />

// Output
{
  "kind": "sequence",
  "strategy": "serial",
  "actions": [
    { "kind": "store.set", ... },
    { "kind": "api.request", ... },
    { "kind": "navigation.push", ... }
  ]
}
```

#### ✅ **Pattern 4: Store Transaction**

```typescript
// Input
<Button onPress={() => {
  store.transaction(s => {
    s.set('items', [])
    s.set('total', 0)
  })
}} />

// Output
{
  "kind": "store.transaction",
  "storeRef": { ... },
  "actions": [
    { "kind": "store.set", "keyPath": "items", ... },
    { "kind": "store.set", "keyPath": "total", ... }
  ]
}
```

#### ✅ **Pattern 5: Using Event Data**

```typescript
// Input
<TextField onChange={(value) => store.set('text', value)} />

// Output
{
  "kind": "store.set",
  "keyPath": "text",
  "value": { "kind": "eventData", "path": "value" }
}
```

#### ✅ **Pattern 6: Computed Values**

```typescript
// Input
<Button onPress={() => {
  store.set('total', store.get('price') * store.get('quantity'))
}} />

// Output
{
  "kind": "store.set",
  "keyPath": "total",
  "value": {
    "kind": "computed",
    "operation": "multiply",
    "operands": [
      { "kind": "storeValue", "keyPath": "price" },
      { "kind": "storeValue", "keyPath": "quantity" }
    ]
  }
}
```

### 4.3 Unsupported Patterns (Compile Errors)

#### ❌ **External Variable References**

```typescript
// ❌ Error: Cannot reference external variables
const userName = 'Alice'
<Button onPress={() => store.set('name', userName)} />

// Error: "Cannot access variable 'userName' from enclosing scope.
//         Use store values or inline literals."
```

#### ❌ **Async/Await Operations**

```typescript
// ❌ Error: Async operations not supported
<Button onPress={async () => {
  const data = await fetch('/api/user')
  store.set('user', data)
}} />

// Error: "Async handlers are not supported. Use 'api.request' action instead."
```

#### ❌ **Complex Loops**

```typescript
// ❌ Error: Dynamic loops not supported
<Button onPress={() => {
  for (let i = 0; i < items.length; i++) {
    store.set(`item_${i}`, items[i])
  }
}} />

// Error: "Dynamic loops are not supported. Use array literals or batch operations."
```

#### ❌ **Arbitrary Function Calls**

```typescript
// ❌ Error: Unknown function
<Button onPress={() => {
  Math.random()
  store.set('value', result)
}} />

// Error: "Unknown function 'Math.random'. Only predefined actions are allowed."
```

### 4.4 API for Predefined Actions

To make handlers analyzable, provide TypeScript APIs:

```typescript
// packages/render-admin-sdk/src/runtime/actions.ts

// Navigation API
export const navigate = {
  push: (screenId: string, params?: Record<string, any>) =>
    void __ACTION_MARKER__('navigation.push', { screenId, params }),
  pop: (count?: number) =>
    void __ACTION_MARKER__('navigation.pop', { count }),
  replace: (screenId: string, params?: Record<string, any>) =>
    void __ACTION_MARKER__('navigation.replace', { screenId, params }),
  modal: (screenId: string, params?: Record<string, any>) =>
    void __ACTION_MARKER__('navigation.modal', { screenId, params }),
}

// UI API
export const ui = {
  showToast: (message: string, options?: ToastOptions) =>
    void __ACTION_MARKER__('ui.showToast', { message, ...options }),
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) =>
    void __ACTION_MARKER__('ui.showAlert', { title, message, buttons }),
}

// System API
export const system = {
  share: (content: ShareContent) =>
    void __ACTION_MARKER__('system.share', { content }),
  openUrl: (url: string, inApp?: boolean) =>
    void __ACTION_MARKER__('system.openUrl', { url, inApp }),
  haptic: (style: HapticStyle) =>
    void __ACTION_MARKER__('system.haptic', { style }),
}

// API request
export function apiRequest(config: ApiRequestConfig) {
  return void __ACTION_MARKER__('api.request', config)
}
```

**Usage:**

```typescript
import { navigate, ui, system } from '@render-engine/admin-sdk/actions'

<Button onPress={() => {
  if (store.get('isValid')) {
    navigate.push('success')
    ui.showToast('Success!')
  }
}} />
```

### 4.5 Transpiler Error Reporting

Errors must be clear and actionable:

```typescript
interface TranspileError {
  code: string              // e.g., 'E001_EXTERNAL_REFERENCE'
  message: string           // Human-readable error
  location: {
    file: string
    line: number
    column: number
  }
  suggestion?: string       // How to fix
  relatedDocs?: string      // Link to documentation
}
```

**Example Errors:**

```
Error [E001]: Cannot reference external variable 'userName'
  --> cart.tsx:45:23
   |
45 |   <Button onPress={() => store.set('name', userName)} />
   |                                             ^^^^^^^^
   |
Suggestion: Use store values or inline literals instead.
  store.set('name', store.get('userName'))

Documentation: https://docs.render-engine.com/actions/variable-scope

---

Error [E002]: Unsupported async operation
  --> cart.tsx:52:19
   |
52 |   <Button onPress={async () => {
   |                    ^^^^^
   |
Suggestion: Use the 'apiRequest' action for API calls:
  apiRequest({
    endpoint: '/api/user',
    method: 'GET',
    onSuccess: { kind: 'sequence', actions: [...] }
  })

Documentation: https://docs.render-engine.com/actions/api-requests
```

---

## 5. iOS SDK Requirements

### 5.1 Action Executor Architecture

```swift
// Core protocol
protocol ActionExecutor {
    var kind: ActionKind { get }
    func execute(_ action: ActionDescriptor, context: ExecutionContext) async throws
}

// Execution context provides runtime dependencies
struct ExecutionContext {
    let storeFactory: StoreFactory
    let navigationController: UINavigationController?
    let scenarioId: String
    let eventData: [String: Any]?  // Data from UI events
    let logger: Logger
}

// Registry of executors
class ActionExecutorRegistry {
    private var executors: [ActionKind: ActionExecutor] = [:]

    func register(_ executor: ActionExecutor) {
        executors[executor.kind] = executor
    }

    func execute(_ action: ActionDescriptor, context: ExecutionContext) async throws {
        guard let executor = executors[action.kind] else {
            throw ActionError.unsupportedActionKind(action.kind)
        }
        try await executor.execute(action, context: context)
    }
}
```

### 5.2 Executor Implementations

#### **Store Executor**

```swift
class StoreSetActionExecutor: ActionExecutor {
    let kind: ActionKind = .storeSet

    func execute(_ action: ActionDescriptor, context: ExecutionContext) async throws {
        guard let storeAction = action as? StoreSetAction else {
            throw ActionError.invalidActionType
        }

        let store = context.storeFactory.getOrCreateStore(
            scope: storeAction.storeRef.scope,
            storage: storeAction.storeRef.storage
        )

        let value = try resolveValue(storeAction.value, context: context)
        store.set(storeAction.keyPath, value)
    }

    private func resolveValue(_ descriptor: ValueDescriptor, context: ExecutionContext) throws -> StoreValue {
        switch descriptor.kind {
        case .literal:
            return descriptor.value.toStoreValue()
        case .storeValue:
            let store = context.storeFactory.getOrCreateStore(...)
            return store.get(descriptor.keyPath) ?? descriptor.defaultValue
        case .computed:
            return try evaluateComputed(descriptor, context: context)
        case .eventData:
            return try extractEventData(descriptor.path, from: context.eventData)
        }
    }
}
```

#### **Conditional Executor**

```swift
class ConditionalActionExecutor: ActionExecutor {
    let kind: ActionKind = .conditional

    func execute(_ action: ActionDescriptor, context: ExecutionContext) async throws {
        guard let conditionalAction = action as? ConditionalAction else {
            throw ActionError.invalidActionType
        }

        let conditionResult = try evaluateCondition(
            conditionalAction.condition,
            context: context
        )

        let actionsToExecute = conditionResult ? conditionalAction.then : conditionalAction.else

        for action in actionsToExecute ?? [] {
            try await context.registry.execute(action, context: context)
        }
    }

    private func evaluateCondition(_ condition: ConditionDescriptor, context: ExecutionContext) throws -> Bool {
        switch condition.type {
        case .equals:
            let left = try resolveValue(condition.left!, context: context)
            let right = try resolveValue(condition.right!, context: context)
            return left == right

        case .greaterThan:
            let left = try resolveNumeric(condition.left!, context: context)
            let right = try resolveNumeric(condition.right!, context: context)
            return left > right

        case .and:
            return try condition.conditions!.allSatisfy {
                try evaluateCondition($0, context: context)
            }

        case .or:
            return try condition.conditions!.contains {
                try evaluateCondition($0, context: context)
            }

        // ... more condition types
        }
    }
}
```

#### **Navigation Executor**

```swift
class NavigationPushActionExecutor: ActionExecutor {
    let kind: ActionKind = .navigationPush

    func execute(_ action: ActionDescriptor, context: ExecutionContext) async throws {
        guard let navAction = action as? NavigationPushAction else {
            throw ActionError.invalidActionType
        }

        guard let navigationController = context.navigationController else {
            throw ActionError.navigationNotAvailable
        }

        // Load target scenario
        let targetScenario = try await loadScenario(key: navAction.screenId)

        // Create view controller from scenario
        let viewController = try ScenarioViewController(
            scenario: targetScenario,
            params: navAction.params,
            context: context
        )

        await MainActor.run {
            navigationController.pushViewController(
                viewController,
                animated: navAction.animated ?? true
            )
        }
    }
}
```

#### **Sequence Executor**

```swift
class SequenceActionExecutor: ActionExecutor {
    let kind: ActionKind = .sequence

    func execute(_ action: ActionDescriptor, context: ExecutionContext) async throws {
        guard let seqAction = action as? SequenceAction else {
            throw ActionError.invalidActionType
        }

        switch seqAction.strategy {
        case .serial:
            for action in seqAction.actions {
                do {
                    try await context.registry.execute(action, context: context)
                } catch {
                    if seqAction.stopOnError {
                        throw error
                    }
                    context.logger.error("Action failed: \(error)")
                }
            }

        case .parallel:
            try await withThrowingTaskGroup(of: Void.self) { group in
                for action in seqAction.actions {
                    group.addTask {
                        try await context.registry.execute(action, context: context)
                    }
                }
                try await group.waitForAll()
            }
        }
    }
}
```

### 5.3 Component Integration

```swift
// Button integration
extension Button {
    func configureAction(_ actionId: String, in context: ExecutionContext) {
        self.addTarget(self, action: #selector(handleActionPress), for: .touchUpInside)

        objc_setAssociatedObject(
            self,
            &ActionContext.key,
            ActionContext(actionId: actionId, context: context),
            .OBJC_ASSOCIATION_RETAIN
        )
    }

    @objc private func handleActionPress() {
        guard let actionContext = objc_getAssociatedObject(self, &ActionContext.key) as? ActionContext else {
            return
        }

        Task {
            do {
                guard let action = actionContext.context.loadedActions[actionContext.actionId] else {
                    throw ActionError.actionNotFound(actionContext.actionId)
                }

                try await actionContext.context.registry.execute(
                    action,
                    context: actionContext.context
                )
            } catch {
                print("Action execution failed: \(error)")
                // Optionally show error UI
            }
        }
    }
}

private struct ActionContext {
    static var key = "com.renderengine.actionContext"
    let actionId: String
    let context: ExecutionContext
}
```

---

## 6. Implementation Plan

### **Phase 1: Core Action Types & Transpiler Foundation (Week 1-2)**

**Deliverables:**
- [ ] Define all action TypeScript types in `action-types.ts`
- [ ] Create `ValueDescriptor` and `ConditionDescriptor` types
- [ ] Implement `ActionHandlerAnalyzer` plugin base
- [ ] Support basic patterns: store operations, conditionals
- [ ] Add comprehensive error messages

**Files to Create/Modify:**
- `packages/render-admin-sdk/src/runtime/action-types.ts` (refactor existing)
- `packages/render-admin-sdk/src/runtime/value-descriptors.ts` (new)
- `packages/render-admin-sdk/src/transpiler/plugins/action-handler-analyzer.ts` (new)
- `packages/render-admin-sdk/src/transpiler/errors.ts` (new)

**Tests:**
- Unit tests for each action type
- Handler analysis tests (success cases)
- Error message tests (failure cases)

### **Phase 2: Predefined Action APIs (Week 2-3)**

**Deliverables:**
- [ ] Implement TypeScript APIs: `navigate`, `ui`, `system`, `apiRequest`
- [ ] Update transpiler to recognize API calls
- [ ] Convert API calls to action descriptors
- [ ] Add validation for API parameters

**Files to Create:**
- `packages/render-admin-sdk/src/runtime/actions/navigation.ts`
- `packages/render-admin-sdk/src/runtime/actions/ui.ts`
- `packages/render-admin-sdk/src/runtime/actions/system.ts`
- `packages/render-admin-sdk/src/runtime/actions/api.ts`
- `packages/render-admin-sdk/src/runtime/actions/index.ts`

**Tests:**
- API call detection and conversion
- Parameter validation
- Error cases for invalid API usage

### **Phase 3: iOS SDK Executors (Week 3-4)**

**Deliverables:**
- [ ] Implement `ActionExecutor` protocol and registry
- [ ] Build executors: Store, Conditional, Sequence, Navigation, UI
- [ ] Add value resolution (`resolveValue`, `evaluateCondition`)
- [ ] Integrate with `RendererContext`
- [ ] Add error handling and logging

**Files to Create:**
- `packages/render-ios-sdk/Sources/RenderEngine/Actions/ActionExecutor.swift`
- `packages/render-ios-sdk/Sources/RenderEngine/Actions/Executors/StoreActionExecutor.swift`
- `packages/render-ios-sdk/Sources/RenderEngine/Actions/Executors/ConditionalActionExecutor.swift`
- `packages/render-ios-sdk/Sources/RenderEngine/Actions/Executors/SequenceActionExecutor.swift`
- `packages/render-ios-sdk/Sources/RenderEngine/Actions/Executors/NavigationActionExecutor.swift`
- `packages/render-ios-sdk/Sources/RenderEngine/Actions/Executors/UIActionExecutor.swift`
- `packages/render-ios-sdk/Sources/RenderEngine/Actions/ValueResolver.swift`
- `packages/render-ios-sdk/Sources/RenderEngine/Actions/ConditionEvaluator.swift`

**Tests:**
- Unit tests for each executor
- Integration tests with mock stores
- Condition evaluation tests
- Error handling tests

### **Phase 4: Advanced Features (Week 4-5)**

**Deliverables:**
- [ ] API request executor with success/error handling
- [ ] System actions (share, openUrl, haptic)
- [ ] Computed values (arithmetic, string operations)
- [ ] Switch/case actions
- [ ] Action middleware (logging, analytics, debugging)

**Files to Create:**
- `packages/render-ios-sdk/Sources/RenderEngine/Actions/Executors/ApiActionExecutor.swift`
- `packages/render-ios-sdk/Sources/RenderEngine/Actions/Executors/SystemActionExecutor.swift`
- `packages/render-ios-sdk/Sources/RenderEngine/Actions/ComputedValueEvaluator.swift`
- `packages/render-ios-sdk/Sources/RenderEngine/Actions/ActionMiddleware.swift`

### **Phase 5: Documentation & Examples (Week 5-6)**

**Deliverables:**
- [ ] Action system architecture documentation
- [ ] Supported patterns guide with examples
- [ ] Error message reference
- [ ] iOS SDK integration guide
- [ ] Migration guide from current implementation
- [ ] Video tutorial / demo

**Files to Create:**
- `docs/actions/architecture.md`
- `docs/actions/supported-patterns.md`
- `docs/actions/error-reference.md`
- `docs/actions/ios-integration.md`
- `docs/actions/migration-guide.md`
- Example scenarios showcasing all action types

---

## 7. Success Criteria

### **Functional Requirements**
- [ ] All supported handler patterns transpile correctly to actions
- [ ] iOS SDK executes all action types without errors
- [ ] Unsupported patterns produce clear, actionable compile errors
- [ ] Event data (button press, text change) flows to actions correctly
- [ ] Store values can be read and written from actions
- [ ] Conditional logic works with all condition types
- [ ] Navigation actions work across scenarios
- [ ] UI actions (toast, alert) display correctly

### **Non-Functional Requirements**
- [ ] Transpilation time < 500ms for typical scenarios
- [ ] Action execution time < 16ms (60fps) for UI-blocking actions
- [ ] Memory usage: < 5MB for action descriptors in typical scenario
- [ ] Error messages rated 4.5+/5 by developers for clarity
- [ ] Code coverage: 90%+ for transpiler, 95%+ for executors

### **Documentation Requirements**
- [ ] 100% of action types documented with examples
- [ ] 100% of error codes documented with fixes
- [ ] Migration guide covers all breaking changes
- [ ] Video demo showing action system in use

---

## 8. Open Questions & Design Decisions

### **Q1: How to handle dynamic array operations?**

```typescript
// Not supported yet
items.forEach(item => store.set(`item_${item.id}`, item))
```

**Options:**
- **A)** Add `forEach` action type with limited iteration
- **B)** Require batch operations: `store.merge('items', itemsObject)`
- **C)** Reject and require server-side data transformation

**Recommendation:** Option B - use declarative batch operations

### **Q2: How to handle computed values with multiple operations?**

```typescript
// Complex computation
const discount = (price * quantity * 0.9) + shipping
store.set('total', discount)
```

**Options:**
- **A)** Support expression trees with precedence
- **B)** Require intermediate store values
- **C)** Add formula syntax: `"price * quantity * 0.9 + shipping"`

**Recommendation:** Option A initially, Option C for advanced users

### **Q3: How to handle error actions?**

```typescript
// What if store.set fails?
store.set('items', largeArray)  // Might exceed size limit
```

**Options:**
- **A)** Silent failure with logging
- **B)** Throw error and stop execution
- **C)** Add `onError` to each action
- **D)** Global error handler in sequence

**Recommendation:** Option D - sequence-level error handling

### **Q4: How to pass data between actions?**

```typescript
// Pseudo-code
const response = await apiRequest('/user')
store.set('user', response.data.name)  // How to access response?
```

**Options:**
- **A)** Temporary variables in action context
- **B)** Implicit last-result passing
- **C)** Explicit result mapping in API actions

**Recommendation:** Option C - explicit `responseMapping` in API actions

---

## 9. Risk Mitigation

### **Risk 1: Complexity of Handler Analysis**

**Mitigation:**
- Start with simple patterns only
- Expand support incrementally
- Provide clear error messages for unsupported cases
- Create escape hatch: allow native code injection for complex logic

### **Risk 2: iOS Executor Performance**

**Mitigation:**
- Benchmark each executor independently
- Use async/await for non-blocking execution
- Cache condition evaluations when possible
- Profile with Instruments for optimization
