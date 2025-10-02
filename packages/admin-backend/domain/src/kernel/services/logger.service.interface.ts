export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  [key: string]: unknown
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  traceId?: string
}

export interface LoggerOptions {
  level?: LogLevel
  context?: LogContext
  traceId?: string
}

export abstract class BaseLogger<Options extends LoggerOptions = LoggerOptions> {
  private readonly _options: Options

  constructor(options: Options) {
    this._options = options
  }

  abstract debug(message: string, context?: LogContext): void
  abstract info(message: string, context?: LogContext): void
  abstract warn(message: string, context?: LogContext): void
  abstract error(message: string, context?: LogContext): void

  /**
   * Perform actual writing of the complete log message
   * @param message
   */
  abstract log(level: LogLevel, message: string, context?: LogContext): void

  /**
   * Child logger with additional context
   * @param context
   * @returns new logger with additional context
   */
  abstract child(context: LogContext): BaseLogger<Options>

  get level(): LogLevel {
    return this._options.level ?? LogLevel.INFO
  }

  get context(): LogContext {
    return this._options.context ?? {}
  }

  get traceId(): string | undefined {
    return this._options.traceId
  }

  protected get options(): Options {
    return this._options
  }

  logFunction(name: string, context?: LogContext) {
    const methodContext = { method: name, ...context }

    return {
      enter: (args?: unknown[]) => {
        this.debug(`Entering ${name}`, { ...methodContext, args })
      },
      exit: (result?: unknown) => {
        this.debug(`Exiting ${name}`, { ...methodContext, result })
      },
      error: (error: unknown) => {
        this.error(`Error in ${name}`, { ...methodContext, error })
      },
    }
  }

  protected async formatMessage(level: LogLevel, message: string, context?: LogContext): Promise<string> {
    const timestamp = new Date().toISOString()
    const levelLabel = LogLevel[level]
    const contextStr = this.formatContext({ ...this.context, ...context })
    const traceStr = this.traceId ? ` [${this.traceId}]` : ''

    const logEntryMessage = `[${timestamp}] [${levelLabel}]${traceStr}: ${message}${contextStr}\n`
    return logEntryMessage
  }

  protected formatContext(context: LogContext): string {
    if (!context || Object.keys(context).length === 0) {
      return ''
    }

    try {
      return ` | ${JSON.stringify(context)}`
    } catch {
      return ` | [Context serialization failed]`
    }
  }
}
