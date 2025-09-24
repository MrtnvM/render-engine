import Foundation
import Combine

// MARK: - Core Data Models

/// Represents a value that can be stored in the Store
public enum StoreValue: Codable, Equatable {
    case string(String)
    case number(Double)
    case integer(Int)
    case bool(Bool)
    case color(String) // Hex color string like "#FF0000"
    case url(String)   // URL string
    case array([StoreValue])
    case object([String: StoreValue])
    case null

    public var rawValue: Any {
        switch self {
        case .string(let value): return value
        case .number(let value): return value
        case .integer(let value): return value
        case .bool(let value): return value
        case .color(let value): return value
        case .url(let value): return value
        case .array(let value): return value.map(\.rawValue)
        case .object(let value): return value.mapValues(\.rawValue)
        case .null: return NSNull()
        }
    }
}

/// Represents a single change operation on the store
public struct StorePatch: Equatable {
    public enum Op: String, Codable, Equatable {
        case set
        case remove
        case merge
    }

    public let op: Op
    public let keyPath: String
    public let oldValue: StoreValue?
    public let newValue: StoreValue?

    public init(op: Op, keyPath: String, oldValue: StoreValue? = nil, newValue: StoreValue? = nil) {
        self.op = op
        self.keyPath = keyPath
        self.oldValue = oldValue
        self.newValue = newValue
    }
}

/// Represents a collection of patches that occurred in a single transaction
public struct StoreChange: Equatable {
    public let patches: [StorePatch]
    public let transactionID: UUID?

    public init(patches: [StorePatch], transactionID: UUID? = nil) {
        self.patches = patches
        self.transactionID = transactionID ?? UUID()
    }
}

// MARK: - Validation

/// Configuration for validation behavior
public struct ValidationOptions: Equatable {
    public enum Mode: String, Codable, Equatable {
        case strict
        case lenient
    }

    public let mode: Mode
    public let schema: [String: ValidationRule]

    public init(mode: Mode, schema: [String: ValidationRule]) {
        self.mode = mode
        self.schema = schema
    }

    public static let strict = ValidationOptions(mode: .strict, schema: [:])
    public static let lenient = ValidationOptions(mode: .lenient, schema: [:])
}

/// Defines validation rules for a specific key path
public struct ValidationRule: Codable, Equatable {
    public enum Kind: String, Codable, Equatable {
        case string, number, integer, bool, color, url, array, object
    }

    public let kind: Kind
    public let required: Bool
    public let defaultValue: StoreValue?
    public let min: Double?
    public let max: Double?
    public let pattern: String?

    public init(
        kind: Kind,
        required: Bool = false,
        defaultValue: StoreValue? = nil,
        min: Double? = nil,
        max: Double? = nil,
        pattern: String? = nil
    ) {
        self.kind = kind
        self.required = required
        self.defaultValue = defaultValue
        self.min = min
        self.max = max
        self.pattern = pattern
    }
}

/// Result of validating a store operation
public enum ValidationResult: Equatable {
    case ok
    case failed(reason: String)

    public var isValid: Bool {
        if case .ok = self { return true }
        return false
    }
}

/// Utility for semantic versioning
public struct SemanticVersion: Codable, Equatable, Comparable {
    public let major: Int
    public let minor: Int
    public let patch: Int

    public init(major: Int, minor: Int, patch: Int) {
        self.major = major
        self.minor = minor
        self.patch = patch
    }

    public init?(_ versionString: String) {
        let components = versionString.split(separator: ".").compactMap { Int($0) }
        guard components.count >= 3 else { return nil }
        self.major = components[0]
        self.minor = components[1]
        self.patch = components[2]
    }

    public var stringValue: String {
        "\(major).\(minor).\(patch)"
    }

    public static func < (lhs: SemanticVersion, rhs: SemanticVersion) -> Bool {
        if lhs.major != rhs.major { return lhs.major < rhs.major }
        if lhs.minor != rhs.minor { return lhs.minor < rhs.minor }
        return lhs.patch < rhs.patch
    }
}

// MARK: - Scope and Storage

/// Defines the scope of a store instance
public enum Scope: Equatable {
    case app
    case scenario(id: String)

    public var id: String {
        switch self {
        case .app: return "app"
        case .scenario(let id): return id
        }
    }
}

/// Defines the storage mechanism for a store instance
public enum Storage: Equatable {
    case memory
    case userPrefs(suite: String? = nil)
    case file(url: URL)
    case backend(namespace: String)
    case scenarioSession

    public var id: String {
        switch self {
        case .memory: return "memory"
        case .userPrefs(let suite): return "userPrefs_\(suite ?? "default")"
        case .file(let url): return "file_\(url.absoluteString)"
        case .backend(let namespace): return "backend_\(namespace)"
        case .scenarioSession: return "scenarioSession"
        }
    }
}