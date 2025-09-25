import UIKit
import FlexLayout

/// Renderer for the "row" component type.
/// A Row is a container that arranges its children in a horizontal line.
class RowRenderer: Renderer {
    let type = "Row"

    @MainActor func render(component: Component) -> UIView? {
        // A Row is a specialized RenderableView.
        let view = RenderableView(component: component)
        
        // The defining characteristic of a Row is its horizontal direction.
        // We enforce this here, overriding any direction that might be in the style
        // to ensure a "row" component always behaves as a row.
        view.flex.direction(.row)
        
        return view
    }
}
