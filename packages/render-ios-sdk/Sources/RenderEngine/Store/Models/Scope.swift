import Foundation

/// Defines the scope of a Store instance
/// Scopes determine the lifecycle and isolation of store data
public enum Scope: Equatable, Hashable, Sendable {
    /// Application-level global state
    /// Persists across scenario changes
    case app

    /// Scenario-specific state
    /// Scoped to a particular scenario
    case scenario(id: String)

    /// Human-readable description of the scope
    public var description: String {
        switch self {
        case .app:
            return "app"
        case .scenario(let id):
            return "scenario(\(id))"
        }
    }

    /// Unique identifier for this scope (used for keying)
    public var identifier: String {
        switch self {
        case .app:
            return "app"
        case .scenario(let id):
            return "scenario_\(id)"
        }
    }
}
