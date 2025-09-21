class ComponentRegistry {
    // A private dictionary to store renderers, mapping type names to renderer instances.
    private var renderers: [String: Renderer] = [:]

    // Prevent direct instantiation; encourage using a singleton or injected instance.
    // If Render.shared is managing it, it would be an internal class.
    init() {}

    /**
     * Registers a Renderer instance for a specific component type.
     * If a renderer for this type already exists, it will be replaced.
     * @param renderer The Renderer instance to register.
     */
    func register(renderer: Renderer) {
        renderers[renderer.type] = renderer
        print("ComponentRegistry: Registered renderer for type '\(renderer.type)'")
    }

    /**
     * Retrieves the Renderer instance associated with a given component type.
     * @param type The string identifier of the component type (e.g., "text", "row").
     * @return The corresponding Renderer instance, or nil if not found.
     */
    func renderer(for type: String) -> Renderer? {
        return renderers[type]
    }
    
    /**
     * Removes the renderer for a given type. Useful for cleanup or dynamic loading.
     * @param type The string identifier of the component type to unregister.
     */
    func unregister(type: String) {
        renderers.removeValue(forKey: type)
        print("ComponentRegistry: Unregistered renderer for type '\(type)'")
    }
    
    /**
     * Clears all registered renderers.
     */
    func reset() {
        renderers.removeAll()
        print("ComponentRegistry: All renderers unregistered.")
    }
}
