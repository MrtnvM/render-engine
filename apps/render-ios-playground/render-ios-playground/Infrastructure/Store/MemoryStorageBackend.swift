import Foundation

/// In-memory storage backend - fast, ephemeral storage
public class MemoryStorageBackend: StoreStorageBackend {
    private var storage: [String: StoreValue] = [:]

    public init() {}

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

    /// Clear all data in memory
    public func clear() {
        storage.removeAll()
    }
}