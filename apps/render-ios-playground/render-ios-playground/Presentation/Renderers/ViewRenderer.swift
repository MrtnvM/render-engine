import UIKit

class ViewRenderer: Renderer {
    let type = "View"

    func render(component: Component) -> UIView? {
        let view = RenderableView(component: component)
        return view
    }
}

