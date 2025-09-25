import Foundation

/// Main store protocol for managing scenario data across different scopes
public protocol Store: AnyObject {
    var appID: String { get }

    /// Get a key-value store for the specified scope
    func named(_ scope: Scope) -> KeyValueStore

    /// Get the current version of the store
    var version: SemanticVersion { get }

    /// Update the store version (drops scenario data on major version changes)
    func updateVersion(_ version: SemanticVersion)

    /// Register a backend adapter for remote synchronization
    func registerBackend(_ backend: StoreBackend, for namespace: String)

    /// Get all registered backends
    func registeredBackends() -> [String: StoreBackend]
}

/// Semantic version for store versioning
public struct SemanticVersion: Equatable, Comparable, Codable {
    public let major: Int
    public let minor: Int
    public let patch: Int

    public init(major: Int, minor: Int, patch: Int) {
        self.major = major
        self.minor = minor
        self.patch = patch
    }

    public static func < (lhs: SemanticVersion, rhs: SemanticVersion) -> Bool {
        if lhs.major != rhs.major {
            return lhs.major < rhs.major
        }
        if lhs.minor != rhs.minor {
            return lhs.minor < rhs.minor
        }
        return lhs.patch < rhs.patch
    }
}

/// Backend adapter for remote synchronization
public protocol StoreBackend: AnyObject {
    /// Pull data from the backend
    func pull(namespace: String, scenarioID: String?) async throws -> [String: StoreValue]

    /// Push data to the backend
    func push(namespace: String, scenarioID: String?, changes: [StoreChange]) async throws

    /// Check if the backend is available
    var isAvailable: Bool { get }
}