import Foundation

public class Config {
    private let config: [String: Any?]

    init(_ config: Any? = nil) {
        guard let config = config as? [String: Any?] else {
            self.config = [:]
            return
        }

        self.config = config
    }

    var isEmpty: Bool {
        return config.isEmpty
    }
    
    func get(forKey key: String) -> Any? {
        return config[key] ?? nil
    }
    
    func get<T>(forKey key: String, type: T.Type) -> T? {
        switch type {
        case is String.Type:
            return getString(forKey: key) as? T
        case is Int.Type:
            return getInt(forKey: key) as? T
        case is Float.Type:
            return getFloat(forKey: key) as? T
        case is Double.Type:
            return getDouble(forKey: key) as? T
        case is CGFloat.Type:
            return getCGFloat(forKey: key) as? T
        case is Bool.Type:
            return getBool(forKey: key) as? T
        case is Date.Type:
            return getDate(forKey: key) as? T
        case is [Any].Type:
            return getArray(forKey: key) as? T
        case is [Config].Type:
            return getConfigArray(forKey: key) as? T
        case is [String: Any].Type:
            return getDictionary(forKey: key) as? T
        case is Config.Type:
            return getConfig(forKey: key) as? T
        default:
            return config[key] as? T
        }
    }
    
    func getString(forKey key: String, defaultValue: String? = nil) -> String? {
        if let value = config[key] as? String {
            return value
        }
        return defaultValue
    }
    
    func getInt(forKey key: String, defaultValue: Int? = nil) -> Int? {
        if let value = config[key] as? Int {
            return value
        }
        return defaultValue
    }
    
    func getFloat(forKey key: String, defaultValue: Float? = nil) -> Float? {
        if let value = config[key] as? Float {
            return value
        }
        return defaultValue
    }
    
    func getDouble(forKey key: String, defaultValue: Double? = nil) -> Double? {
        if let value = config[key] as? Double {
            return value
        }
        return defaultValue
    }
    
    func getCGFloat(forKey key: String, defaultValue: CGFloat? = nil) -> CGFloat? {
        if let value = config[key] as? Int {
            return CGFloat(value)
        }
        
        if let value = config[key] as? Float {
            return CGFloat(value)
        }
        
        if let value = config[key] as? Double {
            return CGFloat(value)
        }
        
        return defaultValue
    }
    
    func getBool(forKey key: String, defaultValue: Bool? = nil) -> Bool? {
        if let value = config[key] as? Bool {
            return value
        }
        return defaultValue
    }
    
    func getDate(forKey key: String, defaultValue: Date? = nil) -> Date? {
        if let value = config[key] as? String {
            let formatter = ISO8601DateFormatter()
            return formatter.date(from: value)
        }
        if let value = config[key] as? Date {
            return value
        }
        return defaultValue
    }
    
    func getArray(forKey key: String, defaultValue: [Any] = []) -> [Any] {
        if let value = config[key], let array = value as? [Any] {
            return array
        }
        return defaultValue
    }
    
    func getConfigArray(forKey key: String, defaultValue: [Config] = []) -> [Config] {
        if let value = config[key], let array = value as? [Any] {
            return array.map(Config.init)
        }
        return defaultValue
    }
    
    func getDictionary(forKey key: String, defaultValue: [String: Any]? = nil) -> [String: Any]? {
        if let value = config[key], let dict = value as? [String: Any] {
            return dict
        }
        return defaultValue
    }

    func getConfig(forKey key: String) -> Config {
        guard let value = config[key] else {
            return Config()
        }

        guard let dict = value as? [String: Any?] else {
            return Config()
        }

        return Config(dict)
    }

    func getRawDictionary() -> [String: Any?] {
        return config
    }
    
    /// Merges another Config into the current one, returning a new Config instance.
    /// Values from the other Config will override values in the current Config for matching keys.
    /// - Parameter other: The Config to merge into this one
    /// - Parameter deep: If true, performs deep merge for nested dictionaries and Config objects. Defaults to false.
    /// - Returns: A new Config instance with merged values
    func merge(_ other: Config, deep: Bool = false) -> Config {
        guard !other.isEmpty else {
            return Config(self.config)
        }
        
        if !deep {
            // Shallow merge: other's values simply override current values
            var mergedConfig = self.config
            let otherConfig = other.getRawDictionary()
            
            for (key, value) in otherConfig {
                mergedConfig[key] = value
            }
            
            return Config(mergedConfig)
        } else {
            // Deep merge: recursively merge nested dictionaries and Config objects
            var mergedConfig = self.config
            let otherConfig = other.getRawDictionary()
            
            for (key, value) in otherConfig {
                if let existingDict = mergedConfig[key] as? [String: Any?],
                   let newDict = value as? [String: Any?] {
                    // Recursively merge nested dictionaries
                    let existingConfig = Config(existingDict)
                    let newConfig = Config(newDict)
                    mergedConfig[key] = existingConfig.merge(newConfig, deep: true).getRawDictionary()
                } else {
                    // For non-dictionary values, override with new value
                    mergedConfig[key] = value
                }
            }
            
            return Config(mergedConfig)
        }
    }
}
