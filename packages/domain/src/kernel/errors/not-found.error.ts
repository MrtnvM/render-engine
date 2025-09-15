import { DomainError } from './domain.error.js'

export class NotFoundError extends DomainError {
  readonly entityType: string
  readonly entityId: string

  private constructor(params: { message: string; code: string; metadata?: Record<string, unknown> }) {
    super(params)
    this.entityType = params.metadata?.entityType as string
    this.entityId = params.metadata?.entityId as string
  }

  static forEntity(entityType: string, entityId: string): NotFoundError {
    return new NotFoundError({
      message: `${entityType} with ID '${entityId}' not found`,
      code: 'ENTITY_NOT_FOUND',
      metadata: { entityType, entityId },
    })
  }

  static forResource(resource: string, id: string): NotFoundError {
    return new NotFoundError({
      message: `${resource} not found: ${id}`,
      code: 'NOT_FOUND',
      metadata: { entityType: resource, entityId: id },
    })
  }
}
