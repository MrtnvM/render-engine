import UIKit

/// Renderer for the "stack" component type.
/// A Stack is a container that layers its children on top of each other.
///
/// This is achieved by having the children use absolute positioning (`position: .absolute`)
/// relative to the Stack container. The Stack itself is a simple container view
/// that establishes the positioning context for its children.
class StackRenderer: Renderer {
    let type = "stack"

    func render(component: Component) -> UIView? {
        // The Stack component is a standard RenderableView that acts as a
        // containing block for its children.
        let view = RenderableView(component: component)
        return view
    }
}
