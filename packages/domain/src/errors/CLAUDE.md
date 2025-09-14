# Overview

**Domain Error** – a business-relevant exception or failure that expresses a violation of rules, missing data, or invalid transitions in the core domain logic.

**Key Points:**

- 💡 Represents _expected_ domain-level failures, not system bugs.
- 🧩 Lives in the **Domain Layer**.
- 🏛️ Fully **framework-agnostic**, no dependencies on infrastructure or UI.
- 🎯 Expresses **intentional rules**, not technical errors (e.g., validation, preconditions).

---

## 📛 TYPES OF DOMAIN ERRORS

Use specific classes to categorize your domain errors:

- `ValidationError` – invalid field or value (e.g., empty name, bad format).
- `BusinessRuleViolation` – valid input, but violates business logic (e.g., can't cancel a shipped order).
- `EntityNotFoundError` – requested entity doesn’t exist in the system (by ID).
- `InvariantViolation` – attempt to break entity-level consistency.

Extend a common base class: `DomainError`.

---

## 🏗️ STRUCTURE & CONSTRUCTION

Each error must:

- Extend `DomainError` base class
- Accept a **human-readable message** and optional metadata
- Use `static factory methods` where helpful:
  `static becauseUserIsInactive()`
  `static invalidEmail(email: string)`

```ts
class InactiveUserError extends DomainError {
  static becauseUserIsInactive(userId: string) {
    return new InactiveUserError(`User ${userId} is inactive.`, { userId });
  }
}
```

---

## 🧠 DOMAIN CONTEXT

- Each error should **convey domain meaning**, not technical implementation.
- Avoid low-level terms like “null”, “undefined”, “database”, etc.
- Prefer:
  ✅ `UserAlreadyRegisteredError`
  ❌ `EmailAlreadyExistsException`

---

## 📦 ERROR GROUPING & NAMING

Structure and name errors to reflect domain boundaries:

- `UserAlreadyRegisteredError` – **User domain**
- `InsufficientFundsError` – **Payment domain**
- `ProjectNameEmptyError` – **Project domain**

Use one error file per domain, or per aggregate.

---

## 🔄 USAGE STRATEGY

- Errors must be **thrown by entities or domain services**, not adapters
- Catch and map them in the **application layer** (e.g., to use case result or presenter model)
- Never throw generic `Error` in the domain layer

---

## 🧪 TESTABILITY

- Errors must be **class-based** to allow `instanceof` checks:

```ts
if (err instanceof InactiveUserError) {
  // handle accordingly
}
```

- Include error codes or types if needed for mapping

---

## 🗣️ DOMAIN LANGUAGE

Use rich, explicit domain language in error names and messages:

- ✅ `CannotRemovePrimaryOwnerError`
- ✅ `ProjectDeadlineInPastError`
- ✅ `InsufficientInventoryError`

Avoid:

- ❌ `GenericDomainError`
- ❌ `InvalidInputError` (too vague)

---

## ❗ INVARIANTS VS ERRORS

- **Invariants** should be enforced inside entities using domain errors
- Errors may be thrown:

  - During construction (`create*`)
  - On state mutation (`changeStatus`)
  - Inside validation methods (`validateX`)

---

## 📦 OUTPUT FORMAT

- No external libraries (`Result`, `Either`, etc. may exist in Application layer only)
- Plain class-based error objects
- Strictly typed

---

## EXAMPLE

```typescript
import { DomainError } from "@/errors/domain.error";

export class UserAlreadyRegisteredError extends DomainError {
  static withEmail(email: string): UserAlreadyRegisteredError {
    return new UserAlreadyRegisteredError({
      message: `A user with email ${email} is already registered.`,
      code: "USER_ALREADY_REGISTERED_WITH_EMAIL",
      metadata: { email },
    });
  }

  private constructor(params: {
    message: string;
    code: string;
    metadata?: Record<string, unknown>;
  }) {
    super(params);
  }
}
```

---

## NOTE

Ask a human for guidance when:

- Error meaning is ambiguous
- Business rules are unclear
- You’re unsure whether to throw or prevent an operation
