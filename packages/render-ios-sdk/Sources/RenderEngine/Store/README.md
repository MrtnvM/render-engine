# Store API for iOS Render SDK

## Overview

The **Store API** is a comprehensive key-value data management system for the iOS Render SDK that enables reactive, persistent scenario data with automatic UI updates.

## Features

- ✅ **Type-Safe Values**: StoreValue enum with support for strings, numbers, booleans, arrays, objects, colors, URLs, and null
- ✅ **Thread-Safe Operations**: Serial DispatchQueue ensures safe concurrent access
- ✅ **Reactive Updates**: Combine publishers for automatic component re-rendering
- ✅ **Multiple Storage Backends**: Memory, UserDefaults, File, and Remote (placeholder)
- ✅ **Scoped Instances**: App-level and Scenario-level isolation
- ✅ **Transaction Support**: Batch multiple operations into single change events
- ✅ **KeyPath Navigation**: Dot and bracket notation (e.g., `cart.total`, `items[0].name`)
- ✅ **Lifecycle Management**: StoreFactory handles instance registry and cleanup
- ✅ **Debug Inspector**: UIKit-based inspector for viewing and editing store data (DEBUG builds only)

## Architecture

```
Store/
├── Models/                     # Data models
│   ├── StoreValue.swift       # Value types
│   ├── StorePatch.swift       # Mutation operations
│   ├── StoreChange.swift      # Change events
│   ├── Scope.swift            # Scope definitions
│   ├── Storage.swift          # Storage types
│   └── SemanticVersion.swift  # Versioning
│
├── Core/                       # Core Store logic
│   ├── Store.swift            # Protocol definition
│   ├── DefaultStore.swift     # Implementation
│   ├── StoreFactory.swift     # Factory protocol
│   └── DefaultStoreFactory.swift  # Factory implementation
│
├── KeyPath/                    # KeyPath resolution
│   ├── KeyPathComponent.swift
│   ├── KeyPathResolver.swift
│   └── KeyPathNavigator.swift
│
├── Storage/                    # Persistence backends
│   ├── StorageBackend.swift
│   ├── MemoryStorageBackend.swift
│   ├── UserPrefsStorageBackend.swift
│   ├── FileStorageBackend.swift
│   └── RemoteStorageBackend.swift
│
├── Publishers/                 # Combine integration
│   ├── StorePublisher.swift
│   └── StoreMultiKeyPublisher.swift
│
├── Integration/                # UI integration
│   ├── StoreSubscriptionManager.swift
│   └── UIView+StoreBinding.swift
│
└── Debug/                      # Debugging tools
    └── StoreInspector.swift   # Debug inspector UI
```

## Usage

### Basic Operations

```swift
// Get store from DI container
let factory = DIContainer.shared.storeFactory
let store = factory.makeStore(scope: .app, storage: .memory)

// Set values
store.set("cart.total", .number(100.0))
store.set("user.name", .string("Alice"))
store.set("items[0].title", .string("Product"))

// Get values
if let total = store.get("cart.total") {
    print("Cart total: \(total)")
}

// Typed get
let userName: String = try store.get("user.name", as: String.self)

// Check existence
if store.exists("cart.total") {
    // ...
}

// Remove
store.remove("cart.total")
```

### Transactions

Batch multiple operations into a single change event:

```swift
store.transaction { store in
    store.set("user.name", .string("Bob"))
    store.set("user.age", .integer(30))
    store.set("user.city", .string("NYC"))
}
// All three changes emit as a single StoreChange
```

### Reactive Subscriptions

```swift
// Subscribe to a single keyPath
let cancellable = store.publisher(for: "cart.total")
    .sink { value in
        print("Cart total changed: \(value ?? .null)")
    }

// Subscribe to multiple keyPaths
let cancellable = store.publisher(for: ["name", "age", "city"])
    .sink { values in
        print("User data changed: \(values)")
    }
```

### UI Binding

```swift
// Bind a UIView to a store keyPath
myLabel.bind(to: "user.name", in: store) { value in
    self.myLabel.text = value?.stringValue
}

// Subscriptions are automatically cancelled when the view is deallocated
```

### Storage Types

```swift
// In-memory (ephemeral)
let memoryStore = factory.makeStore(scope: .app, storage: .memory)

// UserDefaults (persistent)
let prefsStore = factory.makeStore(scope: .app, storage: .userPrefs())

// File-based (persistent JSON)
let fileURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    .appendingPathComponent("store.json")
let fileStore = factory.makeStore(scope: .app, storage: .file(url: fileURL))

// Remote backend (future)
let remoteStore = factory.makeStore(scope: .app, storage: .backend(namespace: "prod"))
```

### Scopes

```swift
// App-level store (global, persists across scenarios)
let appStore = factory.makeStore(scope: .app, storage: .userPrefs())

// Scenario-specific store (isolated to scenario session)
let scenarioStore = factory.makeStore(scope: .scenario(id: "checkout"), storage: .memory)

// Reset scenario stores when scenario ends
factory.resetStores(for: .scenario(id: "checkout"))
```

### Merge Operations

```swift
// Merge object properties
store.set("user", .object(["name": .string("Alice")]))
store.merge("user", ["age": .integer(30), "city": .string("NYC")])

// Result: user = { name: "Alice", age: 30, city: "NYC" }
```

### Snapshot & Replace

```swift
// Get complete snapshot
let snapshot = store.snapshot()

// Replace entire store
store.replaceAll(with: [
    "name": .string("New Data"),
    "count": .integer(42)
])
```

## Integration with Renderer

### RendererContext

The `RendererContext` now includes an optional `store` property:

```swift
public struct RendererContext {
    public let store: Store?
    // ... other properties
}
```

### Component Rendering with Store

```swift
class MyRenderer: Renderer {
    func render(component: Component, context: RendererContext) -> UIView? {
        guard let store = context.store else { return nil }

        let view = UILabel()

        // Bind to store
        view.bind(to: "user.name", in: store) { [weak view] value in
            view?.text = value?.stringValue ?? ""
        }

        return view
    }
}
```

## Debug Inspector

In DEBUG builds, you can use the StoreInspector to view and manipulate store data:

```swift
#if DEBUG
let inspector = StoreInspector(store: myStore)
let navController = UINavigationController(rootViewController: inspector)
present(navController, animated: true)
#endif
```

Features:
- Browse all keyPaths and values
- Add/edit/delete values
- Refresh to see live updates
- Clear entire store

## KeyPath Syntax

The Store API supports both dot notation and bracket notation:

```swift
// Dot notation
"cart.total"
"user.address.city"

// Bracket notation (array indices)
"items[0]"
"items[0].name"
"matrix[0][1]"

// Mixed notation
"users[1].address.city"
"cart.items[0].variants[2].price"
```

## Thread Safety

All Store operations are thread-safe:

- Mutations are serialized through a dedicated DispatchQueue
- Reads are thread-safe
- Combine publishers handle concurrent subscriptions safely

## Versioning

Use `SemanticVersion` for version-based lifecycle management:

```swift
let v1 = SemanticVersion(major: 1, minor: 0, patch: 0)
let v2 = SemanticVersion(major: 2, minor: 0, patch: 0)

// Check for major version changes (triggers data reset per spec)
if v1.hasDifferentMajor(from: v2) {
    factory.resetStores(for: .scenario(id: "checkout"))
}
```

## Testing

The Store API includes comprehensive tests using Swift Testing:

```bash
swift test --filter Store
```

Test coverage includes:
- StoreValue encoding/decoding
- KeyPath parsing and navigation
- Store CRUD operations
- Transactions
- Publishers and subscriptions
- StoreFactory lifecycle
- SemanticVersion comparison

## Files Created

**Implementation:** 23 Swift files
**Tests:** 6 test suites

Total: ~2500+ lines of production code + ~800+ lines of tests

## Design Decisions

1. **Separate StoreValue vs. JSONValue**: Created dedicated `StoreValue` type for Store-specific semantics (color, url types)

2. **StoreFactory for Lifecycle**: Centralized instance management and version-based resets

3. **On-Demand Backend Sync**: Storage backends use load/save pattern (not real-time streaming)

4. **Renderers Subscribe via Associated Objects**: UIView extension stores Combine cancellables in associated objects for automatic cleanup

5. **Dot + Bracket Notation**: Full support for both keyPath styles for developer flexibility

6. **Graceful get() vs. Throwing get(as:)**: `get()` returns nil, `get(_:as:)` throws for type safety

7. **RenderViewController Deallocation Cleanup**: Store cleanup happens when scenario view controller deallocates (or explicit resetStores)

8. **Combine as Primary**: Combine publishers per spec, with potential for AsyncSequence wrappers in the future

9. **UIKit Inspector**: Debug inspector uses UIKit for simplicity and compatibility

10. **Swift Testing Framework**: Using modern Swift Testing for better async support and clarity

## Performance Characteristics

- **Get operations**: O(d) where d = depth of keyPath
- **Set operations**: O(d + s) where s = size of modified subtree
- **Publisher notifications**: O(s) where s = number of subscriptions
- **Memory**: Persistent stores load/save on-demand (not held in memory permanently)

## Future Enhancements

- [ ] Remote backend implementation with real-time sync
- [ ] AsyncSequence support alongside Combine
- [ ] Store middleware/interceptors for logging/validation
- [ ] Query API for complex filtering
- [ ] Optimistic updates for remote backend
- [ ] Conflict resolution strategies
- [ ] Store migrations (currently drops on major version bump)

## See Also

- [Store API Specification](../../../../../docs/specs/store.spec.md)
- [Task Description](../../../../../docs/task/task-description.md)
