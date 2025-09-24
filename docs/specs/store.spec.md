# 📑 Store API for Scenario Data (iOS Render SDK) — Instance-Scoped

## 1. Purpose

The **Store API** manages **scenario data**: key–value state used by components for rendering. It provides:

- Scope-bound and storage-bound store instances.
- Safe updates (serial queue).
- **Combine publishers** for observation.
- Automatic re-render when bound data changes.
- **Validation** of stored values.
- Simple lifecycle rules (drop on major version change, no migrations).
- Debug inspector for development.

---

## 2. Concepts

### 2.1 Scenario Data

- A **key–value store** representing scenario state.
- KeyPaths: dot/bracket syntax, e.g. `cart.total`, `items[0].title`.
- Values: JSON-compatible, extended with `color`, `url`.

### 2.2 Scopes

- **App** — global application-level state.
- **Scenario(scenarioID)** — data tied to a specific scenario session.

### 2.3 Storage mechanisms

- **Memory** — ephemeral, cleared when app terminates.
- **UserPrefs** — persisted in `UserDefaults`.
- **File** — persisted JSON file.
- **Backend** — optional remote sync adapter.
- **ScenarioSession** — ephemeral, cleared when scenario ends.

### 2.4 Versioning

- Controlled via `SemanticVersion(major, minor, patch)`.
- On **major bump**: scenario data is dropped and reset.
- No migrations.

### 2.5 Re-render Strategy

- Components bind to key paths.
- On appear → subscribe.
- On disappear → unsubscribe.
- Store publishes changes only to affected components.

---

## 3. Data Model

```swift
public enum StoreValue: Codable, Equatable {
    case string(String), number(Double), integer(Int), bool(Bool)
    case color(String), url(String)
    case array([StoreValue]), object([String: StoreValue]), null
}

public struct StorePatch: Equatable {
    public enum Op { case set, remove, merge }
    public let op: Op
    public let keyPath: String
    public let oldValue: StoreValue?
    public let newValue: StoreValue?
}

public struct StoreChange: Equatable {
    public let patches: [StorePatch]
    public let transactionID: UUID?
}
```

---

## 4. Store API

```swift
public enum Scope: Equatable {
    case app
    case scenario(id: String)
}

public enum Storage: Equatable {
    case memory
    case userPrefs(suite: String? = nil)
    case file(url: URL)
    case backend(namespace: String)
    case scenarioSession
}

public protocol Store: AnyObject {
    var scope: Scope { get }
    var storage: Storage { get }

    // IO
    func get(_ keyPath: String) -> StoreValue?
    func get<T: Decodable>(_ keyPath: String, as: T.Type) throws -> T
    func exists(_ keyPath: String) -> Bool

    // Mutations
    func set(_ keyPath: String, _ value: StoreValue)
    func merge(_ keyPath: String, _ object: [String: StoreValue])
    func remove(_ keyPath: String)

    // Batch
    func transaction(_ block: (Store) -> Void)

    // Observation
    func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never>
    func publisher(for keyPaths: Set<String>) -> AnyPublisher<StoreValue, Never>

    // Snapshot
    func snapshot() -> [String: StoreValue]
    func replaceAll(with root: [String: StoreValue])

    // Validation
    func configureValidation(_ options: ValidationOptions)
    func validateWrite(_ keyPath: String, _ value: StoreValue) -> ValidationResult
}
```

---

## 4.1 Store Factory

A `StoreFactory` is responsible for creating `Store` instances bound to a specific **scope** and **storage**.
This ensures consistent lifecycle management (e.g., session clearing, versioning rules, shared caches).

```swift
public protocol StoreFactory: AnyObject {
    /// Returns a Store bound to given scope and storage.
    /// If a Store already exists for the combination, the same instance may be reused.
    func makeStore(scope: Scope, storage: Storage) -> Store

    /// Optionally drop and recreate all stores for a given scope (e.g., on major version bump).
    func resetStores(for scope: Scope)
}
```

### Responsibilities

- Manage the **registry of Store instances**.
- Enforce **singleton-like reuse** when multiple components request the same `(scope, storage)`.
- Apply **lifecycle rules**:

  - Drop scenario stores when scenario ends.
  - Drop/reset all stores when major version changes.

- Provide central place to inject cross-cutting behavior (e.g., logging, analytics, persistence adapters).

### Example

```swift
let factory = DefaultStoreFactory()

let appStore = factory.makeStore(scope: .app, storage: .userPrefs())
let checkoutStore = factory.makeStore(scope: .scenario(id: "checkout"), storage: .memory)

// Reuse same instance for identical scope+storage
let again = factory.makeStore(scope: .scenario(id: "checkout"), storage: .memory)
assert(checkoutStore === again)
```

## 5. Validation

Validation enforces that data in the store conforms to expected **types, ranges, and constraints**.

- On `set` / `merge`: rules are checked.
- **Strict mode** → reject invalid data.
- **Lenient mode** → coerce or fallback to defaults.

```swift
public struct ValidationOptions: Equatable {
    public enum Mode { case strict, lenient }
    public var mode: Mode
    public var schema: [String: ValidationRule]
}

public struct ValidationRule: Codable, Equatable {
    public enum Kind: String, Codable { case string, number, integer, bool, color, url, array, object }
    public var kind: Kind
    public var required: Bool
    public var defaultValue: StoreValue?
    public var min: Double?
    public var max: Double?
    public var pattern: String?
}

public enum ValidationResult {
    case ok
    case failed(reason: String)
}
```

---

## 6. Concurrency

- Each `Store` has its own **serial DispatchQueue** for mutations.
- Reads are thread-safe.
- `transaction { … }` batches writes into one `StoreChange`.

---

## 7. Backends

- **Memory** — fast, ephemeral.
- **UserPrefs** — persisted in `UserDefaults`.
- **File** — JSON file, atomic writes.
- **ScenarioSession** — cleared after session ends.
- **Backend** — optional push/pull adapter.

---

## 8. Renderer Integration

- Renderer subscribes to key paths using `publisher(for:)`.
- Subscriptions bound to component lifecycle.
- Updates trigger minimal re-renders.

---

## 9. Lifecycle

- Scenario start → init session store.
- Scenario end → clear session store.
- Major version bump → drop caches.

---

## 10. Debugging

- Debug Inspector:

  - Browse key paths and values.
  - Inspect subscriptions.
  - View mutation log.
  - Manual test writes.

---

## 11. Example

```swift
let store = DefaultStore(scope: .scenario(id: "checkout"), storage: .memory)

// Write
store.set("cart.total", .number(100))

// Read
if let total = store.get("cart.total") {
    print("Cart total:", total)
}

// Subscribe
let cancellable = store.publisher(for: "cart.total")
    .sink { value in
        print("Cart total updated:", value ?? .null)
    }
```

---

## 12. Acceptance Criteria

- ✅ Store instances are bound to scope + storage.
- ✅ Multiple storages supported (memory, prefs, file, session, backend).
- ✅ Combine publishers for observation.
- ✅ Serial queue for thread safety.
- ✅ Transactions coalesce patches.
- ✅ Validation with strict/lenient modes.
- ✅ Drop scenario data on major version bump.
- ✅ Debug inspector in debug builds only.
