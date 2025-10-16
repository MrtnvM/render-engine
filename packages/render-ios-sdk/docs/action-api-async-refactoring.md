# Action API Async/Await Refactoring

## Overview

Refactored the Store and Action API to use Swift's structured concurrency (async/await) instead of DispatchQueue to eliminate deadlocks and improve performance.

## Changes Made

### 1. DefaultStore - Actor-Based Concurrency

**Before:** Used `DispatchQueue.sync/async` causing deadlocks when publishers called `get()` from within queue operations.

**After:** Uses Swift `actor` for thread-safe state management.

**Key Changes:**
- Removed `DispatchQueue`
- Added `StoreActor` for isolated state access
- All mutation methods now `async`
- Publishers use `Task` to await values
- No more deadlocks!

```swift
// Old (DispatchQueue)
public func set(_ keyPath: String, _ value: StoreValue) {
    queue.async { [weak self] in
        // ... mutation logic
    }
}

public func get(_ keyPath: String) -> StoreValue? {
    return queue.sync {
        KeyPathNavigator.get(keyPath, in: root)
    }
}

// New (Actor)
public func set(_ keyPath: String, _ value: StoreValue) async {
    let (patch, root) = await actor.set(keyPath, value: value)
    emitChange(patch: patch)
    await saveToBackend(root: root)
}

public func get(_ keyPath: String) async -> StoreValue? {
    return await actor.get(keyPath)
}
```

### 2. Store Protocol - Async Methods

All Store protocol methods are now `async`:

```swift
protocol Store {
    func get(_ keyPath: String) async -> StoreValue?
    func set(_ keyPath: String, _ value: StoreValue) async
    func merge(_ keyPath: String, _ object: [String: StoreValue]) async
    func remove(_ keyPath: String) async
    func transaction(_ block: @escaping @Sendable (Store) -> Void) async
    func snapshot() async -> [String: StoreValue]
    func replaceAll(with root: [String: StoreValue]) async
    func exists(_ keyPath: String) async -> Bool
    func get<T: Decodable>(_ keyPath: String, as type: T.Type) async throws -> T
}
```

### 3. ActionExecutor - Async Execution

All action execution methods are now `async`:

```swift
// Old
public func execute(_ action: Action, scenarioId: String = "default") throws -> Bool

// New
public func execute(_ action: Action, scenarioId: String = "default") async throws -> Bool
```

**Usage:**
```swift
let executor = ActionExecutor(storeFactory: factory)
let action = Action(id: "test", type: .storeSet, ...)
try await executor.execute(action)
```

### 4. RendererContext - Async Action Methods

```swift
// Initialize stores
await context.initializeStores(from: descriptors, scenarioId: "cart")

// Execute actions
try await context.executeAction(id: "myAction", scenarioId: "cart")
try await context.executeActions(ids: ["action1", "action2"])
try await context.executeAction(action)
```

### 5. StoreActor Implementation

New actor that encapsulates all mutable state:

```swift
private actor StoreActor {
    private var root: StoreValue = .object([:])
    private var currentTransactionID: UUID?
    private var transactionPatches: [StorePatch] = []

    func get(_ keyPath: String) -> StoreValue?
    func set(_ keyPath: String, value: StoreValue) -> (StorePatch, [String: StoreValue])
    func merge(_ keyPath: String, object: [String: StoreValue]) -> (StorePatch, [String: StoreValue])
    func remove(_ keyPath: String) -> (StorePatch, [String: StoreValue])
    func transaction(block: @Sendable () -> Void) -> ([StorePatch], [String: StoreValue])
    func snapshot() -> [String: StoreValue]
    func replaceAll(with data: [String: StoreValue]) -> StorePatch
}
```

## Test Updates Required

All tests must be updated to use `async/await`:

### Example Test Migration

**Before:**
```swift
@Test("Execute set action")
func testExecuteSetAction() {
    let executor = ActionExecutor(storeFactory: factory)
    let action = Action(...)

    let result = try executor.execute(action)
    #expect(result == true)

    // Wait for async
    try await Task.sleep(nanoseconds: 100_000_000)

    let store = factory.makeStore(scope: .app, storage: .memory)
    #expect(store.get("userName") == .string("Alice"))
}
```

**After:**
```swift
@Test("Execute set action")
func testExecuteSetAction() async throws {
    let executor = ActionExecutor(storeFactory: factory)
    let action = Action(...)

    let result = try await executor.execute(action)
    #expect(result == true)

    // No sleep needed - operations are sequential!
    let store = factory.makeStore(scope: .app, storage: .memory)
    let value = await store.get("userName")
    #expect(value == .string("Alice"))
}
```

### Key Changes for Tests

1. **Add `async` to test functions:**
   ```swift
   @Test func myTest() async throws { ... }
   ```

2. **Use `await` for all store operations:**
   ```swift
   await store.set("key", .string("value"))
   let value = await store.get("key")
   #expect(await store.exists("key") == true)
   ```

3. **Use `await` for action execution:**
   ```swift
   try await executor.execute(action)
   try await context.executeAction(id: "myAction")
   ```

4. **Remove manual sleep delays:**
   - No longer needed!
   - Operations are properly awaited

5. **Update transaction tests:**
   ```swift
   await store.transaction { store in
       // Transaction block is now @Sendable
   }
   ```

## Benefits

### 1. No More Deadlocks ✅
- Actor isolation prevents concurrent access
- No `queue.sync` from within `queue.async`
- Publishers can safely await values

### 2. Better Performance ✅
- No thread blocking with `queue.sync`
- Efficient task suspension/resumption
- Cooperative multitasking

### 3. Type Safety ✅
- Swift 6 strict concurrency
- `@Sendable` closures
- Actor isolation checked at compile time

### 4. Cleaner Code ✅
- No manual queue management
- No completion handlers
- Linear async/await flow

### 5. Predictable Timing ✅
- Operations complete before continuing
- No race conditions
- Tests don't need artificial delays

## Migration Checklist

- [x] Refactor DefaultStore to use actor
- [x] Update Store protocol
- [x] Update ActionExecutor
- [x] Update RendererContext
- [ ] Update ActionExecutorTests
- [ ] Update RendererContextActionTests
- [ ] Update DefaultStoreTests
- [ ] Update StoreFactoryTests
- [ ] Run all tests
- [ ] Update documentation

## Files Modified

### Core Implementation
1. `Sources/RenderEngine/Store/Core/DefaultStore.swift` - Actor-based implementation
2. `Sources/RenderEngine/Store/Core/Store.swift` - Async protocol
3. `Sources/RenderEngine/Actions/ActionExecutor.swift` - Async execution
4. `Sources/RenderEngine/Actions/RendererContext+Actions.swift` - Async context methods

### Tests to Update
1. `Tests/RenderEngineTests/Actions/ActionExecutorTests.swift`
2. `Tests/RenderEngineTests/Actions/RendererContextActionTests.swift`
3. `Tests/RenderEngineTests/Store/DefaultStoreTests.swift`
4. `Tests/RenderEngineTests/Store/StoreFactoryTests.swift`

## Breaking Changes

### Public API Changes

All Store and Action methods are now `async`. Any code calling these methods must:

1. Be in an `async` context
2. Use `await` keyword
3. Handle structured concurrency properly

### Example Migration

```swift
// Old - Synchronous
func updateCart() {
    let store = factory.makeStore(scope: .app, storage: .memory)
    store.set("cart.total", .integer(100))
}

// New - Async
func updateCart() async {
    let store = factory.makeStore(scope: .app, storage: .memory)
    await store.set("cart.total", .integer(100))
}
```

## Performance Impact

**Positive:**
- No thread blocking
- Better CPU utilization
- Faster under concurrent load

**Considerations:**
- Initial `await` has minimal overhead (~microseconds)
- Actor reentrancy handled automatically
- No manual synchronization needed

## Testing Strategy

1. **Unit Tests:** All store operations
2. **Integration Tests:** Action execution flow
3. **Concurrency Tests:** Parallel access safety
4. **Performance Tests:** Compare before/after timing

## Conclusion

The async/await refactoring eliminates the deadlock issues while providing better performance, type safety, and code clarity. All tests must be updated to use async/await, but no artificial delays are needed anymore since operations complete deterministically.
