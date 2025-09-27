import UIKit

/// Domain entity representing a UI component
public class Component: Equatable {
    let id: String
    let type: String
    let style: ViewStyle
    let properties: Config
    let data: Config
    private var children: [Component] = []
    
    public init(id: String, type: String, style: ViewStyle, properties: Config, data: Config) {
        self.id = id
        self.type = type
        self.style = style
        self.properties = properties
        self.data = data
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
        let data = config.getConfig(forKey: "data")

        let component = Component(
            id: id,
            type: typeString,
            style: style,
            properties: properties,
            data: data
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
    
    public static func == (lhs: Component, rhs: Component) -> Bool {
        return lhs.id == rhs.id
    }
    
    /// Checks if two components have the same structure and properties
    func isStructurallyEqual(to other: Component) -> Bool {
        return self.type == other.type &&
               self.style == other.style &&
               self.properties == other.properties &&
               self.data == other.data &&
               self.getChildren().count == other.getChildren().count
    }
    
    /// Gets a hash value for structural comparison
    func structuralHash() -> Int {
        var hasher = Hasher()
        hasher.combine(type)
        hasher.combine(style)
        hasher.combine(properties)
        hasher.combine(data)
        hasher.combine(getChildren().count)
        return hasher.finalize()
    }
    
    /// Creates a copy of the component with a new ID
    func copy(withNewId id: String? = nil) -> Component {
        let newId = id ?? self.id
        let newComponent = Component(
            id: newId,
            type: self.type,
            style: self.style,
            properties: self.properties,
            data: self.data
        )
        
        // Copy children
        for child in self.getChildren() {
            try? newComponent.addChild(child.copy())
        }
        
        return newComponent
    }
}
