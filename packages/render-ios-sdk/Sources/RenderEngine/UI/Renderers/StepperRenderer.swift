import UIKit
import FlexLayout

class StepperRenderer: Renderer {
    let type = "Stepper"

    func render(component: Component, context: RendererContext) -> UIView? {
        return RenderableStepper(component: component, context: context)
    }
}

class RenderableStepper: UIView, @MainActor Renderable {
    let component: Component
    let context: RendererContext
    
    private let minusButton = UIButton(type: .system)
    private let plusButton = UIButton(type: .system)
    private let valueLabel = UILabel()
    private var currentValue = 1
    private var minimumValue = 1
    private var maximumValue = 10
    private var isDisabled = false

    init(component: Component, context: RendererContext) {
        self.component = component
        self.context = context
        super.init(frame: .zero)
        yoga.isEnabled = true
        applyStyle()
        applyFlexStyles()
        setupStepper()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func setupStepper() {
        // Get properties
        currentValue = component.properties.getInt(forKey: "value") ?? 1
        minimumValue = component.properties.getInt(forKey: "minimumValue") ?? 1
        maximumValue = component.properties.getInt(forKey: "maximumValue") ?? 10
        isDisabled = component.properties.getBool(forKey: "disabled") ?? false

        // Setup buttons
        minusButton.setTitle("-", for: .normal)
        minusButton.addTarget(self, action: #selector(decrementValue), for: .touchUpInside)
        plusButton.setTitle("+", for: .normal)
        plusButton.addTarget(self, action: #selector(incrementValue), for: .touchUpInside)

        valueLabel.text = "\(currentValue)"
        valueLabel.textAlignment = .center
        valueLabel.font = UIFont.systemFont(ofSize: 16)

        // Add subviews
        addSubview(minusButton)
        addSubview(valueLabel)
        addSubview(plusButton)

        // Setup FlexLayout
        setupFlexLayout()

        updateButtonStates()
    }

    private func setupFlexLayout() {
        // Configure the main container as a horizontal row
        flex.direction(.row)
            .width(44 * 3)
            .height(44)
            .justifyContent(.spaceBetween)
            .alignItems(.center)
            .define { flex in
                // Minus button
                flex.addItem(minusButton)
                    .width(44)
                    .height(44)
                
                // Value label (grows to fill available space)
                flex.addItem(valueLabel)
                    .width(44)
                    .grow(1)
                    .shrink(1)
                
                // Plus button
                flex.addItem(plusButton)
                    .width(44)
                    .height(44)
            }
    }

    private func updateButtonStates() {
        minusButton.isEnabled = !isDisabled && currentValue > minimumValue
        plusButton.isEnabled = !isDisabled && currentValue < maximumValue

        minusButton.alpha = minusButton.isEnabled ? 1.0 : 0.5
        plusButton.alpha = plusButton.isEnabled ? 1.0 : 0.5
    }

    @objc private func decrementValue() {
        guard currentValue > minimumValue else { return }
        currentValue -= 1
        valueLabel.text = "\(currentValue)"
        updateButtonStates()
    }

    @objc private func incrementValue() {
        guard currentValue < maximumValue else { return }
        currentValue += 1
        valueLabel.text = "\(currentValue)"
        updateButtonStates()
    }

    private func applyStyle() {
        applyVisualStyles()

        let cornerRadius: CGFloat = get(key: "borderRadius", type: CGFloat.self) ?? 12
        backgroundColor = parseColor(from: "#F2F1F0")
        layer.cornerRadius = cornerRadius
        layer.masksToBounds = true
        
        // Style buttons
        minusButton.layer.cornerRadius = cornerRadius
        plusButton.layer.cornerRadius = cornerRadius
    }

    func applyVisualStyles() {
        let style = component.style
        
        backgroundColor = style.backgroundColor
        layer.cornerRadius = style.cornerRadius
        layer.masksToBounds = style.cornerRadius > 0
        layer.borderWidth = style.borderWidth
        layer.borderColor = style.borderColor.cgColor
    }
}
