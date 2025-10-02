import Foundation

/// Domain-specific errors for the render engine
public enum RenderSDKError: Error {
    case noScenarioWithKey(key: String)
    case scenarioParsingFailed(key: String, data: String)
    case networkError(String)
    case invalidResponse(String)
    case parsingError(String)
    case invalidComponentType(String)
    case invalidComponentId(String)
    case invalidStyleValue(String)
    case componentNotFound(String)
    case invalidScenarioStructure(String)
    case renderingError(String)
    
    public var errorDescription: String? {
        switch self {
        case .noScenarioWithKey(let key):
            return "Not found scenario with key: \(key)"
        case .scenarioParsingFailed(let key, let data):
            return "Could not parse scenario with key \(key): \(data)"
        case .networkError(let message):
            return "Network request failed: \(message)"
        case .invalidResponse(let message):
            return "Invalid response: \(message)"
        case .parsingError(let message):
            return "Parsing error: \(message)"
            
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

