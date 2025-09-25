# Store API Implementation

This directory contains a complete implementation of the Store API specification for the iOS Render SDK.

## Overview

The Store API manages scenario data with support for multiple storage backends, validation, live expressions, and reactive observations using Combine.

## Key Components

### Core Types
- `StoreValue` - Enum representing all supported value types
- `StorePatch` & `StoreChange` - Track changes and mutations
- `Scope` - Different storage backends (memory, prefs, file, session, backend)
- `ValidationRule` & `ValidationOptions` - Runtime validation system
- `LiveExpression` - Computed values that update automatically

### Protocols
- `Store` - Main store interface
- `KeyValueStore` - Scoped key-value storage operations
- `StoreBackend` - Backend adapter for remote synchronization

### Implementations
- `DefaultStore` - Thread-safe store implementation with serial queue
- `DefaultKeyValueStore` - Key-value store with validation and live expressions
- `MemoryStoreBackend` - In-memory storage
- `UserDefaultsStoreBackend` - UserDefaults-based persistence
- `FileStoreBackend` - File-based persistence
- `BackendStoreAdapter` - HTTP backend integration

### Utilities
- `StoreDebugger` - Debug inspector (debug builds only)
- `StoreExample` - Comprehensive usage examples
- `StoreTests` - Unit tests

## Quick Start

```swift
// Create a store
let store = DefaultStore(appID: "com.example.myapp")

// Get a scoped store
let memoryStore = store.named(.appMemory)
let prefsStore = store.named(.userPrefs())
let sessionStore = store.named(.scenarioSession(id: "checkout"))

// Basic operations
memoryStore.set("user.name", .string("John Doe"))
let name = memoryStore.get("user.name") // .string("John Doe")

// Configure validation
memoryStore.configureValidation(.init(
    mode: .strict,
    schema: [
        "user.age": ValidationRule(kind: .integer, min: 0, max: 150)
    ]
))

// Register live expressions
memoryStore.registerLiveExpression(.init(
    id: "full-name",
    outputKeyPath: "user.fullName",
    dependsOn: ["user.firstName", "user.lastName"],
    compute: { get in
        let first = get("user.firstName")?.stringValue ?? ""
        let last = get("user.lastName")?.stringValue ?? ""
        return .string("\(first) \(last)".trimmingCharacters(in: .whitespaces))
    }
))

// Observe changes
memoryStore.publisher(for: "user.fullName")
    .compactMap { $0?.stringValue }
    .sink { fullName in
        print("Full name changed to: \(fullName)")
    }
```

## Features

✅ **Multiple backends** - Memory, UserDefaults, File, Scenario Session, Backend
✅ **Combine observation** - Reactive publishers for all key paths
✅ **Auto subscribe/unsubscribe** - Component lifecycle integration
✅ **Serial queue** - Thread-safe mutations
✅ **Transactions** - Batch operations
✅ **Live expressions** - Computed values with dependency tracking
✅ **Validation** - Runtime type and constraint checking
✅ **Version management** - Automatic cleanup on major version changes
✅ **Debug inspector** - Development tools (debug builds only)

## Architecture

The store system is built with these principles:

1. **Thread Safety** - All mutations run on a serial DispatchQueue
2. **Immutability** - StoreValue types are immutable
3. **Reactive** - Changes are published via Combine
4. **Composable** - Scopes can be combined and nested
5. **Testable** - Full unit test coverage
6. **Debuggable** - Inspector tools for development

## Backend Integration

The store supports remote synchronization through backend adapters:

```swift
// Register a backend
let backend = BackendStoreAdapter(baseURL: URL(string: "https://api.example.com")!)
store.registerBackend(backend, for: "user-data")

// Use backend scope
let backendStore = store.named(.backend(namespace: "user-data", scenarioID: "session-123"))
```

## Testing

Run the included tests to verify functionality:

```swift
let tests = StoreTests()
tests.testBasicOperations()
tests.testValidation()
tests.testLiveExpressions()
// ... etc
```

## Debug Tools

In debug builds, access the inspector:

```swift
#if DEBUG
if let debugger = store.debugger {
    let currentData = debugger.currentValues(for: .appMemory)
    let exported = debugger.exportData()
}
#endif
```

## Example Usage

See `StoreExample.swift` for a comprehensive demonstration of all features including validation, live expressions, transactions, backend integration, and debugging tools.