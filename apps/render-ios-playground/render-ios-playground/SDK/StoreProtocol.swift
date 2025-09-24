import Foundation
import Combine

/// Protocol defining the core Store interface
public protocol Store: AnyObject {
    var scope: Scope { get }
    var storage: Storage { get }

    // MARK: - IO Operations

    /// Get a value for the given key path
    func get(_ keyPath: String) -> StoreValue?

    /// Get a decoded value for the given key path
    func get<T: Decodable>(_ keyPath: String, as: T.Type) throws -> T

    /// Check if a key path exists
    func exists(_ keyPath: String) -> Bool

    // MARK: - Mutations

    /// Set a value for the given key path
    func set(_ keyPath: String, _ value: StoreValue)

    /// Merge an object into the given key path
    func merge(_ keyPath: String, _ object: [String: StoreValue])

    /// Remove a value for the given key path
    func remove(_ keyPath: String)

    // MARK: - Batch Operations

    /// Execute multiple operations as a single transaction
    func transaction(_ block: (Store) -> Void)

    // MARK: - Observation

    /// Publisher for a single key path
    func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never>

    /// Publisher for multiple key paths - publishes StoreChange when any change occurs
    func publisher(for keyPaths: Set<String>) -> AnyPublisher<StoreChange, Never>

    // MARK: - Snapshot

    /// Get a snapshot of all data
    func snapshot() -> [String: StoreValue]

    /// Replace all data with the given root object
    func replaceAll(with root: [String: StoreValue])

    // MARK: - Validation

    /// Configure validation options for this store
    func configureValidation(_ options: ValidationOptions)

    /// Validate a write operation
    func validateWrite(_ keyPath: String, _ value: StoreValue) -> ValidationResult
}

/// Protocol for creating and managing Store instances
public protocol StoreFactory: AnyObject {
    /// Returns a Store bound to given scope and storage.
    /// If a Store already exists for the combination, the same instance may be reused.
    func makeStore(scope: Scope, storage: Storage) -> Store

    /// Optionally drop and recreate all stores for a given scope (e.g., on major version bump).
    func resetStores(for scope: Scope)

    /// Drop all stores and clear caches
    func resetAllStores()
}

/// Protocol for storage backend implementations
public protocol StoreBackend: AnyObject {
    var storage: Storage { get }

    /// Load all data from storage
    func load() -> [String: StoreValue]

    /// Save data to storage
    func save(_ data: [String: StoreValue])

    /// Clear all data from storage
    func clear()

    /// Check if the backend supports concurrent access
    var supportsConcurrentAccess: Bool { get }
}

/// Protocol for backend adapters that need remote synchronization
public protocol StoreBackendAdapter: StoreBackend {
    /// Synchronize data with remote source
    func sync() async throws

    /// Push local changes to remote source
    func push() async throws

    /// Pull changes from remote source
    func pull() async throws
}