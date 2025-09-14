import { DomainEvent } from "@/events/domain.event";

export interface IEventBus {
  publish(...events: DomainEvent[]): Promise<void>;
}
