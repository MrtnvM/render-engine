class PropsResolver: ValueResolver {
    private let logger = DIContainer.shared.logger

    func resolve<T>(_ context: ValueContext<T>) -> ValueResult<T> {
        let key = context.key
        let props = context.props
        let component = context.component

        logger.debug("PropsResolver.resolve called for key: '\(key)'", category: "PropsResolver")
        logger.debug("Props keys available: \(props.getRawDictionary().keys.joined(separator: ", "))", category: "PropsResolver")

        if let style = component.style.get(forKey: key, ofType: [String: Any].self) {
            logger.debug("Found style for key '\(key)': \(style)", category: "PropsResolver")
            if let type = style["type"] as? String, type == "prop" {
                if let value = props.get(forKey: key, type: T.self) {
                    logger.debug("Resolved from style prop reference: \(value)", category: "PropsResolver")
                    return .value(value)
                }
            }
        }

        if let property = component.properties.get(forKey: key, type: [String: Any].self) {
            logger.debug("Found property for key '\(key)': \(property)", category: "PropsResolver")

            let propertyType = property["type"] as? String
            let valueKey = property["key"] as? String

            if let type = propertyType, type == "prop", let valueKey = valueKey {
                logger.debug("Property is a prop reference with valueKey: '\(valueKey)'", category: "PropsResolver")
                // Handle dot notation (e.g., "item.image")
                if valueKey.contains(".") {
                    logger.debug("Using dot notation resolution for '\(valueKey)'", category: "PropsResolver")
                    if let value = resolveDottedPath(valueKey, in: props, type: T.self) {
                        logger.debug("Resolved dotted path to: \(value)", category: "PropsResolver")
                        return .value(value)
                    } else {
                        logger.warning("Failed to resolve dotted path '\(valueKey)'", category: "PropsResolver")
                    }
                } else {
                    // Simple key lookup
                    logger.debug("Using simple key lookup for '\(valueKey)'", category: "PropsResolver")
                    if let value = props.get(forKey: valueKey, type: T.self) {
                        logger.debug("Resolved simple key to: \(value)", category: "PropsResolver")
                        return .value(value)
                    } else {
                        logger.warning("Failed to resolve simple key '\(valueKey)'", category: "PropsResolver")
                    }
                }
            }
        }

        logger.debug("No value resolved for key '\(key)'", category: "PropsResolver")
        return .noValue
    }

    private func resolveDottedPath<T>(_ path: String, in props: Config, type: T.Type) -> T? {
        let components = path.split(separator: ".").map(String.init)
        guard !components.isEmpty else {
            logger.warning("resolveDottedPath: empty path", category: "PropsResolver")
            return nil
        }

        logger.debug("resolveDottedPath: path='\(path)', components=\(components)", category: "PropsResolver")

        // Start with the first component from props
        var currentValue: Any? = props.get(forKey: components[0])
        logger.debug("First component '\(components[0])' = \(currentValue ?? "nil")", category: "PropsResolver")

        // Navigate through remaining components
        for component in components.dropFirst() {
            if let dict = currentValue as? [String: Any] {
                currentValue = dict[component]
                logger.debug("Navigated to '\(component)' = \(currentValue ?? "nil")", category: "PropsResolver")
            } else {
                logger.warning("Cannot navigate '\(component)' - not a dictionary", category: "PropsResolver")
                return nil
            }
        }

        // Try to cast to the requested type
        let result = currentValue as? T
        logger.debug("Final cast to \(T.self): \(result != nil ? "success" : "failed")", category: "PropsResolver")
        return result
    }
}
