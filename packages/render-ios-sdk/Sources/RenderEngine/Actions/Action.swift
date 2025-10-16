import Foundation

/// Action types that can be executed on a Store
public enum ActionType: String, Codable, Sendable {
    case storeSet = "store.set"
    case storeRemove = "store.remove"
    case storeMerge = "store.merge"
    case storeTransaction = "store.transaction"
}

/// Represents an action to be executed
public struct Action: Codable, Equatable, Sendable {
    public let id: String
    public let type: ActionType
    public let scope: String
    public let storage: String
    public let keyPath: String
    public let value: StoreValueDescriptor?
    public let actions: [Action]? // For transactions

    enum CodingKeys: String, CodingKey {
        case id, type, scope, storage, keyPath, value, actions
    }
}

/// Descriptor for StoreValue in JSON (matches StoreValue enum)
public enum StoreValueDescriptor: Codable, Equatable, Sendable {
    case string(String)
    case number(Double)
    case integer(Int)
    case bool(Bool)
    case color(String)
    case url(String)
    case array([StoreValueDescriptor])
    case object([String: StoreValueDescriptor])
    case null

    enum CodingKeys: String, CodingKey {
        case type, value
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)

        switch type {
        case "string":
            let value = try container.decode(String.self, forKey: .value)
            self = .string(value)
        case "number":
            let value = try container.decode(Double.self, forKey: .value)
            self = .number(value)
        case "integer":
            let value = try container.decode(Int.self, forKey: .value)
            self = .integer(value)
        case "bool":
            let value = try container.decode(Bool.self, forKey: .value)
            self = .bool(value)
        case "color":
            let value = try container.decode(String.self, forKey: .value)
            self = .color(value)
        case "url":
            let value = try container.decode(String.self, forKey: .value)
            self = .url(value)
        case "array":
            let value = try container.decode([StoreValueDescriptor].self, forKey: .value)
            self = .array(value)
        case "object":
            let value = try container.decode([String: StoreValueDescriptor].self, forKey: .value)
            self = .object(value)
        case "null":
            self = .null
        default:
            throw DecodingError.dataCorruptedError(
                forKey: .type,
                in: container,
                debugDescription: "Invalid store value type: \(type)"
            )
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)

        switch self {
        case .string(let value):
            try container.encode("string", forKey: .type)
            try container.encode(value, forKey: .value)
        case .number(let value):
            try container.encode("number", forKey: .type)
            try container.encode(value, forKey: .value)
        case .integer(let value):
            try container.encode("integer", forKey: .type)
            try container.encode(value, forKey: .value)
        case .bool(let value):
            try container.encode("bool", forKey: .type)
            try container.encode(value, forKey: .value)
        case .color(let value):
            try container.encode("color", forKey: .type)
            try container.encode(value, forKey: .value)
        case .url(let value):
            try container.encode("url", forKey: .type)
            try container.encode(value, forKey: .value)
        case .array(let value):
            try container.encode("array", forKey: .type)
            try container.encode(value, forKey: .value)
        case .object(let value):
            try container.encode("object", forKey: .type)
            try container.encode(value, forKey: .value)
        case .null:
            try container.encode("null", forKey: .type)
        }
    }

    /// Convert descriptor to StoreValue
    public func toStoreValue() -> StoreValue {
        switch self {
        case .string(let value): return .string(value)
        case .number(let value): return .number(value)
        case .integer(let value): return .integer(value)
        case .bool(let value): return .bool(value)
        case .color(let value): return .color(value)
        case .url(let value): return .url(value)
        case .array(let value): return .array(value.map { $0.toStoreValue() })
        case .object(let value): return .object(value.mapValues { $0.toStoreValue() })
        case .null: return .null
        }
    }
}

/// Store descriptor from JSON
public struct StoreDescriptor: Codable, Equatable, Sendable {
    public let scope: String
    public let storage: String
    public let initialValue: [String: StoreValueDescriptor]?

    /// Convert to Scope enum
    public func toScope(scenarioId: String = "default") -> Scope {
        switch scope.lowercased() {
        case "app":
            return .app
        case "scenario":
            return .scenario(id: scenarioId)
        default:
            return .app
        }
    }

    /// Convert to Storage enum
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
