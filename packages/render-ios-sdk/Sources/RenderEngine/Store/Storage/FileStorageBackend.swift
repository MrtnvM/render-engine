import Foundation

/// File-based storage backend (persistent as JSON file with atomic writes)
final class FileStorageBackend: StorageBackend {

    private let fileURL: URL
    private nonisolated(unsafe) let fileManager: FileManager

    init(fileURL: URL) {
        self.fileURL = fileURL
        self.fileManager = FileManager.default

        // Ensure parent directory exists
        let parentDir = fileURL.deletingLastPathComponent()
        if !fileManager.fileExists(atPath: parentDir.path) {
            try? fileManager.createDirectory(at: parentDir, withIntermediateDirectories: true)
        }
    }

    func load() async -> [String: StoreValue]? {
        guard fileManager.fileExists(atPath: fileURL.path) else {
            return nil
        }

        do {
            let data = try Data(contentsOf: fileURL)
            let decoder = JSONDecoder()
            let storeData = try decoder.decode([String: StoreValue].self, from: data)
            return storeData
        } catch {
            // Failed to load or decode
            return nil
        }
    }

    func save(_ data: [String: StoreValue]) async throws {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        let encoded = try encoder.encode(data)

        // Atomic write: write to temp file first, then move
        let tempURL = fileURL.deletingLastPathComponent()
            .appendingPathComponent(fileURL.lastPathComponent + ".tmp")

        try encoded.write(to: tempURL, options: .atomic)

        if fileManager.fileExists(atPath: fileURL.path) {
            try fileManager.removeItem(at: fileURL)
        }

        try fileManager.moveItem(at: tempURL, to: fileURL)
    }

    func clear() async throws {
        if fileManager.fileExists(atPath: fileURL.path) {
            try fileManager.removeItem(at: fileURL)
        }
    }

    var isAvailable: Bool {
        let parentDir = fileURL.deletingLastPathComponent()
        return fileManager.fileExists(atPath: parentDir.path)
    }
}
