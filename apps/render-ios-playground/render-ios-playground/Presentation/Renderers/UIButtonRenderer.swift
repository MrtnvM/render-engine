import UIKit

class UIButtonRenderer: Renderer {
    let type = "button"
    
    func render(component: Component) -> UIView? {
        return RenderUIButton(component: component)
    }
}

class RenderUIButton: UIButton {
    private let component: Component
    
    init(component: Component) {
        self.component = component
        super.init(frame: .zero)
        setupButton()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        applyFrameLayout()
    }
    
    private func setupButton() {
        applyStyle()
    }
    
    private func applyFrameLayout() {
        let style = component.style
        
        // Calculate frame based on component style
        var newFrame = self.frame
        
        // Set position
        if let x = style.x {
            newFrame.origin.x = x
        }
        
        if let y = style.y {
            newFrame.origin.y = y
        }
        
        // Set size
        if let width = style.width, width > 0 {
            newFrame.size.width = width
        }
        
        if let height = style.height, height > 0 {
            newFrame.size.height = height
        }
        
        self.frame = newFrame
    }
    
    private func applyStyle() {
        let style = component.style
        
        // Background color
        if let backgroundColor = style.backgroundColor {
            self.backgroundColor = backgroundColor
        }
        
        // Corner radius
        if let cornerRadius = style.cornerRadius {
            self.layer.cornerRadius = cornerRadius
            self.layer.masksToBounds = cornerRadius > 0
        }
        
        // Border
        if let borderWidth = style.borderWidth {
            self.layer.borderWidth = borderWidth
        }
        
        if let borderColor = style.borderColor {
            self.layer.borderColor = borderColor.cgColor
        }
        
        // Title color
        if let titleColor = style.get(forKey: "titleColor", ofType: UIColor.self) {
            self.setTitleColor(titleColor, for: .normal)
        }
        
        // Font size
        if let fontSize = style.get(forKey: "fontSize", ofType: CGFloat.self) {
            self.titleLabel?.font = UIFont.systemFont(ofSize: fontSize)
        }
        
        // Button title
        if let title = style.get(forKey: "title", ofType: String.self) {
            self.setTitle(title, for: .normal)
        }
        
        // Button type (if specified)
        if let buttonTypeString = style.get(forKey: "buttonType", ofType: String.self) {
            // Note: UIButtonType cannot be changed after initialization
            // This is for documentation purposes only
            print("Button type specified: \(buttonTypeString) - using system type")
        }
    }
}
