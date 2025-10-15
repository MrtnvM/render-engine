import Foundation

/// In-memory storage backend (ephemeral, cleared on deallocation)
final class MemoryStorageBackend: StorageBackend {

    private let storage: ThreadSafeStorage

    init() {
        self.storage = ThreadSafeStorage()
    }

    func load() async -> [String: StoreValue]? {
        return storage.data
    }

    func save(_ data: [String: StoreValue]) async throws {
        storage.data = data
    }

    func clear() async throws {
        storage.data = [:]
    }

    var isAvailable: Bool {
        true
    }
}

// MARK: - Thread-Safe Storage

private final class ThreadSafeStorage: @unchecked Sendable {
    private let lock = NSLock()
    private var _data: [String: StoreValue] = [:]

    var data: [String: StoreValue] {
        get {
            lock.lock()
            defer { lock.unlock() }
            return _data
        }
        set {
            lock.lock()
            defer { lock.unlock() }
            _data = newValue
        }
    }
}
