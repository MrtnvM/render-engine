import UIKit

// MARK: - AvitoButton
/// A customizable button component following the Avito Design System
public class AvitoButton: UIButton {
    
    // MARK: - Properties
    private var config: AvitoButtonConfiguration
    private var onTapAction: (() -> Void)?
    
    // MARK: - Initialization
    public init(
        config: AvitoButtonConfiguration = AvitoButtonConfiguration(),
        title: String = "",
        onTap: (() -> Void)? = nil
    ) {
        self.config = config
        self.onTapAction = onTap
        super.init(frame: .zero)
        setupButton(title: title)
    }
    
    required init?(coder: NSCoder) {
        self.config = AvitoButtonConfiguration()
        super.init(coder: coder)
        setupButton(title: "")
    }
    
    // MARK: - Setup
    private func setupButton(title: String) {
        setTitle(title, for: .normal)
        setupAppearance()
        setupConstraints()
        setupActions()
    }
    
    private func setupAppearance() {
        titleLabel?.font = UIFont.systemFont(ofSize: config.size.fontSize, weight: .medium)
        layer.cornerRadius = config.isRound ? config.size.height / 2 : config.size.cornerRadius
        layer.masksToBounds = true
        
        applyVariantStyling()
        applyStateStyling()
        applyPresetStyling()
    }
    
    private func applyVariantStyling() {
        switch config.variant {
        case .primary:
            applyPrimaryStyling()
        case .secondary:
            applySecondaryStyling()
        case .ghost:
            applyGhostStyling()
        }
    }
    
    private func applyPrimaryStyling() {
        switch config.color {
        case .default:
            backgroundColor = UIColor(red: 0.08, green: 0.08, blue: 0.08, alpha: 1.0) // #141414
            setTitleColor(.white, for: .normal)
        case .accent:
            backgroundColor = UIColor(red: 0.0, green: 0.67, blue: 1.0, alpha: 1.0) // #00aaff
            setTitleColor(.white, for: .normal)
        case .pay:
            backgroundColor = UIColor(red: 0.59, green: 0.37, blue: 0.92, alpha: 1.0) // #965eeb
            setTitleColor(.white, for: .normal)
        case .success:
            backgroundColor = UIColor(red: 0.01, green: 0.82, blue: 0.36, alpha: 1.0) // #02d15c
            setTitleColor(.white, for: .normal)
        case .danger:
            backgroundColor = UIColor(red: 1.0, green: 0.25, blue: 0.33, alpha: 1.0) // #ff4053
            setTitleColor(.white, for: .normal)
        }
    }
    
    private func applySecondaryStyling() {
        switch config.color {
        case .default:
            backgroundColor = UIColor(red: 0.95, green: 0.95, blue: 0.94, alpha: 1.0) // #f2f1f0
            setTitleColor(.black, for: .normal)
        case .accent:
            backgroundColor = UIColor(red: 0.81, green: 0.93, blue: 1.0, alpha: 1.0) // #cfedff
            setTitleColor(UIColor(red: 0.0, green: 0.54, blue: 0.93, alpha: 1.0), for: .normal) // #008aed
        case .pay:
            backgroundColor = UIColor(red: 0.91, green: 0.87, blue: 0.99, alpha: 1.0) // #e9ddfd
            setTitleColor(UIColor(red: 0.55, green: 0.31, blue: 0.91, alpha: 1.0), for: .normal) // #8c4fe8
        case .success:
            backgroundColor = UIColor(red: 0.91, green: 0.99, blue: 0.94, alpha: 1.0) // #e9fdf0
            setTitleColor(UIColor(red: 0.0, green: 0.7, blue: 0.31, alpha: 1.0), for: .normal) // #00b34e
        case .danger:
            backgroundColor = UIColor(red: 1.0, green: 0.91, blue: 0.92, alpha: 1.0) // #ffe9eb
            setTitleColor(UIColor(red: 0.9, green: 0.22, blue: 0.27, alpha: 1.0), for: .normal) // #e63946
        }
    }
    
    private func applyGhostStyling() {
        backgroundColor = .clear
        switch config.preset {
        case .inverse:
            setTitleColor(.white, for: .normal)
        default:
            setTitleColor(.black, for: .normal)
        }
    }
    
    private func applyStateStyling() {
        isEnabled = config.state == .default
        
        if config.state == .disabled {
            backgroundColor = UIColor(red: 0.95, green: 0.95, blue: 0.94, alpha: 1.0) // #f2f1f0
            setTitleColor(UIColor(red: 0.64, green: 0.64, blue: 0.64, alpha: 1.0), for: .normal) // #a3a3a3
        }
    }
    
    private func applyPresetStyling() {
        switch config.preset {
        case .overlay:
            backgroundColor = .white
            setTitleColor(.black, for: .normal)
        case .inverse:
            backgroundColor = UIColor(red: 0.08, green: 0.08, blue: 0.08, alpha: 1.0) // #141414
            setTitleColor(.white, for: .normal)
        default:
            break
        }
    }
    
    private func setupConstraints() {
        translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            heightAnchor.constraint(equalToConstant: config.size.height)
        ])
    }
    
    private func setupActions() {
        addTarget(self, action: #selector(buttonTapped), for: .touchUpInside)
    }
    
    @objc private func buttonTapped() {
        onTapAction?()
    }
    
    // MARK: - Public Methods
    public func updateConfiguration(_ newConfiguration: AvitoButtonConfiguration) {
        self.config = newConfiguration
        setupAppearance()
        setupConstraints()
    }
    
    public func setOnTap(_ action: @escaping () -> Void) {
        self.onTapAction = action
    }
    
    // MARK: - Touch Effects
    public override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)
        if isEnabled {
            UIView.animate(withDuration: 0.1) {
                self.transform = CGAffineTransform(scaleX: 0.98, y: 0.98)
            }
        }
    }
    
    public override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
        if isEnabled {
            UIView.animate(withDuration: 0.1) {
                self.transform = .identity
            }
        }
    }
    
    public override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesCancelled(touches, with: event)
        if isEnabled {
            UIView.animate(withDuration: 0.1) {
                self.transform = .identity
            }
        }
    }
}

// MARK: - Convenience Initializers
public extension AvitoButton {
    convenience init(
        variant: AvitoButtonVariant = .primary,
        color: AvitoButtonColor = .default,
        size: AvitoButtonSize = .m,
        title: String = "",
        onTap: (() -> Void)? = nil
    ) {
        let config = AvitoButtonConfiguration(
            variant: variant,
            color: color,
            size: size
        )
        self.init(config: config, title: title, onTap: onTap)
    }
    
    convenience init(
        variant: AvitoButtonVariant = .primary,
        color: AvitoButtonColor = .default,
        size: AvitoButtonSize = .m,
        isRound: Bool = false,
        title: String = "",
        onTap: (() -> Void)? = nil
    ) {
        let config = AvitoButtonConfiguration(
            variant: variant,
            color: color,
            size: size,
            isRound: isRound
        )
        self.init(config: config, title: title, onTap: onTap)
    }
}
