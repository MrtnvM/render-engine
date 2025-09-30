import UIKit

class RenderableView: UIView, Renderable {
    let component: Component
    let context: RendererContext

    init(component: Component, context: RendererContext) {
        self.component = component
        self.context = context
        super.init(frame: .zero)
        
        applyFlexStyles()
        applyVisualStyles()
    }

    required init?(coder: NSCoder) {
        fatalError("init not implemented")
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        flex.layout()
    }
}
