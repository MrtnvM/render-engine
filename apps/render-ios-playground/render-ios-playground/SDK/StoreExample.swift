import Foundation
import Combine

/// Example usage of the Store API
public class StoreExample {
    private let store: Store
    private var subscriptions: Set<AnyCancellable> = []

    public init(store: Store) {
        self.store = store
    }

    public func runExample() {
        print("🏪 Store API Example")

        // Create stores for different scopes
        let memoryStore = store.named(.appMemory)
        let prefsStore = store.named(.userPrefs())
        let sessionStore = store.named(.scenarioSession(id: "checkout"))

        // Configure validation
        configureValidation(for: memoryStore)

        // Set some basic data
        setInitialData(in: memoryStore)

        // Register live expressions
        registerLiveExpressions(in: memoryStore)

        // Subscribe to changes
        subscribeToChanges(in: memoryStore)

        // Demonstrate transactions
        demonstrateTransactions(in: memoryStore)

        // Show backend integration
        demonstrateBackendIntegration()

        // Export/Import data
        demonstrateDataExport()
    }

    private func configureValidation(for store: KeyValueStore) {
        store.configureValidation(.init(
            mode: .strict,
            schema: [
                "cart.total": ValidationRule(
                    kind: .number,
                    required: true,
                    defaultValue: .number(0),
                    min: 0
                ),
                "user.name": ValidationRule(
                    kind: .string,
                    required: false,
                    pattern: "^[a-zA-Z ]+$"
                ),
                "user.email": ValidationRule(
                    kind: .string,
                    required: false,
                    pattern: "^[^@]+@[^@]+\\.[^@]+$"
                ),
                "items": ValidationRule(
                    kind: .array,
                    required: false
                ),
                "cart.items[*].price": ValidationRule(
                    kind: .number,
                    required: true,
                    min: 0
                )
            ]
        ))
    }

    private func setInitialData(in store: KeyValueStore) {
        print("\n📝 Setting initial data...")

        // Set user data
        store.set("user.name", .string("John Doe"))
        store.set("user.email", .string("john@example.com"))

        // Set cart data
        store.set("cart.total", .number(0))
        store.set("cart.items", .array([
            .object([
                "id": .string("item1"),
                "name": .string("Widget A"),
                "price": .number(29.99),
                "quantity": .integer(1)
            ]),
            .object([
                "id": .string("item2"),
                "name": .string("Widget B"),
                "price": .number(15.50),
                "quantity": .integer(2)
            ])
        ]))

        print("✅ Initial data set")
    }

    private func registerLiveExpressions(in store: KeyValueStore) {
        print("\n🔄 Registering live expressions...")

        // Live expression: cart.total = sum(items[*].price * items[*].quantity)
        store.registerLiveExpression(.init(
            id: "calculate-total",
            outputKeyPath: "cart.total",
            dependsOn: ["cart.items[*].price", "cart.items[*].quantity"],
            compute: { get in
                guard case let .array(items)? = get("cart.items") else {
                    return .number(0)
                }

                let total = items.compactMap { item -> Double? in
                    guard case let .object(obj) = item,
                          case let .number(price)? = obj["price"],
                          case let .integer(quantity)? = obj["quantity"] else {
                        return nil
                    }
                    return price * Double(quantity)
                }.reduce(0, +)

                return .number(total)
            },
            policy: .writeIfChanged
        ))

        // Live expression: cart.itemCount = count(items)
        store.registerLiveExpression(.init(
            id: "count-items",
            outputKeyPath: "cart.itemCount",
            dependsOn: ["cart.items"],
            compute: { get in
                guard case let .array(items)? = get("cart.items") else {
                    return .integer(0)
                }
                return .integer(items.count)
            },
            policy: .alwaysWrite
        ))

        print("✅ Live expressions registered")
    }

    private func subscribeToChanges(in store: KeyValueStore) {
        print("\n📡 Subscribing to changes...")

        store.publisher(for: ["cart.total", "cart.itemCount"])
            .sink { values in
                print("🛒 Cart updated:")
                if let total = values["cart.total"]?.numberValue {
                    print("  Total: $\(String(format: "%.2f", total))")
                }
                if let count = values["cart.itemCount"]?.numberValue {
                    print("  Items: \(Int(count))")
                }
            }
            .store(in: &subscriptions)

        store.publisher(for: "user.name")
            .compactMap { $0?.stringValue }
            .sink { name in
                print("👤 User name changed to: \(name)")
            }
            .store(in: &subscriptions)
    }

    private func demonstrateTransactions(in store: KeyValueStore) {
        print("\n💰 Demonstrating transactions...")

        store.transaction { store in
            // Add a new item to cart
            guard case let .array(items)? = store.get("cart.items") else { return }

            let newItem = StoreValue.object([
                "id": .string("item3"),
                "name": .string("Widget C"),
                "price": .number(5.99),
                "quantity": .integer(3)
            ])

            store.set("cart.items", .array(items + [newItem]))
            print("✅ Added new item in transaction")
        }
    }

    private func demonstrateBackendIntegration() {
        print("\n🌐 Demonstrating backend integration...")

        // Register a simple HTTP backend
        let backend = SimpleHTTPStoreBackend(baseURL: URL(string: "https://api.example.com")!)
        store.registerBackend(backend, for: "user-data")

        // Create a backend store
        let backendStore = store.named(.backend(namespace: "user-data", scenarioID: "checkout"))

        // This would sync with the backend
        print("✅ Backend registered and ready")
    }

    private func demonstrateDataExport() {
        print("\n💾 Demonstrating data export/import...")

        #if DEBUG
        if let debugger = store.debugger {
            let exportedData = debugger.exportData()
            print("📤 Exported data: \(exportedData)")

            // You could save this to a file or share it
            print("✅ Data exported successfully")
        }
        #endif
    }

    public func cleanup() {
        subscriptions.forEach { $0.cancel() }
        subscriptions.removeAll()
    }
}

// MARK: - Usage Example

/// How to use the Store API in your app
public func setupStoreExample() {
    // Create a store
    let store = DefaultStore(appID: "com.example.myapp")

    // Create and run the example
    let example = StoreExample(store: store)
    example.runExample()

    // Don't forget to cleanup when done
    example.cleanup()

    print("\n🎉 Store API example completed!")
}