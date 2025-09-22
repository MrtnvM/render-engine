import UIKit

// MARK: - AvitoDesignSystem
/// Main entry point for the Avito Design System iOS components
public struct AvitoDesignSystem {
    
    // MARK: - Components
    public typealias Button = AvitoButton
    public typealias Showcase = AvitoDesignSystemShowcase
    
    // MARK: - Types
    public typealias ButtonVariant = AvitoButtonVariant
    public typealias ButtonColor = AvitoButtonColor
    public typealias ButtonSize = AvitoButtonSize
    public typealias ButtonState = AvitoButtonState
    public typealias ButtonPreset = AvitoButtonPreset
    public typealias ButtonConfiguration = AvitoButtonConfiguration
    
    // MARK: - Factory Methods
    
    /// Creates a new button with the specified configuration
    /// - Parameters:
    ///   - variant: The button variant (primary, secondary, ghost)
    ///   - color: The button color theme
    ///   - size: The button size
    ///   - title: The button title text
    ///   - isRound: Whether the button should be round
    ///   - onTap: Optional tap action closure
    /// - Returns: A configured AvitoButton instance
    public static func button(
        variant: ButtonVariant = .primary,
        color: ButtonColor = .default,
        size: ButtonSize = .m,
        title: String = "",
        isRound: Bool = false,
        onTap: (() -> Void)? = nil
    ) -> AvitoButton {
        return AvitoButton(
            variant: variant,
            color: color,
            size: size,
            isRound: isRound,
            title: title,
            onTap: onTap
        )
    }
    
    /// Creates a new button with full configuration
    /// - Parameter configuration: The complete button configuration
    /// - Parameter title: The button title text
    /// - Parameter onTap: Optional tap action closure
    /// - Returns: A configured AvitoButton instance
    public static func button(
        configuration: ButtonConfiguration,
        title: String = "",
        onTap: (() -> Void)? = nil
    ) -> AvitoButton {
        return AvitoButton(
            config: configuration,
            title: title,
            onTap: onTap
        )
    }
    
    /// Creates a new design system showcase view controller
    /// - Returns: A configured AvitoDesignSystemShowcase view controller
    public static func showcase() -> AvitoDesignSystemShowcase {
        return AvitoDesignSystemShowcase()
    }
    
    // MARK: - Convenience Button Creators
    
    /// Creates a primary button with default styling
    public static func primaryButton(
        title: String,
        size: ButtonSize = .m,
        onTap: (() -> Void)? = nil
    ) -> AvitoButton {
        return button(variant: .primary, color: .default, size: size, title: title, onTap: onTap)
    }
    
    /// Creates an accent button for highlighted actions
    public static func accentButton(
        title: String,
        size: ButtonSize = .m,
        onTap: (() -> Void)? = nil
    ) -> AvitoButton {
        return button(variant: .primary, color: .accent, size: size, title: title, onTap: onTap)
    }
    
    /// Creates a secondary button
    public static func secondaryButton(
        title: String,
        size: ButtonSize = .m,
        onTap: (() -> Void)? = nil
    ) -> AvitoButton {
        return button(variant: .secondary, color: .default, size: size, title: title, onTap: onTap)
    }
    
    /// Creates a ghost button for subtle actions
    public static func ghostButton(
        title: String,
        size: ButtonSize = .m,
        onTap: (() -> Void)? = nil
    ) -> AvitoButton {
        return button(variant: .ghost, color: .default, size: size, title: title, onTap: onTap)
    }
    
    /// Creates a success button for positive actions
    public static func successButton(
        title: String,
        size: ButtonSize = .m,
        onTap: (() -> Void)? = nil
    ) -> AvitoButton {
        return button(variant: .primary, color: .success, size: size, title: title, onTap: onTap)
    }
    
    /// Creates a danger button for destructive actions
    public static func dangerButton(
        title: String,
        size: ButtonSize = .m,
        onTap: (() -> Void)? = nil
    ) -> AvitoButton {
        return button(variant: .primary, color: .danger, size: size, title: title, onTap: onTap)
    }
    
    /// Creates a pay button for payment-related actions
    public static func payButton(
        title: String,
        size: ButtonSize = .m,
        onTap: (() -> Void)? = nil
    ) -> AvitoButton {
        return button(variant: .primary, color: .pay, size: size, title: title, onTap: onTap)
    }
    
    /// Creates a round button for special use cases
    public static func roundButton(
        title: String,
        variant: ButtonVariant = .primary,
        color: ButtonColor = .accent,
        size: ButtonSize = .m,
        onTap: (() -> Void)? = nil
    ) -> AvitoButton {
        return button(variant: variant, color: color, size: size, title: title, isRound: true, onTap: onTap)
    }
    
    /// Creates a disabled button
    public static func disabledButton(
        title: String,
        variant: ButtonVariant = .primary,
        color: ButtonColor = .default,
        size: ButtonSize = .m
    ) -> AvitoButton {
        let configuration = ButtonConfiguration(
            variant: variant,
            color: color,
            size: size,
            state: .disabled
        )
        return button(configuration: configuration, title: title)
    }
}

// MARK: - Extensions for Common Use Cases

public extension AvitoDesignSystem {
    
    /// Creates a button row with multiple buttons
    /// - Parameter buttons: Array of buttons to arrange horizontally
    /// - Parameter spacing: Spacing between buttons
    /// - Returns: A horizontal stack view containing the buttons
    static func buttonRow(_ buttons: [AvitoButton], spacing: CGFloat = 16) -> UIStackView {
        let stackView = UIStackView(arrangedSubviews: buttons)
        stackView.axis = .horizontal
        stackView.spacing = spacing
        stackView.distribution = .fillEqually
        return stackView
    }
    
    /// Creates a button column with multiple buttons
    /// - Parameter buttons: Array of buttons to arrange vertically
    /// - Parameter spacing: Spacing between buttons
    /// - Returns: A vertical stack view containing the buttons
    static func buttonColumn(_ buttons: [AvitoButton], spacing: CGFloat = 12) -> UIStackView {
        let stackView = UIStackView(arrangedSubviews: buttons)
        stackView.axis = .vertical
        stackView.spacing = spacing
        stackView.distribution = .fillEqually
        return stackView
    }
}

// MARK: - Color Constants
public extension AvitoDesignSystem {
    
    /// Avito Design System color palette
    struct Colors {
        public static let primaryDefault = UIColor(red: 0.08, green: 0.08, blue: 0.08, alpha: 1.0)
        public static let primaryAccent = UIColor(red: 0.0, green: 0.67, blue: 1.0, alpha: 1.0)
        public static let primaryPay = UIColor(red: 0.59, green: 0.37, blue: 0.92, alpha: 1.0)
        public static let primarySuccess = UIColor(red: 0.01, green: 0.82, blue: 0.36, alpha: 1.0)
        public static let primaryDanger = UIColor(red: 1.0, green: 0.25, blue: 0.33, alpha: 1.0)
        
        public static let secondaryDefault = UIColor(red: 0.95, green: 0.95, blue: 0.94, alpha: 1.0)
        public static let secondaryAccent = UIColor(red: 0.81, green: 0.93, blue: 1.0, alpha: 1.0)
        public static let secondaryPay = UIColor(red: 0.91, green: 0.87, blue: 0.99, alpha: 1.0)
        public static let secondarySuccess = UIColor(red: 0.91, green: 0.99, blue: 0.94, alpha: 1.0)
        public static let secondaryDanger = UIColor(red: 1.0, green: 0.91, blue: 0.92, alpha: 1.0)
        
        public static let textPrimary = UIColor.black
        public static let textSecondary = UIColor(red: 0.64, green: 0.64, blue: 0.64, alpha: 1.0)
        public static let textInverse = UIColor.white
    }
}
