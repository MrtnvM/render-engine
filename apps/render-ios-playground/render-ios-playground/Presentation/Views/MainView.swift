import UIKit

// MARK: - MainViewDelegate Protocol
protocol MainViewDelegate: AnyObject {
    func mainViewDidTapFetchButton(_ mainView: MainView)
    func mainViewDidTapDesignSystemButton(_ mainView: MainView)
    func mainView(_ mainView: MainView, shouldPresentAlert alert: UIAlertController)
}

// MARK: - MainView Class
/// Main view component following clean architecture principles
class MainView: UIView {
    
    // MARK: - Properties
    weak var delegate: MainViewDelegate?
    
    // MARK: - UI Components
    private lazy var fetchButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("Fetch Schema", for: .normal)
        button.backgroundColor = UIColor.systemBlue
        button.setTitleColor(UIColor.white, for: .normal)
        button.layer.cornerRadius = 8
        button.addTarget(self, action: #selector(fetchButtonTapped), for: .touchUpInside)
        return button
    }()
    
    private lazy var designSystemButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("💎 Design System", for: .normal)
        button.backgroundColor = UIColor(red: 0.59, green: 0.37, blue: 0.92, alpha: 1.0) // Avito pay color
        button.setTitleColor(UIColor.white, for: .normal)
        button.layer.cornerRadius = 8
        button.addTarget(self, action: #selector(designSystemButtonTapped), for: .touchUpInside)
        return button
    }()
    
    private lazy var activityIndicator: UIActivityIndicatorView = {
        let indicator = UIActivityIndicatorView(style: .large)
        indicator.hidesWhenStopped = true
        return indicator
    }()
    
    private var contentView: UIView?
    
    // MARK: - Initialization
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupUI()
    }
    
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupUI()
    }
    
    // MARK: - UI Setup
    private func setupUI() {
        backgroundColor = UIColor.systemBackground
        
        setupButtons()
        setupActivityIndicator()
    }
    
    private func setupButtons() {
        let views = [designSystemButton, fetchButton]
        let buttonStack = UIStackView(arrangedSubviews: views)
        buttonStack.axis = .vertical
        buttonStack.spacing = 12
        buttonStack.distribution = .fillEqually

        addSubview(buttonStack)
        buttonStack.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            buttonStack.centerXAnchor.constraint(equalTo: centerXAnchor),
            buttonStack.bottomAnchor.constraint(equalTo: safeAreaLayoutGuide.bottomAnchor, constant: -20),
            buttonStack.widthAnchor.constraint(equalToConstant: 360),
            buttonStack.heightAnchor.constraint(equalToConstant: CGFloat(150.0) + CGFloat(12.0) * CGFloat(views.count))
        ])
    }
    
    private func setupActivityIndicator() {
        addSubview(activityIndicator)
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            activityIndicator.centerXAnchor.constraint(equalTo: centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: centerYAnchor)
        ])
    }
    
    // MARK: - Actions
    @objc private func fetchButtonTapped() {
        delegate?.mainViewDidTapFetchButton(self)
    }
    
    @objc private func designSystemButtonTapped() {
        delegate?.mainViewDidTapDesignSystemButton(self)
    }
    
    // MARK: - Public Methods
    func showLoading(_ isLoading: Bool) {
        fetchButton.isEnabled = !isLoading
        
        if isLoading {
            activityIndicator.startAnimating()
        } else {
            activityIndicator.stopAnimating()
        }
    }
    
    func displayContent(_ content: UIView) {
        // Remove existing content view if any
        contentView?.removeFromSuperview()

        // Set new content view
        contentView = content
        addSubview(content)

        print("📱 MainView.displayContent - MainView safeAreaInsets: \(safeAreaInsets)")
        print("📱 MainView.displayContent - MainView bounds: \(bounds)")

        // Position content above the buttons
        content.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            content.topAnchor.constraint(equalTo: safeAreaLayoutGuide.topAnchor, constant: 20),
            content.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 20),
            content.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -20),
            content.bottomAnchor.constraint(equalTo: designSystemButton.topAnchor, constant: -20)
        ])

        print("📱 MainView.displayContent - Content frame after constraints: \(content.frame)")
    }
    
    func clearContent() {
        contentView?.removeFromSuperview()
        contentView = nil
    }
    
    func showError(_ error: Error) {
        let alert = UIAlertController(
            title: "Error",
            message: error.localizedDescription,
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        
        // Also log the error
        print("Error occurred: \(error)")
        
        // Delegate to the view controller to present the alert
        delegate?.mainView(self, shouldPresentAlert: alert)
    }
}
