import Foundation

/// Represents all possible values that can be stored in the Store
public enum StoreValue: Codable, Equatable {
    case string(String)
    case number(Double)
    case integer(Int)
    case bool(Bool)
    case color(String)
    case url(String)
    case array([StoreValue])
    case object([String: StoreValue])
    case null

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if container.decodeNil() {
            self = .null
            return
        }

        do {
            // Try to decode as string first (handles color, url, and string)
            let stringValue = try container.decode(String.self)
            if stringValue.hasPrefix("#") && (stringValue.count == 7 || stringValue.count == 9) {
                self = .color(stringValue)
            } else if let url = URL(string: stringValue), url.scheme != nil {
                self = .url(stringValue)
            } else {
                self = .string(stringValue)
            }
            return
        } catch {}

        do {
            // Try number
            let numberValue = try container.decode(Double.self)
            self = .number(numberValue)
            return
        } catch {}

        do {
            // Try integer
            let intValue = try container.decode(Int.self)
            self = .integer(intValue)
            return
        } catch {}

        do {
            // Try boolean
            let boolValue = try container.decode(Bool.self)
            self = .bool(boolValue)
            return
        } catch {}

        do {
            // Try array
            let arrayValue = try container.decode([StoreValue].self)
            self = .array(arrayValue)
            return
        } catch {}

        do {
            // Try object
            let objectValue = try container.decode([String: StoreValue].self)
            self = .object(objectValue)
            return
        } catch {}

        throw DecodingError.dataCorruptedError(
            in: container,
            debugDescription: "Cannot decode StoreValue from the given data"
        )
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

    /// Get the raw value for type checking and conversion
    public var rawValue: Any {
        switch self {
        case .string(let value): return value
        case .number(let value): return value
        case .integer(let value): return value
        case .bool(let value): return value
        case .color(let value): return value
        case .url(let value): return value
        case .array(let value): return value
        case .object(let value): return value
        case .null: return NSNull()
        }
    }

    /// Get the string representation for debugging
    public var description: String {
        switch self {
        case .string(let value): return "string(\"\(value)\")"
        case .number(let value): return "number(\(value))"
        case .integer(let value): return "integer(\(value))"
        case .bool(let value): return "bool(\(value))"
        case .color(let value): return "color(\"\(value)\")"
        case .url(let value): return "url(\"\(value)\")"
        case .array(let value): return "array(\(value.count) items)"
        case .object(let value): return "object(\(value.count) keys)"
        case .null: return "null"
        }
    }
}