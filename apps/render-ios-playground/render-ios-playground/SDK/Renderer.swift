import UIKit

struct RendererContext {
    let viewController: UIViewController?
    let navigationController: UINavigationController?
    let window: UIWindow?
    let scenario: Scenario?
}

protocol Renderer {
    var type: String { get }
    @MainActor func render(component: Component, context: RendererContext) -> UIView?
    @MainActor func update(view: UIView, component: Component, context: RendererContext) async throws
}
