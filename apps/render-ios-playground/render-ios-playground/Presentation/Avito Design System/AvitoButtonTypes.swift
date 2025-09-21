import UIKit

// MARK: - Button Variant
public enum AvitoButtonVariant {
    case primary
    case secondary
    case ghost
    
    var displayName: String {
        switch self {
        case .primary:
            return "Primary"
        case .secondary:
            return "Secondary"
        case .ghost:
            return "Ghost"
        }
    }
}

// MARK: - Button Color
public enum AvitoButtonColor {
    case `default`
    case accent
    case pay
    case success
    case danger
    
    var displayName: String {
        switch self {
        case .default:
            return "Default"
        case .accent:
            return "Accent"
        case .pay:
            return "Pay"
        case .success:
            return "Success"
        case .danger:
            return "Danger"
        }
    }
}

// MARK: - Button Size
public enum AvitoButtonSize {
    case xs
    case s
    case m
    case l
    case xl
    
    var displayName: String {
        switch self {
        case .xs:
            return "XS"
        case .s:
            return "S"
        case .m:
            return "M"
        case .l:
            return "L"
        case .xl:
            return "XL"
        }
    }
    
    var height: CGFloat {
        switch self {
        case .xs:
            return 30
        case .s:
            return 36
        case .m:
            return 44
        case .l:
            return 52
        case .xl:
            return 64
        }
    }
    
    var fontSize: CGFloat {
        switch self {
        case .xs:
            return 13
        case .s:
            return 15
        case .m:
            return 15
        case .l:
            return 18
        case .xl:
            return 18
        }
    }
    
    var horizontalPadding: CGFloat {
        switch self {
        case .xs:
            return 8
        case .s:
            return 11
        case .m:
            return 13
        case .l:
            return 15
        case .xl:
            return 21
        }
    }
    
    var verticalPadding: CGFloat {
        switch self {
        case .xs:
            return 6
        case .s:
            return 9
        case .m:
            return 11
        case .l:
            return 15
        case .xl:
            return 20
        }
    }
    
    var cornerRadius: CGFloat {
        switch self {
        case .xs:
            return 10
        case .s:
            return 12
        case .m:
            return 12
        case .l:
            return 16
        case .xl:
            return 20
        }
    }
}

// MARK: - Button State
public enum AvitoButtonState {
    case `default`
    case disabled
}

// MARK: - Button Preset
public enum AvitoButtonPreset {
    case `default`
    case overlay
    case inverse
}

// MARK: - Button Configuration
public struct AvitoButtonConfiguration {
    let variant: AvitoButtonVariant
    let color: AvitoButtonColor
    let size: AvitoButtonSize
    let state: AvitoButtonState
    let isRound: Bool
    let preset: AvitoButtonPreset
    
    public init(
        variant: AvitoButtonVariant = .primary,
        color: AvitoButtonColor = .default,
        size: AvitoButtonSize = .m,
        state: AvitoButtonState = .default,
        isRound: Bool = false,
        preset: AvitoButtonPreset = .default
    ) {
        self.variant = variant
        self.color = color
        self.size = size
        self.state = state
        self.isRound = isRound
        self.preset = preset
    }
}
