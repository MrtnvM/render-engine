import Testing
import Foundation
@testable import RenderEngine

@Suite("ActionExecutor Tests")
struct ActionExecutorTests {

    @Test("Execute set action")
    func testExecuteSetAction() async throws {
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        let action = Action(
            id: "test_set",
            type: .storeSet,
            scope: "app",
            storage: "memory",
            keyPath: "userName",
            value: .string("Alice"),
            actions: nil
        )

        let result = try await executor.execute(action, scenarioId: "test")

        #expect(result == true)

        // Verify value was set
        let store = factory.makeStore(scope: .app, storage: .memory)
        let value = await store.get("userName")
        #expect(value == .string("Alice"))
    }

    @Test("Execute remove action")
    func testExecuteRemoveAction() async throws {
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        // Set initial value
        let store = factory.makeStore(scope: .app, storage: .memory)
        await store.set("temp", .string("data"))

        // Execute remove action
        let action = Action(
            id: "test_remove",
            type: .storeRemove,
            scope: "app",
            storage: "memory",
            keyPath: "temp",
            value: nil,
            actions: nil
        )

        let result = try await executor.execute(action)

        #expect(result == true)
        #expect(await store.exists("temp") == false)
    }

    @Test("Execute merge action")
    func testExecuteMergeAction() async throws {
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        // Set initial value
        let store = factory.makeStore(scope: .app, storage: .memory)
        await store.set("user", .object(["name": .string("Alice")]))

        // Execute merge action
        let action = Action(
            id: "test_merge",
            type: .storeMerge,
            scope: "app",
            storage: "memory",
            keyPath: "user",
            value: .object([
                "age": .integer(30),
                "city": .string("NYC")
            ]),
            actions: nil
        )

        let result = try await executor.execute(action)

        #expect(result == true)

        // Verify merge
        let value = await store.get("user")
        guard case .object(let obj) = value else {
            Issue.record("Expected object")
            return
        }

        #expect(obj["name"] == .string("Alice"))
        #expect(obj["age"] == .integer(30))
        #expect(obj["city"] == .string("NYC"))
    }

    @Test("Execute transaction action")
    func testExecuteTransactionAction() async throws {
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        let nestedAction1 = Action(
            id: "nested1",
            type: .storeSet,
            scope: "app",
            storage: "memory",
            keyPath: "key1",
            value: .string("value1"),
            actions: nil
        )

        let nestedAction2 = Action(
            id: "nested2",
            type: .storeSet,
            scope: "app",
            storage: "memory",
            keyPath: "key2",
            value: .string("value2"),
            actions: nil
        )

        let transaction = Action(
            id: "transaction",
            type: .storeTransaction,
            scope: "app",
            storage: "memory",
            keyPath: "",
            value: nil,
            actions: [nestedAction1, nestedAction2]
        )

        let result = try await executor.execute(transaction)

        #expect(result == true)

        // Verify both actions were executed
        let store = factory.makeStore(scope: .app, storage: .memory)
        #expect(await store.get("key1") == .string("value1"))
        #expect(await store.get("key2") == .string("value2"))
    }

    @Test("Execute action with scenario scope")
    func testExecuteWithScenarioScope() async throws {
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        let action = Action(
            id: "test",
            type: .storeSet,
            scope: "scenario",
            storage: "memory",
            keyPath: "data",
            value: .string("test"),
            actions: nil
        )

        let result = try await executor.execute(action, scenarioId: "cart")

        #expect(result == true)

        // Verify store was created with correct scope
        let store = factory.makeStore(scope: .scenario(id: "cart"), storage: .memory)
        #expect(await store.get("data") == .string("test"))
    }

    @Test("Execute multiple actions in sequence")
    func testExecuteAll() async throws {
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        let actions = [
            Action(id: "1", type: .storeSet, scope: "app", storage: "memory",
                   keyPath: "a", value: .integer(1), actions: nil),
            Action(id: "2", type: .storeSet, scope: "app", storage: "memory",
                   keyPath: "b", value: .integer(2), actions: nil),
            Action(id: "3", type: .storeSet, scope: "app", storage: "memory",
                   keyPath: "c", value: .integer(3), actions: nil)
        ]

        try await executor.executeAll(actions)

        let store = factory.makeStore(scope: .app, storage: .memory)
        #expect(await store.get("a") == .integer(1))
        #expect(await store.get("b") == .integer(2))
        #expect(await store.get("c") == .integer(3))
    }

    @Test("Throw error for missing value")
    func testThrowErrorForMissingValue() async {
        let factory = DefaultStoreFactory()
        let executor = ActionExecutor(storeFactory: factory)

        let action = Action(
            id: "test",
            type: .storeSet,
            scope: "app",
            storage: "memory",
            keyPath: "key",
            value: nil, // Missing value
            actions: nil
        )

        await #expect(throws: ActionError.self) {
            try await executor.execute(action)
        }
    }
}
