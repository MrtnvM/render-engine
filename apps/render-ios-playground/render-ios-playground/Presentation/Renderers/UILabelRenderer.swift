import UIKit

class UILabelRenderer: Renderer {
    let type = "label"
    
    func render(component: Component) -> UIView? {
        return RenderUILabel(component: component)
    }
}

class RenderUILabel: UILabel {
    private let component: Component
    
    init(component: Component) {
        self.component = component
        super.init(frame: .zero)
        setupLabel()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        applyFrameLayout()
    }
    
    private func setupLabel() {
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
        self.backgroundColor = backgroundColor
       
        // Corner radius
        self.layer.cornerRadius = style.cornerRadius
        self.layer.masksToBounds = style.cornerRadius > 0
        
        // Border
        self.layer.borderWidth = style.borderWidth
        self.layer.borderColor = style.borderColor.cgColor
        
        // Text color
        if let textColor = style.get(forKey: "textColor", ofType: UIColor.self) {
            self.textColor = textColor
        }
        
        // Font size
        if let fontSize = style.get(forKey: "fontSize", ofType: CGFloat.self) {
            self.font = UIFont.systemFont(ofSize: fontSize)
        }
        
        // Text alignment
        if let textAlignmentString = style.get(forKey: "textAlignment", ofType: String.self) {
            self.textAlignment = parseTextAlignment(from: textAlignmentString)
        }
        
        // Text content
        if let text = style.get(forKey: "text", ofType: String.self) {
            self.text = text
        }
        
        // Number of lines
        if let numberOfLines = style.get(forKey: "numberOfLines", ofType: Int.self) {
            self.numberOfLines = numberOfLines
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
