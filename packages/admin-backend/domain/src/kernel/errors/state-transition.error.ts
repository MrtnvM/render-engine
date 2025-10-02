import { DomainError } from './domain.error.js'

export class StateTransitionError extends DomainError {
  readonly currentState: string
  readonly targetState: string
  readonly entityType: string

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.currentState = params.metadata?.currentState as string
    this.targetState = params.metadata?.targetState as string
    this.entityType = params.metadata?.entityType as string
  }

  static forTransition(params: {
    currentState: string
    targetState: string
    entityType: string
    context?: Record<string, unknown>
  }): StateTransitionError {
    return new StateTransitionError({
      message: `Invalid state transition from '${params.currentState}' to '${params.targetState}' for ${params.entityType}`,
      code: 'STATE_TRANSITION_ERROR',
      metadata: {
        currentState: params.currentState,
        targetState: params.targetState,
        entityType: params.entityType,
        context: params.context,
      },
    })
  }
}
