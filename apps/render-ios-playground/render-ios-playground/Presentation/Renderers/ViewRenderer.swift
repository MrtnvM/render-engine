import UIKit

class ViewRenderer: Renderer {
    let type = "view"

    func render(component: Component) -> UIView? {
        // Use a base class for common style application
        let view = RenderableView(component: component)
        return view
    }
}

