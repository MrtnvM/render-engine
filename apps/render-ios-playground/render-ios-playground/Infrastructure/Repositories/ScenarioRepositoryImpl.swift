import Foundation

class ScenarioRepositoryImpl: ScenarioRepository {
    private let networkClient: NetworkClient
    
    init(networkClient: NetworkClient) {
        self.networkClient = networkClient
    }
    
    func fetchScenario(from url: URL) async throws -> Scenario {
        let json = try await networkClient.fetchJSON(from: url)
        guard let scenario = Scenario.create(from: json) else {
            throw ApplicationError.scenarioFetchFailed(
                "Can not parse scenario"
            )
        }
        
        return scenario
    }
}
