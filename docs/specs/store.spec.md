# 📑 Store API for Scenario Data (iOS Render SDK)

## 1. Purpose

The **Store API** manages **scenario data**: key–value state used by components for rendering. It provides:

- App-level access (memory, user prefs, file, backend, scenario session).
- Safe updates (serial queue).
- **Combine publishers** for observation.
- Automatic re-render when bound data changes.
- Support for **live expressions**.
- **Validation + persistent cache** options.
- Simple lifecycle rules (drop on major version change, no migrations).
- Debug inspector.

---

## 2. Concepts

### 2.1 Scenario Data

- A **key–value store** representing scenario state.
- KeyPaths: dot/bracket syntax, e.g. `cart.total`, `items[0].title`.
- Values: JSON-compatible, extended with `color`, `url`.

### 2.2 Scopes

- **AppMemory** — ephemeral, in-memory.
- **UserPrefs** — stored in `UserDefaults`.
- **File** — persisted JSON file.
- **ScenarioSession** — per-scenario ephemeral.
- **Backend** — optional remote sync.

### 2.3 Versioning

- `SemanticVersion(major, minor, patch)`.
- On **major change**: scenario data is dropped and reset. No migrations.

### 2.4 Expressions

- **Live Expressions** recompute outputs when dependencies change.
- Explicitly registered; not automatic.

### 2.5 Re-render Strategy

- Component binds to key paths.
- On appear → subscribe.
- On disappear → unsubscribe.
- When store publishes a change, only affected components update.

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
    public let scenarioID: String
    public let patches: [StorePatch]
    public let transactionID: UUID?
}
```

---

## 4. Store API

```swift
public protocol Store: AnyObject {
    var appID: String { get }
    func named(_ scope: Scope) -> KeyValueStore
}

public enum Scope: Equatable {
    case appMemory
    case userPrefs(suite: String? = nil)
    case file(url: URL)
    case scenarioSession(id: String)
    case backend(namespace: String, scenarioID: String? = nil)
}
```

### KeyValueStore

```swift
public protocol KeyValueStore: AnyObject {
    var scope: Scope { get }
    var scenarioID: String? { get }

    // IO
    func get(_ keyPath: String) -> StoreValue?
    func get<T: Decodable>(_ keyPath: String, as: T.Type) throws -> T
    func exists(_ keyPath: String) -> Bool

    // Mutations
    func set(_ keyPath: String, _ value: StoreValue)
    func merge(_ keyPath: String, _ object: [String: StoreValue])
    func remove(_ keyPath: String)

    // Batch
    func transaction(_ block: (KeyValueStore) -> Void)

    // Observation
    func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never>
    func publisher(for keyPaths: Set<String>) -> AnyPublisher<StoreValue, Never>

    // Snapshot
    func snapshot() -> [String: StoreValue]
    func replaceAll(with root: [String: StoreValue])

    // Validation
    func configureValidation(_ options: ValidationOptions)
    func validateWrite(_ keyPath: String, _ value: StoreValue) -> ValidationResult

    // Expressions
    func registerLiveExpression(_ expr: LiveExpression)
    func unregisterLiveExpression(id: String)
}
```

---

## 5. Validation

Validation is the mechanism that ensures values written into the store conform to expected **types, ranges, and constraints**.

### Why?

- Prevents UI/runtime errors (e.g. component expecting a number but store has a string).
- Provides safe defaults when values are missing or invalid.
- Ensures consistency across backends (memory, file, prefs).

### How it works

- When you call `set(keyPath, value)` or `merge(...)`, the store:

  1. Looks up the **rule** for that keyPath (if defined).
  2. Checks type, required-ness, min/max, regex pattern, etc.
  3. If validation passes → value is stored.
  4. If validation fails:

     - In **strict mode** → reject mutation, return `ValidationResult.failed`.
     - In **lenient mode** → attempt coercion (e.g. `"1"` → `1`), or fall back to default, log a warning.

👉 In short:

- **Validation** = runtime rules for what’s allowed into the store.

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

## 6. Expressions

```swift
public struct LiveExpression: Equatable {
    public let id: String
    public let outputKeyPath: String
    public let dependsOn: Set<String>
    public let compute: (_ get: (String) -> StoreValue?) -> StoreValue?
    public let policy: LiveExpressionPolicy
}

public enum LiveExpressionPolicy {
    case writeIfChanged
    case alwaysWrite
}
```

- Store subscribes internally to `dependsOn`.
- Recomputes synchronously on serial queue when dependencies change.
- Writes result back through `set`.

---

## 7. Concurrency

- Mutations run on a **serial DispatchQueue** per store instance.
- Reads thread-safe (sync or async hop).
- Transactions group writes into one `StoreChange`.

---

## 8. Backends

- **Memory** — always present, source of truth.
- **UserPrefs** — small data persisted in `UserDefaults`.
- **File** — persisted JSON file, atomic writes.
- **ScenarioSession** — ephemeral, cleared when scenario ends or major version changes.
- **Backend** — optional adapter with `pull` / `push`.

---

## 9. Renderer Integration

- Components declare key path bindings.
- Renderer subscribes via `store.publisher(for: Set<String>)`.
- On appear → subscribe; on disappear → cancel.
- When patch intersects bindings:

  - Simple prop updates directly applied.
  - Complex components → subtree re-render scheduled on main runloop.

---

## 10. Lifecycle

- On scenario start: init session store, load cache if configured.
- On scenario end: clear session store.
- On major version bump: drop scenario store & caches.

---

## 11. Debugging

- **Inspector only**:

  - List current values by keyPath.
  - Show active subscriptions.
  - Show recent mutations (patch log).
  - Allow manual writes (test UI updates).

- Enabled only in debug builds.

---

## 12. Example

```swift
let store = DefaultStore(appID: "com.acme.app")
let s = store.named(.scenarioSession(id: "checkout"))

s.configureValidation(.init(
    mode: .strict,
    schema: [
      "cart.total": Rule(kind: .number, required: true, defaultValue: .number(0)),
      "user.name": Rule(kind: .string, required: false)
    ],
))

// Live expression: cart.total = sum(items[*].price)
s.registerLiveExpression(.init(
    id: "sum-total",
    outputKeyPath: "cart.total",
    dependsOn: ["items[*].price"],
    compute: { get in
        guard case let .array(arr)? = get("items") else { return .number(0) }
        let sum = arr.compactMap {
            if case let .object(obj) = $0, case let .number(p)? = obj["price"] { return p }
            return nil
        }.reduce(0, +)
        return .number(sum)
    },
    policy: .writeIfChanged
))
```

---

## 13. Acceptance Criteria

- ✅ Multiple backends (memory, prefs, file, session, backend).
- ✅ Combine observation per keyPath.
- ✅ Auto subscribe/unsubscribe with component lifecycle.
- ✅ Serial queue guarantees thread safety.
- ✅ Transactions coalesce patches.
- ✅ Live expressions recompute on dependencies.
- ✅ Validation with persistent cache policy.
- ✅ Drop scenario data on major version bump.
- ✅ Debug inspector only.
