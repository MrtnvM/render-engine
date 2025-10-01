import UIKit
import FlexLayout

protocol Renderable {
    var component: Component { get }
    var context: RendererContext { get }
    
    @MainActor func applyFlexStyles()
    func applyVisualStyles()
}

extension Renderable where Self: UIView {
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
        
        return
        
        let style = component.style
        
        // Flex direction - Row and Column components override style direction
        if component.type == "Row" {
            flex.direction(.row)
        } else if component.type == "Column" {
            flex.direction(.column)
        } else {
            flex.direction(style.direction == .row ? .row : .column)
        }
        
        // Justify content
        switch style.justifyContent {
        case .center:
            flex.justifyContent(.center)
        case .flexEnd:
            flex.justifyContent(.end)
        case .flexStart:
            flex.justifyContent(.start)
        case .spaceAround:
            flex.justifyContent(.spaceAround)
        case .spaceBetween:
            flex.justifyContent(.spaceBetween)
        case .spaceEvenly:
            flex.justifyContent(.spaceEvenly)
        default:
            break
        }
        
        // Align items
        switch style.alignItems {
        case .center:
            flex.alignItems(.center)
        case .flexStart:
            flex.alignItems(.start)
        case .flexEnd:
            flex.alignItems(.end)
        case .stretch:
            flex.alignItems(.stretch)
        case .baseline:
            flex.alignItems(.baseline)
        default:
            break
        }
        
        switch style.alignSelf {
        case .auto:
            flex.alignSelf(.auto)
        case .center:
            flex.alignItems(.center)
        case .flexStart:
            flex.alignItems(.start)
        case .flexEnd:
            flex.alignItems(.end)
        case .stretch:
            flex.alignItems(.stretch)
        case .baseline:
            flex.alignItems(.baseline)
        default:
            break
        }
        
        // Padding & Margin
        flex.padding(style.padding)
        flex.margin(style.margin)
        
        // Width & Height
        if let width = style.width {
            flex.width(width)
        }
        if let height = style.height {
            flex.height(height)
        }
        
        // Flex grow
        if let flexValue = style.flex {
            flex.grow(flexValue)
        }
        
        if let flexGrow = style.flexGrow {
            flex.grow(flexGrow)
        }
        
        if let flexShrink = style.flexShrink {
            flex.shrink(flexShrink)
        }
    }

    func applyVisualStyles() {
        let style = component.style
        
        backgroundColor = style.backgroundColor
        layer.cornerRadius = style.cornerRadius
        layer.masksToBounds = style.cornerRadius > 0
        layer.borderWidth = style.borderWidth
        layer.borderColor = style.borderColor.cgColor
    }
}
