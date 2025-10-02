import Foundation

/// Domain entity representing a complete UI schema
public class Scenario {
    let id: String
    let key: String
    let mainComponent: Component
    let components: [String: Component]
    let version: String
    let build_number: Int
    let metadata: [String: Any]
    let createdAt: Date
    let updatedAt: Date

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
    
    static func create(from json: [String: Any?]) -> Scenario? {
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
