import Foundation

/// Domain entity representing a complete UI schema
public class Scenario {
    public let id: String
    public let key: String
    public let mainComponent: Component
    public let components: [String: Component]
    public let version: String
    public let build_number: Int
    public let metadata: [String: Any]
    public let createdAt: Date
    public let updatedAt: Date

    private init(
        id: String,
        key: String,
        mainComponent: Component,
        components: [String: Component],
        version: String,
        build_number: Int,
        metadata: [String: Any],
        createdAt: Date,
        updatedAt: Date
    ) {
        self.id = id
        self.key = key
        self.version = version
        self.build_number = build_number
        self.mainComponent = mainComponent
        self.metadata = metadata
        self.components = components
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
    
    public static func create(from json: [String: Any?]) -> Scenario? {
        let config = Config(json)

        let id = config.getString(forKey: "id") ?? UUID().uuidString
        let key = config.getString(forKey: "key") ?? config.getString(forKey: "id") ?? UUID().uuidString
        let version = config.getString(forKey: "version") ?? "1.0.0"
        let build_number = config.getInt(forKey: "build_number") ?? 1
        let metadata = config.getDictionary(forKey: "metadata") ?? [:]
        let mainComponentConfig = config.getConfig(forKey: "mainComponent")

        guard
            !mainComponentConfig.isEmpty,
            let mainComponent = try? Component.create(from: mainComponentConfig)
        else { return nil }

        // Parse components section
        var components: [String: Component] = [:]
        if let componentsSection = config.getDictionary(forKey: "components") {
            for (componentName, componentData) in componentsSection {
                if let componentData = componentData as? [String: Any?],
                   let component = try? Component.create(from: Config(componentData)) {
                    components[componentName] = component
                }
            }
        }

        // Parse timestamps
        let createdAt = config.getDate(forKey: "createdAt") ?? Date()
        let updatedAt = config.getDate(forKey: "updatedAt") ?? Date()

        return Scenario(
            id: id,
            key: key,
            mainComponent: mainComponent,
            components: components,
            version: version,
            build_number: build_number,
            metadata: metadata,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}

struct ScenarioJSON: Decodable, Sendable {
    let id: String
    let key: String
    let mainComponent: [String: JSONValue]
    let components: [String: JSONValue]
    let version: String
    let build_number: Int
    let metadata: [String: JSONValue]
    
    func toMap() -> [String: Any?] {
        return [
            "id": id,
            "key": key,
            "mainComponent": convertJSONValueToAny(mainComponent),
            "components": convertJSONValueToAny(components),
            "version": version,
            "build_number": build_number,
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
