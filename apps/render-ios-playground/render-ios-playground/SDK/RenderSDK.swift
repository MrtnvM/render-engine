import UIKit
import PostgREST
import Supabase

// Public interface for the SDK
class RenderSDK {
    static let shared = RenderSDK()
    
    private let client: SupabaseClient
    private let componentRegistry = DIContainer.shared.componentRegistry
    private let scenarioFetcher = DIContainer.shared.scenarioService

    private init() {
        client = SupabaseClient(
            supabaseURL: URL(string: "https://yhfeoztyhuiccuyeghiw.supabase.co")!,
            supabaseKey: "sb_publishable_8fDYhB0k7n_wuAywpua6vQ_JthMjgzA"
        )
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
}
