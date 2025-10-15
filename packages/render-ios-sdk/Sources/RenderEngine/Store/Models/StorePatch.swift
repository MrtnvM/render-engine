import Foundation

/// Represents a single mutation operation on the store
public struct StorePatch: Equatable, Sendable {

    /// The type of operation
    public enum Operation: String, Codable, Sendable {
        case set     // Set a value at keyPath
        case remove  // Remove a value at keyPath
        case merge   // Merge an object at keyPath (only for object values)
    }

    /// The operation to perform
    public let op: Operation

    /// The keyPath where the operation occurred (e.g., "cart.total", "items[0].name")
    public let keyPath: String

    /// The value before the operation (nil for new keys)
    public let oldValue: StoreValue?

    /// The value after the operation (nil for remove operations)
    public let newValue: StoreValue?

    public init(
        op: Operation,
        keyPath: String,
        oldValue: StoreValue? = nil,
        newValue: StoreValue? = nil
    ) {
        self.op = op
        self.keyPath = keyPath
        self.oldValue = oldValue
        self.newValue = newValue
    }
}

// MARK: - CustomStringConvertible

extension StorePatch: CustomStringConvertible {
    public var description: String {
        switch op {
        case .set:
            return "SET \(keyPath): \(oldValue?.description ?? "nil") -> \(newValue?.description ?? "nil")"
        case .remove:
            return "REMOVE \(keyPath): \(oldValue?.description ?? "nil")"
        case .merge:
            return "MERGE \(keyPath): \(newValue?.description ?? "nil")"
        }
    }
}
