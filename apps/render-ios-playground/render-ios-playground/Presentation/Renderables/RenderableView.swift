import UIKit

class RenderableView: UIView, Renderable {
    let component: Component

    init(component: Component) {
        self.component = component
        super.init(frame: .zero)
        
        applyFlexStyles()
        applyVisualStyles()
    }

    required init?(coder: NSCoder) {
        fatalError("init not implemented")
    }
}
