struct ValueContext<T> {
    let key: String
    let type: T.Type
    let component: Component
    let props: Config
}

enum ValueResult<T> {
    case value(T)
    case noValue
}

protocol ValueResolver {
    func resolve<T>(_ context: ValueContext<T>) -> ValueResult<T>
}

class ValueProvider {
    private let resolvers: [ValueResolver]
    
    init(resolvers: [ValueResolver]) {
        self.resolvers = resolvers
    }
    
    func resolve<T>(_ context: ValueContext<T>) -> T? {
        for resolver in resolvers {
            let result = resolver.resolve(context)
            
            if case let .value(value) = result {
                return value
            }
        }
        
        return nil
    }
}
