import Foundation

/// Repository interface for scenario operations
protocol ScenarioRepository {
    func fetchScenario(from url: URL) async throws -> Scenario
}
