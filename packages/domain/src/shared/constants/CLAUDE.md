# Overview

**Shared Constants** - fixed values or enumerations that define important domain concepts, constraints, or standard codes shared across multiple entities and use cases.

**Key Points:**

- 💡 Represent domain rules or language (not app-specific config).
- 🧩 Live in the **Domain Layer**.
- 🏛️ Independent of frameworks, databases, or UI.
- 🔁 Reusable across entities, services, and use cases.

---

## 💬 PURPOSE

- Centralize key domain values: enums, status codes, roles, types
- Prevent hardcoded strings/numbers in logic
- Enhance clarity and reduce duplication

---

## 📦 ORGANIZATION

- Group by domain context:
  `shared/constants/user-role.ts`, `order-status.ts`, `currency.ts`

```ts
// Good: order-status.ts
export const OrderStatus = {
  PENDING: "pending",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
```

---

## ✅ NAMING CONVENTIONS

- Use **uppercase keys** in object-based enums
- Use **singular** and **descriptive** names

  - ✅ `UserRole`, `CurrencyCode`
  - ❌ `Roles`, `Enums`, `Constants`

---

## 🧪 TYPE SAFETY

- Always export both:

  - `const` object with `as const`
  - `type` derived from it

```ts
export const UserRole = {
  ADMIN: "admin",
  USER: "user",
  GUEST: "guest",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
```

---

## 🚫 WHAT NOT TO INCLUDE

- ❌ No UI labels, colors, or icons
- ❌ No framework-specific values
- ❌ No config or env vars (those belong to infrastructure)

---

## 🗣️ DOMAIN LANGUAGE

- Align constants with domain terminology
- Use exact business terms, not technical shortcuts

  - ✅ `SubscriptionTier`, ❌ `PlanLevel`
  - ✅ `AccountType`, ❌ `UserKind`

---

## 🤝 USAGE GUIDELINES

- Use constants in:

  - Entities (for validation, behavior branching)
  - Use Cases (business rules)
  - Domain Services (cross-entity logic)

- Never re-define or override them in lower layers

---

## NOTE

Ask the human if the values are subject to change over time or you not 95% sure. If yes, consider promoting them to a persisted config entity instead of hardcoded constants.
