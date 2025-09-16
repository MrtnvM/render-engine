import { DomainEvent } from '../../../kernel/events/base.domain-event.js'
import { ID } from '../../../kernel/value-objects/id.value-object.js'

export class SchemaEvent extends DomainEvent {
  constructor(
    public readonly eventName: string,
    public readonly payload: { id: ID; name: string; version: string; changes?: string[] },
    occurredAt?: Date,
  ) {
    super({
      aggregateId: payload.id,
      eventName,
      payload,
      occurredAt,
    })
  }

  static created(schemaId: ID, schemaName: string, schemaVersion: string, occurredAt?: Date): SchemaEvent {
    return new SchemaEvent('schema.created', { id: schemaId, name: schemaName, version: schemaVersion }, occurredAt)
  }

  static updated(
    schemaId: ID,
    schemaName: string,
    schemaVersion: string,
    changes: string[],
    occurredAt?: Date,
  ): SchemaEvent {
    return new SchemaEvent(
      'schema.updated',
      { id: schemaId, name: schemaName, version: schemaVersion, changes },
      occurredAt,
    )
  }

  static deleted(schemaId: ID, schemaName: string, schemaVersion: string, occurredAt?: Date): SchemaEvent {
    return new SchemaEvent('schema.deleted', { id: schemaId, name: schemaName, version: schemaVersion }, occurredAt)
  }

  static published(schemaId: ID, schemaName: string, schemaVersion: string, occurredAt?: Date): SchemaEvent {
    return new SchemaEvent('schema.published', { id: schemaId, name: schemaName, version: schemaVersion }, occurredAt)
  }

  static deprecated(schemaId: ID, schemaName: string, schemaVersion: string, occurredAt?: Date): SchemaEvent {
    return new SchemaEvent('schema.deprecated', { id: schemaId, name: schemaName, version: schemaVersion }, occurredAt)
  }
}
