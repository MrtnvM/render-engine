import Foundation
import ObjectiveC

extension RendererContext {

    // MARK: - Associated Objects Keys

    private nonisolated(unsafe) static var actionExecutorKey = "com.renderengine.actionExecutor"
    private nonisolated(unsafe) static var loadedActionsKey = "com.renderengine.loadedActions"
    private nonisolated(unsafe) static var storeFactoryKey = "com.renderengine.storeFactory"
    private nonisolated(unsafe) static var loggerKey = "com.renderengine.logger"

    // MARK: - Stored Properties via Associated Objects

    /// Action executor for this context
    public var actionExecutor: ActionExecutor {
        if let existing = objc_getAssociatedObject(self, &Self.actionExecutorKey) as? ActionExecutor {
            return existing
        }

        // Create new executor
        let executor = ActionExecutor(storeFactory: storeFactory, logger: logger)
        objc_setAssociatedObject(self, &Self.actionExecutorKey, executor, .OBJC_ASSOCIATION_RETAIN)
        return executor
    }

    /// Store factory for this context
    private var storeFactory: StoreFactory {
        if let existing = objc_getAssociatedObject(self, &Self.storeFactoryKey) as? StoreFactory {
            return existing
        }

        // Create default factory
        let factory = DefaultStoreFactory()
        objc_setAssociatedObject(self, &Self.storeFactoryKey, factory, .OBJC_ASSOCIATION_RETAIN)
        return factory
    }

    /// Logger for this context
    private var logger: Logger? {
        return objc_getAssociatedObject(self, &Self.loggerKey) as? Logger
    }

    /// Loaded actions from scenario
    public var loadedActions: [String: Action] {
        get {
            return objc_getAssociatedObject(self, &Self.loadedActionsKey) as? [String: Action] ?? [:]
        }
        set {
            objc_setAssociatedObject(self, &Self.loadedActionsKey, newValue, .OBJC_ASSOCIATION_RETAIN)
        }
    }

    // MARK: - Configuration

    /// Set the store factory for this context
    public mutating func setStoreFactory(_ factory: StoreFactory) {
        objc_setAssociatedObject(self, &Self.storeFactoryKey, factory, .OBJC_ASSOCIATION_RETAIN)
    }

    /// Set the logger for this context
    public mutating func setLogger(_ logger: Logger) {
        objc_setAssociatedObject(self, &Self.loggerKey, logger, .OBJC_ASSOCIATION_RETAIN)
    }

    // MARK: - Store Initialization

    /// Initialize stores from scenario descriptors
    public func initializeStores(from descriptors: [StoreDescriptor], scenarioId: String) async {
        for descriptor in descriptors {
            let scope = descriptor.toScope(scenarioId: scenarioId)
            let storage = descriptor.toStorage()

            // Get or create store
            let store = storeFactory.makeStore(
                scope: scope,
                storage: storage
            )

            // Set initial values if provided
            if let initialValue = descriptor.initialValue {
                let storeData = initialValue.mapValues { $0.toStoreValue() }
                await store.replaceAll(with: storeData)
            }

            logger?.debug("Initialized store: \(scope) [\(storage)]", category: "Renderer")
        }
    }

    // MARK: - Action Execution

    /// Execute an action by ID
    @discardableResult
    public func executeAction(id: String, scenarioId: String = "default") async throws -> Bool {
        // Find action in loaded scenario
        guard let action = loadedActions[id] else {
            throw ActionError.actionNotFound(id)
        }

        return try await actionExecutor.execute(action, scenarioId: scenarioId)
    }

    /// Execute multiple actions
    public func executeActions(ids: [String], scenarioId: String = "default") async throws {
        for id in ids {
            try await executeAction(id: id, scenarioId: scenarioId)
        }
    }

    /// Execute an action directly (not by ID)
    @discardableResult
    public func executeAction(_ action: Action, scenarioId: String = "default") async throws -> Bool {
        return try await actionExecutor.execute(action, scenarioId: scenarioId)
    }
}
