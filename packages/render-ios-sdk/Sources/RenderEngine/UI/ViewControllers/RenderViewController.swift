import UIKit
import FlexLayout

public protocol Action {}

public protocol RenderViewControllerDelegate: AnyObject {
    func didTrigger(action: Action, from viewController: RenderViewController)
}

public class RenderViewController: UIViewController {
    weak public var delegate: RenderViewControllerDelegate?
    
    private let scenarioKey: String
    private var scenario: Scenario?
    private var repository: ScenarioRepository {
        DIContainer.shared.scenarioRepository
    }
    private var logger: Logger {
        DIContainer.shared.currentLogger
    }
    
    private let rootFlexView = RootFlexView()
    private let activityIndicator = UIActivityIndicatorView(style: .large)
    
    private let errorView = UIView()
    private let errorLabel = UILabel()
    private let reloadButton = UIButton()

    public init(scenarioKey: String) {
        self.scenarioKey = scenarioKey
        super.init(nibName: nil, bundle: nil)
    }
    
    public init(scenario: Scenario) {
        self.scenario = scenario
        scenarioKey = scenario.key
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override public func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        
        if let scenario = scenario {
            rootFlexView.scenario = scenario
        } else {
            loadScenario()
        }
    }
    
    private func setupUI() {
        view.backgroundColor = .white
        
        view.addSubview(rootFlexView)
        view.addSubview(activityIndicator)
        
        errorView.addSubview(errorLabel)
        errorView.addSubview(reloadButton)
        
        [rootFlexView, activityIndicator, errorView, errorLabel, reloadButton]
            .forEach { $0.translatesAutoresizingMaskIntoConstraints = false }
        
        errorView.isHidden = true
        errorLabel.text = "При загрузке сценария возникла ошибка"
        reloadButton.setTitle("Обновить", for: .normal)
        reloadButton.addTarget(self, action: #selector(loadScenario), for: .touchUpInside)
        
        // TODO: Layout error views
    }
    
    public override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        activityIndicator.center = view.center
    }
        
    @objc private func loadScenario() {
        rootFlexView.isHidden = true
        activityIndicator.isHidden = false
        activityIndicator.startAnimating()
        
        Task {
            do {
                let scenario = try await repository.fetchScenario(key: scenarioKey)
                
                await MainActor.run { [weak self] in
                    self?.rootFlexView.scenario = scenario
                    self?.rootFlexView.isHidden = false
                    self?.activityIndicator.stopAnimating()
                    self?.activityIndicator.isHidden = true
                }
            } catch {
                await MainActor.run { [weak self] in
                    self?.rootFlexView.isHidden = true
                    self?.activityIndicator.stopAnimating()
                    self?.activityIndicator.isHidden = true
                }
                
                logger.error(
                    "Scenario loading failed for key: \(scenarioKey)",
                    category: "RenderViewController"
                )
            }
        }
    }
}
