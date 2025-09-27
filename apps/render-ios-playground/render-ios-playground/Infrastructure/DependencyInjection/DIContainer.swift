import Foundation
import Supabase

/// Dependency injection container for the application
class DIContainer {
    static let shared = DIContainer()
    
    private init() {}
    
    lazy var networkClient: NetworkClient = {
        return NetworkClient()
    }()
    
    lazy var supabaseClient: SupabaseClient = {
        return SupabaseClient(
            supabaseURL: URL(string: "https://yhfeoztyhuiccuyeghiw.supabase.co")!,
            supabaseKey: "sb_publishable_8fDYhB0k7n_wuAywpua6vQ_JthMjgzA"
        )
    }()
    
    // MARK: - Repositories
    
    lazy var scenarioRepository: ScenarioRepository = {
        return ScenarioRepositoryImpl(
            networkClient: networkClient,
            supabaseClient: supabaseClient
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
    
    // MARK: SDK
    
    lazy var componentRegistry: ComponentRegistry = {
        let registry = ComponentRegistry()
        let renderers: [Renderer] = [
            ViewRenderer(),
            RowRenderer(),
            ColumnRenderer(),
            StackRenderer(),
            TextRenderer(),
            ButtonRenderer(),
            ImageRenderer(),
            CheckboxRenderer(),
            StepperRenderer(),
            RatingRenderer(),
            NavbarRenderer()
        ]
        renderers.forEach { registry.register(renderer: $0) }
        return registry
}()
}
