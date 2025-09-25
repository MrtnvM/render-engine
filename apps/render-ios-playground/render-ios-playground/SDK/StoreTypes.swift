import Foundation
import Combine

// Core value model for the Store
public enum StoreValue: Codable, Equatable {
    case string(String)
    case number(Double)
    case integer(Int)
    case bool(Bool)
    case color(String)
    case url(String)
    case array([StoreValue])
    case object([String: StoreValue])
    case null

    enum CodingKeys: String, CodingKey { case type, value }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)
        switch type {
        case "string": self = .string(try container.decode(String.self, forKey: .value))
        case "number": self = .number(try container.decode(Double.self, forKey: .value))
        case "integer": self = .integer(try container.decode(Int.self, forKey: .value))
        case "bool": self = .bool(try container.decode(Bool.self, forKey: .value))
        case "color": self = .color(try container.decode(String.self, forKey: .value))
        case "url": self = .url(try container.decode(String.self, forKey: .value))
        case "array": self = .array(try container.decode([StoreValue].self, forKey: .value))
        case "object": self = .object(try container.decode([String: StoreValue].self, forKey: .value))
        case "null": self = .null
        default:
            throw DecodingError.dataCorruptedError(forKey: .type, in: container, debugDescription: "Unknown StoreValue type: \(type)")
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .string(let s):
            try container.encode("string", forKey: .type)
            try container.encode(s, forKey: .value)
        case .number(let d):
            try container.encode("number", forKey: .type)
            try container.encode(d, forKey: .value)
        case .integer(let i):
            try container.encode("integer", forKey: .type)
            try container.encode(i, forKey: .value)
        case .bool(let b):
            try container.encode("bool", forKey: .type)
            try container.encode(b, forKey: .value)
        case .color(let c):
            try container.encode("color", forKey: .type)
            try container.encode(c, forKey: .value)
        case .url(let u):
            try container.encode("url", forKey: .type)
            try container.encode(u, forKey: .value)
        case .array(let a):
            try container.encode("array", forKey: .type)
            try container.encode(a, forKey: .value)
        case .object(let o):
            try container.encode("object", forKey: .type)
            try container.encode(o, forKey: .value)
        case .null:
            try container.encode("null", forKey: .type)
        }
    }
}

public struct StorePatch: Equatable {
    public enum Op { case set, remove, merge }
    public let op: Op
    public let keyPath: String
    public let oldValue: StoreValue?
    public let newValue: StoreValue?

    public init(op: Op, keyPath: String, oldValue: StoreValue?, newValue: StoreValue?) {
        self.op = op
        self.keyPath = keyPath
        self.oldValue = oldValue
        self.newValue = newValue
    }
}

public struct StoreChange: Equatable {
    public let patches: [StorePatch]
    public let transactionID: UUID?
    public init(patches: [StorePatch], transactionID: UUID? = nil) {
        self.patches = patches
        self.transactionID = transactionID
    }
}

public enum Scope: Equatable {
    case appMemory
    case userPrefs(suite: String? = nil)
    case file(url: URL)
    case scenarioSession(id: String)
    case backend(namespace: String, scenarioID: String? = nil)
}

public protocol Store: AnyObject {
    var appID: String { get }
    func named(_ scope: Scope) -> KeyValueStore
}

public protocol KeyValueStore: AnyObject {
    var scope: Scope { get }
    var scenarioID: String? { get }

    // IO
    func get(_ keyPath: String) -> StoreValue?
    func get<T: Decodable>(_ keyPath: String, as: T.Type) throws -> T
    func exists(_ keyPath: String) -> Bool

    // Mutations
    func set(_ keyPath: String, _ value: StoreValue)
    func merge(_ keyPath: String, _ object: [String: StoreValue])
    func remove(_ keyPath: String)

    // Batch
    func transaction(_ block: (KeyValueStore) -> Void)

    // Observation
    func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never>
    func publisher(for keyPaths: Set<String>) -> AnyPublisher<StoreValue, Never>

    // Snapshot
    func snapshot() -> [String: StoreValue]
    func replaceAll(with root: [String: StoreValue])

    // Validation
    func configureValidation(_ options: ValidationOptions)
    func validateWrite(_ keyPath: String, _ value: StoreValue) -> ValidationResult

    // Expressions
    func registerLiveExpression(_ expr: LiveExpression)
    func unregisterLiveExpression(id: String)
}

