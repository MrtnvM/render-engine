import Foundation

/// Protocol for managing store lifecycle
public protocol StoreManager: AnyObject {
    /// Get or create a store for the given scope and storage
    func getStore(scope: Scope, storage: Storage) -> Store

    /// Reset all stores for a specific scope
    func resetStores(for scope: Scope)

    /// Reset all stores
    func resetAllStores()

    /// Configure stores for a scenario session
    func configureScenarioStores(scenarioID: String)

    /// Clean up scenario stores when scenario ends
    func cleanupScenarioStores(scenarioID: String)

    /// Handle version changes (drop stores on major version bump)
    func handleVersionChange(from oldVersion: SemanticVersion, to newVersion: SemanticVersion)
}

/// Default implementation of StoreManager
public class DefaultStoreManager: StoreManager {
    private let storeFactory: StoreFactory
    private var scenarioStores: [String: [String: Store]] = [:] // scenarioID -> storageID -> Store
    private let queue = DispatchQueue(label: "com.render.store.manager", qos: .userInitiated)

    public init(storeFactory: StoreFactory) {
        self.storeFactory = storeFactory
    }

    public func getStore(scope: Scope, storage: Storage) -> Store {
        switch scope {
        case .app:
            return storeFactory.makeStore(scope: scope, storage: storage)
        case .scenario(let scenarioID):
            return queue.sync {
                let storageID = storage.id
                if var stores = scenarioStores[scenarioID],
                   let store = stores[storageID] {
                    return store
                }

                let store = storeFactory.makeStore(scope: scope, storage: storage)

                if scenarioStores[scenarioID] == nil {
                    scenarioStores[scenarioID] = [:]
                }
                scenarioStores[scenarioID]?[storageID] = store

                return store
            }
        }
    }

    public func resetStores(for scope: Scope) {
        switch scope {
        case .app:
            storeFactory.resetStores(for: scope)
        case .scenario(let scenarioID):
            queue.async {
                self.scenarioStores[scenarioID] = nil
            }
            storeFactory.resetStores(for: scope)
        }
    }

    public func resetAllStores() {
        queue.async {
            self.scenarioStores.removeAll()
        }
        storeFactory.resetAllStores()
    }

    public func configureScenarioStores(scenarioID: String) {
        // Set up default stores for a scenario
        _ = getStore(scope: .scenario(id: scenarioID), storage: .memory)
        _ = getStore(scope: .scenario(id: scenarioID), storage: .scenarioSession)
    }

    public func cleanupScenarioStores(scenarioID: String) {
        queue.async {
            self.scenarioStores[scenarioID] = nil
        }
        storeFactory.resetStores(for: .scenario(id: scenarioID))
    }

    public func handleVersionChange(from oldVersion: SemanticVersion, to newVersion: SemanticVersion) {
        // Drop all scenario data on major version change
        if oldVersion.major != newVersion.major {
            resetAllStores()
        }
    }
}