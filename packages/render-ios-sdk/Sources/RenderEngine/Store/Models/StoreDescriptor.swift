import Foundation

/// Descriptor for configuring a store from scenario JSON
public struct StoreDescriptor: Codable, Equatable {
    /// Store scope - "app" or "scenario"
    public let scope: String

    /// Storage type - "memory", "userprefs", "file", or "backend"
    public let storage: String

    /// Optional initial value for the store
    public let initialValue: [String: Any]?

    enum CodingKeys: String, CodingKey {
        case scope, storage, initialValue
    }

    public init(scope: String, storage: String, initialValue: [String: Any]? = nil) {
        self.scope = scope
        self.storage = storage
        self.initialValue = initialValue
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        scope = try container.decode(String.self, forKey: .scope)
        storage = try container.decode(String.self, forKey: .storage)

        if let initialValueData = try? container.decode([String: AnyCodable].self, forKey: .initialValue) {
            initialValue = initialValueData.mapValues { $0.value }
        } else {
            initialValue = nil
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(scope, forKey: .scope)
        try container.encode(storage, forKey: .storage)

        if let initialValue = initialValue {
            let codableValue = initialValue.mapValues { AnyCodable($0) }
            try container.encode(codableValue, forKey: .initialValue)
        }
    }

    public static func == (lhs: StoreDescriptor, rhs: StoreDescriptor) -> Bool {
        return lhs.scope == rhs.scope &&
               lhs.storage == rhs.storage &&
               NSDictionary(dictionary: lhs.initialValue ?? [:]).isEqual(to: rhs.initialValue ?? [:])
    }

    // MARK: - Conversion helpers

    /// Convert descriptor scope to Store Scope
    public func toScope(scenarioId: String = "default") -> Scope {
        return scope.lowercased() == "app" ? .app : .scenario(id: scenarioId)
    }

    /// Convert descriptor storage to Store Storage
    public func toStorage() -> Storage {
        switch storage.lowercased() {
        case "memory":
            return .memory
        case "userprefs":
            return .userPrefs(suite: nil)
        case "file":
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let fileURL = documentsPath.appendingPathComponent("store_\(scope)_\(storage).json")
            return .file(url: fileURL)
        case "backend":
            return .backend(namespace: "default")
        default:
            return .memory
        }
    }
}
