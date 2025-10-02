import type { DomainEvent } from '../events/index.js'

export interface IEventBus {
  publish(...events: DomainEvent[]): Promise<void>
}
