import Foundation

/// Configuration for store validation behavior
public struct ValidationOptions: Equatable {
    public enum Mode: Equatable {
        case strict    // Reject invalid values
        case lenient   // Attempt coercion or use defaults
    }

    public var mode: Mode
    public var schema: [String: ValidationRule]

    public init(mode: Mode = .lenient, schema: [String: ValidationRule] = [:]) {
        self.mode = mode
        self.schema = schema
    }
}

/// Rule defining validation constraints for a key path
public struct ValidationRule: Codable, Equatable {
    public enum Kind: String, Codable, Equatable {
        case string, number, integer, bool, color, url, array, object
    }

    public var kind: Kind
    public var required: Bool = false
    public var defaultValue: StoreValue?
    public var min: Double?
    public var max: Double?
    public var pattern: String?  // Regex pattern for strings

    public init(
        kind: Kind,
        required: Bool = false,
        defaultValue: StoreValue? = nil,
        min: Double? = nil,
        max: Double? = nil,
        pattern: String? = nil
    ) {
        self.kind = kind
        self.required = required
        self.defaultValue = defaultValue
        self.min = min
        self.max = max
        self.pattern = pattern
    }
}

/// Result of a validation operation
public enum ValidationResult: Equatable {
    case ok
    case failed(reason: String)

    public var isValid: Bool {
        switch self {
        case .ok:
            return true
        case .failed:
            return false
        }
    }
}

// MARK: - Validation Logic

extension ValidationRule {
    /// Validate a value against this rule
    func validate(_ value: StoreValue) -> ValidationResult {
        // Check type
        switch (kind, value) {
        case (.string, .string),
             (.number, .number),
             (.integer, .integer),
             (.bool, .bool),
             (.color, .color),
             (.url, .url),
             (.array, .array),
             (.object, .object):
            break // Type matches
        case (.number, .integer):
            break // Integer is acceptable as number
        default:
            return .failed(reason: "Type mismatch: expected \(kind.rawValue), got \(type(of: value))")
        }

        // Check constraints
        switch value {
        case .string(let str):
            if let pattern = pattern, !NSPredicate(format: "SELF MATCHES %@", pattern).evaluate(with: str) {
                return .failed(reason: "String does not match required pattern")
            }
        case .number(let num), .integer:
            let numValue = value.numberValue ?? 0
            if let min = min, numValue < min {
                return .failed(reason: "Value \(numValue) is less than minimum \(min)")
            }
            if let max = max, numValue > max {
                return .failed(reason: "Value \(numValue) is greater than maximum \(max)")
            }
        case .array(let arr):
            if let min = min, Double(arr.count) < min {
                return .failed(reason: "Array count \(arr.count) is less than minimum \(min)")
            }
            if let max = max, Double(arr.count) > max {
                return .failed(reason: "Array count \(arr.count) is greater than maximum \(max)")
            }
        default:
            break
        }

        return .ok
    }

    /// Attempt to coerce a value to match this rule
    func coerce(_ value: StoreValue) -> StoreValue? {
        switch (kind, value) {
        case (.string, .number(let num)):
            return .string(String(num))
        case (.string, .integer(let int)):
            return .string(String(int))
        case (.string, .bool(let bool)):
            return .string(String(bool))
        case (.number, .string(let str)):
            return Double(str).map { .number($0) }
        case (.number, .integer(let int)):
            return .number(Double(int))
        case (.integer, .string(let str)):
            return Int(str).map { .integer($0) }
        case (.integer, .number(let num)):
            return .integer(Int(num))
        case (.bool, .string(let str)):
            switch str.lowercased() {
            case "true", "1", "yes": return .bool(true)
            case "false", "0", "no": return .bool(false)
            default: return nil
            }
        default:
            return nil
        }
    }
}