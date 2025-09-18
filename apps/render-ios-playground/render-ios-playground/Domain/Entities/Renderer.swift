import UIKit

protocol Renderer {
    var type: String { get }
    func render(component: Component) -> UIView?
}
