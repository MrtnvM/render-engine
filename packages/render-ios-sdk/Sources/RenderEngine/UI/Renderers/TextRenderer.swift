import UIKit

class TextRenderer: Renderer {
    let type = "Text"
    
    func render(component: Component, context: RendererContext) -> UIView? {
        return RenderableText(component: component, context: context)
    }
}

class RenderableText: UILabel, @MainActor Renderable {
    let component: Component
    let context: RendererContext
    
    init(component: Component, context: RendererContext) {
        self.component = component
        self.context = context
        super.init(frame: .zero)
        yoga.isEnabled = true
        
        applyVisualStyles()
        applyFlexStyles()
        setupLabel()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupLabel() {
        self.text = get(key: "text", type: String.self)
        self.font = get(key: "font", type: UIFont.self)
        self.textColor = get(key: "color", type: UIColor.self)
        self.textAlignment = get(key: "textAlignment", type: NSTextAlignment.self) ?? .natural
        self.numberOfLines = get(key: "numberOfLines", type: Int.self) ?? 0
    }
}
