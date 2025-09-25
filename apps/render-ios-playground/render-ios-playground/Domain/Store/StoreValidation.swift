import Foundation

/// Validation options for store operations
public struct ValidationOptions: Equatable {
    public enum Mode: String, Codable, Equatable {
        case strict
        case lenient
    }

    public var mode: Mode
    public var schema: [String: ValidationRule]

    public init(mode: Mode = .strict, schema: [String: ValidationRule] = [:]) {
        self.mode = mode
        self.schema = schema
    }

    /// Get validation rule for a specific key path
    public func rule(for keyPath: String) -> ValidationRule? {
        return schema[keyPath]
    }

    /// Check if a key path has a validation rule
    public func hasRule(for keyPath: String) -> Bool {
        return schema[keyPath] != nil
    }
}

/// Represents a validation rule for a store value
public struct ValidationRule: Codable, Equatable {
    public enum Kind: String, Codable, Equatable {
        case string, number, integer, bool, color, url, array, object
    }

    public var kind: Kind
    public var required: Bool = false
    public var defaultValue: StoreValue?
    public var min: Double?
    public var max: Double?
    public var pattern: String?
    public var minLength: Int?
    public var maxLength: Int?

    public init(
        kind: Kind,
        required: Bool = false,
        defaultValue: StoreValue? = nil,
        min: Double? = nil,
        max: Double? = nil,
        pattern: String? = nil,
        minLength: Int? = nil,
        maxLength: Int? = nil
    ) {
        self.kind = kind
        self.required = required
        self.defaultValue = defaultValue
        self.min = min
        self.max = max
        self.pattern = pattern
        self.minLength = minLength
        self.maxLength = maxLength
    }

    /// Validate a value against this rule
    public func validate(_ value: StoreValue) -> ValidationResult {
        // Check type
        let typeValid = isValidType(value)
        if !typeValid {
            return .failed(reason: "Type mismatch: expected \(kind.rawValue), got \(valueType(of: value))")
        }

        // Type-specific validation
        switch value {
        case .string(let stringValue):
            return validateString(stringValue)
        case .number(let numberValue):
            return validateNumber(numberValue)
        case .integer(let intValue):
            return validateNumber(Double(intValue))
        case .array(let arrayValue):
            return validateArray(arrayValue)
        case .object(let objectValue):
            return validateObject(objectValue)
        default:
            return .ok
        }
    }

    private func isValidType(_ value: StoreValue) -> Bool {
        switch (kind, value) {
        case (.string, .string): return true
        case (.number, .number): return true
        case (.integer, .integer): return true
        case (.bool, .bool): return true
        case (.color, .color): return true
        case (.url, .url): return true
        case (.array, .array): return true
        case (.object, .object): return true
        default: return false
        }
    }

    private func valueType(of value: StoreValue) -> String {
        switch value {
        case .string: return "string"
        case .number: return "number"
        case .integer: return "integer"
        case .bool: return "bool"
        case .color: return "color"
        case .url: return "url"
        case .array: return "array"
        case .object: return "object"
        case .null: return "null"
        }
    }

    private func validateString(_ value: String) -> ValidationResult {
        if let minLength = minLength, value.count < minLength {
            return .failed(reason: "String too short: minimum length is \(minLength), got \(value.count)")
        }

        if let maxLength = maxLength, value.count > maxLength {
            return .failed(reason: "String too long: maximum length is \(maxLength), got \(value.count)")
        }

        if let pattern = pattern, let regex = try? NSRegularExpression(pattern: pattern) {
            let range = NSRange(location: 0, length: value.count)
            if regex.firstMatch(in: value, range: range) == nil {
                return .failed(reason: "String does not match pattern: \(pattern)")
            }
        }

        return .ok
    }

    private func validateNumber(_ value: Double) -> ValidationResult {
        if let min = min, value < min {
            return .failed(reason: "Number too small: minimum is \(min), got \(value)")
        }

        if let max = max, value > max {
            return .failed(reason: "Number too large: maximum is \(max), got \(value)")
        }

        return .ok
    }

    private func validateArray(_ value: [StoreValue]) -> ValidationResult {
        if let minLength = minLength, value.count < minLength {
            return .failed(reason: "Array too short: minimum length is \(minLength), got \(value.count)")
        }

        if let maxLength = maxLength, value.count > maxLength {
            return .failed(reason: "Array too long: maximum length is \(maxLength), got \(value.count)")
        }

        return .ok
    }

    private func validateObject(_ value: [String: StoreValue]) -> ValidationResult {
        if let minLength = minLength, value.count < minLength {
            return .failed(reason: "Object too small: minimum keys is \(minLength), got \(value.count)")
        }

        if let maxLength = maxLength, value.count > maxLength {
            return .failed(reason: "Object too large: maximum keys is \(maxLength), got \(value.count)")
        }

        return .ok
    }
}

/// Result of a validation operation
public enum ValidationResult {
    case ok
    case failed(reason: String)

    public var isValid: Bool {
        switch self {
        case .ok: return true
        case .failed: return false
        }
    }

    public var reason: String? {
        switch self {
        case .ok: return nil
        case .failed(let reason): return reason
        }
    }
}