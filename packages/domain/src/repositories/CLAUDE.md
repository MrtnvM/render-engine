# Overview

**Repository Interface** – defines **abstract access to entities** without exposing implementation details (DB, API, file system). It allows the **Domain** and **Application** layers to remain decoupled from infrastructure.

**Key Points:**

- 📁 Lives in the **Domain Layer**
- 💬 Describes what can be done, **not how**
- 🧩 Pure TypeScript – no external dependencies
- 🔌 Implemented by adapters in the **Infrastructure Layer**
- 🧪 Fully mockable for **use case testing**

---

## 🧠 RESPONSIBILITY

- Represent the **contract** for entity persistence
- Expose **intention-revealing** methods (save, find, delete, etc.)
- Do **not** leak infrastructure-specific details (e.g., SQL, HTTP, ORM)

---

## ✍️ NAMING CONVENTIONS

- Interface name: `UserRepository`, `InvoiceRepository`, etc.
- Always **entity-focused**
- Method names must reflect **business intent**:

  - ✅ `findByEmail(email: string): Promise<User | null>`
  - ✅ `save(user: User): Promise<void>`
  - ❌ `selectFromUsersTable()`
  - ❌ `upsertIfNeeded()`

---

## 🧩 TYPING RULES

- Return **entities** or **domain types**
- Return `Promise<T>` or `null` / `void` – no raw DB values
- Use **rich types** from domain:
  e.g., `UserId`, `Email`, not just `string`

---

## 🔁 STANDARD METHODS

Most repositories should include:

- `findById(id: EntityId): Promise<Entity | null>`
- `save(entity: Entity): Promise<void>`
- `delete(id: EntityId): Promise<void>`
- `exists(id: EntityId): Promise<boolean>`

Add additional **domain-specific** queries as needed.

---

## ❌ AVOID

- No implementation (no logic, no state)
- No framework types (Drizzle, Prisma, Axios, etc.)
- No references to `DTOs`, `Models`, or infrastructure-specific contracts
- No technical concerns like pagination or caching unless **part of business rule**

---

## ✅ GOOD PRACTICES

- Think in terms of **business use** – e.g.,
  `getActiveSubscriptionsForUser(userId: UserId): Promise<Subscription[]>`
- Let **application layer** decide batching, caching, retries
- Interface should be minimal and expressive
- Safe for mocking in unit tests

---

## 💡 WHY IN DOMAIN?

Placing repository interfaces in the **domain** ensures:

- 🔄 Persistence logic stays swappable
- 🧪 Core logic can be tested in isolation
- 🔍 Application logic works against business abstractions

---

## 🧪 MOCKING TIP

In use case tests, you can provide simple stubs:

```ts
const fakeRepo: UserRepository = {
  findById: async (id) => mockUser,
  save: async (user) => {},
  delete: async (id) => {},
};
```

---

## 🗣️ DOMAIN LANGUAGE

- Speak in **domain terms**
- ✅ `loadUserAggregate()`, `saveUserDraft()`
- ❌ `fetchFromDb()`, `insertRow()`

---

## 📦 OUTPUT FORMAT

- TypeScript-only, no implementation
- Aligned with business capabilities
- Expressed through domain entities and types

---

## NOTE

Ask the human if unsure **what behaviors should be persisted**, or **how entities should be retrieved** to support the domain use cases.
