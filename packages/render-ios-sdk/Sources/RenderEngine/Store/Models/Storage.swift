import Foundation

/// Defines the storage mechanism for a Store instance
/// Different storage types have different persistence characteristics
public enum Storage: Equatable, Hashable, Sendable {
    /// In-memory storage (ephemeral, cleared on app termination / session end)
    case memory

    /// UserDefaults storage (persisted locally)
    /// Optional suite name for shared containers
    case userPrefs(suite: String? = nil)

    /// File-based storage (persisted as JSON file)
    case file(url: URL)

    /// Remote backend storage (synchronized with server)
    case backend(namespace: String)

    /// Human-readable description of the storage type
    public var description: String {
        switch self {
        case .memory:
            return "memory"
        case .userPrefs(let suite):
            if let suite = suite {
                return "userPrefs(suite: \(suite))"
            }
            return "userPrefs"
        case .file(let url):
            return "file(\(url.lastPathComponent))"
        case .backend(let namespace):
            return "backend(\(namespace))"
        }
    }

    /// Unique identifier for this storage (used for keying)
    public var identifier: String {
        switch self {
        case .memory:
            return "memory"
        case .userPrefs(let suite):
            return "userPrefs_\(suite ?? "default")"
        case .file(let url):
            return "file_\(url.absoluteString.hashValue)"
        case .backend(let namespace):
            return "backend_\(namespace)"
        }
    }

    /// Whether this storage type persists across app launches
    public var isPersistent: Bool {
        switch self {
        case .memory:
            return false
        case .userPrefs, .file, .backend:
            return true
        }
    }
}
