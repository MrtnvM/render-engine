# Overview

**Shared Utils** are pure, reusable helpers that support domain logic across multiple entities, value objects, and domain services.

**Key Points:**

- 🧠 Pure functions only — **no side effects**
- 🧩 Lives in the **Domain Layer**
- 🏛️ Framework-agnostic, no imports from UI, HTTP, DB, or platform
- 🔁 Can be reused across many domain entities and use cases
- 🧪 Fully testable in isolation

---

## 📦 PURPOSE

Shared utils serve domain-level purposes only:

- Validation helpers: `isValidEmail()`, `assertNonEmptyString()`
- Calculation logic: `calculateAge()`, `percentageDiff()`
- Formatting: `normalizePhoneNumber()`, `formatCurrency()`
- Comparison: `areDatesEqual()`, `compareIds()`

---

## ✅ RULES

1. **Pure Functions Only**

   - No mutation of external state
   - No I/O (logging, network, DB, etc.)

2. **Domain-Only Context**

   - Must not reference app/infrastructure concepts (e.g., `fetch`, `axios`, `window`, `localStorage`)
   - Stick to domain language and problem space

3. **Small & Focused**

   - One job per util
   - Keep logic simple and expressive

4. **Reusable**

   - Should be used across multiple domain entities or services
   - Avoid tightly coupling to specific entity shapes

---

## 🧱 NAMING CONVENTIONS

- Verb-first, functional names

  - ✅ `isValidEmail()`, `calculateTax()`
  - ❌ `emailValidator()`, `TaxCalculator()`

- Use domain vocabulary

  - ✅ `isVipStatusEligible()`, `calculateSubscriptionFee()`

---

## 🧪 TESTABILITY

- Every util function must have **unit tests**
- No mocks should be needed — they must run in a pure runtime environment

---

## 🚫 ANTI-PATTERNS

Avoid the following inside domain utils:

- ❌ Logger usage
- ❌ Date.now(), Math.random() (unless injected or wrapped)
- ❌ Instantiating entities or services
- ❌ Accessing file system, environment, API, DB, or frameworks

---

## 📁 FOLDER STRUCTURE

```
shared/utils/
    ├── validation/
    │    └── isValidEmail.ts
    ├── math/
    │    └── calculatePercentage.ts
    ├── format/
    │    └── formatPhoneNumber.ts
    └── index.ts // re-export hub
```

Organize by **type of logic**, **not** by technical patterns.

---

## ✅ EXAMPLE

```ts
// shared/utils/validation/isNonEmptyString.ts

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
```

```ts
// shared/utils/math/calculatePercentage.ts

export function calculatePercentage(
  numerator: number,
  denominator: number
): number {
  if (denominator === 0) throw new Error("Cannot divide by zero");
  return (numerator / denominator) * 100;
}
```

---

## NOTE

Ask a human before introducing complex business rules here — if it requires decision-making, it's likely a domain service or value object instead.
