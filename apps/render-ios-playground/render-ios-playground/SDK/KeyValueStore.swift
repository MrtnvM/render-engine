import Foundation
import Combine

/// Protocol for key-value storage operations
public protocol KeyValueStore: AnyObject {
    var scope: Scope { get }
    var scenarioID: String? { get }

    // MARK: - IO Operations

    /// Get a value for the given key path
    func get(_ keyPath: String) -> StoreValue?

    /// Get a value and decode it to the specified type
    func get<T: Decodable>(_ keyPath: String, as: T.Type) throws -> T

    /// Check if a key path exists
    func exists(_ keyPath: String) -> Bool

    // MARK: - Mutation Operations

    /// Set a value for the given key path
    func set(_ keyPath: String, _ value: StoreValue)

    /// Merge an object into the given key path
    func merge(_ keyPath: String, _ object: [String: StoreValue])

    /// Remove a key path and its value
    func remove(_ keyPath: String)

    // MARK: - Batch Operations

    /// Perform multiple operations in a single transaction
    func transaction(_ block: (KeyValueStore) -> Void)

    // MARK: - Observation

    /// Get a publisher for a single key path
    func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never>

    /// Get a publisher for multiple key paths
    func publisher(for keyPaths: Set<String>) -> AnyPublisher<StoreValue, Never>

    // MARK: - Snapshot

    /// Get a snapshot of all current values
    func snapshot() -> [String: StoreValue]

    /// Replace all values with the given root object
    func replaceAll(with root: [String: StoreValue])

    // MARK: - Validation

    /// Configure validation options for this store
    func configureValidation(_ options: ValidationOptions)

    /// Validate a write operation
    func validateWrite(_ keyPath: String, _ value: StoreValue) -> ValidationResult

    // MARK: - Expressions

    /// Register a live expression
    func registerLiveExpression(_ expr: LiveExpression)

    /// Unregister a live expression
    func unregisterLiveExpression(id: String)
}