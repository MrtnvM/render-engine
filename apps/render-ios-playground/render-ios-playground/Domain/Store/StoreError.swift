import Foundation

/// Errors that can occur during store operations
public enum StoreError: LocalizedError {
    case keyPathNotFound(String)
    case invalidKeyPath(String)
    case decodeFailed(String)
    case encodeFailed(String)
    case invalidVersionFormat(String)
    case validationFailed(String)
    case storageUnavailable(String)
    case concurrencyError(String)
    case transactionFailed(String)

    public var errorDescription: String? {
        switch self {
        case .keyPathNotFound(let keyPath):
            return "Key path not found: \(keyPath)"
        case .invalidKeyPath(let keyPath):
            return "Invalid key path: \(keyPath)"
        case .decodeFailed(let reason):
            return "Failed to decode value: \(reason)"
        case .encodeFailed(let reason):
            return "Failed to encode value: \(reason)"
        case .invalidVersionFormat(let version):
            return "Invalid version format: \(version)"
        case .validationFailed(let reason):
            return "Validation failed: \(reason)"
        case .storageUnavailable(let reason):
            return "Storage unavailable: \(reason)"
        case .concurrencyError(let reason):
            return "Concurrency error: \(reason)"
        case .transactionFailed(let reason):
            return "Transaction failed: \(reason)"
        }
    }
}