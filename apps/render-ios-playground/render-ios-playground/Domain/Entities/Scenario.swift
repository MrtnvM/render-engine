import Foundation

/// Domain entity representing a complete UI schema
class Scenario {
    let id: String
    let version: String
    let mainComponent: Component
    let metadata: [String: Any]
    
    private init(
        id: String,
        version: String,
        mainComponent: Component,
        metadata: [String: Any])
    {
        self.id = id
        self.version = version
        self.mainComponent = mainComponent
        self.metadata = metadata
    }
    
    static func create(from json: [String: Any?]) -> Scenario? {
        let config = Config(json)
        
        let id = config.getString(forKey: "id") ?? UUID().uuidString
        let version = config.getString(forKey: "version") ?? "1.0.0"
        let metadata = config.getDictionary(forKey: "metadata") ?? [:]
        let mainComponentConfig = config.getConfig(forKey: "schema").getConfig(forKey: "main")
        
        guard
            !mainComponentConfig.isEmpty,
            let mainComponent = try? Component.create(from: mainComponentConfig)
        else { return nil }
        
        return Scenario(
            id: id,
            version: version,
            mainComponent: mainComponent,
            metadata: metadata
        )
    }
}
