import { injectable } from "tsyringe"
import { promises as fs } from "node:fs"
import { join } from "node:path"
import { BaseLogger, LogLevel } from "@render-engine/domain"
import type { LogContext, LoggerOptions } from "@render-engine/domain"
import { Buffer } from "node:buffer"

export interface FileLoggerOptions extends LoggerOptions {
  logDir?: string;
  maxFileSize?: number; // in bytes
  maxFiles?: number;
}

@injectable()
export class FileLoggerService extends BaseLogger<FileLoggerOptions> {
  private _currentLogFile?: string
  private _currentFileSize = 0

  constructor(options: FileLoggerOptions) {
    super(options)
  }

  async debug(message: string, context?: LogContext): Promise<void> {
    await this.log(LogLevel.DEBUG, message, context)
  }

  async info(message: string, context?: LogContext): Promise<void> {
    await this.log(LogLevel.INFO, message, context)
  }

  async warn(message: string, context?: LogContext): Promise<void> {
    await this.log(LogLevel.WARN, message, context)
  }

  async error(message: string, context?: LogContext): Promise<void> {
    await this.log(LogLevel.ERROR, message, context)
  }

  async log(level: LogLevel, message: string, context?: LogContext): Promise<void> {
    if (level < this.level) {
      return
    }

    const logEntry = await this.formatMessage(level, message, context)

    try {
      await this.ensureLogDirectory()
      await this.rotateLogFileIfNeeded()
      await this.writeToLogFile(logEntry)
    } catch (error) {
      // Fallback to console if file logging fails
      console.error("File logging failed:", error)
      console.log(logEntry.trim())
    }
  }

  get logDir(): string {
    return this.options.logDir ?? "./logs"
  }

  get maxFileSize(): number {
    return this.options.maxFileSize ?? 10 * 1024 * 1024
  }

  get maxFiles(): number {
    return this.options.maxFiles ?? 5
  }

  child(context: LogContext): BaseLogger<FileLoggerOptions> {
    const options = {
      ...this.options,
      context: { ...this.context, ...context },
    }

    return new FileLoggerService(options)
  }

  private async ensureLogDirectory(): Promise<void> {
    try {
      await fs.access(this.logDir)
    } catch {
      await fs.mkdir(this.logDir, { recursive: true })
    }
  }

  private async rotateLogFileIfNeeded(): Promise<void> {
    if (!this._currentLogFile || this._currentFileSize >= this.maxFileSize) {
      await this.rotateLogFile()
    }
  }

  private async rotateLogFile(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    this._currentLogFile = join(this.logDir, `app-${timestamp}.log`)
    this._currentFileSize = 0

    // Clean up old log files
    await this.cleanupOldLogFiles()
  }

  private async cleanupOldLogFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.logDir)
      const logFiles = files
        .filter((file) => file.startsWith("app-") && file.endsWith(".log"))
        .map((file) => ({ name: file, path: join(this.logDir, file) }))
        .sort((a, b) => a.name.localeCompare(b.name))

      // Remove oldest files if we exceed maxFiles
      if (logFiles.length >= this.maxFiles) {
        const filesToRemove = logFiles.slice(0, logFiles.length - this.maxFiles + 1)
        for (const file of filesToRemove) {
          try {
            await fs.unlink(file.path)
          } catch (error) {
            // Ignore errors when removing old files
          }
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  private async writeToLogFile(logEntry: string): Promise<void> {
    if (!this._currentLogFile) {
      await this.rotateLogFile()
    }

    await fs.appendFile(this._currentLogFile!, logEntry, "utf8")
    this._currentFileSize += Buffer.byteLength(logEntry, "utf8")
  }
}
