import UIKit
import FlexLayout

class StepperRenderer: Renderer {
    let type = "Stepper"

    func render(component: Component, context: RendererContext) -> UIView? {
        return RenderableStepper(component: component, context: context)
    }
}

class RenderableStepper: UIView, Renderable {
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

        // Style buttons
        minusButton.backgroundColor = UIColor.systemGray5
        minusButton.layer.cornerRadius = 4
        plusButton.backgroundColor = UIColor.systemGray5
        plusButton.layer.cornerRadius = 4

        // Style label
        valueLabel.backgroundColor = UIColor.systemGray6
        valueLabel.layer.cornerRadius = 4
        valueLabel.layer.masksToBounds = true
    }

    @MainActor
    func applyFlexStyles() {
        // Apply flex styles from component.style
        let style = component.style
        
        // Flex direction
        flex.direction(style.direction == .row ? .row : .column)
        
        // Justify content
        switch style.contentAlignment {
        case .center:
            flex.justifyContent(.center)
        case .flexEnd:
            flex.justifyContent(.end)
        case .flexStart:
            flex.justifyContent(.start)
        case .spaceAround:
            flex.justifyContent(.spaceAround)
        case .spaceBetween:
            flex.justifyContent(.spaceBetween)
        case .spaceEvenly:
            flex.justifyContent(.spaceEvenly)
        }
        
        // Align items
        switch style.alignItems {
        case .center:
            flex.alignItems(.center)
        case .flexStart:
            flex.alignItems(.start)
        case .flexEnd:
            flex.alignItems(.end)
        case .stretch:
            flex.alignItems(.stretch)
        case .baseline:
            flex.alignItems(.baseline)
        }
        
        // Padding & Margin
        flex.padding(style.padding)
        flex.margin(style.margin)
        
        // Width & Height
        if let width = style.width {
            flex.width(width)
        }
        if let height = style.height {
            flex.height(height)
        }
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
