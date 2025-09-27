import UIKit
import Foundation

// MARK: - Enhanced View Mapping System

/// Enhanced view mapping system that tracks component-to-view relationships
public class EnhancedViewMapping {
    private var componentToView: [String: UIView] = [:]
    private var viewToComponent: [ObjectIdentifier: String] = [:]
    private var componentHierarchy: [String: [String]] = [:] // parent -> children
    private var componentToParent: [String: String] = [:] // child -> parent
    
    /// Associates a component with its rendered view
    func map(component: Component, to view: UIView, parent: Component? = nil) {
        let componentId = component.id
        componentToView[componentId] = view
        viewToComponent[ObjectIdentifier(view)] = componentId
        
        // Track hierarchy
        if let parent = parent {
            componentToParent[componentId] = parent.id
            if componentHierarchy[parent.id] == nil {
                componentHierarchy[parent.id] = []
            }
            componentHierarchy[parent.id]?.append(componentId)
        }
    }
    
    /// Gets the view for a component
    func view(for component: Component) -> UIView? {
        return componentToView[component.id]
    }
    
    /// Gets the view for a component ID
    func view(for componentId: String) -> UIView? {
        return componentToView[componentId]
    }
    
    /// Gets the component ID for a view
    func componentId(for view: UIView) -> String? {
        return viewToComponent[ObjectIdentifier(view)]
    }
    
    /// Gets the component for a view
    func component(for view: UIView) -> Component? {
        guard let componentId = componentId(for: view) else { return nil }
        return findComponent(by: componentId)
    }
    
    /// Removes mapping for a component and all its children
    func remove(component: Component) {
        removeRecursively(component: component)
    }
    
    private func removeRecursively(component: Component) {
        let componentId = component.id
        
        // Remove children first
        if let children = componentHierarchy[componentId] {
            for childId in children {
                if let childView = componentToView[childId] {
                    removeRecursively(component: Component(id: childId, type: "", style: ViewStyle(), properties: Config(), data: Config()))
                }
            }
        }
        
        // Remove this component
        if let view = componentToView[componentId] {
            viewToComponent.removeValue(forKey: ObjectIdentifier(view))
        }
        componentToView.removeValue(forKey: componentId)
        componentHierarchy.removeValue(forKey: componentId)
        componentToParent.removeValue(forKey: componentId)
    }
    
    /// Clears all mappings
    func clear() {
        componentToView.removeAll()
        viewToComponent.removeAll()
        componentHierarchy.removeAll()
        componentToParent.removeAll()
    }
    
    /// Gets all component IDs in the mapping
    func allComponentIds() -> [String] {
        return Array(componentToView.keys)
    }
    
    /// Gets the parent component ID for a given component
    func parentComponentId(for componentId: String) -> String? {
        return componentToParent[componentId]
    }
    
    /// Gets child component IDs for a given parent
    func childComponentIds(for parentId: String) -> [String] {
        return componentHierarchy[parentId] ?? []
    }
    
    /// Rebuilds the mapping from a component tree
    func rebuildFromComponentTree(_ rootComponent: Component, rootView: UIView) {
        clear()
        buildMappingRecursively(component: rootComponent, view: rootView)
    }
    
    private func buildMappingRecursively(component: Component, view: UIView, parent: Component? = nil) {
        map(component: component, to: view, parent: parent)
        
        let children = component.getChildren()
        let childViews = view.subviews
        
        for (index, child) in children.enumerated() {
            if index < childViews.count {
                buildMappingRecursively(component: child, view: childViews[index], parent: component)
            }
        }
    }
    
    /// Finds a component by ID (simplified - in practice you'd traverse the actual component tree)
    private func findComponent(by id: String) -> Component? {
        // This is a simplified implementation
        // In practice, you'd need access to the actual component tree
        return nil
    }
}

// MARK: - Component Tree Traversal

/// Utility for traversing component trees
public class ComponentTreeTraverser {
    
    /// Extracts all components from a tree in depth-first order
    static func extractAllComponents(from root: Component) -> [Component] {
        var components: [Component] = []
        traverseDepthFirst(component: root, components: &components)
        return components
    }
    
    /// Extracts components at a specific level
    static func extractComponentsAtLevel(from root: Component, level: Int) -> [Component] {
        var components: [Component] = []
        traverseAtLevel(component: root, currentLevel: 0, targetLevel: level, components: &components)
        return components
    }
    
    /// Finds a component by ID in the tree
    static func findComponent(by id: String, in root: Component) -> Component? {
        if root.id == id {
            return root
        }
        
        for child in root.getChildren() {
            if let found = findComponent(by: id, in: child) {
                return found
            }
        }
        
        return nil
    }
    
    private static func traverseDepthFirst(component: Component, components: inout [Component]) {
        components.append(component)
        for child in component.getChildren() {
            traverseDepthFirst(component: child, components: &components)
        }
    }
    
    private static func traverseAtLevel(component: Component, currentLevel: Int, targetLevel: Int, components: inout [Component]) {
        if currentLevel == targetLevel {
            components.append(component)
            return
        }
        
        for child in component.getChildren() {
            traverseAtLevel(component: child, currentLevel: currentLevel + 1, targetLevel: targetLevel, components: &components)
        }
    }
}

// MARK: - View Hierarchy Utilities

/// Utilities for working with view hierarchies
public class ViewHierarchyUtils {
    
    /// Safely removes a view from its superview
    static func safelyRemoveView(_ view: UIView) {
        view.removeFromSuperview()
    }
    
    /// Safely inserts a view at a specific index
    static func safelyInsertView(_ view: UIView, at index: Int, in containerView: UIView) {
        if index < containerView.subviews.count {
            containerView.insertSubview(view, at: index)
        } else {
            containerView.addSubview(view)
        }
    }
    
    /// Gets the index of a view in its superview
    static func indexOfView(_ view: UIView) -> Int? {
        return view.superview?.subviews.firstIndex(of: view)
    }
    
    /// Reorders a view from one index to another
    static func reorderView(_ view: UIView, from fromIndex: Int, to toIndex: Int, in containerView: UIView) {
        guard fromIndex != toIndex,
              fromIndex < containerView.subviews.count,
              toIndex < containerView.subviews.count else { return }
        
        view.removeFromSuperview()
        containerView.insertSubview(view, at: toIndex)
    }
}
