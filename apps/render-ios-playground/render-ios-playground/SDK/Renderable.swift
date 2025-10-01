import UIKit
import FlexLayout

protocol Renderable {
    var component: Component { get }
    var context: RendererContext { get }
    
    @MainActor func applyFlexStyles()
    func applyVisualStyles()
}

extension Renderable where Self: UIView {
    var style: ViewStyle {
        return component.style
    }
    
    var valueProvider: ValueProvider {
        DIContainer.shared.valueProvider
    }
    
    func get<T>(key: String, type: T.Type) -> T? {
        return valueProvider.resolve(
            ValueContext(
                key: key,
                type: type,
                component: component,
                props: context.props
            )
        )
    }
    
    @MainActor
    func applyFlexStyles() {
        yoga.isEnabled = true
    }

    func applyVisualStyles() {
        backgroundColor = style.backgroundColor
        layer.cornerRadius = style.cornerRadius
        layer.borderWidth = style.borderWidth
        layer.borderColor = style.borderColor.cgColor
        
        if let shadowColor = style.shadowColor {
            layer.shadowColor = shadowColor.cgColor
        }
        
        if let shadowOffset = style.shadowOffset {
            layer.shadowOffset = shadowOffset
        }
        
        if let shadowOpacity = style.shadowOpacity {
            layer.shadowOpacity = Float(shadowOpacity)
        }
        
        if let shadowRadius = style.shadowRadius {
            layer.shadowRadius = shadowRadius
        }
        
        layer.masksToBounds = false
        
        if style.cornerRadius > 0 {
            layer.shadowPath = UIBezierPath(
                roundedRect: bounds,
                cornerRadius: style.cornerRadius
            ).cgPath
        }
    }
}
