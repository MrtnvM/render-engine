import UIKit

class ButtonRenderer: Renderer {
    let type = "Button"
    
    func render(component: Component, context: RendererContext) -> UIView? {
        return RenderableButton(component: component, context: context)
    }
}

class RenderableButton: UIButton, Renderable {
    let component: Component
    let context: RendererContext
    
    
    init(component: Component, context: RendererContext) {
        self.component = component
        self.context = context
        super.init(frame: .zero)
        yoga.isEnabled = true
        setupButton()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupButton() {
        applyVisualStyles()
        
        let titleColor = get(key: "titleColor", type: UIColor.self) ?? .tintColor
        setTitleColor(titleColor, for: .normal)
        
        let title = get(key: "title", type: String.self) ?? ""
        setTitle(title, for: .normal)
        
        let font = get(key: "font", type: UIFont.self)
        titleLabel?.font = font
    }
}
