import Foundation

protocol ScenarioObserver: AnyObject {
    var scenarioKey: String { get }
    func onScenarioUpdate(scenario: Scenario)
}

/// Repository interface for scenario operations
protocol ScenarioRepository {
    func fetchScenario(key: String) async throws -> Scenario
    func subscribeToScenario(_ observer: ScenarioObserver) async throws
    func unsubscribeFromScenario(_ observer: ScenarioObserver) async
}
