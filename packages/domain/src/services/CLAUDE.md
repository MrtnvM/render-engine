# Overview

**Domain Service** – a stateless business logic unit that operates on one or more domain entities and encapsulates **complex or cross-entity domain rules**. It can be an interface or class with implementation if operations can be made with only domain layer components without external components.

**Key Points:**

- 🧠 Contains **pure domain logic**, not infrastructure
- 🧩 Lives in the **Domain Layer**
- 🏛️ Independent of frameworks, DBs, APIs, or UIs
- 🧪 Fully unit-testable and side-effect free

---

## 🧰 TYPES OF DOMAIN SERVICES

- **Stateless class**
- Interface-first (if business rules are likely to vary or mock)
- Implements **pure logic** (no I/O, no DB, no HTTP)

---

## 📐 STRUCTURE & NAMING

- Name should reflect business logic:
  ✅ `TransferService`, ❌ `HelperUtils`

- Interface: `ITransferService`

- Implementation: `TransferService`

---

## ⚙️ INTERFACE DESIGN

- Define **business-centric methods**
- Method names use **imperative verbs**:
  ✅ `calculateDiscount`, ✅ `transferFunds`
- Prefer value objects and entities as input/output
- No external types (e.g., no DTOs, requests, responses)

```ts
// services/t-transfer.service.ts
export interface ITransferService {
  transferFunds(from: Account, to: Account, amount: Money): void;
}
```

---

## 🧪 IMPLEMENTATION RULES

- No framework logic
- No persistence access
- No logging, HTTP, or system dependencies
- Throw domain errors (`InvalidTransferError`, `InsufficientFundsError`) for rule violations

```ts
// services/transfer.service.ts
export class TransferService implements ITransferService {
  transferFunds(from: Account, to: Account, amount: Money): void {
    if (!from.canTransfer(amount)) {
      throw new InsufficientFundsError();
    }

    from.debit(amount);
    to.credit(amount);
  }
}
```

---

## 🧠 DOMAIN LANGUAGE

- Use rich **ubiquitous language** from the business domain
- ✅ `calculatePayout`, not ❌ `processData`
- ✅ `authorizeTransfer`, not ❌ `checkValidity`

---

## 🔄 PURE & TESTABLE

- No side effects
- No dependencies on date/time unless injected (`Clock` interface)
- Accept dependencies via constructor **only if needed** (e.g., policies, strategies)

---

## 🧪 TEST STRATEGY

- Write fast unit tests with mocked or in-memory domain entities
- Validate invariants, rules, and correct state transitions

---

## 📎 COMMON EXAMPLES

| Domain  | Service Name       | Responsibility                         |
| ------- | ------------------ | -------------------------------------- |
| Billing | `InvoiceService`   | Finalize invoice, calculate totals     |
| HR      | `PromotionService` | Promote employee based on rules        |
| Bank    | `TransferService`  | Move funds between accounts            |
| Ecom    | `CheckoutService`  | Calculate cart totals, apply discounts |

---

## 📦 DOMAIN EVENTS

- Allowed only in command-style methods
- Use: `this.addDomainEvent(new OrderCompleted(...))`
- Do **not** emit events from pure calculations

---

## 🧭 WHEN TO USE

Use a Domain Service **only when**:

- Logic doesn’t naturally belong to a single entity
- Multiple entities or value objects interact in the rule
- Logic needs to stay independent from adapters

If logic fits inside an entity, **put it in the entity**.

---

## NOTE

Ask the human if you not 95% sure and the logic:

- Should live in the entity instead
- Needs a domain event
- Depends on policies or rules that may vary over time
