import Foundation
import Combine

/// Example usage of the Store API
public class StoreExample {
    private let storeFactory: StoreFactory
    private var cancellables: Set<AnyCancellable> = []

    public init(storeFactory: StoreFactory) {
        self.storeFactory = storeFactory
    }

    /// Demonstrates basic store operations
    public func demonstrateBasicUsage() {
        print("=== Store API Basic Usage Demo ===\n")

        // Create stores for different scopes
        let appStore = storeFactory.makeStore(scope: .app, storage: .userPrefs())
        let scenarioStore = storeFactory.makeStore(scope: .scenario(id: "demo-scenario"), storage: .memory)

        // Basic read/write operations
        appStore.set("user.name", .string("John Doe"))
        appStore.set("user.age", .integer(30))
        appStore.set("user.preferences", .object([
            "theme": .string("dark"),
            "notifications": .bool(true)
        ]))

        print("App Store Data:")
        print("- Name: \(appStore.get("user.name") ?? .null)")
        print("- Age: \(appStore.get("user.age") ?? .null)")
        print("- Theme: \(appStore.get("user.preferences.theme") ?? .null)")

        // Scenario-specific data
        scenarioStore.set("cart.items", .array([
            .object(["name": .string("Widget A"), "price": .number(10.99)]),
            .object(["name": .string("Widget B"), "price": .number(15.49)])
        ]))
        scenarioStore.set("cart.total", .number(26.48))

        print("\nScenario Store Data:")
        print("- Cart items count: \(scenarioStore.get("cart.items")?.arrayValue?.count ?? 0)")
        print("- Cart total: \(scenarioStore.get("cart.total") ?? .null)")

        // Demonstrate transactions
        scenarioStore.transaction { store in
            store.set("cart.discount", .number(5.0))
            store.set("cart.total", .number(21.48)) // 26.48 - 5.0
        }

        print("- After discount: \(scenarioStore.get("cart.total") ?? .null)")

        // Demonstrate observation
        demonstrateObservation(with: appStore)
    }

    /// Demonstrates Combine publishers for observation
    public func demonstrateObservation(with store: Store) {
        print("\n=== Store Observation Demo ===\n")

        // Observe single key path
        store.publisher(for: "user.name")
            .sink { value in
                print("User name changed to: \(value ?? .null)")
            }
            .store(in: &cancellables)

        // Observe multiple key paths
        store.publisher(for: ["user.age", "user.preferences.theme"])
            .sink { change in
                print("Change detected: \(change.patches.count) patches")
                for patch in change.patches {
                    print("  - \(patch.op.rawValue) \(patch.keyPath): \(patch.oldValue ?? .null) -> \(patch.newValue ?? .null)")
                }
            }
            .store(in: &cancellables)

        // Make some changes to trigger observations
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            print("\nTriggering changes...")
            store.set("user.name", .string("Jane Doe"))
            store.set("user.age", .integer(25))
            store.set("user.preferences.theme", .string("light"))
        }
    }

    /// Demonstrates validation
    public func demonstrateValidation() {
        print("\n=== Store Validation Demo ===\n")

        let store = storeFactory.makeStore(scope: .scenario(id: "validation-demo"), storage: .memory)

        // Configure validation rules
        let validationOptions = ValidationOptions(
            mode: .strict,
            schema: [
                "user.age": ValidationRule(
                    kind: .integer,
                    required: true,
                    min: 0,
                    max: 120
                ),
                "user.email": ValidationRule(
                    kind: .string,
                    required: true,
                    pattern: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
                )
            ]
        )

        store.configureValidation(validationOptions)

        // Valid operations
        store.set("user.age", .integer(25))
        store.set("user.email", .string("user@example.com"))

        print("Valid data set successfully:")
        print("- Age: \(store.get("user.age") ?? .null)")
        print("- Email: \(store.get("user.email") ?? .null)")

        // Invalid operations (will be rejected in strict mode)
        store.set("user.age", .string("not a number")) // This will be rejected
        store.set("user.email", .string("invalid-email")) // This will be rejected

        print("After invalid operations:")
        print("- Age: \(store.get("user.age") ?? .null)") // Still 25
        print("- Email: \(store.get("user.email") ?? .null)") // Still user@example.com
    }

    /// Demonstrates different storage backends
    public func demonstrateStorageBackends() {
        print("\n=== Storage Backends Demo ===\n")

        // Memory storage (ephemeral)
        let memoryStore = storeFactory.makeStore(scope: .scenario(id: "memory-demo"), storage: .memory)
        memoryStore.set("temp.data", .string("This will be lost when the store is deallocated"))

        // UserPrefs storage (persisted)
        let prefsStore = storeFactory.makeStore(scope: .app, storage: .userPrefs())
        prefsStore.set("persistent.data", .string("This persists across app launches"))

        // File storage (JSON file)
        let tempDir = FileManager.default.temporaryDirectory
        let fileURL = tempDir.appendingPathComponent("store-demo.json")
        let fileStore = storeFactory.makeStore(scope: .scenario(id: "file-demo"), storage: .file(url: fileURL))
        fileStore.set("file.data", .string("This is stored in a JSON file"))

        print("Data stored in different backends:")
        print("- Memory store: \(memoryStore.get("temp.data") ?? .null)")
        print("- UserPrefs store: \(prefsStore.get("persistent.data") ?? .null)")
        print("- File store: \(fileStore.get("file.data") ?? .null)")
    }

    /// Demonstrates advanced features
    public func demonstrateAdvancedFeatures() {
        print("\n=== Advanced Features Demo ===\n")

        let store = storeFactory.makeStore(scope: .scenario(id: "advanced-demo"), storage: .memory)

        // Batch operations with transactions
        store.transaction { store in
            store.set("batch.operation1", .string("First operation"))
            store.set("batch.operation2", .string("Second operation"))
            store.set("batch.operation3", .string("Third operation"))
        }

        // Nested data structures
        store.set("complex.data", .object([
            "nested": .object([
                "deeply": .object([
                    "nested": .object([
                        "value": .string("Deep nested value")
                    ])
                ])
            ]),
            "array": .array([
                .string("item 1"),
                .string("item 2"),
                .object(["key": .string("value")])
            ])
        ]))

        print("Complex data structure:")
        print("- Deep nested value: \(store.get("complex.data.nested.deeply.nested.value") ?? .null)")
        print("- Array item 0: \(store.get("complex.data.array[0]") ?? .null)")
        print("- Array item 2 key: \(store.get("complex.data.array[2].key") ?? .null)")

        // Demonstrate type-safe access
        if let age: Int = try? store.get("user.age", as: Int.self) {
            print("- Type-safe age access: \(age)")
        }

        // Check existence
        print("- Has user.age: \(store.exists("user.age"))")
        print("- Has nonexistent.key: \(store.exists("nonexistent.key"))")
    }

    /// Run all demonstrations
    public func runAllDemos() {
        demonstrateBasicUsage()
        demonstrateValidation()
        demonstrateStorageBackends()
        demonstrateAdvancedFeatures()

        // Wait a moment for async observations
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            print("\n=== Demo Complete ===")
        }
    }
}

// MARK: - StoreValue Convenience Extensions

extension StoreValue {
    var stringValue: String? {
        if case .string(let value) = self { return value }
        return nil
    }

    var intValue: Int? {
        if case .integer(let value) = self { return value }
        return nil
    }

    var doubleValue: Double? {
        if case .number(let value) = self { return value }
        return nil
    }

    var boolValue: Bool? {
        if case .bool(let value) = self { return value }
        return nil
    }

    var arrayValue: [StoreValue]? {
        if case .array(let value) = self { return value }
        return nil
    }

    var objectValue: [String: StoreValue]? {
        if case .object(let value) = self { return value }
        return nil
    }
}