import Foundation

/// Dependency injection container for the application
class DIContainer {
    static let shared = DIContainer()
    
    private init() {}
    
    // MARK: - Repositories
    
    lazy var networkClient: NetworkClient = {
        return NetworkClient()
    }()
    
    lazy var scenarioRepository: ScenarioRepository = {
        return ScenarioRepositoryImpl(
            networkClient: networkClient
        )
    }()
    
    // MARK: - Use Cases
    
    lazy var fetchScenarioUseCase: FetchScenarioUseCase = {
        return FetchScenarioUseCase(
            scenarioRepository: scenarioRepository
        )
    }()
    
    // MARK: - Application Services
    
    lazy var scenarioService: ScenarioService = {
        return ScenarioService(
            fetchScenarioUseCase: fetchScenarioUseCase
        )
    }()
    
    // MARK: Controllers
    
    lazy var renderController: RenderController = {
        return RenderController(renderers: [
            UIViewRenderer(),
            UILabelRenderer(),
            UIButtonRenderer()
        ])
    }()
}
