import { ID } from '../value-objects/id.value-object'

export interface DomainEventPayload {
  [key: string]: unknown
}

export abstract class DomainEvent<TPayload extends DomainEventPayload = DomainEventPayload> {
  readonly eventName: string
  readonly occurredAt: Date
  readonly aggregateId: ID | null
  readonly payload: TPayload

  protected constructor(params: { aggregateId: ID | null; eventName: string; payload: TPayload; occurredAt?: Date }) {
    this.aggregateId = params.aggregateId
    this.eventName = params.eventName
    this.occurredAt = params.occurredAt ?? new Date()
    this.payload = params.payload
    Object.freeze(this.payload)
  }

  toJSON(): object {
    return {
      aggregateId: this.aggregateId?.toPrimitive(),
      eventName: this.eventName,
      payload: this.payload,
      occurredAt: this.occurredAt.toISOString(),
    }
  }

  toString(): string {
    const payload = JSON.stringify(this.payload)
    const occurredAt = this.occurredAt.toISOString()
    const aggregateId = this.aggregateId?.toPrimitive()

    return `${this.eventName} - ${aggregateId} - ${occurredAt} - ${payload}`
  }
}
