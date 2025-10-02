class ComponentRegistry {
    // A private dictionary to store renderers, mapping type names to renderer instances.
    private var renderers: [String: Renderer] = [:]
    private var logger: Logger { return DIContainer.shared.currentLogger }

    init() {}

    /**
     * Registers a Renderer instance for a specific component type.
     * If a renderer for this type already exists, it will be replaced.
     * @param renderer The Renderer instance to register.
     */
    public func register(renderer: Renderer) {
        renderers[renderer.type] = renderer
        logger.registry("Registered renderer for type '\(renderer.type)'")
    }

    /**
     * Retrieves the Renderer instance associated with a given component type.
     * @param type The string identifier of the component type (e.g., "text", "row").
     * @return The corresponding Renderer instance, or nil if not found.
     */
    public func renderer(for type: String) -> Renderer? {
        return renderers[type]
    }
    
    /**
     * Removes the renderer for a given type. Useful for cleanup or dynamic loading.
     * @param type The string identifier of the component type to unregister.
     */
    func unregister(type: String) {
        renderers.removeValue(forKey: type)
        logger.registry("Unregistered renderer for type '\(type)'")
    }
    
    /**
     * Clears all registered renderers.
     */
    func reset() {
        renderers.removeAll()
        logger.registry("All renderers unregistered")
    }
}
