import Foundation

/// HTTP implementation of SchemaRepository
class HttpSchemaRepository: ScenarioRepository {
    private let networkClient: NetworkClient
    private let defaultURL: URL
    
    init(networkClient: NetworkClient, defaultURL: URL) {
        self.networkClient = networkClient
        self.defaultURL = defaultURL
    }
    
    convenience init() {
        let networkClient = NetworkClient()
        let defaultURL = URL(string: "http://localhost:3050/json-schema")!
        self.init(networkClient: networkClient, defaultURL: defaultURL)
    }
    
    func fetchScenario() async throws -> [String: Any] {
        return try await fetchSchema(from: defaultURL)
    }
    
    func fetchSchema(from url: URL) async throws -> [String: Any] {
        return try await networkClient.fetchJSON(from: url)
    }
}
