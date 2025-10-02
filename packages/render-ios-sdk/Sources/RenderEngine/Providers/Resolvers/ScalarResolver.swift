class ScalarResolver: ValueResolver {
    func resolve<T>(_ context: ValueContext<T>) -> ValueResult<T> {
        let properties = context.component.properties
        let styles = context.component.style
        let key = context.key
        let type = context.type
        
        if let value = properties.get(forKey: key, type: type) {
            return .value(value)
        }
        
        if let value = styles.get(forKey: key, ofType: type) {
            return .value(value)
        }
        
        return .noValue
    }
}
