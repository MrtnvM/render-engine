import Foundation

protocol ScenarioObserver {
    var scenarioID: String { get }
    func onScenarioUpdate(scenario: Scenario)
}

/// Repository interface for scenario operations
protocol ScenarioRepository {
    func fetchScenario(from url: URL) async throws -> Scenario
    
    func fetchScenario(id: String) async throws -> Scenario
    func subscribeToScenario(_ observer: ScenarioObserver) async throws
    func unsubscribeFromScenario(_ observer: ScenarioObserver) async
}
