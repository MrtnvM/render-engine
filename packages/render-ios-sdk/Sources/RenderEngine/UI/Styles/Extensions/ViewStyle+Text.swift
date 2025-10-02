import UIKit

enum TextAlignment: ViewStyleEnum {
    case left
    case center
    case right
    case justified
    case natural

    static let defaultValue: TextAlignment = .left

    static func from(string: String) -> TextAlignment? {
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
            return nil
        }
    }
    
    var nsTextAlignment: NSTextAlignment {
        switch self {
        case .left:
            return .left
        case .center:
            return .center
        case .right:
            return .right
        case .justified:
            return .justified
        case .natural:
            return .natural
        }
    }
}

extension ViewStyle {
    var font: UIFont? {
        return get(forKey: "font", ofType: UIFont.self)
    }
    
    var fontFamily: String? {
        return get(forKey: "fontFamily", ofType: String.self)
    }
    
    var fontSize: CGFloat {
        return get(forKey: "fontSize", ofType: CGFloat.self) ?? 12
    }
    
    var fontWeight: String {
        return get(forKey: "fontWeight", ofType: String.self) ?? "regular"
    }
    
    var textAlignment: TextAlignment {
        return get(forKey: "textAlignment", ofType: TextAlignment.self) ?? TextAlignment.defaultValue
    }
    
    func parseFont(from config: Config) -> UIFont? {
        let size: CGFloat = config.getCGFloat(forKey: "fontSize") ?? 12
        let familyName = config.getString(forKey: "fontFamily")
        let weightValue = config.getString(forKey: "fontWeight") ?? "regular"
        var weight: UIFont.Weight = .regular
        
        switch weightValue {
        case "normal", "400":
            weight = .regular
        case "bold", "700":
            weight = .bold
        case "100":
            weight = .ultraLight
        case "200":
            weight = .thin
        case "300":
            weight = .light
        case "500":
            weight = .medium
        case "600":
            weight = .semibold
        case "800":
            weight = .heavy
        case "900":
            weight = .black
        case "ultralight":
            weight = .ultraLight
        case "thin":
            weight = .thin
        case "light":
            weight = .light
        case "medium":
            weight = .medium
        case "regular":
            weight = .regular
        case "semibold":
            weight = .semibold
        case "condensedBold":
            weight = .bold
        case "condensed":
            weight = .regular
        case "heavy":
            weight = .heavy
        case "black":
            weight = .black
        default:
            weight = .regular
        }
        
        // Create font with family name if specified, otherwise use system font
        if let familyName = familyName, !familyName.isEmpty && familyName.lowercased() != "system" {
            // Try to create font with specific family name
            if let customFont = createFontWithFamily(familyName, size: size, weight: weight) {
                return customFont
            } else {
                // Fallback to system font with weight if family not found
                return UIFont.systemFont(ofSize: size, weight: weight)
            }
        } else {
            // Use system font with weight
            return UIFont.systemFont(ofSize: size, weight: weight)
        }
    }
    
    private func createFontWithFamily(_ familyName: String, size: CGFloat, weight: UIFont.Weight) -> UIFont? {
        let lowercasedFamily = familyName.lowercased()
        
        // Map common font family names to system font descriptors
        switch lowercasedFamily {
        case "helvetica", "helvetica-neue":
            return createFontWithWeight(familyName: "HelveticaNeue", size: size, weight: weight)
        case "arial":
            return createFontWithWeight(familyName: "Arial", size: size, weight: weight)
        case "times", "times-roman", "times new roman":
            return createFontWithWeight(familyName: "TimesNewRomanPSMT", size: size, weight: weight)
        case "courier", "courier new":
            return createFontWithWeight(familyName: "CourierNewPSMT", size: size, weight: weight)
        case "georgia":
            return createFontWithWeight(familyName: "Georgia", size: size, weight: weight)
        case "verdana":
            return createFontWithWeight(familyName: "Verdana", size: size, weight: weight)
        case "trebuchet":
            return createFontWithWeight(familyName: "TrebuchetMS", size: size, weight: weight)
        case "palatino":
            return createFontWithWeight(familyName: "Palatino-Roman", size: size, weight: weight)
        case "menlo":
            return createFontWithWeight(familyName: "Menlo-Regular", size: size, weight: weight)
        case "monaco":
            return createFontWithWeight(familyName: "Monaco", size: size, weight: weight)
        case "system", "system-ui":
            return UIFont.systemFont(ofSize: size, weight: weight)
        case "manrope", "manrope_cut", "manrope cut":
            // Special handling for Manrope font family
            return createManropeFont(size: size, weight: weight)
        default:
            // Try to find the font by exact name first with weight
            if let exactFont = createFontWithWeight(familyName: familyName, size: size, weight: weight) {
                return exactFont
            }
            
            // Try to find fonts that contain the family name
            let fontFamilyNames = UIFont.familyNames
            for fontFamily in fontFamilyNames {
                if fontFamily.lowercased().contains(lowercasedFamily) {
                    if let fontWithWeight = createFontWithWeight(familyName: fontFamily, size: size, weight: weight) {
                        return fontWithWeight
                    }
                }
            }
            
            // Try to create a font descriptor with the family name and weight
            let descriptor = UIFontDescriptor(name: familyName, size: size)
            let weightedDescriptor = descriptor.addingAttributes([
                .traits: [UIFontDescriptor.TraitKey.weight: weight]
            ])
            return UIFont(descriptor: weightedDescriptor, size: size)
        }
    }
    
    private func createManropeFont(size: CGFloat, weight: UIFont.Weight) -> UIFont? {
        // Map weights to Manrope font variants
        var fontName: String
        
        switch weight {
        case .heavy, .black:
            // Use ExtraBold for heavy and black weights (800, 900)
            fontName = "Manrope_Cut_008-ExtraBold"
        default:
            // Use Medium for all other weights as fallback
            fontName = "Manrope_Cut_008-Medium"
        }
        
        if let font = UIFont(name: fontName, size: size) {
            return font
        }
        
        // Fallback: Try with underscores replaced by hyphens or vice versa
        let alternateName = fontName.replacingOccurrences(of: "_", with: "-")
        if let font = UIFont(name: alternateName, size: size) {
            return font
        }
        
        // Final fallback: search for any font containing "Manrope"
        for fontFamily in UIFont.familyNames {
            let fontNames = UIFont.fontNames(forFamilyName: fontFamily)
            for name in fontNames where name.lowercased().contains("manrope") {
                if weight == .heavy || weight == .black {
                    if name.lowercased().contains("extrabold") || name.lowercased().contains("extra-bold") {
                        return UIFont(name: name, size: size)
                    }
                } else {
                    if name.lowercased().contains("medium") {
                        return UIFont(name: name, size: size)
                    }
                }
            }
        }
        
        return nil
    }
    
    private func createFontWithWeight(familyName: String, size: CGFloat, weight: UIFont.Weight) -> UIFont? {
        // Try to find a font variant that matches the weight
        let fontFamilyNames = UIFont.familyNames
        for fontFamily in fontFamilyNames {
            if fontFamily == familyName {
                let fontNames = UIFont.fontNames(forFamilyName: fontFamily)
                
                // Try to find a font variant that matches the weight
                for fontName in fontNames {
                    if fontName.lowercased().contains(getWeightSuffix(for: weight)) {
                        return UIFont(name: fontName, size: size)
                    }
                }
                
                // If no weight-specific font found, try to find the closest match
                if let baseFont = UIFont(name: fontNames.first ?? "", size: size) {
                    // Apply weight using font descriptor
                    let descriptor = baseFont.fontDescriptor.addingAttributes([
                        .traits: [UIFontDescriptor.TraitKey.weight: weight]
                    ])
                    return UIFont(descriptor: descriptor, size: size)
                }
            }
        }
        
        // Fallback: try exact font name and apply weight via descriptor
        if let baseFont = UIFont(name: familyName, size: size) {
            let descriptor = baseFont.fontDescriptor.addingAttributes([
                .traits: [UIFontDescriptor.TraitKey.weight: weight]
            ])
            return UIFont(descriptor: descriptor, size: size)
        }
        
        return nil
    }
    
    private func getWeightSuffix(for weight: UIFont.Weight) -> String {
        switch weight {
        case .ultraLight:
            return "ultralight"
        case .thin:
            return "thin"
        case .light:
            return "light"
        case .regular:
            return "regular"
        case .medium:
            return "medium"
        case .semibold:
            return "semibold"
        case .bold:
            return "bold"
        case .heavy:
            return "heavy"
        case .black:
            return "black"
        default:
            return "regular"
        }
    }
}

