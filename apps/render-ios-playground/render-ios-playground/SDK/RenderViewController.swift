import UIKit
import YogaKit

protocol RenderViewControllerDelegate: AnyObject {
    func didTrigger(action: Action, from viewController: RenderViewController)
}

public class RenderViewController: UIViewController {
    
    weak public var delegate: RenderViewControllerDelegate?
    
    private let scenarioID: String
    private let fetcher: ScenarioFetcher
    private let registry: ComponentRegistry
    
    // The root view that Yoga will manage
    private let yogaRootView = UIView()

    init(scenarioID: String, fetcher: ScenarioFetcher, registry: ComponentRegistry) {
        self.scenarioID = scenarioID
        self.fetcher = fetcher
        self.registry = registry
        super.init(nibName: nil, bundle: nil)
    }

    override public func viewDidLoad() {
        super.viewDidLoad()
        setupYogaRootView()
        loadScenario()
    }

    override public func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        // This is the key! Whenever the view's size changes (e.g., rotation),
        // we re-calculate and apply the layout for the entire hierarchy.
        yogaRootView.yoga.applyLayout(preservingOrigin: false)
    }

    private func setupYogaRootView() {
        self.view.addSubview(yogaRootView)
        yogaRootView.configureLayout { layout in
            layout.isEnabled = true
            // The root view fills the safe area of the screen
            layout.width = YGValue(self.view.bounds.width)
            layout.height = YGValue(self.view.bounds.height)
            layout.justifyContent = .center // Example default
            layout.alignItems = .center     // Example default
        }
    }

    private func loadScenario() {
        fetcher.fetch(id: scenarioID) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(let scenario):
                    self?.buildViewHierarchy(from: scenario.root)
                case .failure(let error):
                    // Show an error view
                    print("Failed to load scenario: \(error)")
                }
            }
        }
    }

    private func buildViewHierarchy(from rootNode: ComponentNode) {
        // Recursively build the views and add them to the yogaRootView
        guard let rootView = buildView(from: rootNode) else { return }
        yogaRootView.addSubview(rootView)
        
        // Trigger the initial layout pass
        yogaRootView.yoga.applyLayout(preservingOrigin: false)
    }

    private func buildView(from node: ComponentNode) -> UIView? {
        guard let renderer = registry.renderer(for: node.type) else {
            print("Warning: No renderer found for type '\(node.type)'")
            return nil
        }
        
        // 1. Renderer creates the native view
        guard let view = renderer.render(node: node, actionHandler: self) else { return nil }
        
        // 2. Recursively build children
        node.children?.forEach { childNode in
            if let childView = buildView(from: childNode) {
                view.addSubview(childView) // Add native child
            }
        }
        
        return view
    }
}

// Action Handling Conformance
extension RenderViewController: ActionHandler {
    func handle(action: Action) {
        // Forward the action to the application layer via delegate
        delegate?.didTrigger(action: action, from: self)
    }
}