import Foundation
import Supabase

/// Default implementation of ScenarioRepository using Supabase
@MainActor
class ScenarioRepositoryImpl: ScenarioRepository {
    private let supabaseClient: SupabaseClient
    private let logger = DIContainer.shared.currentLogger
    private var observers: [String: ScenarioObserver] = [:]
    
    init(supabaseClient: SupabaseClient) {
        self.supabaseClient = supabaseClient
    }
    
    func fetchScenario(key: String) async throws -> Scenario {
        let scenarios: [ScenarioJSON] = try await supabaseClient
            .from("scenario_table")
            .select()
            .eq("key", value: key)
            .order("build_number", ascending: false)
            .execute()
            .value

        if scenarios.isEmpty {
            throw RenderSDKError.noScenarioWithKey(key: key)
        }

        logger.debug("Fetched scenario from Supabase: key=\(key)", category: "ScenarioRepository")
        logger.debug("ScenarioJSON has stores: \(scenarios[0].stores != nil)", category: "ScenarioRepository")
        if let stores = scenarios[0].stores {
            logger.debug("Stores count: \(stores.count)", category: "ScenarioRepository")
        }

        let scenarioData = scenarios[0].toMap()
        logger.debug("scenarioData keys: \(scenarioData.keys.joined(separator: ", "))", category: "ScenarioRepository")
        if let stores = scenarioData["stores"] {
            logger.debug("scenarioData has stores: \(stores)", category: "ScenarioRepository")
        } else {
            logger.warning("scenarioData missing stores key", category: "ScenarioRepository")
        }

        guard let scenario = Scenario.create(from: scenarioData) else {
            throw RenderSDKError.scenarioParsingFailed(
                key: key,
                data: String(describing: scenarioData)
            )
        }

        return scenario
    }
    
    func subscribeToScenario(_ observer: ScenarioObserver) async throws {
        let scenarioKey = observer.scenarioKey
        guard observers[scenarioKey] == nil else {
            logger.debug("Already subscribed to scenario \(scenarioKey): \(observer)")
            return
        }
        
        observers[scenarioKey] = observer
        
        let channel = supabaseClient.channel("scenario-\(scenarioKey)")
        let changes = channel.postgresChange(
            InsertAction.self,
            schema: "public",
            table: "scenario_table",
            filter: .eq("key", value: scenarioKey)
        )
        
        do {
            try await channel.subscribeWithError()
            
            for await change in changes {
                let jsonSchema = try change.decodeRecord(
                    as: ScenarioJSON.self,
                    decoder: JSONDecoder()
                )
                let scenarioData = jsonSchema.toMap()
                
                guard let scenario = Scenario.create(from: scenarioData) else {
                    logger.debug("Failed to create scenario from updated data")
                    continue
                }
                
                observer.onScenarioUpdate(scenario: scenario)
            }
        } catch {
            logger.error("FAILED TO SUBSCRIBE TO CHANNEL FOR SCENARIO KEY = \(scenarioKey)")
        }
    }
    
    @MainActor
    func unsubscribeFromScenario(_ observer: ScenarioObserver) async {
        let scenarioKey = observer.scenarioKey
        let exisingObserver = observers[scenarioKey]
        
        if exisingObserver == nil {
            logger.debug("Observer was not subscribed to scenario \(scenarioKey): \(observer)")
            return
        }
        
        let channel = supabaseClient.channel("scenario-\(scenarioKey)")
        await channel.unsubscribe()
        
        observers.removeValue(forKey: scenarioKey)
    }
}
