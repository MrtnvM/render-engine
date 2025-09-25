# Store API Implementation

This directory contains the complete implementation of the Store API for the iOS Render SDK as specified in `/docs/specs/store.spec.md`.

## Architecture

The Store API is organized into the following layers:

```
Domain/Store/
├── StoreValue.swift          # Core data model for all storable values
├── StorePatch.swift          # Represents changes to store values
├── StoreEnums.swift          # Scope and Storage enums
├── StoreValidation.swift     # Validation system
├── StoreProtocol.swift       # Store and StoreFactory protocols
└── StoreError.swift          # Error handling

Infrastructure/Store/
├── BaseStore.swift           # Base implementation of Store protocol
├── StoreStorageBackend.swift # Storage backend protocol and utilities
├── StoreFactory.swift        # Default StoreFactory implementation
├── ScenarioStoreFactory.swift # Scenario-specific factory
├── MemoryStorageBackend.swift # In-memory storage
├── UserDefaultsStorageBackend.swift # UserDefaults storage
├── FileStorageBackend.swift  # File-based storage
└── ScenarioSessionStorageBackend.swift # Scenario session storage

SDK/
├── RenderSDK.swift           # Integration with RenderSDK
├── ComponentStore.swift       # Component binding helpers
├── StoreDebugInspector.swift # Debug tools (DEBUG builds only)
└── StoreUsageExample.swift    # Usage examples
```

## Key Features Implemented

✅ **Core Data Models**
- `StoreValue` enum supporting all JSON-compatible types plus `color` and `url`
- `StorePatch` and `StoreChange` for representing mutations
- Full Codable support for serialization

✅ **Scope and Storage**
- `Scope` enum: `.app` and `.scenario(id: String)`
- `Storage` enum: `.memory`, `.userPrefs()`, `.file(url:)`, `.backend(namespace:)`, `.scenarioSession`
- Semantic versioning with major version handling

✅ **Validation System**
- Strict and lenient validation modes
- Configurable validation rules per key path
- Type, range, pattern, and length validation

✅ **Reactive Publishers**
- Combine publishers for reactive data observation
- Component lifecycle binding support
- Thread-safe operations with serial queues

✅ **Storage Backends**
- **Memory**: Fast, ephemeral storage
- **UserPrefs**: Persistent UserDefaults storage
- **File**: Atomic JSON file storage
- **ScenarioSession**: Scenario lifecycle storage
- **Backend**: Placeholder for remote storage

✅ **Store Factory**
- Singleton-like store reuse for identical scope+storage combinations
- Version management with automatic reset on major version bumps
- Scenario session lifecycle management

✅ **SDK Integration**
- Full integration into `RenderSDK`
- Component binding helpers (`ComponentStore`)
- Debug inspector for development builds
- Comprehensive usage examples

## Usage Examples

### Basic Usage

```swift
let sdk = RenderSDK.shared

// Get stores
let appStore = sdk.getAppStore() // App-level persistent storage
let sessionStore = sdk.getScenarioStore(scenarioID: "checkout") // Session storage

// Set and get values
appStore.set("user.name", .string("John Doe"))
let userName = appStore.get("user.name") // StoreValue?

// Typed access
let name: String = try appStore.get("user.name", as: String.self)

// Reactive updates
let cancellable = appStore.publisher(for: "cart.total")
    .sink { value in print("Total changed: \(value)") }
```

### Component Binding

```swift
class MyComponent: NSObject {
    @Published var itemCount: Int?

    func setupBindings() {
        componentStore.bindStoreValue(
            "cart.itemCount",
            to: \.itemCount,
            in: store
        )
    }
}
```

### Validation

```swift
let validationOptions = ValidationOptions(
    mode: .strict,
    schema: [
        "user.age": ValidationRule(
            kind: .integer,
            required: true,
            min: 0,
            max: 150
        )
    ]
)
store.configureValidation(validationOptions)
```

### Transactions

```swift
store.transaction { store in
    store.set("cart.item1", .string("Apple"))
    store.set("cart.item2", .string("Banana"))
    // All changes committed atomically
}
```

## Debug Tools (DEBUG builds only)

```swift
#if DEBUG
let inspector = sdk.getDebugInspector()
let debugInfo = inspector.getStoreDebugInfo(store)
let jsonData = inspector.exportAllData()
#endif
```

## Thread Safety

- All store operations are thread-safe
- Each store has its own serial dispatch queue
- Publishers deliver updates on the main thread
- Transactions ensure atomicity

## Performance Considerations

- Memory storage: Fastest, but data lost on app termination
- UserDefaults storage: Persistent, but limited to small data sizes
- File storage: Best for larger datasets, atomic writes
- Scenario session: Automatically cleaned up when scenario ends

## Error Handling

The API provides comprehensive error handling through the `StoreError` enum:
- Key path validation errors
- Decode/encode failures
- Validation errors
- Storage unavailability
- Concurrency issues

All errors implement `LocalizedError` for user-friendly error messages.