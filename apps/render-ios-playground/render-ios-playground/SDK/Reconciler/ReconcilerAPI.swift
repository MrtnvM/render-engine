import UIKit
import Foundation

// MARK: - Core Reconciler API

/// Main reconciler interface for efficiently updating view hierarchies
public protocol ReconcilerAPI {
    /// Reconciles the component tree with the current view hierarchy
    /// - Parameters:
    ///   - newComponent: The new component tree
    ///   - containerView: The container view to update
    ///   - context: Rendering context
    func reconcile(
        newComponent: Component,
        in containerView: UIView,
        context: RendererContext
    ) async throws
}

// MARK: - Diff Operations

/// Represents a change operation in the component tree
public enum DiffOperation {
    case insert(Component, at: Int)
    case update(Component, at: Int)
    case remove(at: Int)
    case reorder(from: Int, to: Int)
    case noChange
}

/// Result of diffing two component trees
public struct DiffResult {
    let operations: [DiffOperation]
    let hasChanges: Bool
    
    init(operations: [DiffOperation]) {
        self.operations = operations
        self.hasChanges = !operations.allSatisfy { 
            if case .noChange = $0 { return true }
            return false
        }
    }
}

// MARK: - View Mapping

/// Maps components to their rendered views for efficient updates
public class ViewMapping {
    private var componentToView: [String: UIView] = [:]
    private var viewToComponent: [ObjectIdentifier: String] = [:]
    
    /// Associates a component with its rendered view
    func map(component: Component, to view: UIView) {
        let componentId = component.id
        componentToView[componentId] = view
        viewToComponent[ObjectIdentifier(view)] = componentId
    }
    
    /// Gets the view for a component
    func view(for component: Component) -> UIView? {
        return componentToView[component.id]
    }
    
    /// Gets the component ID for a view
    func componentId(for view: UIView) -> String? {
        return viewToComponent[ObjectIdentifier(view)]
    }
    
    /// Removes mapping for a component
    func remove(component: Component) {
        if let view = componentToView[component.id] {
            viewToComponent.removeValue(forKey: ObjectIdentifier(view))
        }
        componentToView.removeValue(forKey: component.id)
    }
    
    /// Clears all mappings
    func clear() {
        componentToView.removeAll()
        viewToComponent.removeAll()
    }
}

// MARK: - Component Diffing

/// Handles diffing of component trees
public class ComponentDiffer {
    
    /// Diffs two component trees and returns the operations needed to transform one into the other
    func diff(oldComponents: [Component], newComponents: [Component]) -> DiffResult {
        var operations: [DiffOperation] = []
        
        // Simple diffing algorithm - can be enhanced with more sophisticated algorithms
        let maxCount = max(oldComponents.count, newComponents.count)
        
        for i in 0..<maxCount {
            let oldComponent = i < oldComponents.count ? oldComponents[i] : nil
            let newComponent = i < newComponents.count ? newComponents[i] : nil
            
            switch (oldComponent, newComponent) {
            case (nil, let new?):
                // Insert new component
                operations.append(.insert(new, at: i))
                
            case (let old?, nil):
                // Remove old component
                operations.append(.remove(at: i))
                
            case (let old?, let new?):
                if old.id == new.id {
                    // Same component, check if it needs updating
                    if needsUpdate(old: old, new: new) {
                        operations.append(.update(new, at: i))
                    } else {
                        operations.append(.noChange)
                    }
                } else {
                    // Different components - remove old, insert new
                    operations.append(.remove(at: i))
                    operations.append(.insert(new, at: i))
                }
                
            case (nil, nil):
                operations.append(.noChange)
            }
        }
        
        return DiffResult(operations: operations)
    }
    
    /// Determines if a component needs updating by comparing its properties
    private func needsUpdate(old: Component, new: Component) -> Bool {
        // Compare component properties that affect rendering
        return old.type != new.type ||
               old.style != new.style ||
               old.properties != new.properties ||
               old.data != new.data ||
               old.getChildren().count != new.getChildren().count
    }
}

// MARK: - Update Strategies

/// Defines how to apply diff operations to views
public protocol UpdateStrategy {
    func apply(
        operation: DiffOperation,
        to containerView: UIView,
        mapping: ViewMapping,
        context: RendererContext
    ) async throws
}

/// Default update strategy for applying diff operations
public class DefaultUpdateStrategy: UpdateStrategy {
    private let componentRegistry: ComponentRegistry
    
    init(componentRegistry: ComponentRegistry) {
        self.componentRegistry = componentRegistry
    }
    
    func apply(
        operation: DiffOperation,
        to containerView: UIView,
        mapping: ViewMapping,
        context: RendererContext
    ) async throws {
        switch operation {
        case .insert(let component, let index):
            try await insertComponent(component, at: index, in: containerView, mapping: mapping, context: context)
            
        case .update(let component, let index):
            try await updateComponent(component, at: index, in: containerView, mapping: mapping, context: context)
            
        case .remove(let index):
            try await removeComponent(at: index, in: containerView, mapping: mapping)
            
        case .reorder(let fromIndex, let toIndex):
            try await reorderComponent(from: fromIndex, to: toIndex, in: containerView, mapping: mapping)
            
        case .noChange:
            break
        }
    }
    
    private func insertComponent(
        _ component: Component,
        at index: Int,
        in containerView: UIView,
        mapping: ViewMapping,
        context: RendererContext
    ) async throws {
        guard let renderer = componentRegistry.renderer(for: component.type) else {
            throw ReconcilerError.noRendererFound(component.type)
        }
        
        let view = try await renderer.render(component: component, context: context)
        mapping.map(component: component, to: view)
        
        // Insert at the correct index
        if index < containerView.subviews.count {
            containerView.insertSubview(view, at: index)
        } else {
            containerView.addSubview(view)
        }
        
        // Recursively handle children
        for (childIndex, child) in component.getChildren().enumerated() {
            try await insertComponent(child, at: childIndex, in: view, mapping: mapping, context: context)
        }
    }
    
    private func updateComponent(
        _ component: Component,
        at index: Int,
        in containerView: UIView,
        mapping: ViewMapping,
        context: RendererContext
    ) async throws {
        guard let existingView = mapping.view(for: component) else {
            // If no existing view, treat as insert
            try await insertComponent(component, at: index, in: containerView, mapping: mapping, context: context)
            return
        }
        
        // Update the existing view with new component properties
        if let renderer = componentRegistry.renderer(for: component.type) {
            try await renderer.update(view: existingView, component: component, context: context)
        }
        
        // Recursively update children
        let childComponents = component.getChildren()
        let childViews = existingView.subviews
        
        for (childIndex, childComponent) in childComponents.enumerated() {
            if childIndex < childViews.count {
                try await updateComponent(childComponent, at: childIndex, in: existingView, mapping: mapping, context: context)
            } else {
                try await insertComponent(childComponent, at: childIndex, in: existingView, mapping: mapping, context: context)
            }
        }
    }
    
    private func removeComponent(
        at index: Int,
        in containerView: UIView,
        mapping: ViewMapping
    ) async throws {
        guard index < containerView.subviews.count else { return }
        
        let viewToRemove = containerView.subviews[index]
        
        // Remove from mapping
        if let componentId = mapping.componentId(for: viewToRemove) {
            // Find and remove the component from mapping
            // This is a simplified approach - in practice, you'd need to traverse the component tree
            mapping.clear() // Simplified: clear all mappings
        }
        
        viewToRemove.removeFromSuperview()
    }
    
    private func reorderComponent(
        from fromIndex: Int,
        to toIndex: Int,
        in containerView: UIView,
        mapping: ViewMapping
    ) async throws {
        guard fromIndex < containerView.subviews.count,
              toIndex < containerView.subviews.count else { return }
        
        let view = containerView.subviews[fromIndex]
        view.removeFromSuperview()
        containerView.insertSubview(view, at: toIndex)
    }
}

// MARK: - Reconciler Errors

public enum ReconcilerError: Error, LocalizedError {
    case noRendererFound(String)
    case invalidOperation(String)
    case updateFailed(String)
    
    public var errorDescription: String? {
        switch self {
        case .noRendererFound(let type):
            return "No renderer found for component type: \(type)"
        case .invalidOperation(let operation):
            return "Invalid operation: \(operation)"
        case .updateFailed(let reason):
            return "Update failed: \(reason)"
        }
    }
}
