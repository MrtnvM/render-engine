import Foundation

/// Protocol for storage backends that handle the actual persistence
public protocol StoreStorageBackend: AnyObject {
    func get(_ keyPath: String) -> StoreValue?
    func set(_ keyPath: String, _ value: StoreValue)
    func merge(_ keyPath: String, _ object: [String: StoreValue])
    func remove(_ keyPath: String)
    func exists(_ keyPath: String) -> Bool
    func snapshot() -> [String: StoreValue]
    func replaceAll(_ root: [String: StoreValue])
}

/// A buffered storage backend that collects changes for transactions
public class BufferedStorageBackend: StoreStorageBackend {
    private let wrappedBackend: StoreStorageBackend
    private var bufferedChanges: [String: StoreValue] = [:]
    private var removedKeys: Set<String> = []
    private var mergedObjects: [String: [String: StoreValue]] = [:]

    public init(wrappedBackend: StoreStorageBackend) {
        self.wrappedBackend = wrappedBackend
    }

    public func get(_ keyPath: String) -> StoreValue? {
        if let bufferedValue = bufferedChanges[keyPath] {
            return bufferedValue
        }

        if removedKeys.contains(keyPath) {
            return nil
        }

        // For merged objects, we need to construct the merged value
        if let mergeData = mergedObjects[keyPath] {
            if var currentValue = wrappedBackend.get(keyPath)?.objectValue {
                for (key, value) in mergeData {
                    currentValue[key] = value
                }
                return .object(currentValue)
            } else {
                return .object(mergeData)
            }
        }

        return wrappedBackend.get(keyPath)
    }

    public func set(_ keyPath: String, _ value: StoreValue) {
        bufferedChanges[keyPath] = value
        removedKeys.remove(keyPath)
        mergedObjects.removeValue(forKey: keyPath)
    }

    public func merge(_ keyPath: String, _ object: [String: StoreValue]) {
        mergedObjects[keyPath] = object
        removedKeys.remove(keyPath)
    }

    public func remove(_ keyPath: String) {
        bufferedChanges.removeValue(forKey: keyPath)
        removedKeys.insert(keyPath)
        mergedObjects.removeValue(forKey: keyPath)
    }

    public func exists(_ keyPath: String) -> Bool {
        return get(keyPath) != nil
    }

    public func snapshot() -> [String: StoreValue] {
        var result = wrappedBackend.snapshot()

        // Apply buffered changes
        for (key, value) in bufferedChanges {
            result[key] = value
        }

        // Apply merges
        for (keyPath, mergeData) in mergedObjects {
            if var currentObject = result[keyPath]?.objectValue {
                for (key, value) in mergeData {
                    currentObject[key] = value
                }
                result[keyPath] = .object(currentObject)
            } else if result[keyPath] == nil {
                result[keyPath] = .object(mergeData)
            }
        }

        // Remove deleted keys
        for key in removedKeys {
            result.removeValue(forKey: key)
        }

        return result
    }

    public func replaceAll(_ root: [String: StoreValue]) {
        bufferedChanges = root
        removedKeys.removeAll()
        mergedObjects.removeAll()
    }

    /// Commit all buffered changes and return the patches
    public func commit() -> [StorePatch] {
        var patches: [StorePatch] = []

        // Apply changes to the wrapped backend
        for (keyPath, value) in bufferedChanges {
            let oldValue = wrappedBackend.get(keyPath)
            wrappedBackend.set(keyPath, value)
            patches.append(StorePatch(op: .set, keyPath: keyPath, oldValue: oldValue, newValue: value))
        }

        for keyPath in removedKeys {
            let oldValue = wrappedBackend.get(keyPath)
            wrappedBackend.remove(keyPath)
            patches.append(StorePatch(op: .remove, keyPath: keyPath, oldValue: oldValue, newValue: nil))
        }

        for (keyPath, mergeData) in mergedObjects {
            let oldValue = wrappedBackend.get(keyPath)
            wrappedBackend.merge(keyPath, mergeData)
            let newValue = wrappedBackend.get(keyPath) ?? .null
            patches.append(StorePatch(op: .merge, keyPath: keyPath, oldValue: oldValue, newValue: newValue))
        }

        // Clear buffers
        bufferedChanges.removeAll()
        removedKeys.removeAll()
        mergedObjects.removeAll()

        return patches
    }
}

// MARK: - StoreValue Extensions

extension StoreValue {
    var objectValue: [String: StoreValue]? {
        switch self {
        case .object(let value): return value
        default: return nil
        }
    }
}