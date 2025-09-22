import UIKit
import FlexLayout

public protocol Action {}

public protocol RenderViewControllerDelegate: AnyObject {
    func didTrigger(action: Action, from viewController: RenderViewController)
}

public class RenderViewController: UIViewController, ScenarioObserver {
    weak public var delegate: RenderViewControllerDelegate?
    
    let scenarioID: String
    private var scenario: Scenario?
    private let repository = DIContainer.shared.scenarioRepository
    private let service = DIContainer.shared.scenarioService
    private let registry = DIContainer.shared.componentRegistry
    
    // Root flex container
    private let rootFlexContainer = UIView()

    init(scenarioID: String) {
        self.scenarioID = scenarioID
        super.init(nibName: nil, bundle: nil)
    }
    
    init(scenario: Scenario) {
        self.scenario = scenario
        scenarioID = scenario.id
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override public func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
        setupFlexContainer()
        
        if let scenario = scenario {
            buildViewHierarchy(from: scenario.mainComponent)
        } else {
            loadScenario()
        }
    }
    
    public override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        Task {
            try? await repository.subscribeToScenario(self)
        }
    }
    
    public override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        
        Task {
            await repository.unsubscribeFromScenario(self)
        }
    }

    override public func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()

        // Position the container to fill safe area
        rootFlexContainer.frame = CGRect(
            x: 0,
            y: 0,
            width: view.frame.width,
            height: view.frame.height
        )

        // Let flexbox layout itself
        rootFlexContainer.flex.layout(mode: .fitContainer)
    }
    
    func onScenarioUpdate(scenario: Scenario) {
        Task {
            await MainActor.run {
                buildViewHierarchy(from: scenario.mainComponent)
            }
        }
    }

    private func setupFlexContainer() {
        view.addSubview(rootFlexContainer)
        rootFlexContainer.flex
            .direction(.column)
            .justifyContent(.start)
            .alignItems(.start)
    }

    private func loadScenario() {
        let url = URL(string: "https://localhost:3035/json-schema")!
        Task {
            guard let scenario = try? await service.fetchScenario(from: url) else {
                print("FAILED TO LOAD SCENARIO")
                return
            }
            
            DispatchQueue.main.async { [weak self] in
                self?.buildViewHierarchy(from: scenario.mainComponent)
            }
        }
    }

    private func buildViewHierarchy(from component: Component) {
        rootFlexContainer.flex.define { flex in
            if let view = buildView(from: component) {
                flex.addItem(view)
            }
        }
        rootFlexContainer.setNeedsLayout()
    }

    private func buildView(from component: Component) -> UIView? {
        guard let renderer = registry.renderer(for: component.type) else {
            print("Warning: No renderer found for type '\(component.type)'")
            return nil
        }

        guard let view = renderer.render(component: component) else {
            return nil
        }

        // Recursively add children
        component.getChildren().forEach { childNode in
            if let childView = buildView(from: childNode) {
                view.flex.addItem(childView)
            }
        }

        return view
    }
}
