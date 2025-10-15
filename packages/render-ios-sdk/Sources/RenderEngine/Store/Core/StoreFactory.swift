import Foundation

/// Factory for creating and managing Store instances
/// Handles lifecycle, versioning, and instance reuse
public protocol StoreFactory: AnyObject {

    /// Create or retrieve a Store for the given scope and storage
    /// Returns the same instance if already created for this combination
    func makeStore(scope: Scope, storage: Storage) -> Store

    /// Reset all stores for a given scope (e.g., when scenario ends or major version changes)
    /// Clears data and removes instances from registry
    func resetStores(for scope: Scope)

    /// Reset all stores (e.g., on app logout or data reset)
    func resetAllStores()
}
