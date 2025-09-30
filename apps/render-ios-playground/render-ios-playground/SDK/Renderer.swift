import UIKit

struct RendererContext {
    let viewController: UIViewController?
    let navigationController: UINavigationController?
    let window: UIWindow?
    let scenario: Scenario?
    let props: Config
}

protocol Renderer {
    var type: String { get }
    
    @MainActor func render(component: Component, context: RendererContext) -> UIView?
}
