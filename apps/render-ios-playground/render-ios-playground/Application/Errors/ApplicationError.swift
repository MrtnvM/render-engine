/// Application-specific errors
enum ApplicationError: Error {
    case networkError(String)
    case schemaFetchFailed(String)
    case invalidResponse(String)
    case parsingError(String)
    case renderingError(String)
    
    var errorDescription: String? {
        switch self {
        case .networkError(let message):
            return "Network error: \(message)"
        case .schemaFetchFailed(let message):
            return "Schema fetch failed: \(message)"
        case .invalidResponse(let message):
            return "Invalid response: \(message)"
        case .parsingError(let message):
            return "Parsing error: \(message)"
        case .renderingError(let message):
            return "Rendering error: \(message)"
        }
    }
}
