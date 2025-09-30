import UIKit

class ViewRenderer: Renderer {
    let type = "View"

    func render(component: Component, context: RendererContext) -> UIView? {
        let view = RenderableView(component: component, context: context)
        return view
    }
}

