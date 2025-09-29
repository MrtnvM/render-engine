import UIKit

class CheckboxRenderer: Renderer {
    let type = "Checkbox"

    func render(component: Component, context: RendererContext) -> UIView? {
        return RenderableCheckbox(component: component)
    }
}

class RenderableCheckbox: UIButton, Renderable {
    let component: Component
    
    private let checkboxImageView = UIImageView()
    private var isChecked = false
    
    private var width: CGFloat { component.style.width ?? 24 }
    private var height: CGFloat { component.style.height ?? 24 }
    private var borderWidth: CGFloat { component.style.get(forKey: "borderWidth", ofType: CGFloat.self) ?? 2 }

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

        // Use flex layout instead of fixed constraints
        self.translatesAutoresizingMaskIntoConstraints = false
        
        yoga.isEnabled = true
        flex
            .width(width)
            .height(height)
        
        checkboxImageView.yoga.isEnabled = true
        checkboxImageView.flex
            .width(width)
            .height(height)
        
        flex.addItem(checkboxImageView)
    }

    private func updateCheckboxAppearance() {
        if isChecked {
            // Show checked state
            checkboxImageView.image = UIImage.checkbox
            // Use custom background color from component style, fallback to system blue
            self.backgroundColor = component.style.backgroundColor
            self.layer.borderColor = UIColor.clear.cgColor
        } else {
            // Show unchecked state
            checkboxImageView.image = nil
            self.layer.borderColor = UIColor.gray.cgColor
            self.backgroundColor = UIColor.clear
        }

        // Add border
        self.layer.borderWidth = component.style.get(forKey: "borderWidth", ofType: CGFloat.self) ?? 2
        // Use custom border color from component style, fallback to system blue
        
        // Use custom corner radius from component style, fallback to 4
        let conrnerRadius = component.style.get(forKey: "cornerRadius", ofType: CGFloat.self)
        self.layer.cornerRadius = conrnerRadius ?? 4

        // Add the image view
        if checkboxImageView.superview == nil {
            self.addSubview(checkboxImageView)
        }
    }

    @objc private func checkboxTapped() {
        guard self.isEnabled else { return }

        isChecked.toggle()
        updateCheckboxAppearance()

        // You could add callback here if needed
        // component.onStateChange?(.checked(isChecked))
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        frame.size = CGSize(width: width, height: height)
        
        flex.layout(mode: .adjustHeight)
    }

    private func applyStyle() {
        applyVisualStyles()
        
        if #available(iOS 15.0, *) {
            if var config = self.configuration {
                config.contentInsets = .zero
                config.titlePadding = .zero
                config.imagePadding = .zero
                self.configuration = config
            }
        } else {
            contentEdgeInsets = .zero
            titleEdgeInsets = .zero
            imageEdgeInsets = .zero
        }
        // Apply any custom styling if needed
        // This could be extended to support custom colors, sizes, etc.
    }
}

