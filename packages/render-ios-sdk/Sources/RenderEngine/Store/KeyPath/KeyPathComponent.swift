import Foundation

/// Represents a single component of a keyPath
/// Examples:
/// - "cart" -> .property("cart")
/// - "[0]" -> .index(0)
/// - "items[2]" -> .property("items"), .index(2)
enum KeyPathComponent: Equatable {
    case property(String)
    case index(Int)

    var description: String {
        switch self {
        case .property(let name):
            return name
        case .index(let idx):
            return "[\(idx)]"
        }
    }
}
