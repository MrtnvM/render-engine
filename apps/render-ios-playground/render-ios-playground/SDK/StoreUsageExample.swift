import Foundation

/// Example usage of the Store API
public class StoreUsageExample {

    private let sdk = RenderSDK.shared

    public func exampleUsage() {
        // Get stores for different scopes
        let appStore = sdk.getAppStore() // App-level persistent storage
        let sessionStore = sdk.getScenarioStore(scenarioID: "checkout") // Scenario session storage

        // Set values
        appStore.set("user.name", .string("John Doe"))
        appStore.set("user.preferences.theme", .string("dark"))
        appStore.set("cart.itemCount", .integer(5))

        sessionStore.set("checkout.step", .string("payment"))
        sessionStore.set("checkout.amount", .number(99.99))

        // Get values
        if let userName = appStore.get("user.name") {
            print("User name: \(userName)")
        }

        if let itemCount = appStore.get("cart.itemCount") {
            print("Cart items: \(itemCount)")
        }

        // Get typed values
        do {
            let theme: String = try appStore.get("user.preferences.theme", as: String.self)
            print("Theme: \(theme)")

            let count: Int = try appStore.get("cart.itemCount", as: Int.self)
            print("Count: \(count)")
        } catch {
            print("Error getting typed value: \(error)")
        }

        // Transactions
        appStore.transaction { store in
            store.set("cart.itemCount", .integer(6))
            store.set("cart.lastUpdated", .string("2024-01-01"))
        }

        // Merge objects
        let newPreferences: [String: StoreValue] = [
            "notifications": .bool(true),
            "language": .string("en")
        ]
        appStore.merge("user.preferences", newPreferences)

        // Validation example
        let validationOptions = ValidationOptions(
            mode: .strict,
            schema: [
                "user.age": ValidationRule(
                    kind: .integer,
                    required: true,
                    min: 0,
                    max: 150
                ),
                "user.email": ValidationRule(
                    kind: .string,
                    required: true,
                    pattern: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
                )
            ]
        )
        appStore.configureValidation(validationOptions)

        // This will validate against the schema
        appStore.set("user.age", .integer(25))
        appStore.set("user.email", .string("user@example.com"))

        // Remove values
        appStore.remove("cart.lastUpdated")

        // Check existence
        if appStore.exists("user.name") {
            print("User name exists")
        }

        // Snapshot
        let snapshot = appStore.snapshot()
        print("Store snapshot has \(snapshot.count) keys")

        // Publishers for reactive updates
        let cancellable = appStore.publisher(for: "cart.itemCount")
            .sink { value in
                print("Cart item count changed to: \(value ?? .null)")
            }

        // Update the value to trigger the publisher
        appStore.set("cart.itemCount", .integer(10))

        // Cleanup
        _ = cancellable
    }

    public func reactiveExample() {
        let store = sdk.getScenarioStore(scenarioID: "form")

        // Set up reactive bindings
        let nameCancellable = store.publisher(for: "form.name")
            .compactMap { $0?.stringValue }
            .sink { name in
                print("Name changed to: \(name)")
            }

        let emailCancellable = store.publisher(for: "form.email")
            .compactMap { $0?.stringValue }
            .sink { email in
                print("Email changed to: \(email)")
            }

        // Simulate user input
        store.set("form.name", .string("John"))
        store.set("form.email", .string("john@example.com"))

        // Clean up subscriptions
        _ = nameCancellable
        _ = emailCancellable
    }

    #if DEBUG
    public func debugExample() {
        let inspector = sdk.getDebugInspector()

        // Inspect all stores
        let allStores = inspector.getAllStores()
        print("Found \(allStores.count) stores")

        for store in allStores {
            let debugInfo = inspector.getStoreDebugInfo(store)
            print("Store: \(debugInfo.description)")
        }

        // Export data
        let jsonData = inspector.exportAllData()
        print("Exported data: \(jsonData)")

        // Manual testing
        let testStore = sdk.getAppStore(storage: .memory)
        inspector.setTestValue(.string("test value"), for: "test.key", in: testStore)

        if let testValue = testStore.get("test.key") {
            print("Test value: \(testValue)")
        }
    }
    #endif
}

// MARK: - Extensions for easier StoreValue creation

extension StoreValue {
    public var stringValue: String? {
        if case .string(let value) = self { return value }
        return nil
    }

    public var intValue: Int? {
        if case .integer(let value) = self { return value }
        return nil
    }

    public var numberValue: Double? {
        if case .number(let value) = self { return value }
        return nil
    }

    public var boolValue: Bool? {
        if case .bool(let value) = self { return value }
        return nil
    }

    public var arrayValue: [StoreValue]? {
        if case .array(let value) = self { return value }
        return nil
    }

    public var objectValue: [String: StoreValue]? {
        if case .object(let value) = self { return value }
        return nil
    }
}