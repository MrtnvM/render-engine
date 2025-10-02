import { container } from 'tsyringe'
import { BaseLogger } from '../../services/logger.service.interface.js'

/**
 * Get a logger for a class
 * @param cls - The class to get a logger for
 * @returns A logger for the class
 */
export function logger(cls: string | { name: string }): BaseLogger {
  const name = typeof cls === 'string' ? cls : cls?.name
  const injectedLogger = container.resolve<BaseLogger>(Symbol.for('Logger'))

  if (injectedLogger) {
    const logger = injectedLogger.child({ name })
    return logger
  }

  throw new Error('No logger found')
}

/**
 * Measure the duration of an operation
 * @param operation - The operation to measure
 * @returns [result, durationInSeconds]
 */
export async function measure<T>(operation: () => Promise<T>): Promise<[T, string]> {
  const startTime = performance.now()
  const result = await operation()
  const endTime = performance.now()

  const duration = `${(endTime - startTime).toFixed(2)}s`
  return [result, duration]
}
