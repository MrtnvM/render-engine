import { DomainError } from './domain.error.js'

export class RequiredFieldError extends DomainError {
  readonly fieldName: string
  readonly entityType: string

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.fieldName = params.metadata?.fieldName as string
    this.entityType = params.metadata?.entityType as string
  }

  static forField(fieldName: string, entityType: string): RequiredFieldError {
    return new RequiredFieldError({
      message: `Required field '${fieldName}' is missing in ${entityType}`,
      code: 'REQUIRED_FIELD_ERROR',
      metadata: { fieldName, entityType },
    })
  }
}
