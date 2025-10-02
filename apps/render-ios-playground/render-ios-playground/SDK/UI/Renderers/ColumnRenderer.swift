import UIKit
import FlexLayout

/// Renderer for the "column" component type.
/// A Column is a container that arranges its children in a vertical line.
class ColumnRenderer: Renderer {
    let type = "Column"

    func render(component: Component, context: RendererContext) -> UIView? {
        // A Column is a specialized RenderableView.
        let view = RenderableView(component: component, context: context)
        return view
    }
}
