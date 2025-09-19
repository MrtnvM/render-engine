import UIKit

/// Domain entity representing a UI component
class Component: Equatable {
    let id: String
    let type: String
    let style: ViewStyle
    private var children: [Component] = []
    
    init(id: String, type: String, style: ViewStyle) {
        self.id = id
        self.type = type
        self.style = style
    }
    
    static func create(from config: Config) throws -> Component {
        guard let typeString = config.getString(forKey: "type") else {
            throw DomainError.invalidScenarioStructure(
                "Missing 'type' field in component config"
            )
        }
        
        let id = config.getString(forKey: "id") ?? UUID().uuidString
        let style = ViewStyle(config.getConfig(forKey: "style"))

        let component = Component(
            id: id,
            type: typeString,
            style: style
        )
        
        if let childrenData = config.getConfigArray(forKey: "children") {
            for childConfig in childrenData {
                let childComponent = try Component.create(from: childConfig)
                try component.addChild(childComponent)
            }
        }
        
        return component
    }
    
    func addChild(_ child: Component) throws {
        // Check for circular dependencies
        if child.containsComponent(with: self.id) {
            throw DomainError.renderingError("Circular dependency detected")
        }
        
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
    
    static func == (lhs: Component, rhs: Component) -> Bool {
        return lhs.id == rhs.id
    }
}
