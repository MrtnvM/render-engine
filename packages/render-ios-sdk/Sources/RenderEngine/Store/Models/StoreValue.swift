import Foundation

/// A type-safe representation of values that can be stored in the Store
/// Supports JSON-compatible types plus extended types like color and url
public enum StoreValue: Codable, Equatable, Sendable {
    case string(String)
    case number(Double)
    case integer(Int)
    case bool(Bool)
    case color(String)  // Hex color code, e.g., "#FF5733"
    case url(String)     // URL string
    case array([StoreValue])
    case object([String: StoreValue])
    case null

    // MARK: - Codable Implementation

    private enum CodingKeys: String, CodingKey {
        case type
        case value
    }

    private enum ValueType: String, Codable {
        case string, number, integer, bool, color, url, array, object, null
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if container.decodeNil() {
            self = .null
        } else if let string = try? container.decode(String.self) {
            // Try to detect special types by convention
            if string.hasPrefix("#") && string.count >= 4 {
                self = .color(string)
            } else if string.hasPrefix("http://") || string.hasPrefix("https://") {
                self = .url(string)
            } else {
                self = .string(string)
            }
        } else if let integer = try? container.decode(Int.self) {
            self = .integer(integer)
        } else if let number = try? container.decode(Double.self) {
            self = .number(number)
        } else if let boolean = try? container.decode(Bool.self) {
            self = .bool(boolean)
        } else if let array = try? container.decode([StoreValue].self) {
            self = .array(array)
        } else if let object = try? container.decode([String: StoreValue].self) {
            self = .object(object)
        } else {
            throw DecodingError.typeMismatch(StoreValue.self, DecodingError.Context(
                codingPath: decoder.codingPath,
                debugDescription: "Unable to decode StoreValue"
            ))
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch self {
        case .string(let string):
            try container.encode(string)
        case .number(let number):
            try container.encode(number)
        case .integer(let integer):
            try container.encode(integer)
        case .bool(let boolean):
            try container.encode(boolean)
        case .color(let color):
            try container.encode(color)
        case .url(let urlString):
            try container.encode(urlString)
        case .array(let array):
            try container.encode(array)
        case .object(let object):
            try container.encode(object)
        case .null:
            try container.encodeNil()
        }
    }

    // MARK: - Convenience Accessors

    /// Extract the raw value as Any?
    public var value: Any? {
        switch self {
        case .string(let string):
            return string
        case .number(let number):
            return number
        case .integer(let integer):
            return integer
        case .bool(let boolean):
            return boolean
        case .color(let color):
            return color
        case .url(let urlString):
            return urlString
        case .array(let array):
            return array.map { $0.value }
        case .object(let object):
            return object.mapValues { $0.value }
        case .null:
            return nil
        }
    }

    /// Get as String if applicable
    public var stringValue: String? {
        switch self {
        case .string(let str), .color(let str), .url(let str):
            return str
        default:
            return nil
        }
    }

    /// Get as Double if applicable
    public var numberValue: Double? {
        switch self {
        case .number(let num):
            return num
        case .integer(let int):
            return Double(int)
        default:
            return nil
        }
    }

    /// Get as Int if applicable
    public var integerValue: Int? {
        switch self {
        case .integer(let int):
            return int
        case .number(let num):
            return Int(num)
        default:
            return nil
        }
    }

    /// Get as Bool if applicable
    public var boolValue: Bool? {
        if case .bool(let boolean) = self {
            return boolean
        }
        return nil
    }

    /// Get as Array if applicable
    public var arrayValue: [StoreValue]? {
        if case .array(let array) = self {
            return array
        }
        return nil
    }

    /// Get as Object if applicable
    public var objectValue: [String: StoreValue]? {
        if case .object(let object) = self {
            return object
        }
        return nil
    }

    /// Check if value is null
    public var isNull: Bool {
        if case .null = self {
            return true
        }
        return false
    }
}

// MARK: - Convenience Initializers

extension StoreValue {
    /// Create from Any value
    public static func from(_ value: Any?) -> StoreValue {
        guard let value = value else {
            return .null
        }

        switch value {
        case let string as String:
            return .string(string)
        case let number as Double:
            return .number(number)
        case let integer as Int:
            return .integer(integer)
        case let boolean as Bool:
            return .bool(boolean)
        case let array as [Any]:
            return .array(array.map { StoreValue.from($0) })
        case let dict as [String: Any]:
            return .object(dict.mapValues { StoreValue.from($0) })
        default:
            return .null
        }
    }
}

// MARK: - CustomStringConvertible

extension StoreValue: CustomStringConvertible {
    public var description: String {
        switch self {
        case .string(let string):
            return "\"\(string)\""
        case .number(let number):
            return "\(number)"
        case .integer(let integer):
            return "\(integer)"
        case .bool(let boolean):
            return "\(boolean)"
        case .color(let color):
            return "color(\(color))"
        case .url(let urlString):
            return "url(\(urlString))"
        case .array(let array):
            return "[\(array.map { $0.description }.joined(separator: ", "))]"
        case .object(let object):
            let pairs = object.map { "\($0): \($1.description)" }.joined(separator: ", ")
            return "{\(pairs)}"
        case .null:
            return "null"
        }
    }
}
