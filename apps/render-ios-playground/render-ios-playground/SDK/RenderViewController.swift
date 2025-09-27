import UIKit
import FlexLayout

public protocol Action {}

public protocol RenderViewControllerDelegate: AnyObject {
    func didTrigger(action: Action, from viewController: RenderViewController)
}

public class RenderViewController: UIViewController, ScenarioObserver {
    weak public var delegate: RenderViewControllerDelegate?
    
    let scenarioKey: String
    private var scenario: Scenario?
    private let repository = DIContainer.shared.scenarioRepository
    private let service = DIContainer.shared.scenarioService
    private let registry = DIContainer.shared.componentRegistry
    
    // Root flex container
    private let rootFlexContainer = UIView()

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
        setupFlexContainer()
        
        if let scenario = scenario {
            buildViewHierarchy(from: scenario.mainComponent)
        } else {
            print("ERROR: Scenario not found!!!")
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
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.scenario = scenario
            self.buildViewHierarchy(from: scenario.mainComponent)
        }
    }

    private func setupFlexContainer() {
        view.addSubview(rootFlexContainer)
        rootFlexContainer.flex
            .direction(.column)
            .justifyContent(.start)
            .alignItems(.start)
    }

    private func buildViewHierarchy(from component: Component) {
        rootFlexContainer.subviews.forEach { $0.removeFromSuperview() }
        
        rootFlexContainer.flex.define { flex in
            if let view = buildView(from: component) {
                flex.addItem(view)
            }
        }
        
        // Force layout update after rebuilding the hierarchy
        rootFlexContainer.setNeedsLayout()
        rootFlexContainer.layoutIfNeeded()
        
        // Ensure the parent view also updates its layout
        view.setNeedsLayout()
        view.layoutIfNeeded()
    }

    private func buildView(from component: Component) -> UIView? {
        guard let renderer = registry.renderer(for: component.type) else {
            // Check if this component type is defined in the components section
            if let scenario = scenario,
               let componentDefinition = scenario.components[component.type] {
                return buildView(from: expandComponentDefinition(componentDefinition, withData: component.data))
            }

            print("Warning: No renderer found for type '\(component.type)' and no component definition found")
            return nil
        }

        let context = RendererContext(
            viewController: self,
            navigationController: navigationController,
            window: view.window,
            scenario: scenario
        )
        
        guard let view = renderer.render(component: component, context: context) else {
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

    private func expandComponentDefinition(_ componentDefinition: Component, withData data: Config) -> Component {
        // Create a new component with merged properties and data
        let mergedProperties = mergeDataIntoProperties(componentDefinition.properties, data: data)

        let expandedComponent = Component(
            id: componentDefinition.id,
            type: componentDefinition.type,
            style: componentDefinition.style,
            properties: mergedProperties,
            data: Config()
        )

        // Recursively expand children with data substitution
        for child in componentDefinition.getChildren() {
            let expandedChild = expandComponentDefinition(child, withData: data)
            try? expandedComponent.addChild(expandedChild)
        }

        return expandedComponent
    }

    private func mergeDataIntoProperties(_ originalProperties: Config, data: Config) -> Config {
        var mergedDict = originalProperties.getRawDictionary()

        // Merge data values into properties where properties have null values
        let dataDict = data.getRawDictionary()
        for (key, dataValue) in dataDict {
            if let currentValue = mergedDict[key],
               currentValue == nil || (currentValue as? String == "" || currentValue as? String == "null") {
                mergedDict[key] = dataValue
            }
        }

        return Config(mergedDict)
    }
}
