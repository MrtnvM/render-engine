import Foundation

/// Default implementation of StoreFactory
/// Manages a registry of Store instances and handles lifecycle
public final class DefaultStoreFactory: StoreFactory {

    private let logger: Logger?
    private var registry: [StoreKey: Store] = [:]
    private let lock = NSLock()

    /// Initialize with optional logger
    public init(logger: Logger? = nil) {
        self.logger = logger
    }

    // MARK: - StoreFactory

    public func makeStore(scope: Scope, storage: Storage) -> Store {
        lock.lock()
        defer { lock.unlock() }

        let key = StoreKey(scope: scope, storage: storage)

        // Return existing instance if available
        if let existing = registry[key] {
            logger?.debug("Reusing existing store: \(key.description)", category: "StoreFactory")
            return existing
        }

        // Create new store
        let backend = createBackend(for: storage, scope: scope)
        let store = DefaultStore(
            scope: scope,
            storage: storage,
            backend: backend,
            logger: logger
        )

        registry[key] = store
        logger?.debug("Created new store: \(key.description)", category: "StoreFactory")

        return store
    }

    public func resetStores(for scope: Scope) {
        lock.lock()
        defer { lock.unlock() }

        let keysToRemove = registry.keys.filter { $0.scope == scope }

        for key in keysToRemove {
            if let store = registry[key] {
                // Clear the store data
                store.replaceAll(with: [:])
                logger?.debug("Reset store: \(key.description)", category: "StoreFactory")
            }
            registry.removeValue(forKey: key)
        }

        logger?.debug("Reset \(keysToRemove.count) stores for scope: \(scope.description)", category: "StoreFactory")
    }

    public func resetAllStores() {
        lock.lock()
        defer { lock.unlock() }

        for (key, store) in registry {
            store.replaceAll(with: [:])
            logger?.debug("Reset store: \(key.description)", category: "StoreFactory")
        }

        registry.removeAll()
        logger?.debug("Reset all stores", category: "StoreFactory")
    }

    // MARK: - Private Helpers

    private func createBackend(for storage: Storage, scope: Scope) -> StorageBackend {
        switch storage {
        case .memory:
            return MemoryStorageBackend()

        case .userPrefs(let suite):
            return UserPrefsStorageBackend(
                suite: suite,
                scopeIdentifier: scope.identifier
            )

        case .file(let url):
            return FileStorageBackend(fileURL: url)

        case .backend(let namespace):
            return RemoteStorageBackend(namespace: namespace)
        }
    }
}

// MARK: - StoreKey

/// Key for uniquely identifying a Store instance
private struct StoreKey: Hashable {
    let scope: Scope
    let storage: Storage

    var description: String {
        "\(scope.description)|\(storage.description)"
    }
}
