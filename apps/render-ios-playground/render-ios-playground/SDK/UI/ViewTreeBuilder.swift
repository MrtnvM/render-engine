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
            let parentProps = props ?? Config()
            let combinedProps = component.data.merge(parentProps)
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
}
