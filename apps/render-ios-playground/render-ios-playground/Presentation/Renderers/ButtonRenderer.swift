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
    
    private let imageLoader = DIContainer.shared.imageLoader
    
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
        applyFlexStyles()
        
        let titleColor = get(key: "titleColor", type: UIColor.self) ?? .tintColor
        setTitleColor(titleColor, for: .normal)
        
        let title = get(key: "title", type: String.self) ?? ""
        setTitle(title, for: .normal)
        
        let font = get(key: "font", type: UIFont.self)
        titleLabel?.font = font
        
        setupImageContent()
    }
    
    private func setupImageContent() {
        let imageSource = get(key: "image", type: String.self)
        guard let imageSource = imageSource else {
            return
        }

        // Get optional placeholder
        let placeholder = component.properties.getString(forKey: "placeholder")
        
        imageLoader.loadImage(from: imageSource, placeholder: placeholder) { [weak self] image in
            self?.setImage(image, for: .normal)
        }
    }
}
