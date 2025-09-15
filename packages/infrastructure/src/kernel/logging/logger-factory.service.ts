import { injectable } from "tsyringe"
import type { BaseLogger, LogContext, LoggerOptions } from "@render-engine/domain"
import { LogLevel } from "@render-engine/domain"
import { ConsoleLoggerService } from "./console-logger.service.js"
import type { FileLoggerOptions } from "./file-logger.service.js"
import { FileLoggerService } from "./file-logger.service.js"
import { CompositeLoggerService } from "./composite-logger.service.js"

export interface LoggerConfig {
  level?: LogLevel;
  console?: boolean;
  file?: FileLoggerOptions;
  context?: Record<string, unknown>;
  traceId?: string;
}

@injectable()
export class LoggerFactoryService {
  createLogger(config: LoggerConfig = {}): BaseLogger {
    // Merge with environment defaults
    const loggerOptions: LoggerOptions = {
      level: config.level ?? this.getLogLevelFromEnv(),
      context: { ...this.getEnvContext(), ...config.context },
      traceId: config.traceId ?? this.getTraceIdFromEnv(),
    }

    const loggers: BaseLogger[] = []

    // Add console logger if enabled
    const shouldAddConsoleLogger = config.console ?? this.getConsoleLoggerFromEnv()
    if (shouldAddConsoleLogger) {
      const consoleLogger = new ConsoleLoggerService(loggerOptions)
      loggers.push(consoleLogger)
    }

    // Add file logger if configured
    if (config.file) {
      const fileLogger = new FileLoggerService({
        ...loggerOptions,
        ...config.file,
      })
      loggers.push(fileLogger)
    }

    // If no loggers configured, default to console
    if (loggers.length === 0) {
      loggers.push(new ConsoleLoggerService(loggerOptions))
    }

    // If only one logger, return it directly
    if (loggers.length === 1) {
      return loggers[0]
    }

    // Otherwise, return composite logger
    return new CompositeLoggerService({ ...loggerOptions, loggers })
  }

  createConsoleLogger(options: LoggerOptions): BaseLogger {
    return new ConsoleLoggerService({
      level: options.level ?? this.getLogLevelFromEnv(),
      context: { ...this.getEnvContext(), ...options.context },
      traceId: options.traceId ?? this.getTraceIdFromEnv(),
    })
  }

  createFileLogger(options: FileLoggerOptions): BaseLogger {
    return new FileLoggerService({
      level: options.level ?? this.getLogLevelFromEnv(),
      context: { ...this.getEnvContext(), ...options.context },
      traceId: options.traceId ?? this.getTraceIdFromEnv(),

      logDir: options.logDir ?? this.getLogDirFromEnv(),
      maxFileSize: options.maxFileSize ?? this.getMaxFileSizeFromEnv(),
      maxFiles: options.maxFiles ?? this.getMaxFilesFromEnv(),
    })
  }

  createCompositeLogger(loggers: BaseLogger[], context?: LogContext, traceId?: string): BaseLogger {
    return new CompositeLoggerService({
      loggers,
      level: this.getLogLevelFromEnv(),
      context: { ...this.getEnvContext(), ...context },
      traceId: traceId ?? this.getTraceIdFromEnv(),
    })
  }

  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase()

    switch (envLevel) {
      case "DEBUG":
        return LogLevel.DEBUG
      case "INFO":
        return LogLevel.INFO
      case "WARN":
        return LogLevel.WARN
      case "ERROR":
        return LogLevel.ERROR
      default:
        // Default based on NODE_ENV
        return process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG
    }
  }

  private getConsoleLoggerFromEnv(): boolean {
    return process.env.LOG_CONSOLE === "true"
  }

  private getLogDirFromEnv(): string {
    return process.env.LOG_DIR || "./logs"
  }

  private getMaxFileSizeFromEnv(): number {
    const envSize = process.env.LOG_MAX_FILE_SIZE
    if (envSize) {
      const parsed = Number.parseInt(envSize, 10)
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed
      }
    }
    return 1 * 1024 * 1024 // 1MB default
  }

  private getMaxFilesFromEnv(): number {
    const envFiles = process.env.LOG_MAX_FILES
    if (envFiles) {
      const parsed = Number.parseInt(envFiles, 10)
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed
      }
    }
    return 5 // Default to 5 files
  }

  private getEnvContext(): LogContext {
    const context: LogContext = {
      env: process.env.NODE_ENV || "development",
      pid: process.pid,
    }

    // Add app-specific context
    if (process.env.APP_NAME) {
      context.app = process.env.APP_NAME
    }

    if (process.env.APP_VERSION) {
      context.version = process.env.APP_VERSION
    }

    // Add deployment context
    if (process.env.DEPLOYMENT_ID) {
      context.deployment = process.env.DEPLOYMENT_ID
    }

    return context
  }

  private getTraceIdFromEnv(): string | undefined {
    // Allow external trace ID injection
    if (process.env.TRACE_ID) {
      return process.env.TRACE_ID
    }

    // Generate new trace ID if not provided
    if (process.env.LOG_TRACE_ID === "true") {
      return this.generateTraceId()
    }

    return undefined
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Static method to show available environment variables
  static getEnvVars(): Record<string, string> {
    return {
      LOG_LEVEL: "DEBUG|INFO|WARN|ERROR (default: INFO in prod, DEBUG in dev)",
      LOG_CONSOLE: "true|false (default: true in dev, false in prod)",
      LOG_FILE: "true|false (default: false)",
      LOG_DIR: "Directory for log files (default: ./logs)",
      LOG_MAX_FILE_SIZE: "Max file size in bytes (default: 10485760 = 10MB)",
      LOG_MAX_FILES: "Max number of log files to keep (default: 5)",
      LOG_TRACE_ID: "true|false (default: false) - auto-generate trace IDs",
      APP_NAME: "Application name for logging context",
      APP_VERSION: "Application version for logging context",
      DEPLOYMENT_ID: "Deployment identifier for logging context",
      TRACE_ID: "External trace ID to use (overrides auto-generation)",
    }
  }
}
