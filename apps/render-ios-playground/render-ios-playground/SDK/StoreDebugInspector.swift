import Foundation

/// Debug inspector for store data - only available in DEBUG builds
#if DEBUG
public class StoreDebugInspector {
    private let storeFactory: StoreFactory

    public init(storeFactory: StoreFactory) {
        self.storeFactory = storeFactory
    }

    /// Get all stores for all scopes
    public func getAllStores() -> [Store] {
        var stores: [Store] = []

        // Add app stores
        stores.append(contentsOf: storeFactory.stores(for: .app))

        // Add scenario stores
        for scenarioID in getAllScenarioIDs() {
            stores.append(contentsOf: storeFactory.stores(for: .scenario(id: scenarioID)))
        }

        return stores
    }

    /// Get all scenario IDs that have stores
    public func getAllScenarioIDs() -> [String] {
        // This would need to be implemented based on how we track scenarios
        // For now, return empty array
        return []
    }

    /// Get a specific store
    public func getStore(scope: Scope, storage: Storage) -> Store? {
        // Try to get the store from the factory
        // Note: This creates a new store instance, but that's okay for debugging
        return storeFactory.makeStore(scope: scope, storage: storage)
    }

    /// Get debug info for a store
    public func getStoreDebugInfo(_ store: Store) -> StoreDebugInfo {
        return StoreDebugInfo(
            scope: store.scope,
            storage: store.storage,
            keyCount: store.snapshot().count,
            keys: Array(store.snapshot().keys)
        )
    }

    /// Manually set a value for testing
    public func setTestValue(_ value: StoreValue, for keyPath: String, in store: Store) {
        store.set(keyPath, value)
    }

    /// Manually remove a value for testing
    public func removeTestValue(_ keyPath: String, in store: Store) {
        store.remove(keyPath)
    }

    /// Get mutation log (placeholder - would need to be implemented in store)
    public func getMutationLog(for store: Store) -> [String] {
        // This would need to be implemented in the store to track mutations
        return ["Mutation logging not yet implemented"]
    }

    /// Export all store data as JSON for debugging
    public func exportAllData() -> String {
        let stores = getAllStores()
        var exportData: [String: Any] = [:]

        for store in stores {
            let scope = store.scope.description
            let storage = store.storage.description

            let key = "\(scope)_\(storage)"
            exportData[key] = store.snapshot()
        }

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: exportData, options: [.prettyPrinted])
            return String(data: jsonData, encoding: .utf8) ?? "{}"
        } catch {
            return "{}"
        }
    }
}

/// Debug information for a store
public struct StoreDebugInfo {
    public let scope: Scope
    public let storage: Storage
    public let keyCount: Int
    public let keys: [String]

    public var description: String {
        return "StoreDebugInfo(scope: \(scope), storage: \(storage), keys: \(keyCount))"
    }
}
#endif