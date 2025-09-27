import UIKit
import FlexLayout

/// Renderer for the "row" component type.
/// A Row is a container that arranges its children in a horizontal line.
class RowRenderer: Renderer {
    let type = "Row"

    @MainActor func render(component: Component, context: RendererContext) -> UIView? {
        // A Row is a specialized RenderableView.
        let view = RenderableView(component: component)
        return view
    }
}
