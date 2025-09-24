import Foundation

/// Represents different scopes/backends for storing data
public enum Scope: Equatable {
    case appMemory                    // In-memory, ephemeral
    case userPrefs(suite: String? = nil)  // UserDefaults suite
    case file(url: URL)               // File-based storage
    case scenarioSession(id: String)  // Per-scenario ephemeral storage
    case backend(namespace: String, scenarioID: String? = nil)  // Remote backend

    public var description: String {
        switch self {
        case .appMemory:
            return "appMemory"
        case .userPrefs(let suite):
            return "userPrefs(\(suite ?? "default"))"
        case .file(let url):
            return "file(\(url.lastPathComponent))"
        case .scenarioSession(let id):
            return "scenarioSession(\(id))"
        case .backend(let namespace, let scenarioID):
            if let scenarioID = scenarioID {
                return "backend(\(namespace), \(scenarioID))"
            } else {
                return "backend(\(namespace))"
            }
        }
    }
}