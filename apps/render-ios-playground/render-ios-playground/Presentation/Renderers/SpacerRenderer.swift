import UIKit

/// Renderer for the "spacer" component type.
/// A Spacer creates flexible space between components, similar to a UIView with flex: 1.
///
/// The Spacer uses FlexLayout to create flexible space that can grow and shrink
/// based on available space while respecting minimum size constraints.
class SpacerRenderer: Renderer {
    let type = "Spacer"

    func render(component: Component, context: RendererContext) -> UIView? {
        let spacerView = RenderableView(component: component)

        // Configure flex properties for flexible space
        spacerView.flex.grow(1)  // Allow the spacer to grow and fill available space
        spacerView.flex.shrink(0)  // Prevent shrinking below natural size

        // Set minimum size constraints if specified
        if let size = component.properties.getCGFloat(forKey: "size") {
            // Set both minimum width and height to the same value
            spacerView.flex.minWidth(size).minHeight(size)
        }

        if let minSize = component.properties.getCGFloat(forKey: "minSize") {
            // Set both minimum width and height to the specified minimum size
            spacerView.flex.minWidth(minSize).minHeight(minSize)
        }

        return spacerView
    }
}
