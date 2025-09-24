import Foundation

// MARK: - Memory Backend

/// In-memory storage backend - ephemeral, cleared when app terminates
public class MemoryStoreBackend: StoreBackend {
    public let storage: Storage = .memory
    public let supportsConcurrentAccess: Bool = true

    private var data: [String: StoreValue] = [:]
    private let queue = DispatchQueue(label: "com.render.store.memory", qos: .userInitiated)

    public init() {}

    public func load() -> [String: StoreValue] {
        queue.sync { data }
    }

    public func save(_ data: [String: StoreValue]) {
        queue.async {
            self.data = data
        }
    }

    public func clear() {
        queue.async {
            self.data.removeAll()
        }
    }
}

// MARK: - UserPrefs Backend

/// UserDefaults-based storage backend - persisted across app launches
public class UserPrefsStoreBackend: StoreBackend {
    public let storage: Storage
    public let supportsConcurrentAccess: Bool = false // UserDefaults is not thread-safe

    private let defaults: UserDefaults
    private let prefix: String

    public init(suite: String? = nil) {
        self.storage = .userPrefs(suite: suite)
        self.prefix = "render.store."

        if let suite = suite {
            self.defaults = UserDefaults(suiteName: suite) ?? .standard
        } else {
            self.defaults = .standard
        }
    }

    public func load() -> [String: StoreValue] {
        guard let data = defaults.dictionary(forKey: prefix + "data") as? [String: Any] else {
            return [:]
        }

        var result: [String: StoreValue] = [:]
        for (key, value) in data {
            if let storeValue = StoreValue.from(any: value) {
                result[key] = storeValue
            }
        }
        return result
    }

    public func save(_ data: [String: StoreValue]) {
        let encoder = JSONEncoder()
        var anyData: [String: Any] = [:]

        for (key, value) in data {
            if let encoded = try? encoder.encode(value) {
                anyData[key] = try? JSONSerialization.jsonObject(with: encoded, options: [])
            }
        }

        defaults.set(anyData, forKey: prefix + "data")
        defaults.synchronize()
    }

    public func clear() {
        defaults.removeObject(forKey: prefix + "data")
        defaults.synchronize()
    }
}

// MARK: - File Backend

/// File-based storage backend - persisted JSON file with atomic writes
public class FileStoreBackend: StoreBackend {
    public let storage: Storage
    public let supportsConcurrentAccess: Bool = true

    private let fileURL: URL
    private let fileManager = FileManager.default
    private let queue = DispatchQueue(label: "com.render.store.file", qos: .userInitiated)

    public init(fileURL: URL) {
        self.storage = .file(url: fileURL)
        self.fileURL = fileURL
    }

    public func load() -> [String: StoreValue] {
        queue.sync {
            guard fileManager.fileExists(atPath: fileURL.path),
                  let data = try? Data(contentsOf: fileURL) else {
                return [:]
            }

            let decoder = JSONDecoder()
            guard let anyData = try? JSONSerialization.jsonObject(with: data, options: []),
                  let dict = anyData as? [String: Any] else {
                return [:]
            }

            var result: [String: StoreValue] = [:]
            for (key, value) in dict {
                if let storeValue = StoreValue.from(any: value) {
                    result[key] = storeValue
                }
            }
            return result
        }
    }

    public func save(_ data: [String: StoreValue]) {
        queue.async {
            let encoder = JSONEncoder()
            encoder.outputFormatting = .prettyPrinted

            var anyData: [String: Any] = [:]
            for (key, value) in data {
                if let encoded = try? encoder.encode(value) {
                    anyData[key] = try? JSONSerialization.jsonObject(with: encoded, options: [])
                }
            }

            if let jsonData = try? JSONSerialization.data(withJSONObject: anyData, options: [.prettyPrinted, .sortedKeys]) {
                // Atomic write using temporary file
                let tempURL = self.fileURL.deletingLastPathComponent().appendingPathComponent(".\(self.fileURL.lastPathComponent).tmp")
                try? jsonData.write(to: tempURL, options: [.atomic])

                do {
                    try self.fileManager.replaceItem(at: self.fileURL, withItemAt: tempURL)
                } catch {
                    try? self.fileManager.removeItem(at: tempURL)
                }
            }
        }
    }

    public func clear() {
        queue.async {
            try? self.fileManager.removeItem(at: self.fileURL)
        }
    }
}

// MARK: - Scenario Session Backend

/// Session-scoped storage backend - cleared when scenario ends
public class ScenarioSessionStoreBackend: StoreBackend {
    public let storage: Storage = .scenarioSession
    public let supportsConcurrentAccess: Bool = true

    private var data: [String: StoreValue] = [:]
    private let queue = DispatchQueue(label: "com.render.store.session", qos: .userInitiated)

    public init() {}

    public func load() -> [String: StoreValue] {
        queue.sync { data }
    }

    public func save(_ data: [String: StoreValue]) {
        queue.async {
            self.data = data
        }
    }

    public func clear() {
        queue.async {
            self.data.removeAll()
        }
    }

    /// Clear session data - useful for cleanup when scenario ends
    public func clearSession() {
        clear()
    }
}

// MARK: - Remote Backend

/// Remote storage backend with sync capabilities
public class RemoteStoreBackend: StoreBackendAdapter {
    public let storage: Storage
    public let supportsConcurrentAccess: Bool = true

    private let namespace: String
    private var data: [String: StoreValue] = [:]
    private let queue = DispatchQueue(label: "com.render.store.remote", qos: .userInitiated)
    private let session: URLSession
    private let baseURL: URL

    public init(namespace: String, baseURL: URL = URL(string: "https://api.example.com/stores")!) {
        self.storage = .backend(namespace: namespace)
        self.namespace = namespace
        self.baseURL = baseURL
        self.session = URLSession.shared
    }

    public func load() -> [String: StoreValue] {
        queue.sync { data }
    }

    public func save(_ data: [String: StoreValue]) {
        queue.async {
            self.data = data
            // Trigger push to remote
            Task {
                try? await self.push()
            }
        }
    }

    public func clear() {
        queue.async {
            self.data.removeAll()
        }
    }

    // MARK: - Remote Sync

    public func sync() async throws {
        try await pull()
        try await push()
    }

    public func push() async throws {
        let encoder = JSONEncoder()
        var anyData: [String: Any] = [:]

        for (key, value) in data {
            if let encoded = try? encoder.encode(value) {
                anyData[key] = try? JSONSerialization.jsonObject(with: encoded, options: [])
            }
        }

        let url = baseURL.appendingPathComponent(namespace)
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let jsonData = try JSONSerialization.data(withJSONObject: anyData, options: [])
        request.httpBody = jsonData

        let (_, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw StoreError.encodingFailed("Failed to push data to remote store")
        }
    }

    public func pull() async throws {
        let url = baseURL.appendingPathComponent(namespace)
        let request = URLRequest(url: url)

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            throw StoreError.decodingFailed("Failed to pull data from remote store")
        }

        guard let anyData = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] else {
            return
        }

        var result: [String: StoreValue] = [:]
        for (key, value) in anyData {
            if let storeValue = StoreValue.from(any: value) {
                result[key] = storeValue
            }
        }

        queue.async {
            self.data = result
        }
    }
}

// MARK: - StoreValue Conversion Utilities

extension StoreValue {
    static func from(any: Any) -> StoreValue? {
        switch any {
        case let string as String:
            return .string(string)
        case let number as Double:
            return .number(number)
        case let int as Int:
            return .integer(int)
        case let bool as Bool:
            return .bool(bool)
        case let array as [Any]:
            let storeValues = array.compactMap { StoreValue.from(any: $0) }
            return .array(storeValues)
        case let dict as [String: Any]:
            var result: [String: StoreValue] = [:]
            for (key, value) in dict {
                if let storeValue = StoreValue.from(any: value) {
                    result[key] = storeValue
                }
            }
            return .object(result)
        case is NSNull:
            return .null
        default:
            return nil
        }
    }
}