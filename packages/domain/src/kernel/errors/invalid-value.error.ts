import { DomainError } from './domain.error.js'

export class InvalidValueError extends DomainError {
  readonly fieldName: string
  readonly value: unknown
  readonly expectedFormat: string

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.fieldName = params.metadata?.fieldName as string
    this.value = params.metadata?.value
    this.expectedFormat = params.metadata?.expectedFormat as string
  }

  static forField(fieldName: string, value: unknown, expectedFormat: string): InvalidValueError {
    return new InvalidValueError({
      message: `Field '${fieldName}' has invalid value. Expected format: ${expectedFormat}, Got: ${String(value)}`,
      code: 'INVALID_VALUE_ERROR',
      metadata: { fieldName, value, expectedFormat },
    })
  }

  static invalidUUID(value: unknown): InvalidValueError {
    return new InvalidValueError({
      message: `Invalid UUID format: ${String(value)}. Expected UUID v4 format (8-4-4-4-12 hexadecimal digits with hyphens)`,
      code: 'INVALID_VALUE_ERROR',
      metadata: {
        fieldName: 'uuid',
        value,
        expectedFormat: 'UUID v4',
      },
    })
  }
}
