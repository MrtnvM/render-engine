# Overview

Entity - a core business object with unique identity and domain logic that stays valid across any application (web, mobile, backend) and persists over time.

**Key Points:**

- 💡 Contains domain rules (not just data).
- 🧩 Lives in the Domain Layer.
- 🏛️ Independent of frameworks, databases, or UI.
- 🔁 Can be reused across multiple use cases.

---

## 🆔 IDENTITY

- Use `uuid` (string) as entity ID unless told otherwise
- ID is **immutable**
- Entities are compared by ID only (`equals()` method)

---

## 🏗️ CONSTRUCTION STRATEGY

- Use **static factory methods**: `create*`, `fromPersistence*`, `createDraft*`
- `fromPersistence()` must reconstruct the entity from a plain object
- Constructors are `private`
- Validate fields in separate static methods

---

## ⚖️ INVARIANT ENFORCEMENT

- Invariants go inside the entity (single-entity rules)
- Throw exceptions (`throw new Error(...)`) for invariant violations or invalid states
- Validate before changing state
- Operations must be atomic

---

## 🔄 STATE MANAGEMENT

- Use **mutable entities with controlled access**
- Private fields, exposed via **getters**
- Never allow direct mutation

---

## 📚 METHOD GROUPING & ORDER

Structure methods in this exact order, with comments:

1. 🏭 Factory Methods

   - `static create*`, `static fromPersistence*`

2. 📝 Command Methods (State-Changing)

   - Group by:
     a) Core Business  
     b) Lifecycle  
     c) Info Updates
   - Use imperative verbs (e.g., `activateUser`, `updateAddress`)

3. 🔍 Query Methods (Read-Only)

   - Use descriptive/question names: `canCancel()`, `calculateTax()`

4. 👀 Property Accessors

   - Getters for accessing private state

5. 🔒 Private Methods

   - Internal validation: `validate*`, `ensure*`

6. ⚖️ Utility Methods
   - `equals()`, `toString()`, etc.

## 🗣️ DOMAIN LANGUAGE

- Use business verbs and domain concepts
- ✅ `recordDeposit()` instead of ❌ `addToBalance()`
- ✅ `promoteToVip()` instead of ❌ `setTier()`

---

## 📦 DOMAIN EVENTS

- Only command methods can emit events:  
  this.addDomainEvent(new SomethingHappenedEvent(...));
- Query methods **must not emit events**

---

## 📦 OUTPUT FORMAT

- No external libraries or infrastructure code
- Focus on business logic only
- Follow all naming, grouping, and structure rules above

---

## NOTE

Ask human about decisions that needs to make to do perfect entity
