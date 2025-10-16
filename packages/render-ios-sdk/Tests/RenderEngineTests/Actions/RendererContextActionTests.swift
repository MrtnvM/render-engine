import Testing
import Foundation
@testable import RenderEngine

@Suite("RendererContext Action Tests")
struct RendererContextActionTests {

    @Test("Initialize stores from descriptors")
    func testInitializeStores() async throws {
        var context = RendererContext()
        let factory = DefaultStoreFactory()
        context.setStoreFactory(factory)

        let descriptors = [
            StoreDescriptor(
                scope: "scenario",
                storage: "memory",
                initialValue: [
                    "count": .integer(42),
                    "name": .string("Test")
                ]
            )
        ]

        await context.initializeStores(from: descriptors, scenarioId: "test")

        // Verify store was created
        let store = factory.makeStore(scope: .scenario(id: "test"), storage: .memory)
        #expect(await store.get("count") == .integer(42))
        #expect(await store.get("name") == .string("Test"))
    }

    @Test("Execute action directly")
    func testExecuteActionDirectly() async throws {
        let factory = DefaultStoreFactory()

        let action = Action(
            id: "test_action",
            type: .storeSet,
            scope: "app",
            storage: "memory",
            keyPath: "data",
            value: .string("test"),
            actions: nil
        )

        // Create context and execute action directly (not by ID)
        var context = RendererContext()
        context.setStoreFactory(factory)

        // Execute action directly
        let result = try await context.executeAction(action)

        #expect(result == true)

        // Verify
        let store = factory.makeStore(scope: .app, storage: .memory)
        #expect(await store.get("data") == .string("test"))
    }

    @Test("Throw error for missing action")
    func testThrowErrorForMissingAction() async {
        let context = RendererContext()

        await #expect(throws: ActionError.self) {
            try await context.executeAction(id: "nonexistent")
        }
    }

    @Test("Execute multiple actions directly")
    func testExecuteMultipleActions() async throws {
        let factory = DefaultStoreFactory()

        let actions = [
            Action(id: "action1", type: .storeSet, scope: "app", storage: "memory",
                   keyPath: "key1", value: .string("val1"), actions: nil),
            Action(id: "action2", type: .storeSet, scope: "app", storage: "memory",
                   keyPath: "key2", value: .string("val2"), actions: nil)
        ]

        var context = RendererContext()
        context.setStoreFactory(factory)

        // Execute actions directly
        for action in actions {
            try await context.executeAction(action)
        }

        let store = factory.makeStore(scope: .app, storage: .memory)
        #expect(await store.get("key1") == .string("val1"))
        #expect(await store.get("key2") == .string("val2"))
    }
}
