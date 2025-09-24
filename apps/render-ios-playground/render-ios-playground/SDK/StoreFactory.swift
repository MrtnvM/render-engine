import Foundation

/// Default implementation of StoreFactory
public class DefaultStoreFactory: StoreFactory {
    private var storeCache: [String: Store] = [:]
    private let cacheQueue = DispatchQueue(label: "com.render.store.factory", qos: .userInitiated)
    private let backendFactory: StoreBackendFactory
    private let version: SemanticVersion

    public init(version: String = "1.0.0") {
        self.version = SemanticVersion(version) ?? SemanticVersion(major: 1, minor: 0, patch: 0)
        self.backendFactory = DefaultStoreBackendFactory()
    }

    public func makeStore(scope: Scope, storage: Storage) -> Store {
        let cacheKey = "\(scope.id)_\(storage.id)"

        return cacheQueue.sync {
            if let cachedStore = storeCache[cacheKey] {
                return cachedStore
            }

            let backend = backendFactory.createBackend(for: storage)
            let store = DefaultStore(
                scope: scope,
                storage: storage,
                backend: backend,
                version: version
            )

            storeCache[cacheKey] = store
            return store
        }
    }

    public func resetStores(for scope: Scope) {
        cacheQueue.async {
            let keysToRemove = self.storeCache.keys.filter { $0.hasPrefix(scope.id + "_") }
            for key in keysToRemove {
                self.storeCache.removeValue(forKey: key)
            }
        }
    }

    public func resetAllStores() {
        cacheQueue.async {
            self.storeCache.removeAll()
        }
    }
}

// MARK: - Backend Factory

/// Factory for creating storage backends
public protocol StoreBackendFactory: AnyObject {
    func createBackend(for storage: Storage) -> StoreBackend
}

/// Default implementation of StoreBackendFactory
public class DefaultStoreBackendFactory: StoreBackendFactory {
    public init() {}

    public func createBackend(for storage: Storage) -> StoreBackend {
        switch storage {
        case .memory:
            return MemoryStoreBackend()
        case .userPrefs(let suite):
            return UserPrefsStoreBackend(suite: suite)
        case .file(let url):
            return FileStoreBackend(fileURL: url)
        case .backend(let namespace):
            return RemoteStoreBackend(namespace: namespace)
        case .scenarioSession:
            return ScenarioSessionStoreBackend()
        }
    }
}