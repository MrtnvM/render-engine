import UIKit

/// Use case for rendering a schema into UIView
class RenderComponentUseCase {
    private let renderingService: ComponentRenderingService
    
    init(renderingService: ComponentRenderingService) {
        self.renderingService = renderingService
    }
    
    func execute(scenario: Scenario) async -> UIView? {
        return await MainActor.run {
            return renderingService.render(scenario.mainComponent)
        }
    }
    
    func execute(component: Component) -> UIView? {
        return renderingService.render(component)
    }
}
