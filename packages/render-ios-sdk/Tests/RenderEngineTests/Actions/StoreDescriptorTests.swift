import Testing
import Foundation
@testable import RenderEngine

@Suite("StoreDescriptor Tests")
struct StoreDescriptorTests {

    @Test("Convert app scope")
    func testAppScopeConversion() {
        let descriptor = StoreDescriptor(
            scope: "app",
            storage: "memory",
            initialValue: nil
        )

        let scope = descriptor.toScope()

        #expect(scope == .app)
    }

    @Test("Convert scenario scope")
    func testScenarioScopeConversion() {
        let descriptor = StoreDescriptor(
            scope: "scenario",
            storage: "memory",
            initialValue: nil
        )

        let scope = descriptor.toScope(scenarioId: "cart")

        #expect(scope == .scenario(id: "cart"))
    }

    @Test("Convert memory storage")
    func testMemoryStorageConversion() {
        let descriptor = StoreDescriptor(
            scope: "app",
            storage: "memory",
            initialValue: nil
        )

        let storage = descriptor.toStorage()

        #expect(storage == .memory)
    }

    @Test("Convert userPrefs storage")
    func testUserPrefsStorageConversion() {
        let descriptor = StoreDescriptor(
            scope: "app",
            storage: "userprefs",
            initialValue: nil
        )

        let storage = descriptor.toStorage()

        #expect(storage == .userPrefs(suite: nil))
    }

    @Test("Convert file storage")
    func testFileStorageConversion() {
        let descriptor = StoreDescriptor(
            scope: "scenario",
            storage: "file",
            initialValue: nil
        )

        let storage = descriptor.toStorage()

        guard case .file(let url) = storage else {
            Issue.record("Expected file storage")
            return
        }

        #expect(url.lastPathComponent.contains("store_scenario_file.json"))
    }

    @Test("Convert backend storage")
    func testBackendStorageConversion() {
        let descriptor = StoreDescriptor(
            scope: "app",
            storage: "backend",
            initialValue: nil
        )

        let storage = descriptor.toStorage()

        #expect(storage == .backend(namespace: "default"))
    }
}
