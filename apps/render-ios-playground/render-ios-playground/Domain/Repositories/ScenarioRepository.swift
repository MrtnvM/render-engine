import Foundation

/// Repository interface for scenario operations
protocol ScenarioRepository {
    func fetchScenario() async throws -> [String: Any]
    func fetchSchema(from url: URL) async throws -> [String: Any]
}
