import Foundation
import UIKit
import Supabase

/// Main entry point for the Render iOS SDK
/// Provides a centralized API for configuring and using the rendering system
public class RenderEngine {
    
    /// Shared singleton instance
    @MainActor public static let shared = RenderEngine()
    
    private var isConfigured = false
    private var supabaseURL: URL?
    private var supabaseKey: String?
    
    @MainActor
    private var scenarioRepository: ScenarioRepository {
        DIContainer.shared.scenarioRepository
    }
    private var logger: Logger { DIContainer.shared.currentLogger }
    
    private init() {}
    
    /// Configure the SDK with Supabase credentials
    /// - Parameters:
    ///   - supabaseURL: The Supabase project URL
    ///   - supabaseKey: The Supabase anonymous key
    ///   - loggerConfiguration: Optional logger configuration
    @MainActor
    public func configure(
        supabaseURL: URL,
        supabaseKey: String,
        loggerConfiguration: LoggerConfiguration? = nil
    ) {
        self.supabaseURL = supabaseURL
        self.supabaseKey = supabaseKey
        
        // Configure DI Container with credentials
        DIContainer.shared.configure(supabaseURL: supabaseURL, supabaseKey: supabaseKey)
        
        // Configure logger if provided
        if let config = loggerConfiguration {
            configureLogger(config)
        }
        
        isConfigured = true
    }
    
    /// Render a scenario directly into a view controller
    /// - Parameters:
    ///   - scenarioKey: The key of the scenario to render
    ///   - viewController: The view controller to render into
    ///   - containerView: Optional container view, otherwise renders as push/modal
    @MainActor
    public func render(
        scenarioKey: String,
        in viewController: UIViewController,
        containerView: UIView? = nil
    ) async throws {
        guard isConfigured else {
            throw RenderSDKError.renderingError("RenderEngine not configured. Call configure() first.")
        }
        
        logger.sdk("Rendering scenario with key: \(scenarioKey)")
        
        let renderVC = RenderViewController(scenarioKey: scenarioKey)
        
        if let containerView = containerView {
            // Add as child view controller when container view is provided
            viewController.addChild(renderVC)
            renderVC.view.frame = containerView.bounds
            renderVC.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            containerView.addSubview(renderVC.view)
            renderVC.didMove(toParent: viewController)
        } else {
            // Default behavior: push or present
            if let navVC = viewController.navigationController {
                navVC.pushViewController(renderVC, animated: true)
            } else {
                let navVC = UINavigationController()
                navVC.viewControllers = [renderVC]
                viewController.present(navVC, animated: true)
            }
        }
    }
    
    /// Get a pre-configured view controller for a scenario
    /// - Parameter scenarioKey: The key of the scenario to render
    /// - Returns: A RenderViewController configured with the scenario
    @MainActor
    public func getViewController(scenarioKey: String) -> RenderViewController {
        let vc = RenderViewController(
            scenarioKey: scenarioKey
        )
        return vc
    }
    
    /// Configure the SDK logger
    /// - Parameter configuration: The logger configuration
    @MainActor
    public func configureLogger(_ configuration: LoggerConfiguration) {
        configureLogger(
            consoleEnabled: configuration.consoleEnabled,
            fileEnabled: configuration.fileEnabled,
            consoleLogLevel: configuration.consoleLogLevel,
            fileLogLevel: configuration.fileLogLevel,
            customLogFileURL: configuration.customLogFileURL
        )
    }
    
    /// Configure the SDK logger with custom settings
    @MainActor
    public func configureLogger(
        consoleEnabled: Bool = true,
        fileEnabled: Bool = true,
        consoleLogLevel: LogLevel = .info,
        fileLogLevel: LogLevel = .debug,
        customLogFileURL: URL? = nil
    ) {
        var loggers: [Logger] = []
        
        if consoleEnabled {
            let consoleLogger = ConsoleLogger(
                minimumLogLevel: consoleLogLevel,
                isEnabled: true,
                includeTimestamp: true
            )
            loggers.append(consoleLogger)
        }
        
        if fileEnabled {
            let fileLogger = FileLogger(
                minimumLogLevel: fileLogLevel,
                isEnabled: true,
                includeTimestamp: true,
                logFileURL: customLogFileURL
            )
            loggers.append(fileLogger)
        }
        
        // Update the DIContainer with the new logger configuration
        DIContainer.shared.updateLogger(ComposableLogger(loggers: loggers))
        
        logger.sdk("Logger configuration updated - Console: \(consoleEnabled), File: \(fileEnabled)")
    }
    
    /// Get the current log file URL (if file logging is enabled)
    /// - Returns: The URL of the log file, or nil if file logging is disabled
    @MainActor
    public func getLogFileURL() -> URL? {
        if let composableLogger = logger as? ComposableLogger {
            // Find the file logger and return its URL
            for case let fileLogger as FileLogger in composableLogger.loggers {
                return fileLogger.currentLogFileURL
            }
        }
        
        if let fileLogger = logger as? FileLogger {
            return fileLogger.currentLogFileURL
        }
        
        return nil
    }
}

/// Configuration for the SDK logger
public struct LoggerConfiguration {
    public let consoleEnabled: Bool
    public let fileEnabled: Bool
    public let consoleLogLevel: LogLevel
    public let fileLogLevel: LogLevel
    public let customLogFileURL: URL?
    
    public init(
        consoleEnabled: Bool = true,
        fileEnabled: Bool = true,
        consoleLogLevel: LogLevel = .info,
        fileLogLevel: LogLevel = .debug,
        customLogFileURL: URL? = nil
    ) {
        self.consoleEnabled = consoleEnabled
        self.fileEnabled = fileEnabled
        self.consoleLogLevel = consoleLogLevel
        self.fileLogLevel = fileLogLevel
        self.customLogFileURL = customLogFileURL
    }
}

