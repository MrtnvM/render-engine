import UIKit

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

extension ViewStyle {
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
    
    func parseFlexMode(from config: Config, forKey key: String) -> FlexMode {
        let rawValue = config.getString(forKey: key)
        switch rawValue {
        case "adjustWidth":
            return FlexMode.adjustWidth
        case "adjustHeight":
            return FlexMode.adjustHeight
        case "fitContainer":
            return FlexMode.fitContainer
        case nil:
            return FlexMode.fitContainer
        default:
            ViewStyle.logger.warning("Unknown FlexMode value: \(rawValue ?? "nil")", category: "ViewStyle")
            return FlexMode.fitContainer
        }
    }
}

