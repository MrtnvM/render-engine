import Foundation

/// UserDefaults-based storage backend (persistent across app launches)
final class UserPrefsStorageBackend: StorageBackend {

    private nonisolated(unsafe) let userDefaults: UserDefaults
    private let key: String

    init(suite: String?, scopeIdentifier: String) {
        if let suite = suite {
            self.userDefaults = UserDefaults(suiteName: suite) ?? .standard
        } else {
            self.userDefaults = .standard
        }
        self.key = "com.renderengine.store.\(scopeIdentifier)"
    }

    func load() async -> [String: StoreValue]? {
        guard let data = userDefaults.data(forKey: key) else {
            return nil
        }

        do {
            let decoder = JSONDecoder()
            let storeData = try decoder.decode([String: StoreValue].self, from: data)
            return storeData
        } catch {
            // Failed to decode - return nil
            return nil
        }
    }

    func save(_ data: [String: StoreValue]) async throws {
        let encoder = JSONEncoder()
        let encoded = try encoder.encode(data)
        userDefaults.set(encoded, forKey: key)
    }

    func clear() async throws {
        userDefaults.removeObject(forKey: key)
    }

    var isAvailable: Bool {
        true
    }
}
