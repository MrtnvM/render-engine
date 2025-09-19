import UIKit

/// Renderer for UIButton components
class UIButtonRenderer: Renderer {
    var type: String {
        return "button"
    }
    
    func render(component: Component) -> UIView? {
        let button = UIButton(type: .system)
        
        // Apply styling
        applyStyle(to: button, from: component.style)
        button.translatesAutoresizingMaskIntoConstraints = false

        let x: CGFloat = component.style.x ?? 0
        let y: CGFloat = component.style.y ?? 0
        let width: CGFloat = component.style.width ?? 0
        let height: CGFloat = component.style.height ?? 0
        button.frame = CGRect(x: x, y: y, width: width, height: height)
        
        return button
    }
    
    private func applyStyle(to button: UIButton, from style: ViewStyle) {
        // Background color
        if let backgroundColor = style.backgroundColor {
            button.backgroundColor = backgroundColor
        }
        
        // Corner radius
        if let cornerRadius = style.cornerRadius {
            button.layer.cornerRadius = cornerRadius
            button.layer.masksToBounds = cornerRadius > 0
        }
        
        // Border
        if let borderWidth = style.borderWidth {
            button.layer.borderWidth = borderWidth
        }
        
        if let borderColor = style.borderColor {
            button.layer.borderColor = borderColor.cgColor
        }
        
        // Title color
        if let titleColor = style.get(forKey: "titleColor", ofType: UIColor.self) {
            button.setTitleColor(titleColor, for: .normal)
        }
        
        // Font size
        if let fontSize = style.get(forKey: "fontSize", ofType: CGFloat.self) {
            button.titleLabel?.font = UIFont.systemFont(ofSize: fontSize)
        }
        
        // Button title
        if let title = style.get(forKey: "title", ofType: String.self) {
            button.setTitle(title, for: .normal)
        }
        
        // Button type (if specified)
        if let buttonTypeString = style.get(forKey: "buttonType", ofType: String.self) {
            // Note: UIButtonType cannot be changed after initialization
            // This is for documentation purposes only
            print("Button type specified: \(buttonTypeString) - using system type")
        }
    }
}
