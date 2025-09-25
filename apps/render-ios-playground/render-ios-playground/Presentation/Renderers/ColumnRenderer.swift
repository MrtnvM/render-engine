import UIKit
import FlexLayout

/// Renderer for the "column" component type.
/// A Column is a container that arranges its children in a vertical line.
class ColumnRenderer: Renderer {
    let type = "Column"

    func render(component: Component) -> UIView? {
        // A Column is a specialized RenderableView.
        let view = RenderableView(component: component)
        
        // The defining characteristic of a Column is its vertical direction.
        // We enforce this here to ensure a "column" component always behaves as a column.
        view.flex.direction(.column)
        
        return view
    }
}
