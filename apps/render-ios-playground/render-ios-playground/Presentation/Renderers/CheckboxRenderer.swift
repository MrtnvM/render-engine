import UIKit

class CheckboxRenderer: Renderer {
    let type = "Checkbox"

    func render(component: Component, context: RendererContext) -> UIView? {
        return RenderableCheckbox(component: component, context: context)
    }
}

class RenderableCheckbox: UIButton, Renderable {
    let component: Component
    let context: RendererContext
    
    private let checkboxImageView = UIImageView()
    private var isChecked = false
    
    private var width: CGFloat { component.style.width ?? 24 }
    private var height: CGFloat { component.style.height ?? 24 }
    private var borderWidth: CGFloat { component.style.get(forKey: "borderWidth", ofType: CGFloat.self) ?? 2 }
    
    private let valueProvider = DIContainer.shared.valueProvider

    init(component: Component, context: RendererContext) {
        self.component = component
        self.context = context
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
        isChecked = valueProvider.resolve(
            ValueContext(
                key: "checked",
                type: Bool.self,
                component: component,
                props: context.props
            )
        ) ?? false
        let disabled = valueProvider.resolve(
            ValueContext(
                key: "disabled",
                type: Bool.self,
                component: component,
                props: context.props
            )
        ) ?? false

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
            .position(.absolute)
            .width(width)
            .height(height)
            .top(0)
            .left(0)
        
        
        flex.addItem(checkboxImageView)
    }

    private func updateCheckboxAppearance() {
        checkboxImageView.image = UIImage.checkbox
        if isChecked {
            checkboxImageView.isHidden = false
            self.backgroundColor = component.style.backgroundColor
            self.layer.borderColor = UIColor.clear.cgColor
        } else {
            checkboxImageView.isHidden = true
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

