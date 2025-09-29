import UIKit

// MARK: - UIColor Extension
extension UIColor {
    func toHexString() -> String {
        var r: CGFloat = 0
        var g: CGFloat = 0
        var b: CGFloat = 0
        var a: CGFloat = 0

        getRed(&r, green: &g, blue: &b, alpha: &a)

        let rgb: Int = (Int)(r * 255) << 16 | (Int)(g * 255) << 8 | (Int)(b * 255) << 0

        return String(format: "#%06x", rgb)
    }
}

/// View controller that showcases different states and configurations of a specific component type
class ComponentShowcaseViewController: UIViewController {

    // MARK: - Properties for creating components
    private var componentCounter = 0

    // MARK: - Properties
    private let componentType: String
    private let displayName: String

    // MARK: - UI Components
    private lazy var scrollView: UIScrollView = {
        let scroll = UIScrollView()
        scroll.translatesAutoresizingMaskIntoConstraints = false
        return scroll
    }()

    private lazy var contentView: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()

    private lazy var titleLabel: UILabel = {
        let label = UILabel()
        label.text = "\(displayName) Components"
        label.font = .systemFont(ofSize: 24, weight: .bold)
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    private lazy var descriptionLabel: UILabel = {
        let label = UILabel()
        label.text = "Below are various states and configurations for \(displayName.lowercased()) components."
        label.font = .systemFont(ofSize: 16)
        label.textColor = .secondaryLabel
        label.textAlignment = .center
        label.numberOfLines = 0
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    // MARK: - Initialization
    init(componentType: String, displayName: String) {
        self.componentType = componentType
        self.displayName = displayName
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupNavigation()
        setupComponentShowcase()
    }

    // MARK: - Setup
    private func setupUI() {
        view.backgroundColor = .systemBackground

        view.addSubview(scrollView)
        scrollView.addSubview(contentView)

        contentView.addSubview(titleLabel)
        contentView.addSubview(descriptionLabel)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),

            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor),
            contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor),

            titleLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 20),
            titleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            titleLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),

            descriptionLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 10),
            descriptionLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            descriptionLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20)
        ])
    }

    private func setupNavigation() {
        title = displayName
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            title: "Back",
            style: .plain,
            target: self,
            action: #selector(backButtonTapped)
        )
    }

    private func setupComponentShowcase() {
        switch componentType {
        case "Button":
            setupButtonShowcase()
        case "Text":
            setupTextShowcase()
        case "Checkbox":
            setupCheckboxShowcase()
        case "Image":
            setupImageShowcase()
        case "Rating":
            setupRatingShowcase()
        case "Stepper":
            setupStepperShowcase()
        case "Navbar":
            setupNavbarShowcase()
        case "View":
            setupViewShowcase()
        case "Row":
            setupRowShowcase()
        case "Column":
            setupColumnShowcase()
        case "Stack":
            setupStackShowcase()
        default:
            setupDefaultShowcase()
        }
    }

    // MARK: - Component Showcase Setups
    private func setupButtonShowcase() {
        let buttons = createButtonVariations()
        addComponents(buttons, title: "Button Variations")
    }

    private func setupTextShowcase() {
        let texts = createTextVariations()
        addComponents(texts, title: "Text Variations")
    }

    private func setupCheckboxShowcase() {
        let checkboxes = createCheckboxVariations()
        addComponents(checkboxes, title: "Checkbox Variations")
    }

    private func setupImageShowcase() {
        let images = createImageVariations()
        addComponents(images, title: "Image Variations")
    }

    private func setupRatingShowcase() {
        let ratings = createRatingVariations()
        addComponents(ratings, title: "Rating Variations")
    }

    private func setupStepperShowcase() {
        let steppers = createStepperVariations()
        addComponents(steppers, title: "Stepper Variations")
    }

    private func setupNavbarShowcase() {
        let navbars = createNavbarVariations()
        addComponents(navbars, title: "Navbar Variations")
    }

    private func setupViewShowcase() {
        let views = createViewVariations()
        addComponents(views, title: "View Variations")
    }

    private func setupRowShowcase() {
        let rows = createRowVariations()
        addComponents(rows, title: "Row Variations")
    }

    private func setupColumnShowcase() {
        let columns = createColumnVariations()
        addComponents(columns, title: "Column Variations")
    }

    private func setupStackShowcase() {
        let stacks = createStackVariations()
        addComponents(stacks, title: "Stack Variations")
    }

    private func setupDefaultShowcase() {
        let label = UILabel()
        label.text = "Component showcase for \(componentType) is not yet implemented."
        label.textAlignment = .center
        label.textColor = .secondaryLabel
        label.numberOfLines = 0
        label.translatesAutoresizingMaskIntoConstraints = false

        contentView.addSubview(label)
        NSLayoutConstraint.activate([
            label.topAnchor.constraint(equalTo: descriptionLabel.bottomAnchor, constant: 40),
            label.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            label.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            label.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -20)
        ])
    }

    // MARK: - Component Creation Methods
    private func createButtonVariations() -> [UIView] {
        let variations = [
            createSampleButton(title: "Primary", color: .systemBlue),
            createSampleButton(title: "Secondary", color: .systemGray),
            createSampleButton(title: "Success", color: .systemGreen),
            createSampleButton(title: "Warning", color: .systemOrange),
            createSampleButton(title: "Danger", color: .systemRed),
            createSampleButton(title: "Disabled", color: .systemGray, isEnabled: false),
            createSampleButton(title: "Large", color: .systemPurple, size: 20),
            createSampleButton(title: "Small", color: .systemTeal, size: 12)
        ]
        return variations
    }

    // MARK: - Helper Methods
    private func createUniqueComponentId() -> String {
        componentCounter += 1
        return "sample-component-\(componentCounter)"
    }

    private func createComponentStyle(title: String, color: UIColor, fontSize: CGFloat = 16, isEnabled: Bool = true) -> ViewStyle {
        let styleConfig: [String: Any?] = [
            "backgroundColor": color.toHexString(),
            "cornerRadius": 8,
            "titleColor": isEnabled ? UIColor.white.toHexString() : UIColor.lightGray.toHexString(),
            "fontSize": fontSize,
            "title": title,
            "width": 150,
            "height": 44
        ]
        return ViewStyle(Config(styleConfig))
    }

    private func createComponentProperties(isEnabled: Bool = true) -> Config {
        return Config([
            "enabled": isEnabled
        ])
    }

    private func createSampleButton(title: String, color: UIColor, size: CGFloat = 16, isEnabled: Bool = true) -> UIView {
        let componentId = createUniqueComponentId()
        let style = createComponentStyle(title: title, color: color, fontSize: size, isEnabled: isEnabled)
        let properties = createComponentProperties(isEnabled: isEnabled)
        let data = Config([:])

        let component = Component(id: componentId, type: "Button", style: style, properties: properties, data: data)
        return RenderableButton(component: component)
    }

    private func createTextVariations() -> [UIView] {
        let variations = [
            createSampleText(text: "Regular Text", fontSize: 16, color: .label),
            createSampleText(text: "Large Title", fontSize: 28, color: .label, weight: .bold),
            createSampleText(text: "Subtitle", fontSize: 22, color: .secondaryLabel, weight: .semibold),
            createSampleText(text: "Caption", fontSize: 12, color: .tertiaryLabel),
            createSampleText(text: "Centered Text", fontSize: 16, color: .label, alignment: .center),
            createSampleText(text: "Long text that wraps to multiple lines with proper formatting", fontSize: 16, color: .label, alignment: .left, lines: 0)
        ]
        return variations
    }

    private func createSampleText(text: String, fontSize: CGFloat, color: UIColor, weight: UIFont.Weight = .regular, alignment: NSTextAlignment = .left, lines: Int = 1) -> UIView {
        let componentId = createUniqueComponentId()

        let styleConfig: [String: Any?] = [
            "textColor": color.toHexString(),
            "fontSize": fontSize,
            "text": text,
            "textAlignment": alignmentToString(alignment),
            "numberOfLines": lines,
            "width": 300,
            "height": lines == 0 ? nil : fontSize + 10
        ]

        let style = ViewStyle(Config(styleConfig))
        let properties = Config([:])
        let data = Config([:])

        let component = Component(id: componentId, type: "Text", style: style, properties: properties, data: data)
        return RenderableText(component: component)
    }

    private func alignmentToString(_ alignment: NSTextAlignment) -> String {
        switch alignment {
        case .left: return "left"
        case .center: return "center"
        case .right: return "right"
        case .justified: return "justified"
        case .natural: return "natural"
        default: return "left"
        }
    }

    private func createCheckboxVariations() -> [UIView] {
        let variations = [
            createSampleCheckbox(title: "Unchecked", checked: false),
            createSampleCheckbox(title: "Checked", checked: true),
            createSampleCheckbox(title: "Disabled", checked: false, enabled: false),
            createSampleCheckbox(title: "Checked Disabled", checked: true, enabled: false)
        ]
        return variations
    }

    private func createSampleCheckbox(title: String, checked: Bool, enabled: Bool = true) -> UIView {
        let componentId = createUniqueComponentId()

        let styleConfig: [String: Any?] = [
            "backgroundColor": checked && enabled ? UIColor.systemBlue.toHexString() : UIColor.clear.toHexString(),
            "borderColor": enabled ? UIColor.systemBlue.toHexString() : UIColor.systemGray.toHexString(),
            "borderWidth": 2,
            "cornerRadius": 4,
            "width": 24,
            "height": 24
        ]

        let propertiesConfig: [String: Any?] = [
            "checked": checked,
            "disabled": !enabled
        ]

        let style = ViewStyle(Config(styleConfig))
        let properties = Config(propertiesConfig)
        let data = Config([:])

        let component = Component(id: componentId, type: "Checkbox", style: style, properties: properties, data: data)
        return RenderableCheckbox(component: component)
    }

    private func createImageVariations() -> [UIView] {
        let variations = [
            createSampleImage(size: 100, cornerRadius: 0),
            createSampleImage(size: 100, cornerRadius: 10),
            createSampleImage(size: 100, cornerRadius: 50),
            createSampleImage(size: 150, cornerRadius: 20)
        ]
        return variations
    }

    private func createSampleImage(size: CGFloat, cornerRadius: CGFloat) -> UIView {
        let componentId = createUniqueComponentId()

        let styleConfig: [String: Any?] = [
            "backgroundColor": UIColor.systemGray.toHexString(),
            "cornerRadius": cornerRadius,
            "width": size,
            "height": size
        ]

        let style = ViewStyle(Config(styleConfig))
        let properties = Config([:])
        let data = Config([:])

        let component = Component(id: componentId, type: "Image", style: style, properties: properties, data: data)
        return RenderableImage(component: component)
    }

    private func createRatingVariations() -> [UIView] {
        let variations = [
            createSampleRating(value: 0),
            createSampleRating(value: 2.5),
            createSampleRating(value: 5),
            createSampleRating(value: 3)
        ]
        return variations
    }

    private func createSampleRating(value: Double) -> UIView {
        let componentId = createUniqueComponentId()

        let styleConfig: [String: Any?] = [
            "textColor": UIColor.systemOrange.toHexString(),
            "fontSize": 16,
            "width": 200,
            "height": 30
        ]

        let propertiesConfig: [String: Any?] = [
            "value": value,
            "maxValue": 5
        ]

        let style = ViewStyle(Config(styleConfig))
        let properties = Config(propertiesConfig)
        let data = Config([:])

        let component = Component(id: componentId, type: "Rating", style: style, properties: properties, data: data)
        return RenderableRating(component: component)
    }

    private func createStepperVariations() -> [UIView] {
        let variations = [
            createSampleStepper(value: 0, minimum: 0, maximum: 10),
            createSampleStepper(value: 5, minimum: 0, maximum: 100),
            createSampleStepper(value: -5, minimum: -10, maximum: 10)
        ]
        return variations
    }

    private func createSampleStepper(value: Double, minimum: Double, maximum: Double) -> UIView {
        let componentId = createUniqueComponentId()

        let styleConfig: [String: Any?] = [
            "textColor": UIColor.systemBlue.toHexString(),
            "fontSize": 16,
            "width": 150,
            "height": 30
        ]

        let propertiesConfig: [String: Any?] = [
            "value": value,
            "minimumValue": minimum,
            "maximumValue": maximum
        ]

        let style = ViewStyle(Config(styleConfig))
        let properties = Config(propertiesConfig)
        let data = Config([:])

        let component = Component(id: componentId, type: "Stepper", style: style, properties: properties, data: data)
        return RenderableStepper(component: component)
    }

    private func createNavbarVariations() -> [UIView] {
        let variations = [
            createSampleNavbar(title: "Simple Navbar"),
            createSampleNavbar(title: "Navbar with Back Button"),
            createSampleNavbar(title: "Navbar with Actions")
        ]
        return variations
    }

    private func createSampleNavbar(title: String) -> UIView {
        let componentId = createUniqueComponentId()

        let styleConfig: [String: Any?] = [
            "backgroundColor": UIColor.systemBackground.toHexString(),
            "borderColor": UIColor.systemGray.toHexString(),
            "borderWidth": 1,
            "title": title,
            "titleColor": UIColor.label.toHexString(),
            "fontSize": 17,
            "width": 375,
            "height": 44
        ]

        let style = ViewStyle(Config(styleConfig))
        let properties = Config([:])
        let data = Config([:])

        let component = Component(id: componentId, type: "Navbar", style: style, properties: properties, data: data)
        return RenderableNavbar(component: component, context: RendererContext(viewController: nil, navigationController: nil, window: nil, scenario: nil))
    }

    private func createViewVariations() -> [UIView] {
        let variations = [
            createSampleView(color: .systemBlue, cornerRadius: 0),
            createSampleView(color: .systemGreen, cornerRadius: 10),
            createSampleView(color: .systemOrange, cornerRadius: 20),
            createSampleView(color: .systemPurple, cornerRadius: 50)
        ]
        return variations
    }

    private func createSampleView(color: UIColor, cornerRadius: CGFloat) -> UIView {
        let componentId = createUniqueComponentId()

        let styleConfig: [String: Any?] = [
            "backgroundColor": color.toHexString(),
            "cornerRadius": cornerRadius,
            "width": 100,
            "height": 100
        ]

        let style = ViewStyle(Config(styleConfig))
        let properties = Config([:])
        let data = Config([:])

        let component = Component(id: componentId, type: "View", style: style, properties: properties, data: data)
        return RenderableView(component: component)
    }

    private func createRowVariations() -> [UIView] {
        let variations = [
            createSampleRow(colors: [.systemBlue, .systemGreen]),
            createSampleRow(colors: [.systemOrange, .systemPurple, .systemPink])
        ]
        return variations
    }

    private func createSampleRow(colors: [UIColor]) -> UIView {
        let componentId = createUniqueComponentId()

        let styleConfig: [String: Any?] = [
            "direction": "row",
            "contentAlignment": "flexStart",
            "alignItems": "stretch",
            "width": 300,
            "height": 60
        ]

        let style = ViewStyle(Config(styleConfig))
        let properties = Config([:])
        let data = Config([:])

        let component = Component(id: componentId, type: "Row", style: style, properties: properties, data: data)

        // Create child components for the row
        var children: [Component] = []
        for (index, color) in colors.enumerated() {
            let childId = "\(componentId)-child-\(index)"
            let childStyleConfig: [String: Any?] = [
                "backgroundColor": color.toHexString(),
                "cornerRadius": 8,
                "flex": 1,
                "height": 50
            ]
            let childStyle = ViewStyle(Config(childStyleConfig))
            let childProperties = Config([:])
            let childData = Config([:])

            let childComponent = Component(id: childId, type: "View", style: childStyle, properties: childProperties, data: childData)
            children.append(childComponent)
        }

        // Add children to the component (this would normally be done through the JSON parsing)
        // For demo purposes, we'll create a container view and add the children manually
        let containerView = UIView()
        containerView.translatesAutoresizingMaskIntoConstraints = false

        let stackView = UIStackView()
        stackView.axis = .horizontal
        stackView.spacing = 8
        stackView.distribution = .fillEqually
        stackView.translatesAutoresizingMaskIntoConstraints = false

        for color in colors {
            let view = UIView()
            view.backgroundColor = color
            view.layer.cornerRadius = 8
            view.heightAnchor.constraint(equalToConstant: 50).isActive = true
            stackView.addArrangedSubview(view)
        }

        containerView.addSubview(stackView)

        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: containerView.topAnchor),
            stackView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            stackView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            stackView.bottomAnchor.constraint(equalTo: containerView.bottomAnchor)
        ])

        return containerView
    }

    private func createColumnVariations() -> [UIView] {
        let variations = [
            createSampleColumn(colors: [.systemTeal, .systemIndigo]),
            createSampleColumn(colors: [.systemYellow, .systemRed, .systemBrown])
        ]
        return variations
    }

    private func createSampleColumn(colors: [UIColor]) -> UIView {
        let componentId = createUniqueComponentId()

        let styleConfig: [String: Any?] = [
            "direction": "column",
            "contentAlignment": "flexStart",
            "alignItems": "stretch",
            "width": 300,
            "height": 150
        ]

        let style = ViewStyle(Config(styleConfig))
        let properties = Config([:])
        let data = Config([:])

        let component = Component(id: componentId, type: "Column", style: style, properties: properties, data: data)

        // Create container view with vertical stack
        let containerView = UIView()
        containerView.translatesAutoresizingMaskIntoConstraints = false

        let stackView = UIStackView()
        stackView.axis = .vertical
        stackView.spacing = 8
        stackView.distribution = .fillEqually
        stackView.translatesAutoresizingMaskIntoConstraints = false

        for color in colors {
            let view = UIView()
            view.backgroundColor = color
            view.layer.cornerRadius = 8
            view.heightAnchor.constraint(equalToConstant: 40).isActive = true
            stackView.addArrangedSubview(view)
        }

        containerView.addSubview(stackView)

        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: containerView.topAnchor),
            stackView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            stackView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            stackView.bottomAnchor.constraint(equalTo: containerView.bottomAnchor)
        ])

        return containerView
    }

    private func createStackVariations() -> [UIView] {
        let variations = [
            createSampleStack(colors: [.systemMint, .systemCyan]),
            createSampleStack(colors: [.systemGray, .systemGray2, .systemGray3])
        ]
        return variations
    }

    private func createSampleStack(colors: [UIColor]) -> UIView {
        let componentId = createUniqueComponentId()

        let styleConfig: [String: Any?] = [
            "direction": "column",
            "contentAlignment": "flexStart",
            "alignItems": "stretch",
            "width": 300,
            "height": 150
        ]

        let style = ViewStyle(Config(styleConfig))
        let properties = Config([:])
        let data = Config([:])

        let component = Component(id: componentId, type: "Stack", style: style, properties: properties, data: data)

        // Create container view with vertical stack
        let containerView = UIView()
        containerView.translatesAutoresizingMaskIntoConstraints = false

        let stackView = UIStackView()
        stackView.axis = .vertical
        stackView.spacing = 8
        stackView.translatesAutoresizingMaskIntoConstraints = false

        for color in colors {
            let view = UIView()
            view.backgroundColor = color
            view.layer.cornerRadius = 8
            view.heightAnchor.constraint(equalToConstant: 40).isActive = true
            stackView.addArrangedSubview(view)
        }

        containerView.addSubview(stackView)

        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: containerView.topAnchor),
            stackView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor),
            stackView.trailingAnchor.constraint(equalTo: containerView.trailingAnchor),
            stackView.bottomAnchor.constraint(equalTo: containerView.bottomAnchor)
        ])

        return containerView
    }


    // MARK: - Helper Method
    private func addComponents(_ components: [UIView], title: String) {
        let sectionTitle = UILabel()
        sectionTitle.text = title
        sectionTitle.font = .systemFont(ofSize: 20, weight: .semibold)
        sectionTitle.textColor = .label
        sectionTitle.translatesAutoresizingMaskIntoConstraints = false

        contentView.addSubview(sectionTitle)

        let stackView = UIStackView(arrangedSubviews: components)
        stackView.axis = .vertical
        stackView.spacing = 16
        stackView.translatesAutoresizingMaskIntoConstraints = false

        contentView.addSubview(stackView)

        // Layout constraints
        let previousBottom = contentView.subviews.count > 2 ? contentView.subviews[contentView.subviews.count - 3] : descriptionLabel

        NSLayoutConstraint.activate([
            sectionTitle.topAnchor.constraint(equalTo: previousBottom.bottomAnchor, constant: 40),
            sectionTitle.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            sectionTitle.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),

            stackView.topAnchor.constraint(equalTo: sectionTitle.bottomAnchor, constant: 20),
            stackView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            stackView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            stackView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -20)
        ])
    }

    // MARK: - Actions
    @objc private func backButtonTapped() {
        navigationController?.popViewController(animated: true)
    }
}
