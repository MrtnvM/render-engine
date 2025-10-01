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
        
        // Get title from properties
        let titleText = component.properties.getString(forKey: "title") ?? ""
        setTitle(titleText, for: .normal)
        
        // Apply title styling
        applyTitleStyle()
        
        // Setup button image if provided
        setupImageContent()
    }
    
    private func applyTitleStyle() {
        // Check if titleStyle exists in properties
        if let titleStyleDict = component.properties.getDictionary(forKey: "titleStyle") {
            let titleStyle = ViewStyle(Config(titleStyleDict))
            
            // Apply basic title color and font
            if let color = titleStyle.textColor {
                setTitleColor(color, for: .normal)
            }
            
            if let font = titleStyle.font {
                titleLabel?.font = font
            }
            
            if let alignment = titleStyle.textAlign {
                titleLabel?.textAlignment = alignment
            }
            
            // Apply text transform to the title
            if let textTransform = titleStyle.textTransform, let currentTitle = title(for: .normal) {
                let transformedTitle = titleStyle.applyTextTransform(to: currentTitle)
                setTitle(transformedTitle, for: .normal)
            }
            
            // Check if we need attributed string for advanced styling
            if titleStyle.requiresAttributedString(), let currentTitle = title(for: .normal) {
                let attributedString = titleStyle.createAttributedString(from: currentTitle, baseFont: titleLabel?.font)
                setAttributedTitle(attributedString, for: .normal)
            }
        } else {
            // Fallback: Try legacy dot notation approach for individual properties
            if let color = get(key: "titleStyle.color", type: UIColor.self) {
                setTitleColor(color, for: .normal)
            } else if let legacyColor = component.style.get(forKey: "titleColor", ofType: UIColor.self) {
                // Legacy support: titleColor directly in style
                setTitleColor(legacyColor, for: .normal)
            }
            
            if let fontSize = get(key: "titleStyle.fontSize", type: CGFloat.self),
               let fontWeight = get(key: "titleStyle.fontWeight", type: String.self) {
                let font = createFont(size: fontSize, weight: fontWeight)
                titleLabel?.font = font
            } else if let legacyFont = component.style.get(forKey: "font", ofType: UIFont.self) {
                // Legacy support: font directly in style
                titleLabel?.font = legacyFont
            }
        }
    }
    
    private func createFont(size: CGFloat, weight: String) -> UIFont {
        var fontWeight: UIFont.Weight = .regular
        
        switch weight {
        case "100": fontWeight = .ultraLight
        case "200": fontWeight = .thin
        case "300": fontWeight = .light
        case "400", "normal": fontWeight = .regular
        case "500": fontWeight = .medium
        case "600": fontWeight = .semibold
        case "700", "bold": fontWeight = .bold
        case "800": fontWeight = .heavy
        case "900": fontWeight = .black
        default: fontWeight = .regular
        }
        
        return UIFont.systemFont(ofSize: size, weight: fontWeight)
    }
    
    private func setupImageContent() {
        let imageSource = component.properties.getString(forKey: "image")
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
