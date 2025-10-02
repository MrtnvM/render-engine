import { DomainError } from './domain.error.js'

export class EntityAlreadyExistsError extends DomainError {
  readonly entityType: string
  readonly entityId: string

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.entityType = params.metadata?.entityType as string
    this.entityId = params.metadata?.entityId as string
  }

  static forEntity(entityType: string, entityId: string): EntityAlreadyExistsError {
    return new EntityAlreadyExistsError({
      message: `${entityType} with ID '${entityId}' already exists`,
      code: 'ENTITY_ALREADY_EXISTS',
      metadata: { entityType, entityId },
    })
  }
}
