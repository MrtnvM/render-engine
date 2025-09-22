import UIKit

// MARK: - AvitoDesignSystemShowcase
/// A comprehensive showcase of the Avito Design System components
public class AvitoDesignSystemShowcase: UIViewController {
    
    // MARK: - UI Components
    private let scrollView = UIScrollView()
    private let contentView = UIView()
    private let headerLabel = UILabel()
    private let descriptionLabel = UILabel()
    
    // MARK: - Interactive Examples
    private let interactiveSection = UIView()
    private let interactiveLabel = UILabel()
    private let primaryActionsView = UIView()
    private let secondaryActionsView = UIView()
    private let ghostActionsView = UIView()
    
    // MARK: - Special States Section
    private let specialStatesSection = UIView()
    private let specialStatesLabel = UILabel()
    private let roundButtonsView = UIView()
    private let overlayButtonsView = UIView()
    
    // MARK: - Complete Matrix Section
    private let matrixSection = UIView()
    private let matrixLabel = UILabel()
    private let matrixScrollView = UIScrollView()
    private let matrixContentView = UIView()
    
    // MARK: - State
    private var clickedButtonTitle: String?
    
    // MARK: - Lifecycle
    public override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        setupConstraints()
        populateShowcase()
    }
    
    // MARK: - Setup
    private func setupUI() {
        view.backgroundColor = .systemBackground
        title = "Avito Design System"
        
        setupScrollView()
        setupHeader()
        setupInteractiveSection()
        setupSpecialStatesSection()
        setupMatrixSection()
    }
    
    private func setupScrollView() {
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        contentView.translatesAutoresizingMaskIntoConstraints = false
        
        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
    }
    
    private func setupHeader() {
        headerLabel.text = "💎 Avito Design System"
        headerLabel.font = UIFont.systemFont(ofSize: 24, weight: .bold)
        headerLabel.textColor = UIColor(red: 0.5, green: 0.0, blue: 0.8, alpha: 1.0)
        
        descriptionLabel.text = "Comprehensive showcase of button components with all variants, sizes, and states"
        descriptionLabel.font = UIFont.systemFont(ofSize: 16, weight: .regular)
        descriptionLabel.textColor = .systemGray
        descriptionLabel.numberOfLines = 0
        
        [headerLabel, descriptionLabel].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
            contentView.addSubview($0)
        }
    }
    
    private func setupInteractiveSection() {
        interactiveLabel.text = "Interactive Examples"
        interactiveLabel.font = UIFont.systemFont(ofSize: 18, weight: .semibold)
        interactiveLabel.textColor = .label
        
        [interactiveSection, interactiveLabel, primaryActionsView, secondaryActionsView, ghostActionsView].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
        }
        
        contentView.addSubview(interactiveSection)
        interactiveSection.addSubview(interactiveLabel)
        interactiveSection.addSubview(primaryActionsView)
        interactiveSection.addSubview(secondaryActionsView)
        interactiveSection.addSubview(ghostActionsView)
        
        setupActionView(primaryActionsView, title: "Primary Actions")
        setupActionView(secondaryActionsView, title: "Secondary Actions")
        setupActionView(ghostActionsView, title: "Ghost & Disabled")
    }
    
    private func setupActionView(_ containerView: UIView, title: String) {
        containerView.layer.borderWidth = 1
        containerView.layer.borderColor = UIColor.systemGray4.cgColor
        containerView.layer.cornerRadius = 8
        containerView.backgroundColor = .systemBackground
        
        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        titleLabel.textColor = .systemGray
        
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(titleLabel)
        
        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 16),
            titleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            titleLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16)
        ])
    }
    
    private func setupSpecialStatesSection() {
        specialStatesLabel.text = "Special States & Presets"
        specialStatesLabel.font = UIFont.systemFont(ofSize: 18, weight: .semibold)
        specialStatesLabel.textColor = .label
        
        [specialStatesSection, specialStatesLabel, roundButtonsView, overlayButtonsView].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
        }
        
        contentView.addSubview(specialStatesSection)
        specialStatesSection.addSubview(specialStatesLabel)
        specialStatesSection.addSubview(roundButtonsView)
        specialStatesSection.addSubview(overlayButtonsView)
        
        setupSpecialView(roundButtonsView, title: "Round Buttons")
        setupSpecialView(overlayButtonsView, title: "Overlay Preset")
    }
    
    private func setupSpecialView(_ containerView: UIView, title: String) {
        containerView.layer.borderWidth = 1
        containerView.layer.borderColor = UIColor.systemGray4.cgColor
        containerView.layer.cornerRadius = 8
        containerView.backgroundColor = .systemBackground
        
        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        titleLabel.textColor = .systemGray
        
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(titleLabel)
        
        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 16),
            titleLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            titleLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16)
        ])
    }
    
    private func setupMatrixSection() {
        matrixLabel.text = "Complete Size & Variant Matrix"
        matrixLabel.font = UIFont.systemFont(ofSize: 18, weight: .semibold)
        matrixLabel.textColor = .label
        
        matrixScrollView.translatesAutoresizingMaskIntoConstraints = false
        matrixContentView.translatesAutoresizingMaskIntoConstraints = false
        
        [matrixSection, matrixLabel, matrixScrollView, matrixContentView].forEach {
            $0.translatesAutoresizingMaskIntoConstraints = false
        }
        
        contentView.addSubview(matrixSection)
        matrixSection.addSubview(matrixLabel)
        matrixSection.addSubview(matrixScrollView)
        matrixScrollView.addSubview(matrixContentView)
        
        matrixSection.layer.borderWidth = 2
        matrixSection.layer.borderColor = UIColor.purple.withAlphaComponent(0.4).cgColor
        matrixSection.layer.cornerRadius = 8
        matrixSection.backgroundColor = .systemBackground
    }
    
    private func setupConstraints() {
        NSLayoutConstraint.activate([
            // ScrollView
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            
            // ContentView
            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor),
            contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor),
            
            // Header
            headerLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 32),
            headerLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 32),
            headerLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -32),
            
            descriptionLabel.topAnchor.constraint(equalTo: headerLabel.bottomAnchor, constant: 8),
            descriptionLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 32),
            descriptionLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -32),
            
            // Interactive Section
            interactiveSection.topAnchor.constraint(equalTo: descriptionLabel.bottomAnchor, constant: 32),
            interactiveSection.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 32),
            interactiveSection.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -32),
            
            interactiveLabel.topAnchor.constraint(equalTo: interactiveSection.topAnchor),
            interactiveLabel.leadingAnchor.constraint(equalTo: interactiveSection.leadingAnchor),
            interactiveLabel.trailingAnchor.constraint(equalTo: interactiveSection.trailingAnchor),
            
            // Action Views
            primaryActionsView.topAnchor.constraint(equalTo: interactiveLabel.bottomAnchor, constant: 16),
            primaryActionsView.leadingAnchor.constraint(equalTo: interactiveSection.leadingAnchor),
            primaryActionsView.trailingAnchor.constraint(equalTo: interactiveSection.trailingAnchor),
            primaryActionsView.heightAnchor.constraint(equalToConstant: 120),
            
            secondaryActionsView.topAnchor.constraint(equalTo: primaryActionsView.bottomAnchor, constant: 16),
            secondaryActionsView.leadingAnchor.constraint(equalTo: interactiveSection.leadingAnchor),
            secondaryActionsView.trailingAnchor.constraint(equalTo: interactiveSection.trailingAnchor),
            secondaryActionsView.heightAnchor.constraint(equalToConstant: 120),
            
            ghostActionsView.topAnchor.constraint(equalTo: secondaryActionsView.bottomAnchor, constant: 16),
            ghostActionsView.leadingAnchor.constraint(equalTo: interactiveSection.leadingAnchor),
            ghostActionsView.trailingAnchor.constraint(equalTo: interactiveSection.trailingAnchor),
            ghostActionsView.bottomAnchor.constraint(equalTo: interactiveSection.bottomAnchor),
            ghostActionsView.heightAnchor.constraint(equalToConstant: 120),
            
            // Special States Section
            specialStatesSection.topAnchor.constraint(equalTo: interactiveSection.bottomAnchor, constant: 32),
            specialStatesSection.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 32),
            specialStatesSection.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -32),
            
            specialStatesLabel.topAnchor.constraint(equalTo: specialStatesSection.topAnchor),
            specialStatesLabel.leadingAnchor.constraint(equalTo: specialStatesSection.leadingAnchor),
            specialStatesLabel.trailingAnchor.constraint(equalTo: specialStatesSection.trailingAnchor),
            
            roundButtonsView.topAnchor.constraint(equalTo: specialStatesLabel.bottomAnchor, constant: 16),
            roundButtonsView.leadingAnchor.constraint(equalTo: specialStatesSection.leadingAnchor),
            roundButtonsView.trailingAnchor.constraint(equalTo: specialStatesSection.trailingAnchor),
            roundButtonsView.heightAnchor.constraint(equalToConstant: 120),
            
            overlayButtonsView.topAnchor.constraint(equalTo: roundButtonsView.bottomAnchor, constant: 16),
            overlayButtonsView.leadingAnchor.constraint(equalTo: specialStatesSection.leadingAnchor),
            overlayButtonsView.trailingAnchor.constraint(equalTo: specialStatesSection.trailingAnchor),
            overlayButtonsView.bottomAnchor.constraint(equalTo: specialStatesSection.bottomAnchor),
            overlayButtonsView.heightAnchor.constraint(equalToConstant: 120),
            
            // Matrix Section
            matrixSection.topAnchor.constraint(equalTo: specialStatesSection.bottomAnchor, constant: 32),
            matrixSection.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 32),
            matrixSection.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -32),
            matrixSection.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -32),
            
            matrixLabel.topAnchor.constraint(equalTo: matrixSection.topAnchor, constant: 24),
            matrixLabel.leadingAnchor.constraint(equalTo: matrixSection.leadingAnchor, constant: 24),
            matrixLabel.trailingAnchor.constraint(equalTo: matrixSection.trailingAnchor, constant: -24),
            
            matrixScrollView.topAnchor.constraint(equalTo: matrixLabel.bottomAnchor, constant: 24),
            matrixScrollView.leadingAnchor.constraint(equalTo: matrixSection.leadingAnchor, constant: 24),
            matrixScrollView.trailingAnchor.constraint(equalTo: matrixSection.trailingAnchor, constant: -24),
            matrixScrollView.bottomAnchor.constraint(equalTo: matrixSection.bottomAnchor, constant: -24),
            
            matrixContentView.topAnchor.constraint(equalTo: matrixScrollView.topAnchor),
            matrixContentView.leadingAnchor.constraint(equalTo: matrixScrollView.leadingAnchor),
            matrixContentView.trailingAnchor.constraint(equalTo: matrixScrollView.trailingAnchor),
            matrixContentView.bottomAnchor.constraint(equalTo: matrixScrollView.bottomAnchor),
            matrixContentView.widthAnchor.constraint(equalTo: matrixScrollView.widthAnchor)
        ])
    }
    
    // MARK: - Populate Showcase
    private func populateShowcase() {
        populateInteractiveExamples()
        populateSpecialStates()
        populateMatrix()
    }
    
    private func populateInteractiveExamples() {
        // Primary Actions
        let primaryDefault = AvitoButton(
            variant: .primary,
            color: .default,
            size: .m,
            title: "Primary Default"
        ) { [weak self] in
            self?.handleButtonClick("Primary Default")
        }
        
        let primaryAccent = AvitoButton(
            variant: .primary,
            color: .accent,
            size: .m,
            title: "Primary Accent"
        ) { [weak self] in
            self?.handleButtonClick("Primary Accent")
        }
        
        addButtonsToContainer([primaryDefault, primaryAccent], to: primaryActionsView)
        
        // Secondary Actions
        let secondaryDefault = AvitoButton(
            variant: .secondary,
            color: .default,
            size: .m,
            title: "Secondary Default"
        ) { [weak self] in
            self?.handleButtonClick("Secondary Default")
        }
        
        let secondarySuccess = AvitoButton(
            variant: .secondary,
            color: .success,
            size: .m,
            title: "Secondary Success"
        ) { [weak self] in
            self?.handleButtonClick("Secondary Success")
        }
        
        addButtonsToContainer([secondaryDefault, secondarySuccess], to: secondaryActionsView)
        
        // Ghost & Disabled
        let ghostDefault = AvitoButton(
            variant: .ghost,
            color: .default,
            size: .m,
            title: "Ghost Button"
        ) { [weak self] in
            self?.handleButtonClick("Ghost Button")
        }
        
        let disabledButton = AvitoButton(
            variant: .primary,
            color: .default,
            size: .m,
            title: "Disabled Button"
        )
        disabledButton.updateConfiguration(AvitoButtonConfiguration(
            variant: .primary,
            color: .default,
            size: .m,
            state: .disabled
        ))
        
        addButtonsToContainer([ghostDefault, disabledButton], to: ghostActionsView)
    }
    
    private func populateSpecialStates() {
        // Round Buttons
        let roundS = AvitoButton(
            variant: .primary,
            color: .accent,
            size: .s,
            isRound: true,
            title: "Round S"
        )
        
        let roundM = AvitoButton(
            variant: .primary,
            color: .pay,
            size: .m,
            isRound: true,
            title: "Round M"
        )
        
        let roundL = AvitoButton(
            variant: .secondary,
            color: .success,
            size: .l,
            isRound: true,
            title: "Round L"
        )
        
        addButtonsToContainer([roundS, roundM, roundL], to: roundButtonsView)
        
        // Overlay Buttons
        let overlayS = AvitoButton(
            config: AvitoButtonConfiguration(
                variant: .primary,
                color: .default,
                size: .s,
                preset: .overlay
            ),
            title: "Overlay S"
        )
        
        let overlayM = AvitoButton(
            config: AvitoButtonConfiguration(
                variant: .secondary,
                color: .accent,
                size: .m,
                preset: .overlay
            ),
            title: "Overlay M"
        )
        
        let overlayDisabled = AvitoButton(
            config: AvitoButtonConfiguration(
                variant: .primary,
                color: .default,
                size: .s,
                state: .disabled,
                preset: .overlay
            ),
            title: "Disabled"
        )
        
        addButtonsToContainer([overlayS, overlayM, overlayDisabled], to: overlayButtonsView)
    }
    
    private func populateMatrix() {
        let sizes: [AvitoButtonSize] = [.m, .xl, .l, .s, .xs]
        let variantTypes: [(String, [AvitoButton])] = [
            ("Default", [
                AvitoButton(variant: .secondary, color: .default, size: .m, title: "Текст"),
                AvitoButton(variant: .primary, color: .default, size: .m, title: "Текст")
            ]),
            ("Accent", [
                AvitoButton(variant: .primary, color: .accent, size: .m, title: "Текст"),
                AvitoButton(variant: .secondary, color: .accent, size: .m, title: "Текст")
            ]),
            ("Pay", [
                AvitoButton(variant: .primary, color: .pay, size: .m, title: "Текст"),
                AvitoButton(variant: .secondary, color: .pay, size: .m, title: "Текст")
            ]),
            ("Success", [
                AvitoButton(variant: .primary, color: .success, size: .m, title: "Текст"),
                AvitoButton(variant: .secondary, color: .success, size: .m, title: "Текст")
            ]),
            ("Danger", [
                AvitoButton(variant: .primary, color: .danger, size: .m, title: "Текст"),
                AvitoButton(variant: .secondary, color: .danger, size: .m, title: "Текст")
            ]),
            ("Ghost", [
                AvitoButton(variant: .ghost, color: .default, size: .m, title: "Текст")
            ])
        ]
        
        var previousView: UIView?
        
        // Add size labels
        for size in sizes {
            let sizeLabel = UILabel()
            sizeLabel.text = size.displayName
            sizeLabel.font = UIFont.systemFont(ofSize: 14, weight: .medium)
            sizeLabel.textColor = .label
            sizeLabel.textAlignment = .center
            
            sizeLabel.translatesAutoresizingMaskIntoConstraints = false
            matrixContentView.addSubview(sizeLabel)
            
            NSLayoutConstraint.activate([
                sizeLabel.widthAnchor.constraint(equalToConstant: 80),
                sizeLabel.heightAnchor.constraint(equalToConstant: 44)
            ])
            
            if let previous = previousView {
                sizeLabel.topAnchor.constraint(equalTo: previous.bottomAnchor, constant: 12).isActive = true
            } else {
                sizeLabel.topAnchor.constraint(equalTo: matrixContentView.topAnchor).isActive = true
            }
            
            previousView = sizeLabel
        }
        
        // Add variant columns
        var columnViews: [UIView] = []
        for (title, buttons) in variantTypes {
            let columnView = createVariantColumn(title: title, buttons: buttons, sizes: sizes)
            columnViews.append(columnView)
        }
        
        // Layout columns horizontally
        var previousColumn: UIView?
        for (index, columnView) in columnViews.enumerated() {
            columnView.translatesAutoresizingMaskIntoConstraints = false
            matrixContentView.addSubview(columnView)
            
            NSLayoutConstraint.activate([
                columnView.widthAnchor.constraint(equalToConstant: 200),
                columnView.topAnchor.constraint(equalTo: matrixContentView.topAnchor)
            ])
            
            if let previous = previousColumn {
                columnView.leadingAnchor.constraint(equalTo: previous.trailingAnchor, constant: 32).isActive = true
            } else {
                columnView.leadingAnchor.constraint(equalTo: matrixContentView.leadingAnchor, constant: 80).isActive = true
            }
            
            if index == columnViews.count - 1 {
                columnView.trailingAnchor.constraint(equalTo: matrixContentView.trailingAnchor).isActive = true
            }
            
            previousColumn = columnView
        }
    }
    
    private func createVariantColumn(title: String, buttons: [AvitoButton], sizes: [AvitoButtonSize]) -> UIView {
        let columnView = UIView()
        
        let titleLabel = UILabel()
        titleLabel.text = title
        titleLabel.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        titleLabel.textColor = .label
        titleLabel.textAlignment = .center
        
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        columnView.addSubview(titleLabel)
        
        NSLayoutConstraint.activate([
            titleLabel.topAnchor.constraint(equalTo: columnView.topAnchor),
            titleLabel.leadingAnchor.constraint(equalTo: columnView.leadingAnchor),
            titleLabel.trailingAnchor.constraint(equalTo: columnView.trailingAnchor),
            titleLabel.heightAnchor.constraint(equalToConstant: 44)
        ])
        
        var previousButton: UIView = titleLabel
        
        for size in sizes {
            let buttonStack = UIStackView(arrangedSubviews: buttons.map { button in
                let sizedButton = AvitoButton(
                    variant: button.config.variant,
                    color: button.config.color,
                    size: size,
                    title: "Текст"
                )
                return sizedButton
            })
            
            buttonStack.axis = .horizontal
            buttonStack.distribution = .fillEqually
            buttonStack.spacing = 16
            
            buttonStack.translatesAutoresizingMaskIntoConstraints = false
            columnView.addSubview(buttonStack)
            
            NSLayoutConstraint.activate([
                buttonStack.topAnchor.constraint(equalTo: previousButton.bottomAnchor, constant: 12),
                buttonStack.leadingAnchor.constraint(equalTo: columnView.leadingAnchor),
                buttonStack.trailingAnchor.constraint(equalTo: columnView.trailingAnchor),
                buttonStack.heightAnchor.constraint(equalToConstant: 44)
            ])
            
            previousButton = buttonStack
        }
        
        return columnView
    }
    
    private func addButtonsToContainer(_ buttons: [AvitoButton], to container: UIView) {
        let stackView = UIStackView(arrangedSubviews: buttons)
        stackView.axis = .vertical
        stackView.spacing = 8
        stackView.distribution = .fillEqually
        
        stackView.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(stackView)
        
        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: container.topAnchor, constant: 48),
            stackView.leadingAnchor.constraint(equalTo: container.leadingAnchor, constant: 16),
            stackView.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -16),
            stackView.bottomAnchor.constraint(equalTo: container.bottomAnchor, constant: -16)
        ])
    }
    
    private func handleButtonClick(_ buttonTitle: String) {
        clickedButtonTitle = buttonTitle
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.clickedButtonTitle = nil
        }
        
        // Show feedback
        let alert = UIAlertController(title: "Button Clicked", message: "\(buttonTitle) was tapped!", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}
