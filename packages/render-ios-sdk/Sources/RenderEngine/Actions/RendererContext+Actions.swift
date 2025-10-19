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
            let scope = descriptor.scope == "app" ? Scope.app : Scope.scenario(id: scenarioId)
            let storage = storageFromString(descriptor.storage)

            // Get or create store
            let store = factory.makeStore(
                scope: scope,
                storage: storage
            )

            // Set initial values if provided
            if let initialValue = descriptor.initialValue {
                let storeValues = initialValue.mapValues { StoreValue.from($0) }
                await store.replaceAll(with: storeValues)
            }

            logger?.debug("Initialized store: \(scope) [\(storage)]", category: "Renderer")
        }
    }

    // MARK: - Action Execution

    /// Execute a declarative action by ID
    @discardableResult
    @MainActor
    public func executeAction(id: String, scenarioId: String = "default", eventData: [String: Any]? = nil) async throws -> Bool {
        // Find action in loaded scenario
        guard let action = loadedActions[id] else {
            throw ActionExecutionError.navigationControllerMissing
        }

        let factory = getStoreFactory()
        let executor = DeclarativeActionExecutor(
            storeFactory: factory,
            navigationController: navigationController,
            logger: logger
        )

        try await executor.execute(action, scenarioId: scenarioId, eventData: eventData)
        return true
    }

    /// Execute multiple actions
    @MainActor
    public func executeActions(ids: [String], scenarioId: String = "default", eventData: [String: Any]? = nil) async throws {
        for id in ids {
            try await executeAction(id: id, scenarioId: scenarioId, eventData: eventData)
        }
    }

    /// Execute a declarative action directly (not by ID)
    @discardableResult
    @MainActor
    public func executeAction(_ action: AnyDeclarativeAction, scenarioId: String = "default", eventData: [String: Any]? = nil) async throws -> Bool {
        let factory = getStoreFactory()
        let executor = DeclarativeActionExecutor(
            storeFactory: factory,
            navigationController: navigationController,
            logger: logger
        )

        try await executor.execute(action, scenarioId: scenarioId, eventData: eventData)
        return true
    }

    // MARK: - Helpers

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
