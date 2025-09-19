import UIKit

/// Renderer for UIView components
class UIViewRenderer: Renderer {
    var type: String {
        return "view"
    }
    
    func render(component: Component) -> UIView? {
        let view = UIView()
        
        // Apply styling
        applyStyle(to: view, from: component.style)
        view.translatesAutoresizingMaskIntoConstraints = false

        let x: CGFloat = component.style.x ?? 0
        let y: CGFloat = component.style.y ?? 0
        let width: CGFloat = component.style.width ?? 0
        let height: CGFloat = component.style.height ?? 0
        view.frame = CGRect(x: x, y: y, width: width, height: height)
        
        return view
    }
    
    private func applyStyle(to view: UIView, from style: ViewStyle) {
        // Background color
        if let backgroundColor = style.backgroundColor {
            view.backgroundColor = backgroundColor
        }
        
        // Corner radius
        if let cornerRadius = style.cornerRadius {
            view.layer.cornerRadius = cornerRadius
            view.layer.masksToBounds = cornerRadius > 0
        }
        
        // Border
        if let borderWidth = style.borderWidth {
            view.layer.borderWidth = borderWidth
        }
        
        if let borderColor = style.borderColor {
            view.layer.borderColor = borderColor.cgColor
        }
    }
}
