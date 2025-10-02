enum JSONValue: Decodable {
    case string(String)
    case number(Double)
    case boolean(Bool)
    case array([JSONValue])
    case object([String: JSONValue])
    case null
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        
        if container.decodeNil() {
            self = .null
        } else if let string = try? container.decode(String.self) {
            self = .string(string)
        } else if let number = try? container.decode(Double.self) {
            self = .number(number)
        } else if let boolean = try? container.decode(Bool.self) {
            self = .boolean(boolean)
        } else if let array = try? container.decode([JSONValue].self) {
            self = .array(array)
        } else if let object = try? container.decode([String: JSONValue].self) {
            self = .object(object)
        } else {
            throw DecodingError.typeMismatch(JSONValue.self, DecodingError.Context(
                codingPath: decoder.codingPath,
                debugDescription: "Unable to decode JSONValue"
            ))
        }
    }
    
    var value: Any? {
        switch self {
        case .string(let string):
            return string
        case .number(let number):
            return number
        case .boolean(let boolean):
            return boolean
        case .array(let array):
            return array.map { $0.value }
        case .object(let object):
            return object.mapValues { $0.value }
        case .null:
            return nil
        }
    }
}
