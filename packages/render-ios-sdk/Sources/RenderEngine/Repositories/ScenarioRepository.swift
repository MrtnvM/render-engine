import Foundation

/// Observer protocol for scenario updates
@MainActor
protocol ScenarioObserver: AnyObject, Sendable {
    var scenarioKey: String { get }
    func onScenarioUpdate(scenario: Scenario)
}

/// Repository interface for scenario operations
@MainActor
protocol ScenarioRepository {
    func fetchScenario(key: String) async throws -> Scenario
    func subscribeToScenario(_ observer: ScenarioObserver) async throws
    func unsubscribeFromScenario(_ observer: ScenarioObserver) async
}
