import UIKit

/// Application service that orchestrates schema operations
class ScenarioService {
    private let fetchScenarioUseCase: FetchScenarioUseCase
    private let renderComponentUseCase: RenderComponentUseCase
    
    init(
        fetchScenarioUseCase: FetchScenarioUseCase,
        renderComponentUseCase: RenderComponentUseCase
    ) {
        self.fetchScenarioUseCase = fetchScenarioUseCase
        self.renderComponentUseCase = renderComponentUseCase
    }
    
    func fetchAndRenderScenario() async throws -> UIView {
        guard let scenario = try? await fetchScenarioUseCase.execute() else {
            throw ApplicationError.schemaFetchFailed("No scenario recieved")
        }
        
        guard let view = await renderComponentUseCase.execute(scenario: scenario) else {
            throw ApplicationError.renderingError("")
        }
        
        return view
    }
    
    func fetchAndRenderScenario(from url: URL) async throws -> UIView {
        guard let scenario = try? await fetchScenarioUseCase.execute(from: url) else {
            throw ApplicationError.schemaFetchFailed("No scenario recieved")
        }
        
        guard let view = await renderComponentUseCase.execute(scenario: scenario) else {
            throw ApplicationError.renderingError("")
        }
        
        return view
    }
    
    func renderScenario(_ scenario: Scenario) async  -> UIView? {
        return await renderComponentUseCase.execute(scenario: scenario)
    }
}
