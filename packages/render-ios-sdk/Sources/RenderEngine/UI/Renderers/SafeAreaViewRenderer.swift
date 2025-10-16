import UIKit
import FlexLayout

/// Renderer for the "SafeAreaView" component type.
/// SafeAreaView applies safe area insets as padding to specified edges.
class SafeAreaViewRenderer: Renderer {
    let type = "SafeAreaView"

    func render(component: Component, context: RendererContext) -> UIView? {
        let view = SafeAreaContainerView(component: component, context: context)
        return view
    }
}

/// Container view that applies safe area insets as padding
class SafeAreaContainerView: RenderableView {
    private var appliedEdges: Set<String> = []

    override init(component: Component, context: RendererContext) {
        super.init(component: component, context: context)

        // Parse edges from properties
        // If no edges specified, apply all edges
        if let edgesArray = component.properties.getArray(forKey: "edges") as? [String], !edgesArray.isEmpty {
            appliedEdges = Set(edgesArray)
        } else {
            // Default: apply all edges
            appliedEdges = Set(["top", "bottom", "left", "right"])
        }
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func safeAreaInsetsDidChange() {
        super.safeAreaInsetsDidChange()
        applySafeAreaPadding()
        setNeedsLayout()
    }

    override func didMoveToWindow() {
        super.didMoveToWindow()
        if window != nil {
            applySafeAreaPadding()
        }
    }

    private func applySafeAreaPadding() {
        let insets = safeAreaInsets

        let topPadding = appliedEdges.contains("top") ? insets.top : 0
        let bottomPadding = appliedEdges.contains("bottom") ? insets.bottom : 0
        let leftPadding = appliedEdges.contains("left") ? insets.left : 0
        let rightPadding = appliedEdges.contains("right") ? insets.right : 0

        flex.paddingTop(topPadding)
        flex.paddingBottom(bottomPadding)
        flex.paddingLeft(leftPadding)
        flex.paddingRight(rightPadding)
    }
}
