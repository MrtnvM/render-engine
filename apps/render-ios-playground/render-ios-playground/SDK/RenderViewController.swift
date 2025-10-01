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
    private let repository = DIContainer.shared.scenarioRepository
    private var logger = DIContainer.shared.currentLogger
    
    private let rootFlexView = RootFlexView()
    private let activityIndicator = UIActivityIndicatorView(style: .large)

    init(scenarioKey: String) {
        self.scenarioKey = scenarioKey
        super.init(nibName: nil, bundle: nil)
    }
    
    init(scenario: Scenario) {
        self.scenario = scenario
        scenarioKey = scenario.key
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override public func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        
        view.addSubview(rootFlexView)
        view.addSubview(activityIndicator)
        
        activityIndicator.flex.alignSelf(.center)
        activityIndicator.flex.layout()
        
        if let scenario = scenario {
            rootFlexView.scenario = scenario
        } else {
            loadScenario()
        }
    }
        
    private func loadScenario() {
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
