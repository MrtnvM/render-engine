import Foundation

/// Use case for fetching schema from remote source
class FetchScenarioUseCase {
    private let scenarioRepository: ScenarioRepository
    
    init(scenarioRepository: ScenarioRepository) {
        self.scenarioRepository = scenarioRepository
    }
    
    func execute(from url: URL) async throws -> Scenario? {
        do {
            return try await scenarioRepository.fetchScenario(from: url)
        } catch {
            if error is DomainError {
                throw error
            } else {
                throw ApplicationError.scenarioFetchFailed(error.localizedDescription)
            }
        }
    }
}
