import Foundation

/// Factory for creating stores with scenario session support
public class ScenarioStoreFactory: StoreFactory {
    private let baseFactory: DefaultStoreFactory
    private var scenarioSessionBackends: [String: ScenarioSessionStorageBackend] = [:]
    private let sessionQueue = DispatchQueue(label: "com.render.store.scenario", qos: .userInitiated)

    public init(baseFactory: DefaultStoreFactory) {
        self.baseFactory = baseFactory
    }

    public func makeStore(scope: Scope, storage: Storage) -> Store {
        switch storage {
        case .scenarioSession:
            guard case .scenario(let scenarioID) = scope else {
                fatalError("ScenarioSession storage can only be used with scenario scope")
            }

            return sessionQueue.sync {
                // Create or reuse session backend for this scenario
                if let backend = scenarioSessionBackends[scenarioID] {
                    return BaseStore(scope: scope, storage: storage, storageBackend: backend)
                } else {
                    let backend = ScenarioSessionStorageBackend(scenarioID: scenarioID)
                    scenarioSessionBackends[scenarioID] = backend
                    return BaseStore(scope: scope, storage: storage, storageBackend: backend)
                }
            }

        default:
            return baseFactory.makeStore(scope: scope, storage: storage)
        }
    }

    public func resetStores(for scope: Scope) {
        switch scope {
        case .scenario(let scenarioID):
            sessionQueue.async { [weak self] in
                self?.scenarioSessionBackends[scenarioID]?.clear()
            }
        case .app:
            baseFactory.resetStores(for: scope)
        }
    }

    public func resetAllStores() {
        sessionQueue.async { [weak self] in
            self?.scenarioSessionBackends.removeAll()
        }
        baseFactory.resetAllStores()
    }

    public func stores(for scope: Scope) -> [Store] {
        switch scope {
        case .scenario(let scenarioID):
            return sessionQueue.sync {
                if let backend = scenarioSessionBackends[scenarioID] {
                    return [BaseStore(scope: scope, storage: .scenarioSession, storageBackend: backend)]
                } else {
                    return []
                }
            }
        default:
            return baseFactory.stores(for: scope)
        }
    }

    public func version(for scope: Scope) -> SemanticVersion {
        return baseFactory.version(for: scope)
    }

    public func setVersion(_ version: SemanticVersion, for scope: Scope) {
        baseFactory.setVersion(version, for: scope)
    }

    /// Clear session data for a specific scenario
    public func clearScenarioSession(_ scenarioID: String) {
        sessionQueue.async { [weak self] in
            self?.scenarioSessionBackends[scenarioID]?.clear()
            self?.scenarioSessionBackends.removeValue(forKey: scenarioID)
        }
    }

    /// Get all active scenario sessions
    public func activeScenarioSessions() -> [String] {
        return sessionQueue.sync {
            Array(scenarioSessionBackends.keys)
        }
    }
}