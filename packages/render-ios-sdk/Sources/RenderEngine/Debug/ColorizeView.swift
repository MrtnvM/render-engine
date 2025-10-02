import UIKit

extension UIView {
    /**
     * Recursively applies random background colors to this view and all its subviews.
     *
     * This is a debug utility to help visualize the view hierarchy and identify
     * view boundaries during development. Each view receives a random semi-transparent color.
     *
     * Usage:
     * ```swift
     * // In your view controller or view
     * myView.colorize()
     * ```
     *
     * - Parameter alpha: The alpha (transparency) value for the random colors. Default is 0.3.
     */
    @MainActor
    public func colorize(alpha: CGFloat = 0.3) {
        // Apply random color to self
        self.backgroundColor = UIColor.random(alpha: alpha)
        
        // Recursively colorize all subviews
        for subview in self.subviews {
            subview.colorize(alpha: alpha)
        }
    }
}

// Helper extension to generate random colors
fileprivate extension UIColor {
    /**
     * Generates a random UIColor with the specified alpha value.
     *
     * - Parameter alpha: The alpha (transparency) value. Default is 1.0 (fully opaque).
     * - Returns: A UIColor with random RGB values.
     */
    static func random(alpha: CGFloat = 1.0) -> UIColor {
        let red = CGFloat.random(in: 0...1)
        let green = CGFloat.random(in: 0...1)
        let blue = CGFloat.random(in: 0...1)
        
        return UIColor(red: red, green: green, blue: blue, alpha: alpha)
    }
}

