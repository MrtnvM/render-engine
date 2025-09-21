import UIKit

// Base class that handles all Yoga and visual style application
class RenderableView: UIView {
    let component: Component

    init(component: Component) {
        self.component = component
        super.init(frame: .zero)
        
        self.yoga.isEnabled = true
        
        applyYogaStyles()
        applyVisualStyles()
    }

    required init?(coder: NSCoder) {
        fatalError("init not implemented")
    }

    private func applyYogaStyles() {
        guard let style = component.style else { return }

        // Translate style properties into Yoga properties
        if let direction = style.direction {
            self.yoga.flexDirection = (direction == .row) ? .row : .column
        }
        if let justifyContent = style.contentAlignment {
            self.yoga.justifyContent = justifyContent
        }
        if let alignItems = style.alignItems {
            // ... map "stretch" to .stretch etc.
        }
        if let padding = style.padding {
            self.yoga.padding = YGValue(padding)
        }
        if let margin = style.margin {
            self.yoga.margin = YGValue(margin)
        }
        if let width = style.width {
            self.yoga.width = YGValue(width)
        }
        if let height = style.height {
            self.yoga.height = YGValue(height)
        }
    }

    private func applyVisualStyles() {
        guard let style = component.style else { return }

        if let bgColor = style.backgroundColor {
            self.backgroundColor = bgColor
        }
        if let cornerRadius = style.cornerRadius {
            self.layer.cornerRadius = cornerRadius
        }
        if let borderWidth = style.borderWidth {
            self.layer.borderWidth = borderWidth
        }
        if let borderColor = style.borderColor {
            self.layer.borderColor = borderColor.cgColor
        }
    }
}
