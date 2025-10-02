import UIKit

protocol Renderer {
    var type: String { get }
    
    @MainActor func render(component: Component, context: RendererContext) -> UIView?
}

struct RendererContext {
    let viewController: UIViewController?
    let navigationController: UINavigationController?
    let window: UIWindow?
    let scenario: Scenario?
    let props: Config
    
    init(
        viewController: UIViewController? = nil,
        navigationController: UINavigationController? = nil,
        window: UIWindow? = nil,
        scenario: Scenario? = nil,
        props: Config? = nil
    ) {
        self.viewController = viewController
        self.navigationController = navigationController
        self.window = window
        self.scenario = scenario
        self.props = props ?? Config()
    }
}
