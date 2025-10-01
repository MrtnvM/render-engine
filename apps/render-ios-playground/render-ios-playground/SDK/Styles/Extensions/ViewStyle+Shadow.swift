import UIKit

extension ViewStyle {
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
}

