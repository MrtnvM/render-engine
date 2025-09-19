import UIKit

/// Application service that orchestrates schema operations
class ScenarioService {
    private let fetchScenarioUseCase: FetchScenarioUseCase
    
    init(fetchScenarioUseCase: FetchScenarioUseCase) {
        self.fetchScenarioUseCase = fetchScenarioUseCase
    }
    
    func fetchScenario(from url: URL) async throws -> Scenario {
        guard let scenario = try? await fetchScenarioUseCase.execute() else {
            throw ApplicationError.scenarioFetchFailed("No scenario recieved")
        }
        
        return scenario
    }
}
