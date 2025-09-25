import UIKit
import PostgREST
import Supabase
import Combine

// Public interface for the SDK
class RenderSDK {
    static let shared = RenderSDK()

    private let client = DIContainer.shared.supabaseClient
    private let componentRegistry = DIContainer.shared.componentRegistry
    private let scenarioFetcher = DIContainer.shared.scenarioService
    private let storeFactory: ScenarioStoreFactory

    private init() {
        storeFactory = ScenarioStoreFactory(baseFactory: DefaultStoreFactory())
    }

    // Option 1: Render into an existing view
    func render(
        scenarioID: String,
        vc: UIViewController,
        containerView view: UIView? = nil
    ) async throws {
        do {
            let scenarios: [JsonSchema] = try await client
                .from("schema_table")
                .select()
                .eq("id", value: scenarioID)
                .order("version", ascending: false)
                .execute()
                .value
            
            if scenarios.isEmpty {
                throw ApplicationError.scenarioFetchFailed(
                    "No scenario with ID: \(scenarioID)"
                )
            }
            
            let scenarioData = scenarios[0].toMap()
            guard let scenario = Scenario.create(from: scenarioData) else {
                throw ApplicationError.scenarioFetchFailed(
                    "Can not parse scenario"
                )
            }
            
            let renderVC = await RenderViewController(
                scenario: scenario
            )
            
            if let navVC = await vc.navigationController {
                await navVC.pushViewController(
                    renderVC,
                    animated: true
                )
            } else {
                await MainActor.run {
                    let navVC = UINavigationController()
                    navVC.viewControllers = [renderVC]
                    vc.present(navVC, animated: true)
                }
            }
        } catch {
            print("RENDER SDK ERROR:", error)
            throw error
        }
    }

    // Option 2: Create and return a new view controller
    func getViewController(scenarioID id: String) -> RenderViewController {
        let vc = RenderViewController(
            scenarioID: id
        )
        return vc
    }

    // MARK: - Store API

    /// Get a store for app-level data with the specified storage
    public func getAppStore(storage: Storage = .userPrefs()) -> Store {
        return storeFactory.makeStore(scope: .app, storage: storage)
    }

    /// Get a store for scenario-specific data with the specified storage
    public func getScenarioStore(scenarioID: String, storage: Storage = .scenarioSession) -> Store {
        return storeFactory.makeStore(scope: .scenario(id: scenarioID), storage: storage)
    }

    /// Get the store factory for advanced usage
    public func getStoreFactory() -> StoreFactory {
        return storeFactory
    }

    /// Clear all stores for a specific scenario
    public func clearScenarioData(_ scenarioID: String) {
        storeFactory.clearScenarioSession(scenarioID)
    }

    /// Get all active scenario sessions
    public func getActiveScenarios() -> [String] {
        return storeFactory.activeScenarioSessions()
    }

    #if DEBUG
    /// Get the debug inspector for development builds
    public func getDebugInspector() -> StoreDebugInspector {
        return StoreDebugInspector(storeFactory: storeFactory)
    }
    #endif
}
