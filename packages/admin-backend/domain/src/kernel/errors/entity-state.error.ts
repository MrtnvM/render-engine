import { DomainError } from './domain.error.js'

export class EntityStateError extends DomainError {
  readonly entityType: string
  readonly currentState: string
  readonly requiredState: string

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.entityType = params.metadata?.entityType as string
    this.currentState = params.metadata?.currentState as string
    this.requiredState = params.metadata?.requiredState as string
  }

  static forState(entityType: string, currentState: string, requiredState: string): EntityStateError {
    return new EntityStateError({
      message: `${entityType} is in invalid state '${currentState}' for this operation. Required state: '${requiredState}'`,
      code: 'ENTITY_STATE_ERROR',
      metadata: { entityType, currentState, requiredState },
    })
  }
}
