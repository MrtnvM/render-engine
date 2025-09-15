// Example of how to use the logging system
// This file demonstrates the basic usage patterns

import { ConsoleLoggerService } from "./console-logger.service.js"
import { FileLoggerService } from "./file-logger.service.js"
import { CompositeLoggerService } from "./composite-logger.service.js"
import { LogLevel } from "@render-engine/domain"

// Example 1: Basic console logging
export function basicConsoleLogging() {
  const logger = new ConsoleLoggerService({ level: LogLevel.INFO, context: { service: "ExampleService" } })

  logger.info("Starting basic console logging example")
  logger.debug("Debug information", { step: "initialization" })
  logger.warn("Warning message", { level: "medium" })
  logger.error("Error occurred", { code: "E001", details: "Something went wrong" })
}

// Example 2: File logging
export async function fileLoggingExample() {
  const logger = new FileLoggerService({
    logDir: "./logs",
    maxFileSize: 1024 * 1024, // 1MB
    maxFiles: 3,
    level: LogLevel.INFO, // INFO level
    context: { service: "FileLoggerExample" },
  })

  await logger.info("Starting file logging example")
  await logger.debug("This will be filtered out due to INFO level")
  await logger.info("This will be written to file")
  await logger.warn("Warning in file", { timestamp: new Date().toISOString() })
  await logger.error("Error logged to file", { error: "File operation failed" })
}

// Example 3: Composite logging
export function compositeLoggingExample() {
  const consoleLogger = new ConsoleLoggerService({
    level: LogLevel.DEBUG,
    context: { service: "CompositeLoggerExample" },
  }) // DEBUG
  const fileLogger = new FileLoggerService({
    logDir: "./logs",
    level: LogLevel.INFO, // INFO level
    context: { service: "CompositeLoggerExample" },
  })

  const compositeLogger = new CompositeLoggerService({
    loggers: [consoleLogger, fileLogger],
    level: LogLevel.INFO,
    context: { service: "CompositeLoggerExample" },
  })

  // This goes to both console and file
  compositeLogger.info("Important message", { priority: "high" })

  // This goes only to console (file logger is set to INFO level)
  compositeLogger.debug("Debug info", { step: "processing" })
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("=== Logging System Examples ===\n")

  basicConsoleLogging()
  console.log()

  // Note: File logging examples are async and would need proper async handling
  console.log("File logging example would create logs in ./logs directory")
  console.log()

  compositeLoggingExample()
  console.log()

  fileLoggingExample()
  console.log()
}
