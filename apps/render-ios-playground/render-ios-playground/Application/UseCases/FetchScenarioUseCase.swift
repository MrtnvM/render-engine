import Foundation

/// Use case for fetching schema from remote source
class FetchScenarioUseCase {
    private let schemaRepository: ScenarioRepository
    
    init(schemaRepository: ScenarioRepository) {
        self.schemaRepository = schemaRepository
    }
    
    func execute() async throws -> Scenario? {
        do {
            let data = try await schemaRepository.fetchScenario()
            return Scenario.create(from: data)
        } catch {
            if error is DomainError {
                throw error
            } else {
                throw ApplicationError.schemaFetchFailed(error.localizedDescription)
            }
        }
    }
    
    func execute(from url: URL) async throws -> Scenario? {
        do {
            let data = try await schemaRepository.fetchSchema(from: url)
            return Scenario.create(from: data)
        } catch {
            if error is DomainError {
                throw error
            } else {
                throw ApplicationError.schemaFetchFailed(error.localizedDescription)
            }
        }
    }
}
