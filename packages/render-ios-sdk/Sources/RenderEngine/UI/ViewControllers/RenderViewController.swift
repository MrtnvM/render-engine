import UIKit
import FlexLayout

public protocol ScenarioAction {}

public protocol RenderViewControllerDelegate: AnyObject {
    func didTrigger(action: ScenarioAction, from viewController: RenderViewController)
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

    private let rootFlexView: RootFlexView
    private let activityIndicator = UIActivityIndicatorView(style: .large)

    private let errorView = UIView()
    private let errorLabel = UILabel()
    private let reloadButton = UIButton()

    public init(scenarioKey: String, safeArea: SafeAreaOptions = .none) {
        self.scenarioKey = scenarioKey
        self.rootFlexView = RootFlexView(safeArea: safeArea)
        super.init(nibName: nil, bundle: nil)
        DIContainer.shared.currentLogger.debug("RenderViewController init with safeArea: \(safeArea)", category: "RenderViewController")
    }

    public init(scenario: Scenario, safeArea: SafeAreaOptions = .none) {
        self.scenario = scenario
        self.scenarioKey = scenario.key
        self.rootFlexView = RootFlexView(safeArea: safeArea)
        super.init(nibName: nil, bundle: nil)
        DIContainer.shared.currentLogger.debug("RenderViewController init with safeArea: \(safeArea)", category: "RenderViewController")
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

    override public func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        // Hide navigation bar for fullscreen experience
        navigationController?.setNavigationBarHidden(true, animated: animated)
    }
    
    private func setupUI() {
        view.backgroundColor = .white

        view.addSubview(rootFlexView)
        view.addSubview(activityIndicator)

        errorView.addSubview(errorLabel)
        errorView.addSubview(reloadButton)

        [rootFlexView, activityIndicator, errorView, errorLabel, reloadButton]
            .forEach { $0.translatesAutoresizingMaskIntoConstraints = false }

        // Layout rootFlexView to fill the entire view (it handles safe area internally)
        NSLayoutConstraint.activate([
            rootFlexView.topAnchor.constraint(equalTo: view.topAnchor),
            rootFlexView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            rootFlexView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            rootFlexView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])

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
