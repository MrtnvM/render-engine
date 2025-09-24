import Foundation

/// Represents a value that can be stored in the store.
/// Supports JSON-compatible types plus extended types like color and url.
public enum StoreValue: Codable, Equatable {
    case string(String)
    case number(Double)
    case integer(Int)
    case bool(Bool)
    case color(String)  // Hex color code like "#FF0000" or named colors
    case url(String)    // URL string
    case array([StoreValue])
    case object([String: StoreValue])
    case null

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if let stringValue = try? container.decode(String.self) {
            // Try to detect if it's a color or URL based on format
            if stringValue.hasPrefix("#") && (stringValue.count == 7 || stringValue.count == 9) {
                self = .color(stringValue)
            } else if let _ = URL(string: stringValue) {
                self = .url(stringValue)
            } else {
                self = .string(stringValue)
            }
        } else if let numberValue = try? container.decode(Double.self) {
            self = .number(numberValue)
        } else if let integerValue = try? container.decode(Int.self) {
            self = .integer(integerValue)
        } else if let boolValue = try? container.decode(Bool.self) {
            self = .bool(boolValue)
        } else if let arrayValue = try? container.decode([StoreValue].self) {
            self = .array(arrayValue)
        } else if let objectValue = try? container.decode([String: StoreValue].self) {
            self = .object(objectValue)
        } else {
            // Default to null if nothing matches
            self = .null
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch self {
        case .string(let value):
            try container.encode(value)
        case .number(let value):
            try container.encode(value)
        case .integer(let value):
            try container.encode(value)
        case .bool(let value):
            try container.encode(value)
        case .color(let value):
            try container.encode(value)
        case .url(let value):
            try container.encode(value)
        case .array(let value):
            try container.encode(value)
        case .object(let value):
            try container.encode(value)
        case .null:
            try container.encodeNil()
        }
    }

    /// Get the string representation of this value
    public var stringValue: String? {
        switch self {
        case .string(let value):
            return value
        case .color(let value):
            return value
        case .url(let value):
            return value
        default:
            return nil
        }
    }

    /// Get the numeric representation of this value
    public var numberValue: Double? {
        switch self {
        case .number(let value):
            return value
        case .integer(let value):
            return Double(value)
        default:
            return nil
        }
    }

    /// Get the boolean representation of this value
    public var boolValue: Bool? {
        switch self {
        case .bool(let value):
            return value
        default:
            return nil
        }
    }

    /// Get the array representation of this value
    public var arrayValue: [StoreValue]? {
        switch self {
        case .array(let value):
            return value
        default:
            return nil
        }
    }

    /// Get the object representation of this value
    public var objectValue: [String: StoreValue]? {
        switch self {
        case .object(let value):
            return value
        default:
            return nil
        }
    }
}