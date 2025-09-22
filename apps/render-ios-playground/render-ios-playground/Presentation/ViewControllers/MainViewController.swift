import UIKit

/// Main view controller following clean architecture principles
class MainViewController: UIViewController {
    
    // MARK: - Dependencies
    private let schemaService = DIContainer.shared.scenarioService
    
    // MARK: - UI Components
    private var mainView: MainView!
    
    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }
    
    // MARK: - UI Setup
    private func setupUI() {
        mainView = MainView()
        mainView.delegate = self
        view = mainView
    }
    
    // MARK: - Business Logic
    private func fetchAndRenderSchema() async {
        await MainActor.run {
            mainView.showLoading(true)
        }
        
        do {
//            let url = URL(string: "http://localhost:3050/json-schema")!
//            let scenario = try await schemaService.fetchScenario(from: url)
            
            try await RenderSDK.shared.render(
                scenarioID: "1",
                vc: self,
                containerView: mainView
            )
            
            await MainActor.run {
                mainView.showLoading(false)
            }
        } catch {
            await MainActor.run {
                mainView.showLoading(false)
                mainView.showError(error)
            }
        }
    }
}

// MARK: - MainViewDelegate
extension MainViewController: MainViewDelegate {
    func mainViewDidTapFetchButton(_ mainView: MainView) {
        Task {
            await fetchAndRenderSchema()
        }
    }
    
    func mainViewDidTapDesignSystemButton(_ mainView: MainView) {
        let showcaseVC = AvitoDesignSystem.showcase()
        let navController = UINavigationController(rootViewController: showcaseVC)
        present(navController, animated: true)
    }
    
    func mainView(_ mainView: MainView, shouldPresentAlert alert: UIAlertController) {
        present(alert, animated: true)
    }
}
