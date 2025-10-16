import Foundation

/// Executes actions on stores
public final class ActionExecutor {

    private let storeFactory: StoreFactory
    private let logger: Logger?

    public init(storeFactory: StoreFactory, logger: Logger? = nil) {
        self.storeFactory = storeFactory
        self.logger = logger
    }

    /// Execute a single action
    @discardableResult
    public func execute(_ action: Action, scenarioId: String = "default") async throws -> Bool {
        logger?.debug("Executing action: \(action.id) [\(action.type.rawValue)]", category: "ActionExecutor")

        // Convert scope/storage to Scope and Storage enums
        let scope = scopeFromString(action.scope, scenarioId: scenarioId)
        let storage = storageFromString(action.storage)

        // Get or create the store
        let store = storeFactory.makeStore(
            scope: scope,
            storage: storage
        )

        switch action.type {
        case .storeSet:
            return try await executeSet(action, on: store)

        case .storeRemove:
            return try await executeRemove(action, on: store)

        case .storeMerge:
            return try await executeMerge(action, on: store)

        case .storeTransaction:
            return try await executeTransaction(action, on: store, scenarioId: scenarioId)
        }
    }

    /// Execute multiple actions in sequence
    public func executeAll(_ actions: [Action], scenarioId: String = "default") async throws {
        for action in actions {
            try await execute(action, scenarioId: scenarioId)
        }
    }

    // MARK: - Private Helpers

    private func executeSet(_ action: Action, on store: Store) async throws -> Bool {
        guard let valueDescriptor = action.value else {
            throw ActionError.missingValue(action.id)
        }

        let storeValue = valueDescriptor.toStoreValue()
        await store.set(action.keyPath, storeValue)

        logger?.debug("Set \(action.keyPath) = \(storeValue)", category: "ActionExecutor")
        return true
    }

    private func executeRemove(_ action: Action, on store: Store) async throws -> Bool {
        await store.remove(action.keyPath)

        logger?.debug("Removed \(action.keyPath)", category: "ActionExecutor")
        return true
    }

    private func executeMerge(_ action: Action, on store: Store) async throws -> Bool {
        guard let valueDescriptor = action.value,
              case .object(let objectDescriptor) = valueDescriptor else {
            throw ActionError.invalidValueType(action.id, expected: "object")
        }

        let storeObject = objectDescriptor.mapValues { $0.toStoreValue() }
        await store.merge(action.keyPath, storeObject)

        logger?.debug("Merged \(action.keyPath)", category: "ActionExecutor")
        return true
    }

    private func executeTransaction(_ action: Action, on store: Store, scenarioId: String) async throws -> Bool {
        guard let nestedActions = action.actions else {
            throw ActionError.missingNestedActions(action.id)
        }

        // Execute all nested actions sequentially within the transaction
        for nestedAction in nestedActions {
            try await executeAction(nestedAction, on: store)
        }

        logger?.debug("Executed transaction with \(nestedActions.count) actions", category: "ActionExecutor")
        return true
    }

    private func executeAction(_ action: Action, on store: Store) async throws {
        switch action.type {
        case .storeSet:
            _ = try await executeSet(action, on: store)
        case .storeRemove:
            _ = try await executeRemove(action, on: store)
        case .storeMerge:
            _ = try await executeMerge(action, on: store)
        case .storeTransaction:
            // Nested transactions not supported - execute actions directly
            if let nestedActions = action.actions {
                for nestedAction in nestedActions {
                    try await executeAction(nestedAction, on: store)
                }
            }
        }
    }

    private func scopeFromString(_ scope: String, scenarioId: String) -> Scope {
        switch scope.lowercased() {
        case "app":
            return .app
        case "scenario":
            return .scenario(id: scenarioId)
        default:
            return .app
        }
    }

    private func storageFromString(_ storage: String) -> Storage {
        switch storage.lowercased() {
        case "memory":
            return .memory
        case "userprefs":
            return .userPrefs(suite: nil)
        case "file":
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let fileURL = documentsPath.appendingPathComponent("store_\(storage).json")
            return .file(url: fileURL)
        case "backend":
            return .backend(namespace: "default")
        default:
            return .memory
        }
    }
}

// MARK: - Errors

public enum ActionError: Error, LocalizedError {
    case storeNotFound(String)
    case missingValue(String)
    case invalidValueType(String, expected: String)
    case missingNestedActions(String)
    case actionNotFound(String)

    public var errorDescription: String? {
        switch self {
        case .storeNotFound(let identifier):
            return "Store not found: \(identifier)"
        case .missingValue(let actionId):
            return "Action \(actionId) is missing required value"
        case .invalidValueType(let actionId, let expected):
            return "Action \(actionId) has invalid value type, expected: \(expected)"
        case .missingNestedActions(let actionId):
            return "Transaction action \(actionId) is missing nested actions"
        case .actionNotFound(let actionId):
            return "Action not found: \(actionId)"
        }
    }
}
