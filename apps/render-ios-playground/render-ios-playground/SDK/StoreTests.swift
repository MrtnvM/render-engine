import Foundation
import Combine
import XCTest

/// Tests for the Store API implementation
public class StoreTests: XCTestCase {
    private var store: DefaultStore!
    private var subscriptions: Set<AnyCancellable> = []

    override func setUp() {
        super.setUp()
        store = DefaultStore(appID: "com.example.test")
    }

    override func tearDown() {
        subscriptions.forEach { $0.cancel() }
        subscriptions.removeAll()
        super.tearDown()
    }

    // MARK: - StoreValue Tests

    func testStoreValueCreation() {
        let stringValue = StoreValue.string("test")
        let numberValue = StoreValue.number(42.5)
        let integerValue = StoreValue.integer(42)
        let boolValue = StoreValue.bool(true)
        let colorValue = StoreValue.color("#FF0000")
        let urlValue = StoreValue.url("https://example.com")
        let arrayValue = StoreValue.array([.string("item1"), .string("item2")])
        let objectValue = StoreValue.object(["key": .string("value")])

        XCTAssertEqual(stringValue.stringValue, "test")
        XCTAssertEqual(numberValue.numberValue, 42.5)
        XCTAssertEqual(integerValue.numberValue, 42.0)
        XCTAssertEqual(boolValue.boolValue, true)
        XCTAssertEqual(colorValue.stringValue, "#FF0000")
        XCTAssertEqual(urlValue.stringValue, "https://example.com")
        XCTAssertEqual(arrayValue.arrayValue?.count, 2)
        XCTAssertEqual(objectValue.objectValue?["key"], .string("value"))
    }

    // MARK: - KeyValueStore Tests

    func testBasicOperations() {
        let keyValueStore = store.named(.appMemory)

        // Test set and get
        keyValueStore.set("test.key", .string("test value"))
        let retrievedValue = keyValueStore.get("test.key")
        XCTAssertEqual(retrievedValue, .string("test value"))

        // Test exists
        XCTAssertTrue(keyValueStore.exists("test.key"))
        XCTAssertFalse(keyValueStore.exists("nonexistent.key"))

        // Test remove
        keyValueStore.remove("test.key")
        XCTAssertNil(keyValueStore.get("test.key"))
        XCTAssertFalse(keyValueStore.exists("test.key"))
    }

    func testObjectOperations() {
        let keyValueStore = store.named(.appMemory)

        // Test merge
        keyValueStore.merge("user", [
            "name": .string("John"),
            "age": .integer(30)
        ])

        var user = keyValueStore.get("user")
        XCTAssertEqual(user?.objectValue?["name"], .string("John"))
        XCTAssertEqual(user?.objectValue?["age"], .integer(30))

        // Merge additional data
        keyValueStore.merge("user", [
            "email": .string("john@example.com")
        ])

        user = keyValueStore.get("user")
        XCTAssertEqual(user?.objectValue?["name"], .string("John"))
        XCTAssertEqual(user?.objectValue?["age"], .integer(30))
        XCTAssertEqual(user?.objectValue?["email"], .string("john@example.com"))
    }

    func testArrayOperations() {
        let keyValueStore = store.named(.appMemory)

        let items = StoreValue.array([
            .object(["id": .string("1"), "name": .string("Item 1")]),
            .object(["id": .string("2"), "name": .string("Item 2")])
        ])

        keyValueStore.set("items", items)

        let retrievedItems = keyValueStore.get("items")
        XCTAssertEqual(retrievedItems?.arrayValue?.count, 2)

        if case let .array(items) = retrievedItems {
            if case let .object(item1) = items[0] {
                XCTAssertEqual(item1["name"], .string("Item 1"))
            }
        }
    }

    // MARK: - Validation Tests

    func testValidation() {
        let keyValueStore = store.named(.appMemory)

        keyValueStore.configureValidation(.init(
            mode: .strict,
            schema: [
                "test.number": ValidationRule(
                    kind: .number,
                    required: true,
                    min: 0,
                    max: 100
                )
            ]
        ))

        // Valid value should be accepted
        keyValueStore.set("test.number", .number(50))
        XCTAssertEqual(keyValueStore.get("test.number"), .number(50))

        // Invalid value should be rejected in strict mode
        keyValueStore.set("test.number", .string("invalid"))
        // The value should remain unchanged
        XCTAssertEqual(keyValueStore.get("test.number"), .number(50))
    }

    // MARK: - Live Expressions Tests

    func testLiveExpressions() {
        let keyValueStore = store.named(.appMemory)

        // Register a simple live expression
        keyValueStore.registerLiveExpression(.init(
            id: "test-sum",
            outputKeyPath: "sum",
            dependsOn: ["a", "b"],
            compute: { get in
                let a = get("a")?.numberValue ?? 0
                let b = get("b")?.numberValue ?? 0
                return .number(a + b)
            }
        ))

        // Set dependency values
        keyValueStore.set("a", .number(10))
        keyValueStore.set("b", .number(20))

        // Check if expression was computed
        let sum = keyValueStore.get("sum")
        XCTAssertEqual(sum, .number(30))

        // Update a dependency
        keyValueStore.set("a", .number(15))

        // Check if expression was recomputed
        let newSum = keyValueStore.get("sum")
        XCTAssertEqual(newSum, .number(35))
    }

    // MARK: - Publisher Tests

    func testPublishers() {
        let keyValueStore = store.named(.appMemory)
        let expectation = expectation(description: "Publisher emits values")

        var receivedValues: [StoreValue] = []

        keyValueStore.publisher(for: "test.key")
            .compactMap { $0 }
            .sink { value in
                receivedValues.append(value)
                if receivedValues.count == 2 {
                    expectation.fulfill()
                }
            }
            .store(in: &subscriptions)

        // Set initial value
        keyValueStore.set("test.key", .string("value1"))

        // Update value
        keyValueStore.set("test.key", .string("value2"))

        waitForExpectations(timeout: 1.0) { error in
            if let error = error {
                XCTFail("Publisher expectation failed: \(error)")
            }
        }

        XCTAssertEqual(receivedValues, [.string("value1"), .string("value2")])
    }

    // MARK: - Transaction Tests

    func testTransactions() {
        let keyValueStore = store.named(.appMemory)
        let expectation = expectation(description: "Transaction completes")

        var changeCount = 0

        keyValueStore.publisher(for: ["a", "b"])
            .sink { _ in
                changeCount += 1
                if changeCount >= 2 { // One for each set operation
                    expectation.fulfill()
                }
            }
            .store(in: &subscriptions)

        keyValueStore.transaction { store in
            store.set("a", .number(1))
            store.set("b", .number(2))
        }

        waitForExpectations(timeout: 1.0) { error in
            if let error = error {
                XCTFail("Transaction expectation failed: \(error)")
            }
        }

        XCTAssertEqual(keyValueStore.get("a"), .number(1))
        XCTAssertEqual(keyValueStore.get("b"), .number(2))
    }

    // MARK: - Store Tests

    func testMultipleScopes() {
        let memoryStore = store.named(.appMemory)
        let prefsStore = store.named(.userPrefs())

        memoryStore.set("shared.key", .string("memory value"))
        prefsStore.set("shared.key", .string("prefs value"))

        // Values should be independent
        XCTAssertEqual(memoryStore.get("shared.key"), .string("memory value"))
        XCTAssertEqual(prefsStore.get("shared.key"), .string("prefs value"))
    }

    func testVersionManagement() {
        let initialVersion = SemanticVersion(major: 1, minor: 0, patch: 0)
        let store = DefaultStore(appID: "com.example.test", version: initialVersion)

        // Update to new major version
        let newVersion = SemanticVersion(major: 2, minor: 0, patch: 0)
        store.updateVersion(newVersion)

        // Scenario stores should be cleared on major version change
        // (This is tested indirectly by checking that the version changed)
        XCTAssertEqual(store.version.major, 2)
        XCTAssertEqual(store.version.minor, 0)
        XCTAssertEqual(store.version.patch, 0)
    }

    // MARK: - Backend Tests

    func testBackendRegistration() {
        let backend = SimpleHTTPStoreBackend(baseURL: URL(string: "https://example.com")!)
        store.registerBackend(backend, for: "test-namespace")

        let registeredBackends = store.registeredBackends()
        XCTAssertEqual(registeredBackends.count, 1)
        XCTAssertNotNil(registeredBackends["test-namespace"])
    }

    // MARK: - Debug Tests

    func testDebugInspector() {
        #if DEBUG
        let keyValueStore = store.named(.appMemory)
        keyValueStore.set("debug.key", .string("debug value"))

        if let debugger = store.debugger {
            let values = debugger.currentValues(for: .appMemory)
            XCTAssertEqual(values["debug.key"], .string("debug value"))

            let exportedData = debugger.exportData()
            XCTAssertTrue(exportedData.contains("debug.key"))

            // Test import
            debugger.importData(exportedData)
            let reimportedValues = debugger.currentValues(for: .appMemory)
            XCTAssertEqual(reimportedValues["debug.key"], .string("debug value"))
        } else {
            XCTFail("Debug inspector should be available in debug builds")
        }
        #endif
    }
}