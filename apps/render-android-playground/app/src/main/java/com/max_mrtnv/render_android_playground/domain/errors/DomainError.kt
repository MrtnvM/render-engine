package com.max_mrtnv.render_android_playground.domain.errors

/**
 * Domain-specific errors for the render engine
 */
sealed class DomainError(message: String) : Exception(message) {
    class InvalidComponentType(message: String) : DomainError("Invalid component type: $message")
    class InvalidComponentId(message: String) : DomainError("Invalid component ID: $message")
    class InvalidPropertyValue(message: String) : DomainError("Invalid property value: $message")
    class InvalidFrame(message: String) : DomainError("Invalid frame: $message")
    class ComponentNotFound(message: String) : DomainError("Component not found: $message")
    class InvalidSchemaStructure(message: String) : DomainError("Invalid schema structure: $message")
    class RenderingError(message: String) : DomainError("Rendering error: $message")
}
