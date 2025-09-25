import Foundation
import Supabase
import UIKit

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
            RatingRenderer()
        ]
        renderers.forEach { registry.register(renderer: $0) }
        return registry
}()

    // MARK: - Store

    lazy var store: DefaultStore = {
        let appID = Bundle.main.bundleIdentifier ?? "render-ios-playground"
        return DefaultStore(appID: appID)
    }()

    func scenarioStore(id: String) -> KeyValueStore {
        return store.named(.scenarioSession(id: id))
    }

    func ensureScenarioVersionDropIfNeeded(id: String, version: String) {
        let defaults = UserDefaults.standard
        let key = "\(Bundle.main.bundleIdentifier ?? appBundleIDFallback).store.scenario.major.\(id)"
        let currentMajor = SemanticVersion(string: version)?.major ?? 0
        let previousMajor = defaults.integer(forKey: key)
        if previousMajor != 0 && previousMajor != currentMajor {
            // Drop scenario session data on major change
            let kv = scenarioStore(id: id)
            kv.replaceAll(with: [:])
        }
        defaults.set(currentMajor, forKey: key)
    }

    private var appBundleIDFallback: String { "render-ios-playground" }
}
