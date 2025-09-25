import Foundation

/// Default implementation of StoreFactory
public class DefaultStoreFactory: StoreFactory {
    private var stores: [StoreKey: BaseStore] = [:]
    private var versions: [Scope: SemanticVersion] = [:]
    private let queue = DispatchQueue(label: "com.render.store.factory", qos: .userInitiated)

    public init() {
        // Set default versions
        versions[.app] = SemanticVersion(major: 1, minor: 0, patch: 0)
    }

    public func makeStore(scope: Scope, storage: Storage) -> Store {
        return queue.sync {
            let key = StoreKey(scope: scope, storage: storage)

            // Check if we already have a store for this combination
            if let existingStore = stores[key] {
                return existingStore
            }

            // Create new storage backend
            let storageBackend = createStorageBackend(for: storage)

            // Create new store
            let store = BaseStore(scope: scope, storage: storage, storageBackend: storageBackend)
            stores[key] = store

            return store
        }
    }

    public func resetStores(for scope: Scope) {
        queue.async { [weak self] in
            self?.performResetStores(for: scope)
        }
    }

    public func resetAllStores() {
        queue.async { [weak self] in
            self?.performResetAllStores()
        }
    }

    public func stores(for scope: Scope) -> [Store] {
        return queue.sync {
            stores.values.filter { $0.scope == scope }.map { $0 as Store }
        }
    }

    public func version(for scope: Scope) -> SemanticVersion {
        return queue.sync {
            versions[scope] ?? SemanticVersion(major: 1, minor: 0, patch: 0)
        }
    }

    public func setVersion(_ version: SemanticVersion, for scope: Scope) {
        queue.async { [weak self] in
            self?.performSetVersion(version, for: scope)
        }
    }

    // MARK: - Private Methods

    private func createStorageBackend(for storage: Storage) -> StoreStorageBackend {
        switch storage {
        case .memory:
            return MemoryStorageBackend()
        case .userPrefs(let suite):
            return UserDefaultsStorageBackend(suite: suite)
        case .file(let url):
            return FileStorageBackend(fileURL: url)
        case .backend(let namespace):
            return BackendStorageBackend(namespace: namespace)
        case .scenarioSession:
            // For scenario session, we need to create a session-specific backend
            // This will be handled specially in the concrete implementation
            fatalError("ScenarioSession storage should be handled by concrete implementation")
        }
    }

    private func performResetStores(for scope: Scope) {
        let keysToRemove = stores.keys.filter { $0.scope == scope }
        for key in keysToRemove {
            stores.removeValue(forKey: key)
        }

        // Reset version
        versions[scope] = SemanticVersion(major: 1, minor: 0, patch: 0)
    }

    private func performResetAllStores() {
        stores.removeAll()
        versions.removeAll()
        versions[.app] = SemanticVersion(major: 1, minor: 0, patch: 0)
    }

    private func performSetVersion(_ version: SemanticVersion, for scope: Scope) {
        let oldVersion = versions[scope] ?? SemanticVersion(major: 1, minor: 0, patch: 0)

        versions[scope] = version

        // If major version changed, reset stores
        if version.isMajorBump(from: oldVersion) {
            performResetStores(for: scope)
        }
    }

    // MARK: - Store Key

    private struct StoreKey: Hashable {
        let scope: Scope
        let storage: Storage

        func hash(into hasher: inout Hasher) {
            hasher.combine(scope)
            hasher.combine(storage.identifier)
        }

        static func == (lhs: StoreKey, rhs: StoreKey) -> Bool {
            return lhs.scope == rhs.scope && lhs.storage.identifier == rhs.storage.identifier
        }
    }
}

// MARK: - Backend Storage Backend (placeholder)

/// Placeholder backend storage backend - would integrate with actual backend service
public class BackendStorageBackend: StoreStorageBackend {
    private let namespace: String
    private var cache: [String: StoreValue] = [:]

    public init(namespace: String) {
        self.namespace = namespace
    }

    public func get(_ keyPath: String) -> StoreValue? {
        // In a real implementation, this would make a network call
        // For now, just return from cache
        return cache[keyPath]
    }

    public func set(_ keyPath: String, _ value: StoreValue) {
        cache[keyPath] = value
        // In a real implementation, this would make a network call
    }

    public func merge(_ keyPath: String, _ object: [String: StoreValue]) {
        if var currentObject = cache[keyPath]?.objectValue {
            for (key, value) in object {
                currentObject[key] = value
            }
            cache[keyPath] = .object(currentObject)
        } else {
            cache[keyPath] = .object(object)
        }
        // In a real implementation, this would make a network call
    }

    public func remove(_ keyPath: String) {
        cache.removeValue(forKey: keyPath)
        // In a real implementation, this would make a network call
    }

    public func exists(_ keyPath: String) -> Bool {
        return cache[keyPath] != nil
    }

    public func snapshot() -> [String: StoreValue] {
        return cache
    }

    public func replaceAll(_ root: [String: StoreValue]) {
        cache = root
        // In a real implementation, this would make a network call
    }
}