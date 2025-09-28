import UIKit
import PostgREST
import Supabase

// Public interface for the SDK
class RenderSDK {
    static let shared = RenderSDK()
    
    private let client = DIContainer.shared.supabaseClient
    private let componentRegistry = DIContainer.shared.componentRegistry
    private let scenarioRepository = DIContainer.shared.scenarioRepository
    private let scenarioFetcher = DIContainer.shared.scenarioService
    private var logger: Logger { DIContainer.shared.currentLogger }

    private init() {}

    // Option 1: Render into an existing view
    func render(
        scenarioKey: String,
        vc: UIViewController,
        containerView view: UIView? = nil
    ) async throws {
        do {
            let scenario = try await scenarioRepository
                .fetchScenario(key: scenarioKey)
            
            logger.sdk("Rendering scenario with ID: \(scenario.id)")
            logger.sdk("Scenario version: \(scenario.version) (\(scenario.build_number))")
            
            let renderVC = await RenderViewController(
                scenario: scenario
            )
            
            if let navVC = await vc.navigationController {
                await navVC.pushViewController(
                    renderVC,
                    animated: true
                )
            } else {
                await MainActor.run {
                    let navVC = UINavigationController()
                    navVC.viewControllers = [renderVC]
                    vc.present(navVC, animated: true)
                }
            }
        } catch {
            logger.error("Render SDK error: \(error.localizedDescription)", category: "SDK")
            throw error
        }
    }

    // Option 2: Create and return a new view controller
    func getViewController(scenarioKey key: String) -> RenderViewController {
        let vc = RenderViewController(
            scenarioKey: key
        )
        return vc
    }
    
    // MARK: - Logger Configuration
    
    /// Configure the SDK logger with custom settings
    func configureLogger(
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
    func getLogFileURL() -> URL? {
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
