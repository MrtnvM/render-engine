import Foundation
import Combine

/// Protocol for store instances that manage key-value state
public protocol Store: AnyObject {
    var scope: Scope { get }
    var storage: Storage { get }

    // MARK: - IO Operations

    /// Get a value for the given key path
    func get(_ keyPath: String) -> StoreValue?

    /// Get a value for the given key path and decode it to the specified type
    func get<T: Decodable>(_ keyPath: String, as: T.Type) throws -> T

    /// Check if a key path exists in the store
    func exists(_ keyPath: String) -> Bool

    // MARK: - Mutation Operations

    /// Set a value for the given key path
    func set(_ keyPath: String, _ value: StoreValue)

    /// Merge an object into the given key path
    func merge(_ keyPath: String, _ object: [String: StoreValue])

    /// Remove a value for the given key path
    func remove(_ keyPath: String)

    // MARK: - Batch Operations

    /// Perform multiple operations in a single transaction
    func transaction(_ block: (Store) -> Void)

    // MARK: - Observation

    /// Get a publisher for a specific key path
    func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never>

    /// Get a publisher for multiple key paths
    func publisher(for keyPaths: Set<String>) -> AnyPublisher<StoreValue, Never>

    // MARK: - Snapshot Operations

    /// Get a snapshot of all values in the store
    func snapshot() -> [String: StoreValue]

    /// Replace all values in the store
    func replaceAll(with root: [String: StoreValue])

    // MARK: - Validation

    /// Configure validation options for this store
    func configureValidation(_ options: ValidationOptions)

    /// Validate a write operation before it occurs
    func validateWrite(_ keyPath: String, _ value: StoreValue) -> ValidationResult
}

/// Factory protocol for creating and managing Store instances
public protocol StoreFactory: AnyObject {
    /// Returns a Store bound to given scope and storage.
    /// If a Store already exists for the combination, the same instance may be reused.
    func makeStore(scope: Scope, storage: Storage) -> Store

    /// Optionally drop and recreate all stores for a given scope (e.g., on major version bump).
    func resetStores(for scope: Scope)

    /// Reset all stores regardless of scope
    func resetAllStores()

    /// Get all stores for a given scope
    func stores(for scope: Scope) -> [Store]

    /// Get the current version for a scope
    func version(for scope: Scope) -> SemanticVersion

    /// Set the version for a scope (will reset stores if major version changes)
    func setVersion(_ version: SemanticVersion, for scope: Scope)
}