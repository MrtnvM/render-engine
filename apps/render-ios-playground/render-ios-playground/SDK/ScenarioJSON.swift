struct ScenarioJSON: Decodable {
    let id: String
    let mainComponent: [String: JSONValue]
    let components: [String: JSONValue]
    let version: String
    let metadata: [String: JSONValue]
    
    func toMap() -> [String: Any?] {
        return [
            "id": id,
            "mainComponent": convertJSONValueToAny(mainComponent),
            "components": convertJSONValueToAny(components),
            "version": version,
            "metadata": convertJSONValueToAny(metadata)
        ]
    }
    
    private func convertJSONValueToAny(_ jsonValue: [String: JSONValue]) -> [String: Any?] {
        var result = [String: Any?]()
        for (key, value) in jsonValue {
            result[key] = convertJSONValueToAny(value)
        }
        return result
    }
    
    private func convertJSONValueToAny(_ jsonValue: JSONValue) -> Any? {
        switch jsonValue {
        case .string(let string):
            return string
        case .number(let number):
            return number
        case .boolean(let boolean):
            return boolean
        case .array(let array):
            return array.map { convertJSONValueToAny($0) }
        case .object(let object):
            return convertJSONValueToAny(object)
        case .null:
            return nil
        }
    }
}

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
