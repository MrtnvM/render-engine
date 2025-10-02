import { DomainError } from './domain.error.js'

export class ServiceUnavailableError extends DomainError {
  readonly serviceName: string
  readonly retryAfter?: number

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.serviceName = params.metadata?.serviceName as string
    this.retryAfter = params.metadata?.retryAfter as number
  }

  static forService(serviceName: string, retryAfter?: number): ServiceUnavailableError {
    const message = retryAfter
      ? `Service '${serviceName}' is temporarily unavailable. Retry after ${retryAfter} seconds`
      : `Service '${serviceName}' is temporarily unavailable`

    return new ServiceUnavailableError({
      message,
      code: 'SERVICE_UNAVAILABLE',
      metadata: { serviceName, retryAfter },
    })
  }
}
