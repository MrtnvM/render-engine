import UIKit

/// Domain entity representing a UI component
class Component: Equatable {
    let id: String
    let type: String
    let style: ViewStyle
    let properties: Config
    private var children: [Component] = []
    
    private init(id: String, type: String, style: ViewStyle, properties: Config) {
        self.id = id
        self.type = type
        self.style = style
        self.properties = properties
    }
    
    static func create(from config: Config) throws -> Component {
        guard let typeString = config.getString(forKey: "type") else {
            throw DomainError.invalidScenarioStructure(
                "Missing 'type' field in component config"
            )
        }
        
        let id = config.getString(forKey: "id") ?? UUID().uuidString
        let style = ViewStyle(config.getConfig(forKey: "style"))
        let properties = config.getConfig(forKey: "properties")

        let component = Component(
            id: id,
            type: typeString,
            style: style,
            properties: properties
        )
        
        let childrenData = config.getConfigArray(forKey: "children")
        for childConfig in childrenData {
            let childComponent = try Component.create(from: childConfig)
            try component.addChild(childComponent)
        }
        
        return component
    }
    
    func addChild(_ child: Component) throws {
        try self.checkCircularDependencies(child)
        children.append(child)
    }
    
    func getChildren() -> [Component] {
        return children
    }
    
    private func containsComponent(with id: String) -> Bool {
        if self.id == id {
            return true
        }
        
        return children.contains { $0.containsComponent(with: id) }
    }

    private func checkCircularDependencies(_ child: Component) throws {
        if child.containsComponent(with: self.id) {
            throw DomainError.renderingError("Circular dependency detected")
        }
    }
    
    static func == (lhs: Component, rhs: Component) -> Bool {
        return lhs.id == rhs.id
    }
}
