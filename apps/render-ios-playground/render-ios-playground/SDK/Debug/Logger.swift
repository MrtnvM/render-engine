import Foundation

/**
 # Render SDK Logger System
 
 The Render SDK provides a comprehensive logging system with multiple logger implementations:
 
 ## Available Loggers:
 - **ConsoleLogger**: Outputs logs to the console (print statements)
 - **FileLogger**: Writes logs to a file with thread-safe operations
 - **ComposableLogger**: Combines multiple loggers to output to multiple destinations
 - **SilentLogger**: Disables all logging output
 
 ## Usage Examples:
 
 ### Basic Usage:
 ```swift
 let logger = DIContainer.shared.currentLogger
 logger.info("Application started")
 logger.error("Something went wrong", category: "Network")
 ```
 
 ### Custom Configuration:
 ```swift
 RenderSDK.shared.configureLogger(
     consoleEnabled: true,
     fileEnabled: true,
     consoleLogLevel: .info,
     fileLogLevel: .debug
 )
 ```
 
 ### Direct Logger Usage:
 ```swift
 let consoleLogger = ConsoleLogger(minimumLogLevel: .warning)
 let fileLogger = FileLogger(minimumLogLevel: .debug)
 let composableLogger = ComposableLogger(loggers: [consoleLogger, fileLogger])
 ```
 
 ## Log Levels:
 - **debug**: Detailed information for debugging
 - **info**: General information about app flow
 - **warning**: Potentially harmful situations
 - **error**: Error events that might still allow the app to continue
 */

/// Log levels for the Render SDK
public enum LogLevel: Int, CaseIterable {
    case debug = 0
    case info = 1
    case warning = 2
    case error = 3
    
    var emoji: String {
        switch self {
        case .debug:
            return "🐛"
        case .info:
            return "ℹ️"
        case .warning:
            return "⚠️"
        case .error:
            return "❌"
        }
    }
    
    var name: String {
        switch self {
        case .debug:
            return "DEBUG"
        case .info:
            return "INFO"
        case .warning:
            return "WARNING"
        case .error:
            return "ERROR"
        }
    }
}

/// Logger protocol for the Render SDK
public protocol Logger {
    /// Log a message at the specified level
    func log(level: LogLevel, message: String, category: String?)
    
    /// Log a debug message
    func debug(_ message: String, category: String?)
    
    /// Log an info message
    func info(_ message: String, category: String?)
    
    /// Log a warning message
    func warning(_ message: String, category: String?)
    
    /// Log an error message
    func error(_ message: String, category: String?)
}

/// Console implementation of the Logger protocol
public class ConsoleLogger: Logger {
    
    /// The minimum log level to display
    public var minimumLogLevel: LogLevel
    
    /// Whether logging is enabled
    public var isEnabled: Bool
    
    /// Whether to include timestamps in log messages
    public var includeTimestamp: Bool
    
    
    public init(
        minimumLogLevel: LogLevel = .debug,
        isEnabled: Bool = true,
        includeTimestamp: Bool = true
    ) {
        self.minimumLogLevel = minimumLogLevel
        self.isEnabled = isEnabled
        self.includeTimestamp = includeTimestamp
    }
    
    public func log(level: LogLevel, message: String, category: String?) {
        guard isEnabled && level.rawValue >= minimumLogLevel.rawValue else {
            return
        }
        
        var logMessage = "\(level.emoji) [RenderSDK] \(level.name)"
        
        if let category = category {
            logMessage += " [\(category)]"
        }
        
        if includeTimestamp {
            let timestamp = DateFormatter.logTimestamp.string(from: Date())
            logMessage += " \(timestamp)"
        }
        
        logMessage += " \(message)"
        
        print(logMessage)
    }
    
    public func debug(_ message: String, category: String?) {
        log(level: .debug, message: message, category: category)
    }
    
    public func info(_ message: String, category: String?) {
        log(level: .info, message: message, category: category)
    }
    
    public func warning(_ message: String, category: String?) {
        log(level: .warning, message: message, category: category)
    }
    
    public func error(_ message: String, category: String?) {
        log(level: .error, message: message, category: category)
    }
    
    // MARK: - Convenience Methods with Default Arguments
    
    public func debug(_ message: String, category: String? = nil, file: String = #file, function: String = #function, line: Int = #line) {
        debug(message, category: category, file: file, function: function, line: line)
    }
    
    public func info(_ message: String, category: String? = nil, file: String = #file, function: String = #function, line: Int = #line) {
        info(message, category: category, file: file, function: function, line: line)
    }
    
    public func warning(_ message: String, category: String? = nil, file: String = #file, function: String = #function, line: Int = #line) {
        warning(message, category: category, file: file, function: function, line: line)
    }
    
    public func error(_ message: String, category: String? = nil, file: String = #file, function: String = #function, line: Int = #line) {
        error(message, category: category, file: file, function: function, line: line)
    }
}

/// File-based implementation of the Logger protocol
public class FileLogger: Logger {
    
    /// The minimum log level to display
    public var minimumLogLevel: LogLevel
    
    /// Whether logging is enabled
    public var isEnabled: Bool
    
    /// Whether to include timestamps in log messages
    public var includeTimestamp: Bool
    
    
    /// The file URL to write logs to
    private let logFileURL: URL
    
    /// Queue for thread-safe file writing
    private let fileQueue = DispatchQueue(label: "com.rendersdk.filelogger", qos: .utility)
    
    public init(
        minimumLogLevel: LogLevel = .debug,
        isEnabled: Bool = true,
        includeTimestamp: Bool = true,
        logFileURL: URL? = nil
    ) {
        self.minimumLogLevel = minimumLogLevel
        self.isEnabled = isEnabled
        self.includeTimestamp = includeTimestamp
        
        // Default to Documents directory if no URL provided
        if let logFileURL = logFileURL {
            self.logFileURL = logFileURL
        } else {
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            self.logFileURL = documentsPath.appendingPathComponent("rendersdk.log")
        }
    }
    
    public func log(level: LogLevel, message: String, category: String?) {
        guard isEnabled && level.rawValue >= minimumLogLevel.rawValue else {
            return
        }
        
        var logMessage = "\(level.emoji) [RenderSDK] \(level.name)"
        
        if let category = category {
            logMessage += " [\(category)]"
        }
        
        if includeTimestamp {
            let timestamp = DateFormatter.logTimestamp.string(from: Date())
            logMessage += " \(timestamp)"
        }
        
        logMessage += " \(message)\n"
        
        fileQueue.async { [weak self] in
            guard let self = self else { return }
            
            do {
                if !FileManager.default.fileExists(atPath: self.logFileURL.path) {
                    FileManager.default.createFile(atPath: self.logFileURL.path, contents: nil, attributes: nil)
                }
                
                if let data = logMessage.data(using: .utf8) {
                    let fileHandle = try FileHandle(forWritingTo: self.logFileURL)
                    defer { fileHandle.closeFile() }
                    
                    fileHandle.seekToEndOfFile()
                    fileHandle.write(data)
                }
            } catch {
                print("Failed to write to log file: \(error)")
            }
        }
    }
    
    public func debug(_ message: String, category: String?) {
        log(level: .debug, message: message, category: category)
    }
    
    public func info(_ message: String, category: String?) {
        log(level: .info, message: message, category: category)
    }
    
    public func warning(_ message: String, category: String?) {
        log(level: .warning, message: message, category: category)
    }
    
    public func error(_ message: String, category: String?) {
        log(level: .error, message: message, category: category)
    }
    
    // MARK: - Convenience Methods with Default Arguments
    
    public func debug(_ message: String, category: String? = nil, file: String = #file, function: String = #function, line: Int = #line) {
        debug(message, category: category, file: file, function: function, line: line)
    }
    
    public func info(_ message: String, category: String? = nil, file: String = #file, function: String = #function, line: Int = #line) {
        info(message, category: category, file: file, function: function, line: line)
    }
    
    public func warning(_ message: String, category: String? = nil, file: String = #file, function: String = #function, line: Int = #line) {
        warning(message, category: category, file: file, function: function, line: line)
    }
    
    public func error(_ message: String, category: String? = nil, file: String = #file, function: String = #function, line: Int = #line) {
        error(message, category: category, file: file, function: function, line: line)
    }
    
    /// Get the current log file URL
    public var currentLogFileURL: URL {
        return logFileURL
    }
    
    /// Clear the log file
    public func clearLogFile() {
        fileQueue.async { [weak self] in
            guard let self = self else { return }
            
            do {
                try "".write(to: self.logFileURL, atomically: true, encoding: .utf8)
            } catch {
                print("Failed to clear log file: \(error)")
            }
        }
    }
}

/// Composable logger that forwards messages to multiple loggers
public class ComposableLogger: Logger {
    
    let loggers: [Logger]
    
    public init(loggers: [Logger]) {
        self.loggers = loggers
    }
    
    public func log(level: LogLevel, message: String, category: String?) {
        loggers.forEach { logger in
            logger.log(level: level, message: message, category: category)
        }
    }
    
    public func debug(_ message: String, category: String?) {
        loggers.forEach { $0.debug(message, category: category) }
    }
    
    public func info(_ message: String, category: String?) {
        loggers.forEach { $0.info(message, category: category) }
    }
    
    public func warning(_ message: String, category: String?) {
        loggers.forEach { $0.warning(message, category: category) }
    }
    
    public func error(_ message: String, category: String?) {
        loggers.forEach { $0.error(message, category: category) }
    }
    
    /// Add a new logger to the composition
    public func addLogger(_ logger: Logger) -> ComposableLogger {
        return ComposableLogger(loggers: loggers + [logger])
    }
    
    /// Remove a logger from the composition (by type)
    public func removeLogger<T: Logger>(ofType type: T.Type) -> ComposableLogger {
        let filteredLoggers = loggers.filter { !($0 is T) }
        return ComposableLogger(loggers: filteredLoggers)
    }
}

/// Silent logger that doesn't output anything
public class SilentLogger: Logger {
    public init() {}
    
    public func log(level: LogLevel, message: String, category: String?) {
        // Do nothing
    }
    
    public func debug(_ message: String, category: String?) {}
    public func info(_ message: String, category: String?) {}
    public func warning(_ message: String, category: String?) {}
    public func error(_ message: String, category: String?) {}
}

// MARK: - Extensions

extension DateFormatter {
    static let logTimestamp: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm:ss.SSS"
        return formatter
    }()
}

/// Convenience extension for logging with categories
extension Logger {
    /// Log with SDK category
    func sdk(_ message: String, level: LogLevel = .info) {
        log(level: level, message: message, category: "SDK")
    }
    
    /// Log with ComponentRegistry category
    func registry(_ message: String, level: LogLevel = .info) {
        log(level: level, message: message, category: "ComponentRegistry")
    }
    
    /// Log with RenderViewController category
    func renderVC(_ message: String, level: LogLevel = .info) {
        log(level: level, message: message, category: "RenderViewController")
    }
    
    // MARK: - Convenience Methods with Default Arguments
    
    /// Log a debug message with default arguments
    func debug(_ message: String, category: String? = nil) {
        debug(message, category: category)
    }
    
    /// Log an info message with default arguments
    func info(_ message: String, category: String? = nil) {
        info(message, category: category)
    }
    
    /// Log a warning message with default arguments
    func warning(_ message: String, category: String? = nil) {
        warning(message, category: category)
    }
    
    /// Log an error message with default arguments
    func error(_ message: String, category: String? = nil) {
        error(message, category: category)
    }
}
