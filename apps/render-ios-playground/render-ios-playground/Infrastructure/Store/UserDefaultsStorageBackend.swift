import Foundation

/// UserDefaults storage backend - persistent storage using NSUserDefaults
public class UserDefaultsStorageBackend: StoreStorageBackend {
    private let userDefaults: UserDefaults
    private let prefix: String

    public init(suite: String? = nil) {
        if let suite = suite {
            userDefaults = UserDefaults(suiteName: suite) ?? .standard
            prefix = "store_\(suite)_"
        } else {
            userDefaults = .standard
            prefix = "store_"
        }
    }

    public func get(_ keyPath: String) -> StoreValue? {
        let key = prefixedKey(keyPath)
        guard let data = userDefaults.data(forKey: key) else {
            return nil
        }

        do {
            let decoder = JSONDecoder()
            return try decoder.decode(StoreValue.self, from: data)
        } catch {
            print("Failed to decode StoreValue for key \(keyPath): \(error)")
            return nil
        }
    }

    public func set(_ keyPath: String, _ value: StoreValue) {
        let key = prefixedKey(keyPath)

        do {
            let encoder = JSONEncoder()
            let data = try encoder.encode(value)
            userDefaults.set(data, forKey: key)
        } catch {
            print("Failed to encode StoreValue for key \(keyPath): \(error)")
        }
    }

    public func merge(_ keyPath: String, _ object: [String: StoreValue]) {
        let key = prefixedKey(keyPath)

        if var currentObject = get(keyPath)?.objectValue {
            for (mergeKey, mergeValue) in object {
                currentObject[mergeKey] = mergeValue
            }
            set(keyPath, .object(currentObject))
        } else {
            set(keyPath, .object(object))
        }
    }

    public func remove(_ keyPath: String) {
        let key = prefixedKey(keyPath)
        userDefaults.removeObject(forKey: key)
    }

    public func exists(_ keyPath: String) -> Bool {
        let key = prefixedKey(keyPath)
        return userDefaults.object(forKey: key) != nil
    }

    public func snapshot() -> [String: StoreValue] {
        let prefix = self.prefix
        let keys = userDefaults.dictionaryRepresentation().keys.filter { $0.hasPrefix(prefix) }

        var result: [String: StoreValue] = [:]
        for key in keys {
            let originalKey = String(key.dropFirst(prefix.count))
            if let value = get(originalKey) {
                result[originalKey] = value
            }
        }

        return result
    }

    public func replaceAll(_ root: [String: StoreValue]) {
        // Clear existing keys with our prefix
        let prefix = self.prefix
        let keysToRemove = userDefaults.dictionaryRepresentation().keys.filter { $0.hasPrefix(prefix) }
        for key in keysToRemove {
            userDefaults.removeObject(forKey: key)
        }

        // Set new values
        for (keyPath, value) in root {
            set(keyPath, value)
        }
    }

    private func prefixedKey(_ keyPath: String) -> String {
        return "\(prefix)\(keyPath)"
    }
}