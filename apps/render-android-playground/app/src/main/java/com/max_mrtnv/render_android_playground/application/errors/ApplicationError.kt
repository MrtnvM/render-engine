package com.max_mrtnv.render_android_playground.application.errors

/**
 * Application-specific errors
 */
sealed class ApplicationError(message: String) : Exception(message) {
    class NetworkError(message: String) : ApplicationError("Network error: $message")
    class SchemaFetchFailed(message: String) : ApplicationError("Schema fetch failed: $message")
    class InvalidResponse(message: String) : ApplicationError("Invalid response: $message")
    class ParsingError(message: String) : ApplicationError("Parsing error: $message")
    class RenderingError(message: String) : ApplicationError("Rendering error: $message")
}
