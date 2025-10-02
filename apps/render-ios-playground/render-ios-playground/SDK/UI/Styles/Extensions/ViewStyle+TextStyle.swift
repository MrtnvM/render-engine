import UIKit

/// Extension for ViewStyle to handle TextStyle properties
extension ViewStyle {
    
    // MARK: - Text Color
    
    var textColor: UIColor? {
        return get(forKey: "color", ofType: UIColor.self)
    }
    
    // MARK: - Text Alignment
    
    var textAlign: NSTextAlignment? {
        return get(forKey: "textAlign", ofType: NSTextAlignment.self)
    }
    
    // MARK: - Letter Spacing
    
    var letterSpacing: CGFloat? {
        return get(forKey: "letterSpacing", ofType: CGFloat.self)
    }
    
    // MARK: - Line Height
    
    var lineHeight: CGFloat? {
        return get(forKey: "lineHeight", ofType: CGFloat.self)
    }
    
    // MARK: - Text Transform
    
    var textTransform: String? {
        return get(forKey: "textTransform", ofType: String.self)
    }
    
    func applyTextTransform(to text: String) -> String {
        guard let transform = textTransform else { return text }
        
        switch transform.lowercased() {
        case "uppercase":
            return text.uppercased()
        case "lowercase":
            return text.lowercased()
        case "capitalize":
            return text.capitalized
        default:
            return text
        }
    }
    
    // MARK: - Text Decoration
    
    var textDecorationLine: String? {
        return get(forKey: "textDecorationLine", ofType: String.self)
    }
    
    func applyTextDecoration(to attributes: inout [NSAttributedString.Key: Any]) {
        guard let decoration = textDecorationLine else { return }
        
        let decorations = decoration.split(separator: " ")
            .map { $0.trimmingCharacters(in: .whitespaces).lowercased() }
        
        if decorations.contains("underline") {
            attributes[.underlineStyle] = NSUnderlineStyle.single.rawValue
        }
        
        if decorations.contains("linethrough") || decorations.contains("line-through") {
            attributes[.strikethroughStyle] = NSUnderlineStyle.single.rawValue
        }
    }
    
    var textDecorationStyle: String? {
        return get(forKey: "iosTextDecorationStyle", ofType: String.self)
    }
    
    var textDecorationColor: UIColor? {
        return get(forKey: "iosTextDecorationColor", ofType: UIColor.self)
    }
    
    // MARK: - Text Shadow
    
    var textShadowColor: UIColor? {
        return get(forKey: "textShadowColor", ofType: UIColor.self)
    }
    
    var textShadowOffset: CGSize? {
        guard let offsetDict = get(forKey: "textShadowOffset", ofType: [String: Any].self) else {
            return nil
        }
        
        let width = (offsetDict["width"] as? CGFloat) ?? 0
        let height = (offsetDict["height"] as? CGFloat) ?? 0
        return CGSize(width: width, height: height)
    }
    
    var textShadowRadius: CGFloat? {
        return get(forKey: "textShadowRadius", ofType: CGFloat.self)
    }
    
    func createTextShadow() -> NSShadow? {
        let shadow = NSShadow()
        var hasShadow = false
        
        if let shadowColor = textShadowColor {
            shadow.shadowColor = shadowColor
            hasShadow = true
        }
        
        if let shadowOffset = textShadowOffset {
            shadow.shadowOffset = shadowOffset
            hasShadow = true
        }
        
        if let shadowRadius = textShadowRadius {
            shadow.shadowBlurRadius = shadowRadius
            hasShadow = true
        }
        
        return hasShadow ? shadow : nil
    }
    
    func applyTextShadow(to attributes: inout [NSAttributedString.Key: Any]) {
        if let shadow = createTextShadow() {
            attributes[.shadow] = shadow
        }
    }
    
    // MARK: - Create Attributed String
    
    /// Creates an attributed string with all text styling properties applied
    func createAttributedString(from text: String, baseFont: UIFont? = nil) -> NSAttributedString {
        var attributes: [NSAttributedString.Key: Any] = [:]
        
        // Apply text color
        if let color = textColor {
            attributes[.foregroundColor] = color
        }
        
        // Apply font
        if let font = self.font ?? baseFont {
            attributes[.font] = font
        }
        
        // Apply letter spacing
        if let spacing = letterSpacing {
            attributes[.kern] = spacing
        }
        
        // Apply text decoration
        applyTextDecoration(to: &attributes)
        
        // Apply text shadow
        applyTextShadow(to: &attributes)
        
        // Apply text transform
        let transformedText = applyTextTransform(to: text)
        
        return NSAttributedString(string: transformedText, attributes: attributes)
    }
    
    /// Check if any text styling requires an attributed string
    func requiresAttributedString() -> Bool {
        return letterSpacing != nil ||
               textDecorationLine != nil ||
               textShadowColor != nil ||
               textShadowRadius != nil
    }
}

