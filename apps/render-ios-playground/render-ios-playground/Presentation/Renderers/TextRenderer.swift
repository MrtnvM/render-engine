import UIKit

class TextRenderer: Renderer {
    let type = "Text"
    
    func render(component: Component) -> UIView? {
        return RenderableText(component: component)
    }
}

class RenderableText: UILabel, Renderable {
    let component: Component
    
    init(component: Component) {
        self.component = component
        super.init(frame: .zero)
        applyStyle()
        applyFlexStyles()
        setupLabel()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupLabel() {
        let text = component.properties.getString(forKey: "text") ?? ""
        self.text = text
    }
    
    
    private func applyStyle() {
        let style = component.style
        
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
