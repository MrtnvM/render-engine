import UIKit

class ViewRenderer: Renderer {
    let type = "view"

    func render(component: Component) -> UIView? {
        let view = RenderableView(component: component)
        return view
    }
}

