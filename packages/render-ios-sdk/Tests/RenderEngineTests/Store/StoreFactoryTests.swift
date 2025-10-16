import Testing
import Foundation
@testable import RenderEngine

@Suite("StoreFactory Tests")
struct StoreFactoryTests {

    @Test("Factory creates store")
    func testMakeStore() {
        let factory = DefaultStoreFactory()

        let store = factory.makeStore(scope: .app, storage: .memory)

        #expect(store.scope == .app)
        #expect(store.storage == .memory)
    }

    @Test("Factory reuses store instances")
    func testReuseStoreInstance() {
        let factory = DefaultStoreFactory()

        let store1 = factory.makeStore(scope: .app, storage: .memory)
        let store2 = factory.makeStore(scope: .app, storage: .memory)

        #expect(store1 === store2)
    }

    @Test("Factory creates different stores for different scopes")
    func testDifferentScopes() {
        let factory = DefaultStoreFactory()

        let appStore = factory.makeStore(scope: .app, storage: .memory)
        let scenarioStore = factory.makeStore(scope: .scenario(id: "test"), storage: .memory)

        #expect(appStore !== scenarioStore)
    }

    @Test("Factory creates different stores for different storage")
    func testDifferentStorage() {
        let factory = DefaultStoreFactory()

        let memoryStore = factory.makeStore(scope: .app, storage: .memory)
        let prefsStore = factory.makeStore(scope: .app, storage: .userPrefs())

        #expect(memoryStore !== prefsStore)
    }

    @Test("Factory reset stores for scope")
    func testResetStoresForScope() async throws {
        let factory = DefaultStoreFactory()

        let scenarioStore = factory.makeStore(scope: .scenario(id: "test"), storage: .memory)
        await scenarioStore.set("data", .string("value"))

        factory.resetStores(for: .scenario(id: "test"))

        // Should get new instance
        let newStore = factory.makeStore(scope: .scenario(id: "test"), storage: .memory)
        #expect(await newStore.exists("data") == false)
    }

    @Test("Factory reset all stores")
    func testResetAllStores() async throws {
        let factory = DefaultStoreFactory()

        let appStore = factory.makeStore(scope: .app, storage: .memory)
        let scenarioStore = factory.makeStore(scope: .scenario(id: "test"), storage: .memory)

        await appStore.set("app-data", .string("value"))
        await scenarioStore.set("scenario-data", .string("value"))

        factory.resetAllStores()

        let newAppStore = factory.makeStore(scope: .app, storage: .memory)
        let newScenarioStore = factory.makeStore(scope: .scenario(id: "test"), storage: .memory)

        #expect(await newAppStore.exists("app-data") == false)
        #expect(await newScenarioStore.exists("scenario-data") == false)
    }
}
