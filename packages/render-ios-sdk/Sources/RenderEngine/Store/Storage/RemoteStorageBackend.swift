import Foundation

/// Remote backend storage (placeholder for future implementation)
/// This will sync data with a remote server on-demand
final class RemoteStorageBackend: StorageBackend {

    private let namespace: String

    init(namespace: String) {
        self.namespace = namespace
    }

    func load() async -> [String: StoreValue]? {
        // TODO: Implement remote fetch
        // For now, return nil
        return nil
    }

    func save(_ data: [String: StoreValue]) async throws {
        // TODO: Implement remote save
        // For now, no-op
    }

    func clear() async throws {
        // TODO: Implement remote clear
        // For now, no-op
    }

    var isAvailable: Bool {
        // TODO: Check network connectivity and backend availability
        false
    }
}
