import Foundation

/// Parses and resolves keyPath strings into components
/// Supports both dot notation (cart.total) and bracket notation (items[0].name)
struct KeyPathResolver {

    /// Parse a keyPath string into components
    /// Examples:
    /// - "cart.total" -> [.property("cart"), .property("total")]
    /// - "items[0].name" -> [.property("items"), .index(0), .property("name")]
    /// - "users[1].addresses[0].street" -> [.property("users"), .index(1), .property("addresses"), .index(0), .property("street")]
    static func parse(_ keyPath: String) -> [KeyPathComponent] {
        var components: [KeyPathComponent] = []
        var currentProperty = ""
        var currentIndex = ""
        var isParsingIndex = false

        for char in keyPath {
            switch char {
            case ".":
                // Finish current property
                if !currentProperty.isEmpty {
                    components.append(.property(currentProperty))
                    currentProperty = ""
                }

            case "[":
                // Finish current property and start parsing index
                if !currentProperty.isEmpty {
                    components.append(.property(currentProperty))
                    currentProperty = ""
                }
                isParsingIndex = true

            case "]":
                // Finish parsing index
                if isParsingIndex, let index = Int(currentIndex) {
                    components.append(.index(index))
                }
                currentIndex = ""
                isParsingIndex = false

            default:
                if isParsingIndex {
                    currentIndex.append(char)
                } else {
                    currentProperty.append(char)
                }
            }
        }

        // Add final property if exists
        if !currentProperty.isEmpty {
            components.append(.property(currentProperty))
        }

        return components
    }

    /// Convert components back to keyPath string
    static func stringify(_ components: [KeyPathComponent]) -> String {
        var result = ""
        for (index, component) in components.enumerated() {
            switch component {
            case .property(let name):
                // Add dot before property if previous component exists and is a property or index
                if index > 0 {
                    let previous = components[index - 1]
                    switch previous {
                    case .property:
                        result += "."
                    case .index:
                        result += "."
                    }
                }
                result += name

            case .index(let idx):
                result += "[\(idx)]"
            }
        }
        return result
    }

    /// Check if a keyPath is a prefix of another keyPath
    /// Used to determine if a change affects nested values
    /// Example: "cart" is a prefix of "cart.total"
    static func isPrefix(_ prefix: String, of keyPath: String) -> Bool {
        let prefixComponents = parse(prefix)
        let keyPathComponents = parse(keyPath)

        guard prefixComponents.count <= keyPathComponents.count else {
            return false
        }

        return Array(keyPathComponents.prefix(prefixComponents.count)) == prefixComponents
    }

    /// Check if two keyPaths are related (one is a prefix of the other)
    static func areRelated(_ keyPath1: String, _ keyPath2: String) -> Bool {
        isPrefix(keyPath1, of: keyPath2) || isPrefix(keyPath2, of: keyPath1)
    }
}
