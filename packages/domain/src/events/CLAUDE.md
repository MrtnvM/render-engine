# Overview

**Domain Event** – a business-relevant occurrence in the past tense, emitted by an entity or domain service to notify the system that something meaningful happened.

**Key Points:**

- 🔔 Represents something that **already happened**
- 📍 Lives in the **Domain Layer**
- 🧱 Immutable and serializable
- 🧃 Pure data – **no behavior**, only structure
- 🧩 Enables **event-driven workflows** across layers

---

## 🧱 STRUCTURE

- Inherit from the `DomainEvent` base class
- Must define:

  - `eventName` (string constant)
  - `aggregateId` (ID of the entity that emitted it)
  - `occurredAt` timestamp

- Add extra payload fields if needed

### ✅ Base Class

```ts
export abstract class DomainEvent {
  abstract readonly eventName: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;

  protected constructor(aggregateId: string, occurredAt?: Date) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt ?? new Date();
  }
}
```

### ✅ Example Event

```ts
import { DomainEvent } from "@/events/domain.event";

export class UserActivatedEvent extends DomainEvent {
  static readonly eventName = "user.activated";
  readonly eventName = UserActivatedEvent.eventName;

  constructor(aggregateId: string) {
    super(aggregateId);
  }
}
```

---

## 🏛️ LOCATION & BOUNDARIES

- Belongs in the **Domain Layer**, next to related entities
- Scoped to a **single aggregate**
- Should be **business-oriented**, not technical

✅ `UserActivatedEvent`
❌ `UserUpdatedEvent` (too generic)

---

## ⛓️ IMMUTABILITY

- Events must be **immutable**
- All fields are readonly
- No setters or state mutation

---

## 🧃 SERIALIZATION

- All fields must be **serializable**
- Use only primitive types, plain objects, and ISO strings

---

## 🔄 EMISSION RULES

- Only **command methods** can emit events
- Emit using a helper in the entity:

```ts
this.addDomainEvent(new UserActivatedEvent(this.id));
```

- Never emit from:

  - Query methods
  - Constructors
  - Accessors

---

## 🧭 NAMING CONVENTION

- Use **past-tense verbs**, business vocabulary
- ✅ `OrderShippedEvent`, `EmailConfirmedEvent`
- ❌ `SendEmailEvent`, `StartShippingEvent`

---

## 📦 ORGANIZATION

- Place under `@/events/`
- Group by **bounded context** or aggregate root

---

## ⚖️ WHY EVENTS?

- Decouples core logic from side effects (notifications, logging, integrations)
- Enables:

  - Event Sourcing
  - Audit trails
  - Async processing
  - Reactions across modules

---

## 📚 METHOD ORDER IN ENTITY (EVENTS PART)

Always emit domain events at the **end of a command method**:

```ts
activate(): void {
  if (!this.isActive) {
    this.isActive = true;
    this.addDomainEvent(new UserActivatedEvent(this.id));
  }
}
```

---

## NOTE

Talk to a human when:

- You're unsure whether an event belongs in the domain or application layer
- The event is triggered by a process, not an entity
- You need to coordinate multiple aggregates
