import { DomainError } from './domain.error.js'

export class FormatError extends DomainError {
  readonly fieldName: string
  readonly value: unknown
  readonly expectedFormat: string

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.fieldName = params.metadata?.fieldName as string
    this.value = params.metadata?.value
    this.expectedFormat = params.metadata?.expectedFormat as string
  }

  static forField(fieldName: string, value: unknown, expectedFormat: string): FormatError {
    return new FormatError({
      message: `Field '${fieldName}' has invalid format. Expected: ${expectedFormat}, Got: ${String(value)}`,
      code: 'FORMAT_ERROR',
      metadata: { fieldName, value, expectedFormat },
    })
  }
}
