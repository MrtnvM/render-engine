import Foundation

/// Parses JSON action descriptors
public struct ActionParser {

    /// Parse actions from JSON data
    public static func parse(from data: Data) throws -> [Action] {
        let decoder = JSONDecoder()
        return try decoder.decode([Action].self, from: data)
    }

    /// Parse stores from JSON data
    public static func parseStores(from data: Data) throws -> [StoreDescriptor] {
        let decoder = JSONDecoder()
        return try decoder.decode([StoreDescriptor].self, from: data)
    }

    /// Parse actions and stores from scenario JSON
    public static func parseFromScenario(data: Data) throws -> (stores: [StoreDescriptor], actions: [Action]) {
        let decoder = JSONDecoder()

        // Define a wrapper structure to decode the scenario
        struct ScenarioWrapper: Codable {
            let stores: [StoreDescriptor]?
            let actions: [Action]?
        }

        let wrapper = try decoder.decode(ScenarioWrapper.self, from: data)

        return (
            stores: wrapper.stores ?? [],
            actions: wrapper.actions ?? []
        )
    }
}
