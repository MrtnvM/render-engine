import Foundation
import Combine

/// Debug inspector for the store (only available in debug builds)
public class StoreDebugger {
    private let store: Store
    private var subscriptions: Set<AnyCancellable> = []

    public init(store: Store) {
        self.store = store

        #if DEBUG
        setupDebugging()
        #endif
    }

    /// Get current values for a specific scope
    public func currentValues(for scope: Scope) -> [String: StoreValue] {
        let keyValueStore = store.named(scope)
        return keyValueStore.snapshot()
    }

    /// Get all active subscriptions for a scope
    public func activeSubscriptions(for scope: Scope) -> [String] {
        // This would return the active key paths being observed
        // For now, return an empty array
        return []
    }

    /// Get recent changes for a scope
    public func recentChanges(for scope: Scope, limit: Int = 100) -> [StoreChange] {
        // This would return recent changes from a change log
        // For now, return an empty array
        return []
    }

    /// Manually set a value (for testing/debugging)
    public func setValue(_ value: StoreValue, for keyPath: String, in scope: Scope) {
        let keyValueStore = store.named(scope)
        keyValueStore.set(keyPath, value)
    }

    /// Get information about all registered live expressions
    public func liveExpressions() -> [LiveExpression] {
        // This would aggregate live expressions from all scopes
        // For now, return an empty array
        return []
    }

    /// Get validation errors for a scope
    public func validationErrors(for scope: Scope) -> [String] {
        // This would return current validation errors
        // For now, return an empty array
        return []
    }

    /// Reset all data for a scope
    public func resetScope(_ scope: Scope) {
        let keyValueStore = store.named(scope)
        keyValueStore.replaceAll(with: [:])
    }

    /// Export store data as JSON
    public func exportData() -> String {
        var exportData: [String: [String: StoreValue]] = [:]

        // Export data from all scopes
        let scopes: [Scope] = [.appMemory, .userPrefs()]

        for scope in scopes {
            let data = currentValues(for: scope)
            if !data.isEmpty {
                exportData[scope.description] = data
            }
        }

        do {
            let jsonData = try JSONEncoder().encode(exportData)
            return String(data: jsonData, encoding: .utf8) ?? "{}"
        } catch {
            return "{}"
        }
    }

    /// Import store data from JSON
    public func importData(_ jsonString: String) {
        guard let jsonData = jsonString.data(using: .utf8) else { return }

        do {
            let importData = try JSONDecoder().decode([String: [String: StoreValue]].self, from: jsonData)

            for (scopeDescription, data) in importData {
                // Parse scope from description (simplified)
                if scopeDescription.contains("appMemory") {
                    let scope = Scope.appMemory
                    let keyValueStore = store.named(scope)
                    keyValueStore.replaceAll(with: data)
                } else if scopeDescription.contains("userPrefs") {
                    let scope = Scope.userPrefs()
                    let keyValueStore = store.named(scope)
                    keyValueStore.replaceAll(with: data)
                }
            }
        } catch {
            print("Failed to import store data: \(error)")
        }
    }

    private func setupDebugging() {
        #if DEBUG
        // Set up logging for all store changes
        (store as? DefaultStore)?.storePublisher
            .sink { change in
                print("🔍 Store Change [\(change.scenarioID)]:")
                for patch in change.patches {
                    switch patch.op {
                    case .set:
                        print("  SET \(patch.keyPath) = \(patch.newValue ?? .null)")
                    case .remove:
                        print("  REMOVE \(patch.keyPath)")
                    case .merge:
                        print("  MERGE \(patch.keyPath) with \(patch.newValue ?? .null)")
                    }
                }
            }
            .store(in: &subscriptions)
        #endif
    }

    deinit {
        subscriptions.forEach { $0.cancel() }
    }
}

// MARK: - Debug Extensions

#if DEBUG
extension Store {
    /// Get the debug inspector (only available in debug builds)
    public var debugger: StoreDebugger? {
        return StoreDebugger(store: self)
    }
}
#endif