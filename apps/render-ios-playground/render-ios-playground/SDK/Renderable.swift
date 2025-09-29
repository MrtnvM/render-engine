import UIKit
import FlexLayout

protocol Renderable {
    var component: Component { get }
    
    @MainActor func applyFlexStyles()
    func applyVisualStyles()
}

extension Renderable where Self: UIView {
    @MainActor
    func applyFlexStyles() {
        yoga.isEnabled = true
        
//        let style = component.style
//        
//        // Flex direction
//        var direction = style.direction
//        if component.type == "Row" {
//            direction = .row
//        } else if component.type == "Column" {
//            direction = .column
//        }
//        flex.direction(direction == .row ? .row : .column)
//        
//        // Justify content
//        switch style.contentAlignment {
//        case .center:
//            flex.justifyContent(.center)
//        case .flexEnd:
//            flex.justifyContent(.end)
//        case .flexStart:
//            flex.justifyContent(.start)
//        case .spaceAround:
//            flex.justifyContent(.spaceAround)
//        case .spaceBetween:
//            flex.justifyContent(.spaceBetween)
//        case .spaceEvenly:
//            flex.justifyContent(.spaceBetween)
//        }
//        
//        // Align items
//        switch style.alignItems {
//        case .center:
//            flex.alignItems(.center)
//        case .flexStart:
//            flex.alignItems(.start)
//        case .flexEnd:
//            flex.alignItems(.end)
//        case .stretch:
//            flex.alignItems(.stretch)
//        case .baseline:
//            flex.alignItems(.baseline)
//        }
//        
//        // Padding & Margin
//        flex.padding(style.padding)
//        flex.margin(style.margin)
//        
//        // Width & Height
//        if let width = style.width {
//            flex.width(width)
//        }
//        if let height = style.height {
//            flex.height(height)
//        }
//        
//        // Flex grow
//        if let flexValue = style.flex {
//            flex.grow(flexValue)
//        }
//        
//        if let flexGrow = style.flexGrow {
//            flex.gap(flexGrow)
//        }
//        
//        if let flexShrink = style.flexShrink {
//            flex.shrink(flexShrink)
//        }
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
