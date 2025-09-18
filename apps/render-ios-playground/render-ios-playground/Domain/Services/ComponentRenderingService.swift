import UIKit

/// Domain service responsible for rendering components to UIViews
class ComponentRenderingService {
    private var renderers: [String: Renderer] = [:]
    
    init(renderers: [Renderer]) {
        for renderer in renderers {
            self.renderers[renderer.type] = renderer
        }
    }
    
    
    func render(_ component: Component) -> UIView? {
        guard let renderer = renderers[component.type] else {
            return nil
        }
        
        guard let view = renderer.render(component: component) else {
            return nil
        }
        
        for child in component.getChildren() {
            if let subview = self.render(child) {
                view.addSubview(subview)
            }
        }
        
        return view
    }
}
