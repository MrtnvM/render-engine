import Foundation

/// Dependency injection container for the application
class DIContainer {
    static let shared = DIContainer()
    
    private init() {}
    
    // MARK: - Repositories
    
    lazy var schemaRepository: ScenarioRepository = {
        return HttpSchemaRepository()
    }()
    
    // MARK: - Domain Services
    
    lazy var componentRenderingService: ComponentRenderingService = {
        return ComponentRenderingService(renderers: [
            UIViewRenderer(),
            UILabelRenderer(),
            UIButtonRenderer()
        ])
    }()
    
    // MARK: - Use Cases
    
    lazy var fetchScenarioUseCase: FetchScenarioUseCase = {
        return FetchScenarioUseCase(schemaRepository: schemaRepository)
    }()
    
    lazy var renderComponentUseCase: RenderComponentUseCase = {
        return RenderComponentUseCase(renderingService: componentRenderingService)
    }()
    
    // MARK: - Application Services
    
    lazy var scenarioService: ScenarioService = {
        return ScenarioService(
            fetchScenarioUseCase: fetchScenarioUseCase,
            renderComponentUseCase: renderComponentUseCase
        )
    }()
}
