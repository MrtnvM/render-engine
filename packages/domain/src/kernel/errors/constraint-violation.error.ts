import { DomainError } from './domain.error.js'

export class ConstraintViolationError extends DomainError {
  readonly constraintName: string
  readonly violatedValue: unknown

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.constraintName = params.metadata?.constraintName as string
    this.violatedValue = params.metadata?.violatedValue
  }

  static forConstraint(constraintName: string, violatedValue: unknown): ConstraintViolationError {
    return new ConstraintViolationError({
      message: `Domain constraint '${constraintName}' has been violated. Value: ${String(violatedValue)}`,
      code: 'CONSTRAINT_VIOLATION',
      metadata: { constraintName, violatedValue },
    })
  }
}
