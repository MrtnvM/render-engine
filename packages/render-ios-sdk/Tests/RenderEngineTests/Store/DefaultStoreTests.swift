import Testing
import Foundation
import Combine
@testable import RenderEngine

@Suite("DefaultStore Tests")
struct DefaultStoreTests {

    @Test("Store get/set operations")
    func testGetSet() async {
        let backend = MemoryStorageBackend()
        let store = DefaultStore(
            scope: .app,
            storage: .memory,
            backend: backend
        )

        await store.set("name", .string("Alice"))

        let value = await store.get("name")
        #expect(value == .string("Alice"))
    }

    @Test("Store exists check")
    func testExists() async {
        let backend = MemoryStorageBackend()
        let store = DefaultStore(
            scope: .app,
            storage: .memory,
            backend: backend
        )

        await store.set("name", .string("Alice"))

        #expect(await store.exists("name") == true)
        #expect(await store.exists("age") == false)
    }

    @Test("Store remove operation")
    func testRemove() async {
        let backend = MemoryStorageBackend()
        let store = DefaultStore(
            scope: .app,
            storage: .memory,
            backend: backend
        )

        await store.set("name", .string("Alice"))
        #expect(await store.exists("name") == true)

        await store.remove("name")
        #expect(await store.exists("name") == false)
    }

    @Test("Store merge operation")
    func testMerge() async {
        let backend = MemoryStorageBackend()
        let store = DefaultStore(
            scope: .app,
            storage: .memory,
            backend: backend
        )

        await store.set("user", .object(["name": .string("Alice")]))

        await store.merge("user", ["age": .integer(30)])

        let user = await store.get("user")?.objectValue
        #expect(user?["name"] == .string("Alice"))
        #expect(user?["age"] == .integer(30))
    }

    @Test("Store transaction batches changes")
    func testTransaction() async throws {
        let backend = MemoryStorageBackend()
        let store = DefaultStore(
            scope: .app,
            storage: .memory,
            backend: backend
        )

        await store.transaction { store in
            await store.set("name", .string("Alice"))
            await store.set("age", .integer(30))
            await store.set("city", .string("NYC"))
        }

        #expect(await store.get("name") == .string("Alice"))
        #expect(await store.get("age") == .integer(30))
        #expect(await store.get("city") == .string("NYC"))
    }

    @Test("Store snapshot")
    func testSnapshot() async {
        let backend = MemoryStorageBackend()
        let store = DefaultStore(
            scope: .app,
            storage: .memory,
            backend: backend
        )

        await store.set("name", .string("Alice"))
        await store.set("age", .integer(30))

        let snapshot = await store.snapshot()

        #expect(snapshot.count == 2)
        #expect(snapshot["name"] == .string("Alice"))
        #expect(snapshot["age"] == .integer(30))
    }

    @Test("Store replaceAll")
    func testReplaceAll() async {
        let backend = MemoryStorageBackend()
        let store = DefaultStore(
            scope: .app,
            storage: .memory,
            backend: backend
        )

        await store.set("old", .string("value"))

        await store.replaceAll(with: [
            "new": .string("data"),
            "count": .integer(42)
        ])

        #expect(await store.exists("old") == false)
        #expect(await store.get("new") == .string("data"))
        #expect(await store.get("count") == .integer(42))
    }

    @Test("Store typed get")
    func testTypedGet() async throws {
        let backend = MemoryStorageBackend()
        let store = DefaultStore(
            scope: .app,
            storage: .memory,
            backend: backend
        )

        await store.set("name", .string("Alice"))
        await store.set("age", .integer(30))

        let name: String = try await store.get("name", as: String.self)
        let age: Int = try await store.get("age", as: Int.self)

        #expect(name == "Alice")
        #expect(age == 30)
    }

    @Test("Store publisher emits changes")
    func testPublisher() async throws {
        let backend = MemoryStorageBackend()
        let store = DefaultStore(
            scope: .app,
            storage: .memory,
            backend: backend
        )

        var receivedValues: [StoreValue?] = []
        let expectation = XCTestExpectation(description: "Publisher receives values")
        expectation.expectedFulfillmentCount = 3

        let cancellable = store.publisher(for: "counter")
            .sink { value in
                receivedValues.append(value)
                expectation.fulfill()
            }

        // Initial value (nil)
        try await Task.sleep(nanoseconds: 100_000_000)

        // Set value
        await store.set("counter", .integer(1))
        try await Task.sleep(nanoseconds: 100_000_000)

        // Update value
        await store.set("counter", .integer(2))
        try await Task.sleep(nanoseconds: 100_000_000)

        cancellable.cancel()

        #expect(receivedValues.count == 3)
        #expect(receivedValues[0] == nil)
        #expect(receivedValues[1] == .integer(1))
        #expect(receivedValues[2] == .integer(2))
    }

    @Test("Store multi-key publisher")
    func testMultiKeyPublisher() async throws {
        let backend = MemoryStorageBackend()
        let store = DefaultStore(
            scope: .app,
            storage: .memory,
            backend: backend
        )

        var receivedValues: [[String: StoreValue?]] = []

        let cancellable = store.publisher(for: ["name", "age"])
            .sink { values in
                receivedValues.append(values)
            }

        try await Task.sleep(nanoseconds: 100_000_000)

        await store.set("name", .string("Alice"))
        try await Task.sleep(nanoseconds: 100_000_000)

        await store.set("age", .integer(30))
        try await Task.sleep(nanoseconds: 100_000_000)

        cancellable.cancel()

        #expect(receivedValues.count >= 2)
    }
}

// XCTestExpectation fallback for async testing
private class XCTestExpectation {
    let description: String
    var expectedFulfillmentCount: Int = 1
    private var fulfillmentCount: Int = 0

    init(description: String) {
        self.description = description
    }

    func fulfill() {
        fulfillmentCount += 1
    }
}
