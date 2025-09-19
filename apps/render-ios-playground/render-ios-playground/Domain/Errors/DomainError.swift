import Foundation

/// Domain-specific errors for the render engine
enum DomainError: Error {
    case invalidComponentType(String)
    case invalidComponentId(String)
    case invalidStyleValue(String)
    case componentNotFound(String)
    case invalidScenarioStructure(String)
    case renderingError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidComponentType(let message):
            return "Invalid component type: \(message)"
        case .invalidComponentId(let message):
            return "Invalid component ID: \(message)"
        case .invalidStyleValue(let message):
            return "Invalid style value: \(message)"
        case .componentNotFound(let message):
            return "Component not found: \(message)"
        case .invalidScenarioStructure(let message):
            return "Invalid schema structure: \(message)"
        case .renderingError(let message):
            return "Rendering error: \(message)"
        }
    }
}
