import Foundation

/// Protocol for storage backends that persist Store data
/// Different implementations provide different persistence characteristics
protocol StorageBackend: Sendable {

    /// Load the entire data snapshot from storage
    /// Returns nil if no data exists or on error
    func load() async -> [String: StoreValue]?

    /// Save the entire data snapshot to storage
    func save(_ data: [String: StoreValue]) async throws

    /// Clear all data from storage
    func clear() async throws

    /// Check if the storage backend is available
    var isAvailable: Bool { get }
}
