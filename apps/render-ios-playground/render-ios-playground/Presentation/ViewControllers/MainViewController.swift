import UIKit

/// Main view controller following clean architecture principles
class MainViewController: UIViewController {
    
    // MARK: - Dependencies
    private let schemaService = DIContainer.shared.scenarioService
    
    // MARK: - UI Components
    private var contentView: UIView?
    private lazy var fetchButton: UIButton = {
        let button = UIButton(type: .system)
        button.setTitle("Fetch Schema", for: .normal)
        button.backgroundColor = UIColor.systemBlue
        button.setTitleColor(UIColor.white, for: .normal)
        button.layer.cornerRadius = 8
        button.addTarget(self, action: #selector(fetchSchemaButtonTapped), for: .touchUpInside)
        return button
    }()
    
    private lazy var activityIndicator: UIActivityIndicatorView = {
        let indicator = UIActivityIndicatorView(style: .large)
        indicator.hidesWhenStopped = true
        return indicator
    }()
    
    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }
    
    // MARK: - UI Setup
    private func setupUI() {
        view.backgroundColor = UIColor.systemBackground
        
        setupFetchButton()
        setupActivityIndicator()
    }
    
    private func setupFetchButton() {
        view.addSubview(fetchButton)
        fetchButton.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            fetchButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            fetchButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -20),
            fetchButton.widthAnchor.constraint(equalToConstant: 150),
            fetchButton.heightAnchor.constraint(equalToConstant: 50)
        ])
    }
    
    private func setupActivityIndicator() {
        view.addSubview(activityIndicator)
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
    
    // MARK: - Actions
    @objc private func fetchSchemaButtonTapped() {
        Task {
            await fetchAndRenderSchema()
        }
    }
    
    // MARK: - Business Logic
    private func fetchAndRenderSchema() async {
        await MainActor.run {
            showLoading(true)
        }
        
        do {
            let renderedView = try await schemaService.fetchAndRenderScenario()
            
            await MainActor.run {
                showLoading(false)
                displayContent(renderedView)
            }
        } catch {
            await MainActor.run {
                showLoading(false)
                showError(error)
            }
        }
    }
    
    // MARK: - UI Updates
    private func showLoading(_ isLoading: Bool) {
        fetchButton.isEnabled = !isLoading
        
        if isLoading {
            activityIndicator.startAnimating()
        } else {
            activityIndicator.stopAnimating()
        }
    }
    
    private func displayContent(_ content: UIView) {
        // Remove existing content view if any
        contentView?.removeFromSuperview()
        
        // Set new content view
        contentView = content
        view.addSubview(content)
        
        // Position content above the button
        content.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            content.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            content.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            content.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            content.bottomAnchor.constraint(equalTo: fetchButton.topAnchor, constant: -20)
        ])
    }
    
    private func showError(_ error: Error) {
        let alert = UIAlertController(
            title: "Error",
            message: error.localizedDescription,
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
        
        // Also log the error
        print("Error occurred: \(error)")
    }
}
