import Foundation
import Combine

/// Protocol for the Store API - manages scenario data (key-value state)
/// Provides thread-safe mutations, observation via Combine publishers, and persistence
public protocol Store: AnyObject {

    /// The scope this store is bound to
    var scope: Scope { get }

    /// The storage mechanism for this store
    var storage: Storage { get }

    // MARK: - IO Operations

    /// Get a value at the specified keyPath
    /// Returns nil if the keyPath doesn't exist
    func get(_ keyPath: String) -> StoreValue?

    /// Get a typed value at the specified keyPath
    /// Throws if the value cannot be decoded to the specified type
    func get<T: Decodable>(_ keyPath: String, as type: T.Type) throws -> T

    /// Check if a keyPath exists in the store
    func exists(_ keyPath: String) -> Bool

    // MARK: - Mutations

    /// Set a value at the specified keyPath
    /// Creates intermediate objects/arrays as needed
    func set(_ keyPath: String, _ value: StoreValue)

    /// Merge an object at the specified keyPath
    /// Only works for object values - merges new keys into existing object
    func merge(_ keyPath: String, _ object: [String: StoreValue])

    /// Remove a value at the specified keyPath
    func remove(_ keyPath: String)

    // MARK: - Batch Operations

    /// Execute multiple mutations as a single transaction
    /// All changes are batched into a single StoreChange event
    func transaction(_ block: @escaping (Store) -> Void)

    // MARK: - Observation

    /// Get a publisher for a specific keyPath
    /// Emits the current value immediately, then on every change
    func publisher(for keyPath: String) -> AnyPublisher<StoreValue?, Never>

    /// Get a publisher for multiple keyPaths
    /// Emits when any of the keyPaths change
    func publisher(for keyPaths: Set<String>) -> AnyPublisher<[String: StoreValue?], Never>

    // MARK: - Snapshot

    /// Get a complete snapshot of the store's data
    func snapshot() -> [String: StoreValue]

    /// Replace all data in the store with the provided snapshot
    func replaceAll(with root: [String: StoreValue])
}
