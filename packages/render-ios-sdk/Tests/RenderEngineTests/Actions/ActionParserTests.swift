import Testing
import Foundation
@testable import RenderEngine

@Suite("ActionParser Tests")
struct ActionParserTests {

    @Test("Parse simple set action from JSON")
    func testParseSetAction() throws {
        let json = """
        {
          "id": "app.memory_set_userName",
          "type": "store.set",
          "scope": "app",
          "storage": "memory",
          "keyPath": "userName",
          "value": {
            "type": "string",
            "value": "Alice"
          }
        }
        """

        let data = json.data(using: .utf8)!
        let action = try JSONDecoder().decode(Action.self, from: data)

        #expect(action.id == "app.memory_set_userName")
        #expect(action.type == .storeSet)
        #expect(action.scope == "app")
        #expect(action.storage == "memory")
        #expect(action.keyPath == "userName")
        #expect(action.value == .string("Alice"))
    }

    @Test("Parse remove action from JSON")
    func testParseRemoveAction() throws {
        let json = """
        {
          "id": "scenario.memory_remove_temp",
          "type": "store.remove",
          "scope": "scenario",
          "storage": "memory",
          "keyPath": "temp"
        }
        """

        let data = json.data(using: .utf8)!
        let action = try JSONDecoder().decode(Action.self, from: data)

        #expect(action.type == .storeRemove)
        #expect(action.keyPath == "temp")
        #expect(action.value == nil)
    }

    @Test("Parse merge action with object")
    func testParseMergeAction() throws {
        let json = """
        {
          "id": "app.memory_merge_user",
          "type": "store.merge",
          "scope": "app",
          "storage": "memory",
          "keyPath": "user",
          "value": {
            "type": "object",
            "value": {
              "age": { "type": "integer", "value": 31 },
              "city": { "type": "string", "value": "NYC" }
            }
          }
        }
        """

        let data = json.data(using: .utf8)!
        let action = try JSONDecoder().decode(Action.self, from: data)

        #expect(action.type == .storeMerge)
        guard case .object(let obj) = action.value else {
            Issue.record("Expected object value")
            return
        }
        #expect(obj["age"] == .integer(31))
        #expect(obj["city"] == .string("NYC"))
    }

    @Test("Parse transaction action with nested actions")
    func testParseTransactionAction() throws {
        let json = """
        {
          "id": "app.memory_transaction_123",
          "type": "store.transaction",
          "scope": "app",
          "storage": "memory",
          "keyPath": "",
          "actions": [
            {
              "id": "app.memory_set_key1",
              "type": "store.set",
              "scope": "app",
              "storage": "memory",
              "keyPath": "key1",
              "value": { "type": "string", "value": "value1" }
            },
            {
              "id": "app.memory_set_key2",
              "type": "store.set",
              "scope": "app",
              "storage": "memory",
              "keyPath": "key2",
              "value": { "type": "string", "value": "value2" }
            }
          ]
        }
        """

        let data = json.data(using: .utf8)!
        let action = try JSONDecoder().decode(Action.self, from: data)

        #expect(action.type == .storeTransaction)
        #expect(action.actions?.count == 2)
        #expect(action.actions?[0].type == .storeSet)
        #expect(action.actions?[1].type == .storeSet)
    }

    @Test("Parse array of actions")
    func testParseActionArray() throws {
        let json = """
        [
          {
            "id": "action1",
            "type": "store.set",
            "scope": "app",
            "storage": "memory",
            "keyPath": "key1",
            "value": { "type": "string", "value": "val1" }
          },
          {
            "id": "action2",
            "type": "store.remove",
            "scope": "app",
            "storage": "memory",
            "keyPath": "key2"
          }
        ]
        """

        let data = json.data(using: .utf8)!
        let actions = try ActionParser.parse(from: data)

        #expect(actions.count == 2)
        #expect(actions[0].id == "action1")
        #expect(actions[1].id == "action2")
    }

    @Test("Parse stores and actions from scenario")
    func testParseFromScenario() throws {
        let json = """
        {
          "key": "test-scenario",
          "version": "1.0.0",
          "main": {},
          "stores": [
            {
              "scope": "scenario",
              "storage": "memory",
              "initialValue": {
                "count": { "type": "integer", "value": 0 }
              }
            }
          ],
          "actions": [
            {
              "id": "action1",
              "type": "store.set",
              "scope": "scenario",
              "storage": "memory",
              "keyPath": "count",
              "value": { "type": "integer", "value": 1 }
            }
          ]
        }
        """

        let data = json.data(using: .utf8)!
        let (stores, actions) = try ActionParser.parseFromScenario(data: data)

        #expect(stores.count == 1)
        #expect(stores[0].scope == "scenario")
        #expect(stores[0].storage == "memory")

        #expect(actions.count == 1)
        #expect(actions[0].id == "action1")
    }
}
