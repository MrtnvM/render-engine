import { injectable } from "tsyringe"
import { BaseLogger, LogLevel } from "@render-engine/domain"
import type { LogContext, LoggerOptions } from "@render-engine/domain"

export interface CompositeLoggerOptions extends LoggerOptions {
  loggers: BaseLogger[];
}

@injectable()
export class CompositeLoggerService extends BaseLogger<CompositeLoggerOptions> {
  constructor(options: CompositeLoggerOptions) {
    super(options)
  }

  get loggers(): readonly BaseLogger[] {
    return this.options.loggers
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context)
  }

  log(level: LogLevel, message: string, context?: LogContext): void {
    const mergedContext = { ...this.context, ...context }

    // Log to all backends
    for (const logger of this.loggers) {
      try {
        logger.log(level, message, mergedContext)
      } catch (error) {
        // If one logger fails, continue with others
        console.error(`Logger failed:`, error)
      }
    }
  }

  child(context: LogContext): BaseLogger<CompositeLoggerOptions> {
    const childLoggers = this.loggers.map((logger) => logger.child(context))
    return new CompositeLoggerService({
      ...this.options,
      loggers: childLoggers,
      context: { ...this.context, ...context },
    })
  }

  // Add a new logger to the composite
  addLogger(logger: BaseLogger): void {
    this.options.loggers.push(logger)
  }

  // Remove a logger from the composite
  removeLogger(logger: BaseLogger): void {
    const index = this.options.loggers.indexOf(logger)
    if (index > -1) {
      this.options.loggers.splice(index, 1)
    }
  }
}
