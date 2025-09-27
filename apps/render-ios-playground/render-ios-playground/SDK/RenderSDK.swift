import UIKit
import PostgREST
import Supabase

// Public interface for the SDK
class RenderSDK {
    static let shared = RenderSDK()
    
    private let client = DIContainer.shared.supabaseClient
    private let componentRegistry = DIContainer.shared.componentRegistry
    private let scenarioRepository = DIContainer.shared.scenarioRepository
    private let scenarioFetcher = DIContainer.shared.scenarioService

    private init() {}

    // Option 1: Render into an existing view
    func render(
        scenarioKey: String,
        vc: UIViewController,
        containerView view: UIView? = nil
    ) async throws {
        do {
            let scenario = try await scenarioRepository
                .fetchScenario(key: scenarioKey)
            
            print("RENDERING SCENARIO WITH ID: \(scenario.id)")
            print("SCENARIO VERSION: \(scenario.version) (\(scenario.build_number))")
            
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
    func getViewController(scenarioKey key: String) -> RenderViewController {
        let vc = RenderViewController(
            scenarioKey: key
        )
        return vc
    }
}
