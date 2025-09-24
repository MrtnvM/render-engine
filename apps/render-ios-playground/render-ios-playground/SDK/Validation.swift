import Foundation

public struct ValidationOptions: Equatable {
    public enum Mode { case strict, lenient }
    public var mode: Mode
    public var schema: [String: ValidationRule]

    public init(mode: Mode = .lenient, schema: [String: ValidationRule] = [:]) {
        self.mode = mode
        self.schema = schema
    }
}

public struct ValidationRule: Codable, Equatable {
    public enum Kind: String, Codable { case string, number, integer, bool, color, url, array, object }
    public var kind: Kind
    public var required: Bool
    public var defaultValue: StoreValue?
    public var min: Double?
    public var max: Double?
    public var pattern: String?

    public init(kind: Kind, required: Bool = false, defaultValue: StoreValue? = nil, min: Double? = nil, max: Double? = nil, pattern: String? = nil) {
        self.kind = kind
        self.required = required
        self.defaultValue = defaultValue
        self.min = min
        self.max = max
        self.pattern = pattern
    }
}

public enum ValidationResult {
    case ok
    case failed(reason: String)
}

