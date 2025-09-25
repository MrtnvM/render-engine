import UIKit

class CheckboxRenderer: Renderer {
    let type = "Checkbox"

    func render(component: Component) -> UIView? {
        return RenderableCheckbox(component: component)
    }
}

class RenderableCheckbox: UIButton, Renderable {
    let component: Component
    private let checkboxImageView = UIImageView()
    private var isChecked = false

    init(component: Component) {
        self.component = component
        super.init(frame: .zero)
        applyStyle()
        applyFlexStyles()
        setupCheckbox()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupCheckbox() {
        // Set initial state
        isChecked = component.properties.getBool(forKey: "checked") ?? false
        let disabled = component.properties.getBool(forKey: "disabled") ?? false

        // Configure button
        self.isEnabled = !disabled
        self.addTarget(self, action: #selector(checkboxTapped), for: .touchUpInside)

        // Create checkbox appearance
        updateCheckboxAppearance()

        // Add constraints to make it a proper size
        self.translatesAutoresizingMaskIntoConstraints = false
        self.widthAnchor.constraint(equalToConstant: 24).isActive = true
        self.heightAnchor.constraint(equalToConstant: 24).isActive = true
    }

    private func updateCheckboxAppearance() {
        if isChecked {
            // Show checked state
            checkboxImageView.image = createCheckedImage()
            self.backgroundColor = UIColor.systemBlue
        } else {
            // Show unchecked state
            checkboxImageView.image = createUncheckedImage()
            self.backgroundColor = UIColor.clear
        }

        // Add border
        self.layer.borderWidth = 2
        self.layer.borderColor = isChecked ? UIColor.systemBlue.cgColor : UIColor.gray.cgColor
        self.layer.cornerRadius = 4

        // Add the image view
        if checkboxImageView.superview == nil {
            self.addSubview(checkboxImageView)
            checkboxImageView.translatesAutoresizingMaskIntoConstraints = false
            checkboxImageView.centerXAnchor.constraint(equalTo: self.centerXAnchor).isActive = true
            checkboxImageView.centerYAnchor.constraint(equalTo: self.centerYAnchor).isActive = true
            checkboxImageView.widthAnchor.constraint(equalToConstant: 16).isActive = true
            checkboxImageView.heightAnchor.constraint(equalToConstant: 16).isActive = true
        }
    }

    private func createCheckedImage() -> UIImage? {
        let size = CGSize(width: 16, height: 16)
        UIGraphicsBeginImageContextWithOptions(size, false, 0)
        defer { UIGraphicsEndImageContext() }

        let context = UIGraphicsGetCurrentContext()!
        context.setStrokeColor(UIColor.white.cgColor)
        context.setLineWidth(2)

        // Draw checkmark
        context.move(to: CGPoint(x: 3, y: 8))
        context.addLine(to: CGPoint(x: 7, y: 12))
        context.addLine(to: CGPoint(x: 13, y: 4))
        context.strokePath()

        return UIGraphicsGetImageFromCurrentImageContext()
    }

    private func createUncheckedImage() -> UIImage? {
        return nil // No image for unchecked state
    }

    @objc private func checkboxTapped() {
        guard self.isEnabled else { return }

        isChecked.toggle()
        updateCheckboxAppearance()

        // You could add callback here if needed
        // component.onStateChange?(.checked(isChecked))
    }

    private func applyStyle() {
        applyVisualStyles()
        // Apply any custom styling if needed
        // This could be extended to support custom colors, sizes, etc.
    }
}
