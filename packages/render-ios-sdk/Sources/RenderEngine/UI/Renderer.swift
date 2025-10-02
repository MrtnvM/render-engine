import UIKit

/// Protocol for component renderers
public protocol Renderer {
    var type: String { get }
    
    @MainActor func render(component: Component, context: RendererContext) -> UIView?
}

/// Context passed to renderers during rendering
public struct RendererContext {
    public let viewController: UIViewController?
    public let navigationController: UINavigationController?
    public let window: UIWindow?
    public let scenario: Scenario?
    public let props: Config
    
    public init(
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
