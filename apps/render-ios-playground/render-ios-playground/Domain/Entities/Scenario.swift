import Foundation

/// Domain entity representing a complete UI schema
public class Scenario {
    let id: String
    
    let mainComponent: Component
    let components: [String: Component]
    
    let version: String
    let buildNumber: Int
    
    let metadata: [String: Any]

    private init(
        id: String,
        mainComponent: Component,
        components: [String: Component],
        version: String,
        buildNumber: Int,
        metadata: [String: Any]
    ) {
        self.id = id
        self.version = version
        self.mainComponent = mainComponent
        self.metadata = metadata
        self.components = components
        self.buildNumber = buildNumber
    }
    
    static func create(from json: [String: Any?]) -> Scenario? {
        let config = Config(json)

        let id = config.getString(forKey: "id") ?? UUID().uuidString
        let version = config.getString(forKey: "version") ?? "1.0.0"
        let metadata = config.getDictionary(forKey: "metadata") ?? [:]
        let mainComponentConfig = config.getConfig(forKey: "main")
        let buildNumber = config.getInt(forKey: "buildNumber") ?? 1

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

        return Scenario(
            id: id,
            mainComponent: mainComponent,
            components: components,
            version: version,
            buildNumber: buildNumber,
            metadata: metadata
        )
    }
}
