import UIKit

class StepperRenderer: Renderer {
    let type = "Stepper"

    func render(component: Component, context: RendererContext) -> UIView? {
        return RenderableStepper(component: component)
    }
}

class RenderableStepper: UIView, Renderable {
    let component: Component
    private let minusButton = UIButton(type: .system)
    private let plusButton = UIButton(type: .system)
    private let valueLabel = UILabel()
    private var currentValue = 1
    private var minimumValue = 1
    private var maximumValue = 10
    private var isDisabled = false

    init(component: Component) {
        self.component = component
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

        // Layout
        minusButton.translatesAutoresizingMaskIntoConstraints = false
        plusButton.translatesAutoresizingMaskIntoConstraints = false
        valueLabel.translatesAutoresizingMaskIntoConstraints = false

        NSLayoutConstraint.activate([
            minusButton.leadingAnchor.constraint(equalTo: leadingAnchor),
            minusButton.centerYAnchor.constraint(equalTo: centerYAnchor),
            minusButton.widthAnchor.constraint(equalToConstant: 44),
            minusButton.heightAnchor.constraint(equalToConstant: 44),

            valueLabel.leadingAnchor.constraint(equalTo: minusButton.trailingAnchor),
            valueLabel.topAnchor.constraint(equalTo: topAnchor),
            valueLabel.bottomAnchor.constraint(equalTo: bottomAnchor),
            valueLabel.widthAnchor.constraint(equalToConstant: 44),

            plusButton.leadingAnchor.constraint(equalTo: valueLabel.trailingAnchor),
            plusButton.centerYAnchor.constraint(equalTo: centerYAnchor),
            plusButton.trailingAnchor.constraint(equalTo: trailingAnchor),
            plusButton.widthAnchor.constraint(equalToConstant: 44),
            plusButton.heightAnchor.constraint(equalToConstant: 44)
        ])

        updateButtonStates()
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
}
