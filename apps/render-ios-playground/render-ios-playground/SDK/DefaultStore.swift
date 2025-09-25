import Foundation
import Combine

/// Default implementation of the Store protocol
public class DefaultStore: Store {
    public let appID: String
    public private(set) var version: SemanticVersion {
        didSet {
            if version.major != oldValue.major {
                // Drop all scenario data on major version change
                scenarioStores.removeAll()
                UserDefaults.standard.removeObject(forKey: scenarioDataKey)
            }
        }
    }

    private let serialQueue = DispatchQueue(label: "com.render.store", qos: .userInitiated)
    private var stores: [Scope: KeyValueStore] = [:]
    private var backends: [String: StoreBackend] = [:]
    private let scenarioDataKey = "render_scenario_data"

    // Publishers for observation
    private let storeSubject = PassthroughSubject<StoreChange, Never>()
    public var storePublisher: AnyPublisher<StoreChange, Never> {
        storeSubject.eraseToAnyPublisher()
    }

    public init(appID: String, version: SemanticVersion = SemanticVersion(major: 1, minor: 0, patch: 0)) {
        self.appID = appID
        self.version = version
    }

    public func named(_ scope: Scope) -> KeyValueStore {
        return stores[scope] ?? createStore(for: scope)
    }

    public func updateVersion(_ version: SemanticVersion) {
        self.version = version
    }

    public func registerBackend(_ backend: StoreBackend, for namespace: String) {
        backends[namespace] = backend
    }

    public func registeredBackends() -> [String: StoreBackend] {
        return backends
    }

    private func createStore(for scope: Scope) -> KeyValueStore {
        let store = DefaultKeyValueStore(
            scope: scope,
            store: self,
            queue: serialQueue
        )
        stores[scope] = store
        return store
    }
}