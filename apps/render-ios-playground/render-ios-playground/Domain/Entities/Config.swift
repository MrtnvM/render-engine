import Foundation

class Config {
    private let config: [String: Any?]

    init(_ config: Any?) {
        guard let config = config as? [String: Any?] else {
            self.config = [:]
            return
        }

        self.config = config
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
    
    func getArray(forKey key: String, defaultValue: [Any]? = nil) -> [Any]? {
        if let value = config[key] as? [Any] {
            return value
        }
        return defaultValue
    }
    
    func getConfigArray(forKey key: String, defaultValue: [Config]? = nil) -> [Config]? {
        if let value = config[key] as? [Any] {
            return value.map(Config.init)
        }
        return defaultValue
    }
    
    func getDictionary(forKey key: String, defaultValue: [String: Any]? = nil) -> [String: Any]? {
        if let value = config[key] as? [String: Any] {
            return value
        }
        return defaultValue
    }

    func getConfig(forKey key: String, defaultValue: Config? = nil) -> Config? {
        if let value = config[key] as? [String: Any?] {
            return Config(value)
        }
        return defaultValue
    }
}
