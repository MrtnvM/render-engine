import UIKit

protocol ViewStyleEnum {
    static func from(string: String) -> Self?
    static var defaultValue: Self { get }
}

public class ViewStyle {
    internal let config: Config
    private var cache: [String: Any]
    
    internal static let logger = DIContainer.shared.logger

    init(_ config: Config?) {
        self.config = config ?? Config([:])
        self.cache = [:]
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
            value = parseColor(from: config, forKey: key) as? T
            
        // Flex Layout
        case is FlexMode.Type:
            value = parseFlexMode(from: config, forKey: key) as? T
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
            
        // Text
        case is TextAlignment.Type:
            let configValue = config.getString(forKey: key) ?? ""
            value = TextAlignment.from(string: configValue) as? T
        case is NSTextAlignment.Type:
            let configValue = config.getString(forKey: key) ?? ""
            value = TextAlignment.from(string: configValue)?.nsTextAlignment as? T
        case is UIFont.Type:
            value = parseFont(from: config) as? T
            
        // Dictionary
        case is [String: Any].Type:
            value = config.getDictionary(forKey: key) as? T
        case is [String: Any?].Type:
            value = config.getDictionary(forKey: key) as? T
        
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
}
