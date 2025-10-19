import UIKit
import FlexLayout

class ViewTreeBuilder {
    private let scenario: Scenario
    private let viewController: UIViewController?
    private let navigationController: UINavigationController?
    private let window: UIWindow?
    
    private let registry = DIContainer.shared.componentRegistry
    private let logger = DIContainer.shared.logger
    
    init(
        scenario: Scenario,
        viewController: UIViewController? = nil,
        navigationController: UINavigationController? = nil,
        window: UIWindow? = nil
    ) {
        self.scenario = scenario
        self.viewController = viewController
        self.navigationController = navigationController
        self.window = window
    }
    
    /**
     * Recursively builds a UIView hierarchy from a domain `Component` object.
     *
     * This function looks up the appropriate renderer for the given component's type,
     * creates the view, and then recursively calls itself to build views for all
     * child components, adding them to the newly created view's flex container.
     * 
     * Enhanced to handle component props by expanding custom components with their data.
     *
     * - Parameter component: The `Component` object to be rendered.
     * - Returns: A `UIView` instance representing the component and its entire
     *   child hierarchy, or `nil` if rendering fails (e.g., no renderer found).
     */
    @MainActor
    func buildViewTree(from component: Component, props: Config? = nil) -> UIView? {
        // 1. Check if this is a custom component defined in the scenario
        if let subcomponent = scenario.components[component.type] {
            logger.debug("Building custom component: \(component.type)", category: "ViewTreeBuilder")
            let parentProps = props ?? Config()
            logger.debug("Parent props keys: \(parentProps.getRawDictionary().keys.joined(separator: ", "))", category: "ViewTreeBuilder")
            logger.debug("Component.data keys: \(component.data.getRawDictionary().keys.joined(separator: ", "))", category: "ViewTreeBuilder")

            // Resolve prop references in component.data using parentProps
            let resolvedData = resolvePropsInData(component.data, using: parentProps)
            logger.debug("Resolved data keys: \(resolvedData.getRawDictionary().keys.joined(separator: ", "))", category: "ViewTreeBuilder")

            let combinedProps = resolvedData.merge(parentProps)
            logger.debug("Combined props keys: \(combinedProps.getRawDictionary().keys.joined(separator: ", "))", category: "ViewTreeBuilder")
            subcomponent.metadata["componentName"] = component.type
            return buildViewTree(from: subcomponent, props: combinedProps)
        }
        
        // 2. Find the renderer for the component's type from the registry.
        guard let renderer = registry.renderer(for: component.type) else {
            logger.warning(
                "Warning: No renderer found for type '\(component.type)'. Skipping.",
                category: "ViewTreeBuilder"
            )
            return nil
        }
        
        let props = props ?? Config()
        let context = RendererContext(
            viewController: viewController,
            navigationController: navigationController,
            window: window,
            scenario: scenario,
            props: props,
            store: nil,
            storeFactory: DIContainer.shared.storeFactory,
            logger: DIContainer.shared.currentLogger
        )
        
        // 3. Use the renderer to create the UIView. The renderer is responsible
        // for creating a view (e.g., RenderableView) that applies the component's styles.
        guard let view = renderer.render(component: component, context: context) else {
            logger.warning(
                "Warning: Renderer for type '\(component.type)' failed to create a view.",
                category: "ViewTreeBuilder"
            )
            return nil
        }
        
        view.yoga.isEnabled = true
        applyFlexboxLayout(to: view.flex, with: component)
        
        // 4. Recursively build the view tree for all children.
        // The `define` block provides a clean, declarative structure for adding child items.
        let children = component.getChildren()
        if !children.isEmpty {
            view.flex.define { (flex) in
                for childComponent in children {
                    // Recursively call the function to build the child's view.
                    if let childView = buildViewTree(from: childComponent, props: props) {
                        // Add the created child view to the current view's flex container.
                        childView.yoga.isEnabled = true
                        let childFlex = flex.addItem(childView)
                        applyFlexboxLayout(to: childFlex, with: childComponent)
                    }
                }
            }
        }
        
        // Apply the flex layout after setting all properties
        layout(flex: view.flex, component: component)
        
        // Layout setup completed
        // 5. Return the fully constructed view with its children attached.
        return view
    }
    
    @MainActor
    private func applyFlexboxLayout(to flex: Flex, with component: Component) {
        
        let style = component.style
        
        if component.type == "Row" {
            flex.direction(.row)
        } else if component.type == "Column" {
            flex.direction(.column)
        }
        
        switch style.justifyContent {
        case .center:
            flex.justifyContent(.center)
        case .flexEnd:
            flex.justifyContent(.end)
        case .flexStart:
            flex.justifyContent(.start)
        case .spaceAround:
            flex.justifyContent(.spaceAround)
        case .spaceBetween:
            flex.justifyContent(.spaceBetween)
        case .spaceEvenly:
            flex.justifyContent(.spaceEvenly)
        default:
            break
        }
        
        switch style.alignItems {
        case .center:
            flex.alignItems(.center)
        case .flexStart:
            flex.alignItems(.start)
        case .flexEnd:
            flex.alignItems(.end)
        case .stretch:
            flex.alignItems(.stretch)
        case .baseline:
            flex.alignItems(.baseline)
        default:
            break
        }
        
        switch style.alignSelf {
        case .auto:
            flex.alignSelf(.auto)
        case .center:
            flex.alignSelf(.center)
        case .flexStart:
            flex.alignSelf(.start)
        case .flexEnd:
            flex.alignSelf(.end)
        case .stretch:
            flex.alignSelf(.stretch)
        case .baseline:
            flex.alignSelf(.baseline)
        default:
            break
        }
        
        let padding = style.padding
        if padding.left > 0 {
            flex.paddingLeft(padding.left)
        }
        if padding.top > 0 {
            flex.paddingTop(padding.top)
        }
        if padding.right > 0 {
            flex.paddingRight(padding.right)
        }
        if padding.bottom > 0 {
            flex.paddingBottom(padding.bottom)
        }
        
        let margin = style.margin
        if margin.left > 0 {
            flex.marginLeft(margin.left)
        }
        if margin.top > 0 {
            flex.marginTop(margin.top)
        }
        if margin.right > 0 {
            flex.marginRight(margin.right)
        }
        if margin.bottom > 0 {
            flex.marginBottom(margin.bottom)
        }
        
        if let width = style.width {
            flex.width(width)
        }
        if let height = style.height {
            flex.height(height)
        }
        
        if let gap = style.gap {
            flex.gap(gap)
        }
        
        if let rowGap = style.rowGap {
            flex.rowGap(rowGap)
        }
        
        if let columnGap = style.columnGap {
            flex.columnGap(columnGap)
        }
        
        if let flexGrow = style.flexGrow {
            flex.grow(flexGrow)
        }
        
        if let flexShrink = style.flexShrink {
            flex.shrink(flexShrink)
        }
        
        switch style.flexMode {
        case .adjustWidth:
            flex.layout(mode: .adjustWidth)
        case .adjustHeight:
            flex.layout(mode: .adjustHeight)
        case .fitContainer:
            flex.layout(mode: .fitContainer)
        }
        
        layout(flex: flex, component: component)
    }
    
    @MainActor
    private func layout(flex: Flex, component: Component) {
        switch component.style.flexMode {
        case .adjustWidth:
            flex.layout(mode: .adjustWidth)
        case .adjustHeight:
            flex.layout(mode: .adjustHeight)
        case .fitContainer:
            flex.layout(mode: .fitContainer)
        }
    }

    /// Resolves prop references in component data using parent props
    private func resolvePropsInData(_ data: Config, using props: Config) -> Config {
        logger.debug("resolvePropsInData called", category: "ViewTreeBuilder")
        var resolvedDict: [String: Any] = [:]

        for (key, value) in data.getRawDictionary() {
            if let value = value {
                let resolved = resolveValue(value, using: props)
                resolvedDict[key] = resolved
                logger.debug("Resolved '\(key)': \(value) -> \(resolved)", category: "ViewTreeBuilder")
            }
        }

        return Config(resolvedDict)
    }

    /// Recursively resolves a value that might be a prop descriptor
    private func resolveValue(_ value: Any, using props: Config) -> Any {
        // Check if this is a prop descriptor: {type: "prop", key: "..."}
        if let dict = value as? [String: Any],
           let type = dict["type"] as? String,
           type == "prop",
           let key = dict["key"] as? String {

            logger.debug("Found prop descriptor with key: '\(key)'", category: "ViewTreeBuilder")

            // Resolve the prop reference
            var resolved: Any?
            if key.contains(".") {
                // Handle dot notation (e.g., "item.image")
                resolved = resolveDottedPath(key, in: props)
                logger.debug("Resolved dotted path '\(key)': \(resolved ?? "nil")", category: "ViewTreeBuilder")
            } else {
                // Simple key lookup
                resolved = props.get(forKey: key)
                logger.debug("Resolved simple key '\(key)': \(resolved ?? "nil")", category: "ViewTreeBuilder")
            }

            // Unwrap StoreValueDescriptor if needed
            if let resolvedValue = resolved,
               let valueDict = resolvedValue as? [String: Any],
               let _ = valueDict["type"] as? String,
               let actualValue = valueDict["value"] {
                logger.debug("Unwrapping StoreValueDescriptor for '\(key)', actual value: \(actualValue)", category: "ViewTreeBuilder")
                return actualValue
            }

            return resolved ?? value
        }

        // If it's a dictionary, recursively resolve its values
        if let dict = value as? [String: Any] {
            var resolvedDict: [String: Any] = [:]
            for (k, v) in dict {
                resolvedDict[k] = resolveValue(v, using: props)
            }
            return resolvedDict
        }

        // If it's an array, recursively resolve its elements
        if let array = value as? [Any] {
            return array.map { resolveValue($0, using: props) }
        }

        // Return the value as-is if it's not a descriptor
        return value
    }

    /// Resolves a dotted path like "item.image" from props
    private func resolveDottedPath(_ path: String, in props: Config) -> Any? {
        let components = path.split(separator: ".").map(String.init)
        guard !components.isEmpty else {
            logger.warning("Empty path in resolveDottedPath", category: "ViewTreeBuilder")
            return nil
        }

        logger.debug("Resolving dotted path: \(path), components: \(components)", category: "ViewTreeBuilder")

        // Start with the first component from props
        var currentValue: Any? = props.get(forKey: components[0])
        logger.debug("First component '\(components[0])' resolved to: \(currentValue ?? "nil")", category: "ViewTreeBuilder")

        // Navigate through remaining components
        for component in components.dropFirst() {
            if let dict = currentValue as? [String: Any] {
                currentValue = dict[component]
                logger.debug("Navigated to '\(component)': \(currentValue ?? "nil")", category: "ViewTreeBuilder")
            } else {
                logger.warning("Cannot navigate '\(component)' - current value is not a dictionary", category: "ViewTreeBuilder")
                return nil
            }
        }

        logger.debug("Final resolved value for '\(path)': \(currentValue ?? "nil")", category: "ViewTreeBuilder")
        return currentValue
    }
}
