import Foundation

/// Represents a batch of changes to the store
/// Multiple patches can be grouped into a single change event (e.g., via transaction)
public struct StoreChange: Equatable, Sendable {

    /// The patches that comprise this change
    public let patches: [StorePatch]

    /// Optional transaction ID for batched operations
    public let transactionID: UUID?

    /// Timestamp when the change occurred
    public let timestamp: Date

    public init(
        patches: [StorePatch],
        transactionID: UUID? = nil,
        timestamp: Date = Date()
    ) {
        self.patches = patches
        self.transactionID = transactionID
        self.timestamp = timestamp
    }

    /// Convenience initializer for a single patch
    public init(patch: StorePatch, timestamp: Date = Date()) {
        self.patches = [patch]
        self.transactionID = nil
        self.timestamp = timestamp
    }

    /// All keyPaths affected by this change
    public var affectedKeyPaths: Set<String> {
        Set(patches.map { $0.keyPath })
    }

    /// Check if a specific keyPath was affected by this change
    public func affects(keyPath: String) -> Bool {
        affectedKeyPaths.contains(keyPath)
    }

    /// Check if any of the provided keyPaths were affected
    public func affects(keyPaths: Set<String>) -> Bool {
        !affectedKeyPaths.isDisjoint(with: keyPaths)
    }
}

// MARK: - CustomStringConvertible

extension StoreChange: CustomStringConvertible {
    public var description: String {
        let txID = transactionID?.uuidString.prefix(8) ?? "none"
        let patchDescriptions = patches.map { "  - \($0.description)" }.joined(separator: "\n")
        return """
        StoreChange(txID: \(txID), patches: \(patches.count))
        \(patchDescriptions)
        """
    }
}
