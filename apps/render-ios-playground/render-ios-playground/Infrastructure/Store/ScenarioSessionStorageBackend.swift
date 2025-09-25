import Foundation

/// Scenario session storage backend - ephemeral storage tied to scenario lifecycle
public class ScenarioSessionStorageBackend: StoreStorageBackend {
    private var storage: [String: StoreValue] = [:]
    private let scenarioID: String

    public init(scenarioID: String) {
        self.scenarioID = scenarioID
    }

    public func get(_ keyPath: String) -> StoreValue? {
        return storage[keyPath]
    }

    public func set(_ keyPath: String, _ value: StoreValue) {
        storage[keyPath] = value
    }

    public func merge(_ keyPath: String, _ object: [String: StoreValue]) {
        if var currentObject = storage[keyPath]?.objectValue {
            for (key, value) in object {
                currentObject[key] = value
            }
            storage[keyPath] = .object(currentObject)
        } else {
            storage[keyPath] = .object(object)
        }
    }

    public func remove(_ keyPath: String) {
        storage.removeValue(forKey: keyPath)
    }

    public func exists(_ keyPath: String) -> Bool {
        return storage[keyPath] != nil
    }

    public func snapshot() -> [String: StoreValue] {
        return storage
    }

    public func replaceAll(_ root: [String: StoreValue]) {
        storage = root
    }

    /// Clear all data in this session
    public func clear() {
        storage.removeAll()
    }

    /// Get the scenario ID this backend is tied to
    public func getScenarioID() -> String {
        return scenarioID
    }
}