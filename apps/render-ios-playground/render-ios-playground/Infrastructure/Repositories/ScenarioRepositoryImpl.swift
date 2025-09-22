import Foundation
import Supabase

class ScenarioRepositoryImpl: ScenarioRepository {
    private let networkClient: NetworkClient
    private let supabaseClient: SupabaseClient
    private var observers: [String: ScenarioObserver] = [:]
    
    init(networkClient: NetworkClient, supabaseClient: SupabaseClient) {
        self.networkClient = networkClient
        self.supabaseClient = supabaseClient
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
    
    func fetchScenario(id: String) async throws -> Scenario {
        let scenarios: [JsonSchema] = try await supabaseClient
            .from("schema_table")
            .select()
            .eq("id", value: id)
            .order("version", ascending: false)
            .execute()
            .value
        
        if scenarios.isEmpty {
            throw ApplicationError.scenarioFetchFailed(
                "No scenario with ID: \(id)"
            )
        }
        
        let scenarioData = scenarios[0].toMap()
        guard let scenario = Scenario.create(from: scenarioData) else {
            throw ApplicationError.scenarioFetchFailed(
                "Can not parse scenario"
            )
        }
        
        return scenario
    }
    
    func subscribeToScenario(_ observer: ScenarioObserver) async throws {
        let scenarioID = observer.scenarioID
        guard observers[scenarioID] == nil else {
            print("Already subscribed to scenario \(scenarioID): \(observer)")
            return
        }
        
        let channel = supabaseClient.channel("scenario-\(scenarioID)")
        let changes = channel.postgresChange(UpdateAction.self, schema: "public")
        
        do {
            try await channel.subscribeWithError()
            for await change in changes {
                print(change.oldRecord, change.record)
                
                // Decode the record to JsonSchema
                let jsonSchema = try change.decodeRecord(as: JsonSchema.self, decoder: JSONDecoder())
                let scenarioData = jsonSchema.toMap()
                
                guard let scenario = Scenario.create(from: scenarioData) else {
                    print("Failed to create scenario from updated data")
                    continue
                }
                
                observer.onScenarioUpdate(scenario: scenario)
            }
            
            observers[scenarioID] = observer
        } catch {
            print("FAILED TO SUBSCRIBE TO CHANNEL FOR SCENARIO ID = \(scenarioID)")
        }
    }
    
    func unsubscribeFromScenario(_ observer: ScenarioObserver) async {
        let scenarioID = observer.scenarioID
        let exisingObserver = observers[scenarioID]
        
        if exisingObserver == nil {
            print("Observer was not subscribed to scenario \(scenarioID): \(observer)")
            return
        }
        
        let channel = supabaseClient.channel("scenario-\(scenarioID)")
        await channel.unsubscribe()
        
        observers.removeValue(forKey: scenarioID)
    }
}
