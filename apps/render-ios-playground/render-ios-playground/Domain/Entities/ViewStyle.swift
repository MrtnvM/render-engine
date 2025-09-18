import UIKit

class ViewStyle {
    private let config: Config
    private var cache: [String: Any]

    init(_ config: Config?) {
        self.config = config ?? Config([:])
        self.cache = [:]
    }

    var backgroundColor: UIColor? {
        return get(forKey: "bgColor", ofType: UIColor.self)
    }

    var cornerRadius: CGFloat? {
        return get(forKey: "cornerRadius", ofType: CGFloat.self)
    }

    var borderWidth: CGFloat? {
        return get(forKey: "borderWidth", ofType: CGFloat.self)
    }

    var borderColor: UIColor? {
        return get(forKey: "borderColor", ofType: UIColor.self)
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
        default:
            print("Unsupported type: \(type)")
            return nil
        }

        cache[key] = value
        return value
    }
}
