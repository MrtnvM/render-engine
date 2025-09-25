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
}
