import UIKit

// Public interface for the SDK
class Render {
    static let shared = Render()
    private let componentRegistry = DIContainer.shared.componentRegistry
    private let scenarioFetcher = DIContainer.shared.scenarioService

    private init() { }

    // Option 1: Render into an existing view
    func render(scenarioID: String, inside vc: UIViewController, into view: UIView? = nil) {
    }

    // Option 2: Create and return a new view controller
    func getViewController(forScenarioID id: String) -> RenderViewController {
        let vc = RenderViewController(
            scenarioID: id,
            service: scenarioFetcher,
            registry: componentRegistry
        )
        return vc
    }
}
