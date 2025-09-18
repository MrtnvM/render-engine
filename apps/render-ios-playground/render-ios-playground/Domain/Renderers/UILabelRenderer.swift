import UIKit

/// Renderer for UILabel components
class UILabelRenderer: Renderer {
    var type: String {
        return "label"
    }
    
    func render(component: Component) -> UIView? {
        let label = UILabel()
        
        applyStyle(to: label, from: component.style)
        label.translatesAutoresizingMaskIntoConstraints = false

        let x: CGFloat = component.style.x ?? 0
        let y: CGFloat = component.style.y ?? 0
        let width: CGFloat = component.style.width ?? 0
        let height: CGFloat = component.style.height ?? 0
        label.frame = CGRect(x: x, y: y, width: width, height: height)
        
        return label
    }
    
    private func applyStyle(to label: UILabel, from style: ViewStyle) {
        // Background color
        if let backgroundColor = style.backgroundColor {
            label.backgroundColor = backgroundColor
        }
        
        // Corner radius
        if let cornerRadius = style.cornerRadius {
            label.layer.cornerRadius = cornerRadius
            label.layer.masksToBounds = cornerRadius > 0
        }
        
        // Border
        if let borderWidth = style.borderWidth {
            label.layer.borderWidth = borderWidth
        }
        
        if let borderColor = style.borderColor {
            label.layer.borderColor = borderColor.cgColor
        }
        
        // Text color
        if let textColor = style.get(forKey: "textColor", ofType: UIColor.self) {
            label.textColor = textColor
        }
        
        // Font size
        if let fontSize = style.get(forKey: "fontSize", ofType: CGFloat.self) {
            label.font = UIFont.systemFont(ofSize: fontSize)
        }
        
        // Text alignment
        if let textAlignmentString = style.get(forKey: "textAlignment", ofType: String.self) {
            label.textAlignment = parseTextAlignment(from: textAlignmentString)
        }
        
        // Text content
        if let text = style.get(forKey: "text", ofType: String.self) {
            label.text = text
        }
        
        // Number of lines
        if let numberOfLines = style.get(forKey: "numberOfLines", ofType: Int.self) {
            label.numberOfLines = numberOfLines
        }
    }
    
    private func parseTextAlignment(from string: String) -> NSTextAlignment {
        switch string.lowercased() {
        case "left":
            return .left
        case "center":
            return .center
        case "right":
            return .right
        case "justified":
            return .justified
        case "natural":
            return .natural
        default:
            return .left
        }
    }
}
