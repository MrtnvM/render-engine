import Foundation
import Supabase

/// Dependency injection container for the application
class DIContainer {
    nonisolated(unsafe) static let shared = DIContainer()
    
    private var _supabaseURL: URL?
    private var _supabaseKey: String?
    
    private init() {}
    
    /// Configure the container with Supabase credentials
    func configure(supabaseURL: URL, supabaseKey: String) {
        self._supabaseURL = supabaseURL
        self._supabaseKey = supabaseKey
        // Reset supabase client to use new credentials
        _supabaseClient = nil
    }
    
    lazy var networkClient: NetworkClient = {
        return NetworkClient()
    }()
    
    lazy var imageLoader: ImageLoader = {
        return ImageLoader()
    }()
    
    private var _supabaseClient: SupabaseClient?
    var supabaseClient: SupabaseClient {
        if let client = _supabaseClient {
            return client
        }
        
        guard let url = _supabaseURL, let key = _supabaseKey else {
            fatalError("DIContainer not configured. Call configure(supabaseURL:supabaseKey:) first.")
        }
        
        let client = SupabaseClient(supabaseURL: url, supabaseKey: key)
        _supabaseClient = client
        return client
    }
    
    // MARK: - Repositories
    
    @MainActor
    lazy var scenarioRepository: ScenarioRepository = {
        return ScenarioRepositoryImpl(supabaseClient: supabaseClient)
    }()
    
    // MARK: SDK
    
    lazy var logger: Logger = {
        let consoleLogger = ConsoleLogger(
            minimumLogLevel: .debug,
            isEnabled: true,
            includeTimestamp: true
        )
        
        let fileLogger = FileLogger(
            minimumLogLevel: .debug,
            isEnabled: true,
            includeTimestamp: true
        )
        
        return ComposableLogger(loggers: [consoleLogger, fileLogger])
    }()
    
    lazy var componentRegistry: ComponentRegistry = {
        let registry = ComponentRegistry()
        let renderers: [Renderer] = [
            ViewRenderer(),
            RowRenderer(),
            ColumnRenderer(),
            StackRenderer(),
            TextRenderer(),
            ButtonRenderer(),
            ImageRenderer(),
            CheckboxRenderer(),
            StepperRenderer(),
            RatingRenderer(),
            NavbarRenderer(),
            SpacerRenderer()
        ]
        renderers.forEach { registry.register(renderer: $0) }
        return registry
    }()
    
    lazy var valueProvider: ValueProvider = {
        let resolvers: [ValueResolver] = [
            ScalarResolver(),
            PropsResolver(),
        ]
        return ValueProvider(resolvers: resolvers)
    }()
    
    // MARK: - Logger Management
    
    private var _logger: Logger?
    
    /// Get the current logger instance
    var currentLogger: Logger {
        return _logger ?? logger
    }
    
    /// Update the logger configuration
    func updateLogger(_ newLogger: Logger) {
        _logger = newLogger
    }
}
