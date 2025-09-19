import UIKit

// MARK: - MainViewDelegate Protocol
protocol MainViewDelegate: AnyObject {
    func mainViewDidTapFetchButton(_ mainView: MainView)
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
        
        setupFetchButton()
        setupActivityIndicator()
    }
    
    private func setupFetchButton() {
        addSubview(fetchButton)
        fetchButton.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            fetchButton.centerXAnchor.constraint(equalTo: centerXAnchor),
            fetchButton.bottomAnchor.constraint(equalTo: safeAreaLayoutGuide.bottomAnchor, constant: -20),
            fetchButton.widthAnchor.constraint(equalToConstant: 150),
            fetchButton.heightAnchor.constraint(equalToConstant: 50)
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
        
        // Position content above the button
        content.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            content.topAnchor.constraint(equalTo: safeAreaLayoutGuide.topAnchor, constant: 20),
            content.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 20),
            content.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -20),
            content.bottomAnchor.constraint(equalTo: fetchButton.topAnchor, constant: -20)
        ])
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
