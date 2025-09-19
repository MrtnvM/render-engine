import UIKit

class UIViewRenderer: Renderer {
    let type = "view"
    
    func render(component: Component) -> UIView? {
        return RenderUIView(component: component)
    }
}

class RenderUIView: UIView {
    private let component: Component
    
    init(component: Component) {
        self.component = component
        super.init(frame: .zero)
        setupView()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        applyFrameLayout()
    }
    
    private func setupView() {
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
    }
}


