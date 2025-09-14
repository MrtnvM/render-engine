export abstract class DomainEvent {
  abstract readonly eventName: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;

  protected constructor(aggregateId: string, occurredAt?: Date) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt ?? new Date();
  }
}
