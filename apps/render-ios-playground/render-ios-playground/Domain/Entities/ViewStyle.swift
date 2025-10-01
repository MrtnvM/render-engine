import UIKit

protocol ViewStyleEnum {
    static func from(string: String) -> Self?
    static var defaultValue: Self { get }
}

enum FlexDirection: ViewStyleEnum {
    case row
    case column

    static let defaultValue: FlexDirection = .column

    static func from(string: String) -> FlexDirection? {
        switch string {
        case "row":
            return .row
        case "column":
            return .column
        default:
            return nil
        }
    }
}

enum JustifyContent: ViewStyleEnum {
    case flexStart
    case flexEnd
    case spaceBetween
    case spaceAround
    case spaceEvenly
    case center

    static let defaultValue: JustifyContent = .flexStart

    static func from(string: String) -> JustifyContent? {
        switch string {
        case "flexStart":
            return .flexStart
        case "flexEnd":
            return .flexEnd
        case "spaceBetween":
            return .spaceBetween
        case "spaceAround":
            return .spaceAround
        case "spaceEvenly":
            return .spaceEvenly
        case "center":
            return .center
        default:
            return nil
        }
    }
}

enum AlignItems: ViewStyleEnum {
    case flexStart
    case flexEnd
    case center
    case stretch
    case baseline

    static let defaultValue: AlignItems = .stretch

    static func from(string: String) -> AlignItems? {
        switch string {
        case "flexStart":
            return .flexStart
        case "flexEnd":
            return .flexEnd
        case "center":
            return .center
        case "stretch":
            return .stretch
        case "baseline":
            return .baseline
        default:
            return nil
        }
    }
}

enum AlignSelf: ViewStyleEnum {
    case auto
    case flexStart
    case flexEnd
    case center
    case stretch
    case baseline

    static let defaultValue: AlignSelf = .stretch

    static func from(string: String) -> AlignSelf? {
        switch string {
        case "auto":
            return .auto
        case "flexStart":
            return .flexStart
        case "flexEnd":
            return .flexEnd
        case "center":
            return .center
        case "stretch":
            return .stretch
        case "baseline":
            return .baseline
        default:
            return nil
        }
    }
}

enum FlexMode {
    case adjustWidth, adjustHeight, fitContainer
}

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

public class ViewStyle {
    private let config: Config
    private var cache: [String: Any]
    
    private static let logger = DIContainer.shared.logger

    init(_ config: Config?) {
        self.config = config ?? Config([:])
        self.cache = [:]
    }

    var direction: FlexDirection? {
        return get(forKey: "flexDirection", ofType: FlexDirection.self)
    }

    var justifyContent: JustifyContent? {
        return get(forKey: "justifyContent", ofType: JustifyContent.self)
    }

    var alignItems: AlignItems? {
        return get(forKey: "alignItems", ofType: AlignItems.self)
    }
    
    var alignSelf: AlignSelf? {
        return get(forKey: "alignSelf", ofType: AlignSelf.self)
    }
    
    var gap: CGFloat? {
        return get(forKey: "gap", ofType: CGFloat.self)
    }
    
    var rowGap: CGFloat? {
        return get(forKey: "rowGap", ofType: CGFloat.self)
    }
    
    var columnGap: CGFloat? {
        return get(forKey: "columnGap", ofType: CGFloat.self)
    }

    var backgroundColor: UIColor {
        return get(forKey: "backgroundColor", ofType: UIColor.self) ?? UIColor.clear
    }

    var cornerRadius: CGFloat {
        return get(forKey: "cornerRadius", ofType: CGFloat.self) ?? 0
    }

    var borderWidth: CGFloat {
        return get(forKey: "borderWidth", ofType: CGFloat.self) ?? 0
    }

    var borderColor: UIColor {
        return get(forKey: "borderColor", ofType: UIColor.self) ?? UIColor.clear
    }

    var x: CGFloat? {
        return get(forKey: "x", ofType: CGFloat.self)
    }
    
    var y: CGFloat? {
        return get(forKey: "y", ofType: CGFloat.self)
    }

    var width: CGFloat? {
        return get(forKey: "width", ofType: CGFloat.self)
    }
    
    var height: CGFloat? {
        return get(forKey: "height", ofType: CGFloat.self)
    }
    
    var flex: CGFloat? {
        return get(forKey: "flex", ofType: CGFloat.self)
    }
    
    var flexGrow: CGFloat? {
        return get(forKey: "flexGrow", ofType: CGFloat.self)
    }
    
    var flexShrink: CGFloat? {
        return get(forKey: "flexShrink", ofType: CGFloat.self)
    }
    
    var flexMode: FlexMode {
        return get(forKey: "flexMode", ofType: FlexMode.self) ?? FlexMode.fitContainer
    }

    var padding: UIEdgeInsets {
        // Priority 1: Specific properties (highest priority)
        let top = get(forKey: "paddingTop", ofType: CGFloat.self)
        let left = get(forKey: "paddingLeft", ofType: CGFloat.self)
        let bottom = get(forKey: "paddingBottom", ofType: CGFloat.self)
        let right = get(forKey: "paddingRight", ofType: CGFloat.self)
        
        // Priority 2: Horizontal/Vertical properties (medium priority)
        let horizontal = get(forKey: "paddingHorizontal", ofType: CGFloat.self)
        let vertical = get(forKey: "paddingVertical", ofType: CGFloat.self)
        
        // Priority 3: General padding property (lowest priority)
        let general = get(forKey: "padding", ofType: CGFloat.self) ?? 0
        
        return UIEdgeInsets(
            top: top ?? vertical ?? general,
            left: left ?? horizontal ?? general,
            bottom: bottom ?? vertical ?? general,
            right: right ?? horizontal ?? general
        )
    }

    var margin: UIEdgeInsets {
        // Priority 1: Specific properties (highest priority)
        let top = get(forKey: "marginTop", ofType: CGFloat.self)
        let left = get(forKey: "marginLeft", ofType: CGFloat.self)
        let bottom = get(forKey: "marginBottom", ofType: CGFloat.self)
        let right = get(forKey: "marginRight", ofType: CGFloat.self)
        
        // Priority 2: Horizontal/Vertical properties (medium priority)
        let horizontal = get(forKey: "marginHorizontal", ofType: CGFloat.self)
        let vertical = get(forKey: "marginVertical", ofType: CGFloat.self)
        
        // Priority 3: General margin property (lowest priority)
        let general = get(forKey: "margin", ofType: CGFloat.self) ?? 0
        
        return UIEdgeInsets(
            top: top ?? vertical ?? general,
            left: left ?? horizontal ?? general,
            bottom: bottom ?? vertical ?? general,
            right: right ?? horizontal ?? general
        )
    }
    
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
    
    var shadowColor: UIColor? {
        return get(forKey: "shadowColor", ofType: UIColor.self)
    }
    
    var shadowOffset: CGSize? {
        guard let offsetDict = get(forKey: "shadowOffset", ofType: [String: Any].self) else {
            return nil
        }
        
        let config = Config(offsetDict)
        
        let width = config.get(forKey: "width", type: Double.self) ?? 0
        let height = config.get(forKey: "height", type: Double.self) ?? 0
        
        return CGSize(width: width, height: height)
    }
    
    var shadowOpacity: CGFloat? {
        return get(forKey: "shadowOpacity", ofType: CGFloat.self)
    }
    
    var shadowRadius: CGFloat? {
        return get(forKey: "shadowRadius", ofType: CGFloat.self)
    }

    func get<T>(forKey key: String, ofType type: T.Type) -> T? {
        if let value = cache[key] {
            return value as? T
        }

        var value: T?

        switch type {
        case is String.Type:
            value = config.getString(forKey: key) as? T
        case is Int.Type:
            value = config.getInt(forKey: key) as? T
        case is Bool.Type:
            value = config.getBool(forKey: key) as? T
        case is Double.Type:
            value = config.getDouble(forKey: key) as? T
        case is CGFloat.Type:
            value = config.getCGFloat(forKey: key) as? T
        case is UIColor.Type:
            guard let colorString = config.getString(forKey: key) else {
                return nil
            }
            value = parseColor(from: colorString) as? T
        case is FlexDirection.Type:
            let configValue = config.getString(forKey: key) ?? ""
            value = FlexDirection.from(string: configValue) as? T
        case is JustifyContent.Type:
            let configValue = config.getString(forKey: key) ?? ""
            value = JustifyContent.from(string: configValue) as? T
        case is AlignItems.Type:
            let configValue = config.getString(forKey: key) ?? ""
            value = AlignItems.from(string: configValue) as? T
        case is AlignSelf.Type:
            let configValue = config.getString(forKey: key) ?? ""
            value = AlignSelf.from(string: configValue) as? T
        case is NSTextAlignment.Type:
            let configValue = config.getString(forKey: key) ?? ""
            value = TextAlignment.from(string: configValue)?.nsTextAlignment as? T
        case is [String: Any].Type:
            value = config.getDictionary(forKey: key) as? T
        case is [String: Any?].Type:
            value = config.getDictionary(forKey: key) as? T
        case is UIFont.Type:
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
                    value = customFont as? T
                } else {
                    // Fallback to system font with weight if family not found
                    value = UIFont.systemFont(ofSize: size, weight: weight) as? T
                }
            } else {
                // Use system font with weight
                value = UIFont.systemFont(ofSize: size, weight: weight) as? T
            }
        case is FlexMode.Type:
            let rawValue = config.getString(forKey: key)
            switch rawValue {
            case "adjustWidth":
                value = FlexMode.adjustWidth as? T
            case "adjustHeight":
                value = FlexMode.adjustHeight as? T
            case "fitContainer":
                value = FlexMode.fitContainer as? T
            case nil:
                value = FlexMode.fitContainer as? T
            default:
                ViewStyle.logger.warning("Unknown FlexMode value: \(rawValue ?? "nil")", category: "ViewStyle")
                value = FlexMode.fitContainer as? T
            }
        default:
            print("Unsupported type: \(type)")
            return nil
        }

        cache[key] = value
        return value
    }
    
    func getRawDictionary() -> [String: Any?] {
        return config.getRawDictionary()
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
    
    private func parseColor(from colorString: String) -> UIColor {
        // Handle hex colors (#RRGGBB, #RGB, #RRGGBBAA, #RGBA)
        if colorString.hasPrefix("#") {
            let hex = String(colorString.dropFirst())
            return parseHexColor(hex: hex)
        }
        
        // Handle rgb/rgba colors
        if colorString.hasPrefix("rgb") {
            return parseRGBColor(from: colorString)
        }
        
        // Handle named colors
        return parseNamedColor(from: colorString)
    }
    
    private func parseHexColor(hex: String) -> UIColor {
        var cleanHex = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Expand short form (#RGB -> #RRGGBB)
        if cleanHex.count == 3 || cleanHex.count == 4 {
            cleanHex = cleanHex.map { "\($0)\($0)" }.joined()
        }
        
        // Parse RGB components
        let r = String(cleanHex.prefix(2))
        let g = String(cleanHex.dropFirst(2).prefix(2))
        let b = String(cleanHex.dropFirst(4).prefix(2))
        let a = cleanHex.count >= 8 ? String(cleanHex.suffix(2)) : "FF"
        
        let red = CGFloat(Int(r, radix: 16) ?? 0) / 255.0
        let green = CGFloat(Int(g, radix: 16) ?? 0) / 255.0
        let blue = CGFloat(Int(b, radix: 16) ?? 0) / 255.0
        let alpha = CGFloat(Int(a, radix: 16) ?? 255) / 255.0
        
        return UIColor(red: red, green: green, blue: blue, alpha: alpha)
    }
    
    private func parseRGBColor(from colorString: String) -> UIColor {
        // Simple RGB/RGBA parser - handles basic cases
        let pattern = "rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*(?:,\\s*([\\d.]+))?\\s*\\)"
        
        if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) {
            let range = NSRange(location: 0, length: colorString.utf16.count)
            if let match = regex.firstMatch(in: colorString, options: [], range: range) {
                let red = CGFloat(Int(colorString.substring(with: match.range(at: 1)) ?? "0") ?? 0) / 255.0
                let green = CGFloat(Int(colorString.substring(with: match.range(at: 2)) ?? "0") ?? 0) / 255.0
                let blue = CGFloat(Int(colorString.substring(with: match.range(at: 3)) ?? "0") ?? 0) / 255.0
                let alpha = CGFloat(Double(colorString.substring(with: match.range(at: 4)) ?? "1") ?? 1.0)
                
                return UIColor(red: red, green: green, blue: blue, alpha: alpha)
            }
        }
        
        return UIColor.clear
    }
    
    private func parseNamedColor(from colorString: String) -> UIColor {
        let lowercased = colorString.lowercased()
        
        switch lowercased {
        case "clear", "transparent":
            return UIColor.clear
        case "black":
            return UIColor.black
        case "white":
            return UIColor.white
        case "red":
            return UIColor.red
        case "green":
            return UIColor.green
        case "blue":
            return UIColor.blue
        case "yellow":
            return UIColor.yellow
        case "orange":
            return UIColor.orange
        case "purple":
            return UIColor.purple
        case "gray", "grey":
            return UIColor.gray
        case "lightgray", "lightgrey":
            return UIColor.lightGray
        case "darkgray", "darkgrey":
            return UIColor.darkGray
        case "cyan":
            return UIColor.cyan
        case "magenta":
            return UIColor.magenta
        case "brown":
            return UIColor.brown
        default:
            return UIColor.black // Default fallback
        }
    }
}

extension String {
    func substring(with range: NSRange) -> String? {
        guard let swiftRange = Range(range, in: self) else { return nil }
        return String(self[swiftRange])
    }
}
