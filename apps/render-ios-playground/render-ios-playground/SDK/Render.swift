import UIKit

class ComponentRegistry {
    private var renderers: [String: Renderer] = [:]

    func register(renderer: Renderer) {
        if renderers[renderer.type] != nil {
            throw DomainError.renderingError("Renderer already registered for type: \(renderer.type)")
        }

        renderers[renderer.type] = renderer
    }

    func getRenderer(forType type: String) -> Renderer? {
        return renderers[type]
    }
}

// Public interface for the SDK
class Render {
    static let shared = Render()
    private let componentRegistry = ComponentRegistry()
    private let scenarioFetcher = ScenarioFetcher()

    private init() { }

    // Option 1: Render into an existing view
    func render(scenarioID: String, inside vc: UIViewController, into view: UIView? = nil) {
        scenarioFetcher.fetch(id: scenarioID) { result in
            // ... on main thread, parse result and build the view hierarchy
        }
    }

    // Option 2: Create and return a new view controller
    func getViewController(forScenarioID id: String) -> RenderViewController {
        let vc = RenderViewController(scenarioID: id, fetcher: scenarioFetcher, registry: componentRegistry)
        return vc
    }
}