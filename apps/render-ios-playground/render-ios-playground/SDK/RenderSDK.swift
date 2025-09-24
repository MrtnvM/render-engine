import UIKit
import PostgREST
import Supabase

// Public interface for the SDK
class RenderSDK {
    static let shared = RenderSDK()

    private let client = DIContainer.shared.supabaseClient
    private let componentRegistry = DIContainer.shared.componentRegistry
    private let scenarioFetcher = DIContainer.shared.scenarioService
    private let storeManager = DIContainer.shared.storeManager

    private init() {}

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

    /// Get a store for app-scoped data
    public func getAppStore(storage: Storage = .userPrefs()) -> Store {
        storeManager.getStore(scope: .app, storage: storage)
    }

    /// Get a store for scenario-scoped data
    public func getScenarioStore(scenarioID: String, storage: Storage = .memory) -> Store {
        storeManager.getStore(scope: .scenario(id: scenarioID), storage: storage)
    }

    /// Configure stores for a scenario session
    public func configureScenarioStores(scenarioID: String) {
        storeManager.configureScenarioStores(scenarioID: scenarioID)
    }

    /// Clean up scenario stores when scenario ends
    public func cleanupScenarioStores(scenarioID: String) {
        storeManager.cleanupScenarioStores(scenarioID: scenarioID)
    }

    /// Reset all stores for a specific scope
    public func resetStores(for scope: Scope) {
        storeManager.resetStores(for: scope)
    }

    /// Reset all stores
    public func resetAllStores() {
        storeManager.resetAllStores()
    }

    /// Handle version changes
    public func handleVersionChange(from oldVersion: SemanticVersion, to newVersion: SemanticVersion) {
        storeManager.handleVersionChange(from: oldVersion, to: newVersion)
    }
}
