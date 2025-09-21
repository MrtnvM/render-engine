import UIKit
import FlexLayout

public protocol Action {}

public protocol RenderViewControllerDelegate: AnyObject {
    func didTrigger(action: Action, from viewController: RenderViewController)
}

public class RenderViewController: UIViewController {
    weak public var delegate: RenderViewControllerDelegate?
    
    private let scenarioID: String
    private let service: ScenarioService
    private let registry: ComponentRegistry
    
    // Root flex container
    private let rootFlexContainer = UIView()

    init(scenarioID: String, service: ScenarioService, registry: ComponentRegistry) {
        self.scenarioID = scenarioID
        self.service = service
        self.registry = registry
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override public func viewDidLoad() {
        super.viewDidLoad()
        setupFlexContainer()
        loadScenario()
    }

    override public func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()

        // Position the container to fill safe area
        rootFlexContainer.frame = CGRect(
            x: view.safeAreaInsets.left,
            y: view.safeAreaInsets.top,
            width: view.frame.width - (view.safeAreaInsets.left + view.safeAreaInsets.right),
            height: view.frame.height - (view.safeAreaInsets.top + view.safeAreaInsets.bottom)
        )

        // Let flexbox layout itself
        rootFlexContainer.flex.layout(mode: .fitContainer)
    }

    private func setupFlexContainer() {
        view.addSubview(rootFlexContainer)
        rootFlexContainer.flex
            .direction(.column)
            .justifyContent(.center)
            .alignItems(.center)
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
                flex.addItem(view).grow(1)
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
