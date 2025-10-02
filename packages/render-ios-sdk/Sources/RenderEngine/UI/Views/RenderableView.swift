import UIKit

class RenderableView: UIView, @MainActor Renderable {
    let component: Component
    let context: RendererContext

    init(component: Component, context: RendererContext) {
        self.component = component
        self.context = context
        super.init(frame: .zero)
        yoga.isEnabled = true
        applyVisualStyles()
    }

    required init?(coder: NSCoder) {
        fatalError("init not implemented")
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        // Apply flex layout when the view's bounds change
        // TODO: Check if it is needed
        flex.layout()
    }
}
