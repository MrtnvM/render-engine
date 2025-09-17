import { injectable } from 'tsyringe'
import { BaseLogger, LogLevel } from '@render-engine/domain'
import type { LoggerOptions, LogContext } from '@render-engine/domain'

@injectable()
export class ConsoleLoggerService extends BaseLogger<LoggerOptions> {
  constructor(options: LoggerOptions) {
    super(options)
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

  async log(level: LogLevel, message: string, context?: LogContext): Promise<void> {
    const logMessage = await this.formatMessage(level, message, context)

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage)
        break
      case LogLevel.INFO:
        console.info(logMessage)
        break
      case LogLevel.WARN:
        console.warn(logMessage)
        break
      case LogLevel.ERROR:
        console.error(logMessage)
        break
    }
  }

  child(context: LogContext): BaseLogger<LoggerOptions> {
    return new ConsoleLoggerService({
      ...this.options,
      context: { ...this.context, ...context },
    })
  }
}
