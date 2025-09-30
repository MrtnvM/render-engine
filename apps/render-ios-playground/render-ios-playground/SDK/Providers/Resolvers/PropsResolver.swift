class PropsResolver: ValueResolver {
    func resolve<T>(_ context: ValueContext<T>) -> ValueResult<T> {
        let key = context.key
        let type = context.type
        let props = context.props
        let component = context.component
        
        if let style = component.style.get(forKey: key, ofType: [String: Any].self) {
            if let type = style["type"] as? String, type == "prop" {
                if let value = props.get(forKey: key, type: T.self) {
                    return .value(value)
                }
            }
        }
        
        if let property = component.properties.get(forKey: key, type: [String: Any].self) {
            
            let propertyType = property["type"] as? String
            let valueKey = property["key"] as? String
            
            if let type = propertyType, type == "prop", let valueKey = valueKey {
                if let value = props.get(forKey: valueKey, type: T.self) {
                    return .value(value)
                }
            }
        }
        
        return .noValue
    }
}
