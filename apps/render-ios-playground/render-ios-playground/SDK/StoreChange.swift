import Foundation

/// Represents a single patch operation on the store
public struct StorePatch: Equatable {
    public enum Op: Equatable {
        case set
        case remove
        case merge
    }

    public let op: Op
    public let keyPath: String
    public let oldValue: StoreValue?
    public let newValue: StoreValue?

    public init(op: Op, keyPath: String, oldValue: StoreValue? = nil, newValue: StoreValue? = nil) {
        self.op = op
        self.keyPath = keyPath
        self.oldValue = oldValue
        self.newValue = newValue
    }
}

/// Represents a collection of patches that occurred in a single transaction
public struct StoreChange: Equatable {
    public let scenarioID: String
    public let patches: [StorePatch]
    public let transactionID: UUID?

    public init(scenarioID: String, patches: [StorePatch], transactionID: UUID? = nil) {
        self.scenarioID = scenarioID
        self.patches = patches
        self.transactionID = transactionID ?? UUID()
    }

    /// Check if this change affects any of the given key paths
    public func affects(keyPaths: Set<String>) -> Bool {
        return patches.contains { patch in
            keyPaths.contains { affectedKeyPath in
                // Simple check - in a real implementation, this would need more sophisticated
                // key path matching logic to handle wildcards like "items[*].price"
                patch.keyPath == affectedKeyPath ||
                affectedKeyPath.hasPrefix(patch.keyPath + ".") ||
                patch.keyPath.hasPrefix(affectedKeyPath + ".")
            }
        }
    }
}