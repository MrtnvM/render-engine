import Foundation

/// Represents the scope of a store instance
public enum Scope: Equatable {
    case app
    case scenario(id: String)

    public var description: String {
        switch self {
        case .app: return "app"
        case .scenario(let id): return "scenario(\(id))"
        }
    }
}

/// Represents the storage mechanism for a store instance
public enum Storage: Equatable {
    case memory
    case userPrefs(suite: String? = nil)
    case file(url: URL)
    case backend(namespace: String)
    case scenarioSession

    public var description: String {
        switch self {
        case .memory: return "memory"
        case .userPrefs(let suite): return "userPrefs(\(suite ?? "default"))"
        case .file(let url): return "file(\(url.lastPathComponent))"
        case .backend(let namespace): return "backend(\(namespace))"
        case .scenarioSession: return "scenarioSession"
        }
    }

    /// Get a unique identifier for this storage configuration
    public var identifier: String {
        switch self {
        case .memory: return "memory"
        case .userPrefs(let suite): return "userPrefs_\(suite ?? "default")"
        case .file(let url): return "file_\(url.absoluteString.hashValue)"
        case .backend(let namespace): return "backend_\(namespace)"
        case .scenarioSession: return "scenarioSession"
        }
    }
}

/// Semantic version for store versioning
public struct SemanticVersion: Equatable, Comparable {
    public let major: Int
    public let minor: Int
    public let patch: Int

    public init(major: Int, minor: Int, patch: Int) {
        self.major = major
        self.minor = minor
        self.patch = patch
    }

    public init(_ versionString: String) throws {
        let components = versionString.split(separator: ".").map { Int($0) }
        guard components.count == 3, let major = components[0], let minor = components[1], let patch = components[2] else {
            throw StoreError.invalidVersionFormat("Invalid version format: \(versionString)")
        }
        self.major = major
        self.minor = minor
        self.patch = patch
    }

    public var description: String {
        return "\(major).\(minor).\(patch)"
    }

    public static func < (lhs: SemanticVersion, rhs: SemanticVersion) -> Bool {
        if lhs.major != rhs.major { return lhs.major < rhs.major }
        if lhs.minor != rhs.minor { return lhs.minor < rhs.minor }
        return lhs.patch < rhs.patch
    }

    /// Check if this is a major version bump compared to another version
    public func isMajorBump(from other: SemanticVersion) -> Bool {
        return major > other.major
    }
}