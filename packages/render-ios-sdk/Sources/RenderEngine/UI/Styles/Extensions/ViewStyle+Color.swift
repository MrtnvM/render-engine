import UIKit

extension ViewStyle {
    var backgroundColor: UIColor {
        return get(forKey: "backgroundColor", ofType: UIColor.self) ?? .clear
    }
    
    func parseColor(from config: Config, forKey key: String) -> UIColor? {
        guard let colorString = config.getString(forKey: key) else {
            return nil
        }
        
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

