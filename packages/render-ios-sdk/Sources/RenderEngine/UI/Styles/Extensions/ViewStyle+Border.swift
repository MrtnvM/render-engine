import UIKit

extension ViewStyle {
    var cornerRadius: CGFloat {
        return get(forKey: "borderRadius", ofType: CGFloat.self) ?? 0
    }

    var borderWidth: CGFloat {
        return get(forKey: "borderWidth", ofType: CGFloat.self) ?? 0
    }

    var borderColor: UIColor {
        return get(forKey: "borderColor", ofType: UIColor.self) ?? UIColor.clear
    }
}

