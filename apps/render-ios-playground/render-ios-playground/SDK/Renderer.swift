import UIKit

protocol Renderer {
    var type: String { get }
    @MainActor func render(component: Component) -> UIView?
}
