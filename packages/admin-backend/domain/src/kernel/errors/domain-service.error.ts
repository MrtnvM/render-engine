import { DomainError } from './domain.error.js'

export class DomainServiceError extends DomainError {
  readonly serviceName: string
  readonly operation: string
  readonly originalError?: string

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.serviceName = params.metadata?.serviceName as string
    this.operation = params.metadata?.operation as string
    this.originalError = params.metadata?.originalError as string
  }

  static forService(serviceName: string, operation: string, originalError?: string): DomainServiceError {
    return new DomainServiceError({
      message: `Domain service '${serviceName}' failed during operation '${operation}'`,
      code: 'DOMAIN_SERVICE_ERROR',
      metadata: { serviceName, operation, originalError },
    })
  }
}
