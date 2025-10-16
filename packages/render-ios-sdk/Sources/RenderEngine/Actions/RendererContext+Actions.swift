import Foundation

extension RendererContext {

    // MARK: - Configuration

    /// Set the store factory for this context
    public mutating func setStoreFactory(_ factory: StoreFactory) {
        self.storeFactory = factory
    }

    /// Set the logger for this context
    public mutating func setLogger(_ logger: Logger) {
        self.logger = logger
    }

    /// Get the store factory, creating a default one if needed
    private func getStoreFactory() -> StoreFactory {
        if let factory = storeFactory {
            return factory
        }
        // Create default factory
        return DefaultStoreFactory(logger: logger)
    }

    // MARK: - Store Initialization

    /// Initialize stores from scenario descriptors
    public func initializeStores(from descriptors: [StoreDescriptor], scenarioId: String) async {
        let factory = getStoreFactory()

        for descriptor in descriptors {
            let scope = descriptor.toScope(scenarioId: scenarioId)
            let storage = descriptor.toStorage()

            // Get or create store
            let store = factory.makeStore(
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

        let factory = getStoreFactory()
        let executor = ActionExecutor(storeFactory: factory, logger: logger)
        return try await executor.execute(action, scenarioId: scenarioId)
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
        let factory = getStoreFactory()
        let executor = ActionExecutor(storeFactory: factory, logger: logger)
        return try await executor.execute(action, scenarioId: scenarioId)
    }
}
