import UIKit
import FlexLayout

// MARK: - CheckBoxDelegate Protocol
protocol CheckBoxDelegate: AnyObject {
    func checkBox(_ checkBox: CheckBox, didChangeState isChecked: Bool)
}

// MARK: - CheckBox Class
/// A reusable checkbox component that uses UIImage.checkbox and FlexLayout for positioning
class CheckBox: UIView {

    // MARK: - Properties
    weak var delegate: CheckBoxDelegate?

    var isChecked: Bool = false {
        didSet {
            updateAppearance()
            delegate?.checkBox(self, didChangeState: isChecked)
        }
    }

    var checkboxSize: CGFloat = 24.0 {
        didSet {
            setNeedsLayout()
        }
    }

    var checkedTintColor: UIColor = .systemBlue {
        didSet {
            updateAppearance()
        }
    }

    var uncheckedTintColor: UIColor = .gray {
        didSet {
            updateAppearance()
        }
    }

    var borderWidth: CGFloat = 2.0 {
        didSet {
            updateAppearance()
        }
    }

    var cornerRadius: CGFloat = 4.0 {
        didSet {
            updateAppearance()
        }
    }

    var animationDuration: TimeInterval = 0.2

    // MARK: - UI Components
    private lazy var checkboxImageView: UIImageView = {
        let imageView = UIImageView()
        imageView.contentMode = .scaleAspectFit
        imageView.isUserInteractionEnabled = false
        return imageView
    }()

    private lazy var tapGestureRecognizer: UITapGestureRecognizer = {
        let gesture = UITapGestureRecognizer(target: self, action: #selector(checkboxTapped))
        gesture.numberOfTapsRequired = 1
        return gesture
    }()

    // MARK: - Initialization
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupUI()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupUI()
    }

    // MARK: - Setup
    private func setupUI() {
        backgroundColor = .clear
        isUserInteractionEnabled = true

        addGestureRecognizer(tapGestureRecognizer)

        // Enable FlexLayout for this view
        yoga.isEnabled = true

        addSubview(checkboxImageView)

        // Set up flex layout for the checkbox image
        flex.define { flex in
            flex.addItem(checkboxImageView)
                .width(checkboxSize)
                .height(checkboxSize)
                .position(.absolute)
                .top(0)
                .left(0)
        }

        updateAppearance()
    }

    override func layoutSubviews() {
        super.layoutSubviews()

        // Apply flex layout
        flex.layout()
    }

    // MARK: - Appearance Updates
    private func updateAppearance() {
        if isChecked {
            checkboxImageView.isHidden = false
            checkboxImageView.image = UIImage.checkbox.withTintColor(checkedTintColor, renderingMode: .alwaysTemplate)
            backgroundColor = checkedTintColor.withAlphaComponent(0.1)
            layer.borderColor = checkedTintColor.cgColor
        } else {
            checkboxImageView.isHidden = true
            checkboxImageView.image = nil
            backgroundColor = .clear
            layer.borderColor = uncheckedTintColor.cgColor
        }

        layer.borderWidth = borderWidth
        layer.cornerRadius = cornerRadius

        // Add subtle shadow for depth
        layer.shadowColor = UIColor.black.cgColor
        layer.shadowOffset = CGSize(width: 0, height: 1)
        layer.shadowRadius = 1
        layer.shadowOpacity = 0.1

        // Update flex layout when size changes
        flex.define { flex in
            flex.addItem(checkboxImageView)
                .width(checkboxSize)
                .height(checkboxSize)
                .position(.absolute)
                .top(0)
                .left(0)
        }
        setNeedsLayout()
    }

    // MARK: - Animation
    private func animateStateChange() {
        UIView.animate(withDuration: animationDuration) {
            self.updateAppearance()
        }
    }

    // MARK: - Actions
    @objc private func checkboxTapped() {
        isChecked.toggle()
        animateStateChange()
    }

    // MARK: - Public Methods
    func setChecked(_ checked: Bool, animated: Bool = true) {
        guard checked != isChecked else { return }

        isChecked = checked

        if animated {
            animateStateChange()
        } else {
            updateAppearance()
        }
    }

    func toggle() {
        setChecked(!isChecked)
    }

    // MARK: - Accessibility
    override var isAccessibilityElement: Bool {
        get { true }
        set { super.isAccessibilityElement = newValue }
    }

    override var accessibilityLabel: String? {
        get {
            let state = isChecked ? "checked" : "unchecked"
            return "Checkbox, \(state)"
        }
        set { super.accessibilityLabel = newValue }
    }

    override var accessibilityHint: String? {
        get { "Tap to toggle checkbox state" }
        set { super.accessibilityHint = newValue }
    }

    override var accessibilityTraits: UIAccessibilityTraits {
        get {
            var traits = super.accessibilityTraits
            traits.insert(.button)
            return traits
        }
        set { super.accessibilityTraits = newValue }
    }

    override var accessibilityValue: String? {
        get { isChecked ? "Checked" : "Unchecked" }
        set { super.accessibilityValue = newValue }
    }
}
