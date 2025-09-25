import Foundation

/// Represents a single patch operation on a store value
public struct StorePatch: Equatable {
    public enum Op: String, Codable, Equatable {
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

/// Represents a collection of patches within a single transaction
public struct StoreChange: Equatable {
    public let patches: [StorePatch]
    public let transactionID: UUID?

    public init(patches: [StorePatch], transactionID: UUID? = nil) {
        self.patches = patches
        self.transactionID = transactionID ?? UUID()
    }

    /// Check if this change affects a specific key path
    public func affects(keyPath: String) -> Bool {
        return patches.contains { patch in
            patch.keyPath == keyPath || keyPath.hasPrefix(patch.keyPath + ".")
        }
    }

    /// Get all key paths affected by this change
    public var affectedKeyPaths: Set<String> {
        var keyPaths = Set<String>()

        for patch in patches {
            keyPaths.insert(patch.keyPath)

            // Add parent paths for nested changes
            var components = patch.keyPath.split(separator: ".")
            while !components.isEmpty {
                components.removeLast()
                if !components.isEmpty {
                    keyPaths.insert(components.joined(separator: "."))
                }
            }
        }

        return keyPaths
    }
}