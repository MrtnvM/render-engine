import Foundation

/// Domain-specific errors for the render engine
enum DomainError: Error {
    case invalidComponentType(String)
    case invalidComponentId(String)
    case invalidPropertyValue(String)
    case invalidFrame(String)
    case componentNotFound(String)
    case invalidSchemaStructure(String)
    case renderingError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidComponentType(let message):
            return "Invalid component type: \(message)"
        case .invalidComponentId(let message):
            return "Invalid component ID: \(message)"
        case .invalidPropertyValue(let message):
            return "Invalid property value: \(message)"
        case .invalidFrame(let message):
            return "Invalid frame: \(message)"
        case .componentNotFound(let message):
            return "Component not found: \(message)"
        case .invalidSchemaStructure(let message):
            return "Invalid schema structure: \(message)"
        case .renderingError(let message):
            return "Rendering error: \(message)"
        }
    }
}
