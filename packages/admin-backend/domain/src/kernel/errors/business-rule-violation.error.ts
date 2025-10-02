import { DomainError } from './domain.error.js'

export class BusinessRuleViolationError extends DomainError {
  readonly ruleName: string
  readonly context: Record<string, unknown>

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.ruleName = params.metadata?.ruleName as string
    this.context = params.metadata?.context as Record<string, unknown>
  }

  static forRule(ruleName: string, context: Record<string, unknown> = {}): BusinessRuleViolationError {
    return new BusinessRuleViolationError({
      message: `Business rule '${ruleName}' has been violated`,
      code: 'BUSINESS_RULE_VIOLATION',
      metadata: { ruleName, context },
    })
  }
}
