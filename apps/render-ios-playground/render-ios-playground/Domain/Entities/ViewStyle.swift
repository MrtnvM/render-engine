import UIKit

protocol ViewStyleEnum {
    static func from(string: String) -> Self
    static var defaultValue: Self { get }
}

enum FlexDirection: ViewStyleEnum {
    case row
    case column

    static let defaultValue: FlexDirection = .column

    static func from(string: String) -> FlexDirection {
        switch string {
        case "row":
            return .row
        case "column":
            return .column
        default:
            return .column
        }
    }
}

enum ContentAlignment: ViewStyleEnum {
    case flexStart
    case flexEnd
    case spaceBetween
    case spaceAround
    case spaceEvenly
    case center

    static let defaultValue: ContentAlignment = .flexStart

    static func from(string: String) -> ContentAlignment {
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
            return .flexStart
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

    static func from(string: String) -> AlignItems {
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
            return .stretch
        }
    }
}

public class ViewStyle {
    private let config: Config
    private var cache: [String: Any]

    init(_ config: Config?) {
        self.config = config ?? Config([:])
        self.cache = [:]
    }

    var direction: FlexDirection {
        return get(forKey: "direction", ofType: FlexDirection.self) ?? FlexDirection.defaultValue
    }

    var contentAlignment: ContentAlignment {
        return get(forKey: "contentAlignment", ofType: ContentAlignment.self) ?? ContentAlignment.defaultValue
    }

    var alignItems: AlignItems {
        return get(forKey: "alignItems", ofType: AlignItems.self) ?? AlignItems.defaultValue
    }

    var backgroundColor: UIColor {
        return get(forKey: "bgColor", ofType: UIColor.self) ?? UIColor.clear
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
        case is ContentAlignment.Type:
            let configValue = config.getString(forKey: key) ?? ""
            value = ContentAlignment.from(string: configValue) as? T
        case is AlignItems.Type:
            let configValue = config.getString(forKey: key) ?? ""
            value = AlignItems.from(string: configValue) as? T
        default:
            print("Unsupported type: \(type)")
            return nil
        }

        cache[key] = value
        return value
    }
}
