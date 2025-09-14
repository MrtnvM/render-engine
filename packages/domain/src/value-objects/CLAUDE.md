# Overview

**Value Object** – an immutable domain object that models a concept **without identity**. Two value objects are equal **if all their properties are equal**. They encapsulate rules, validations, and formatting logic for domain-specific values.

**Key Points:**

- ✅ **No unique ID**
- 🔁 **Compared by value**
- 💡 **Enforce domain rules**
- 🧩 Lives in the **Domain Layer**
- 🏛️ Independent of frameworks, databases, or UI
- ♻️ Fully replaceable and reusable

---

## 🏗️ CONSTRUCTION STRATEGY

- Always use **static factory methods**: `create*`, `from*`, `parse*`, etc.
- Constructors are `private` to enforce validation
- All input is validated before creating an instance
- `from*()` for deserialization or reconstruction
- Do **not allow partial/invalid creation**

---

## ♻️ IMMUTABILITY

- Value objects are **immutable** by design
- All fields are `readonly` (if possible)
- No command methods that mutate internal state
- All transformation methods must **return a new instance**

---

## ⚖️ INVARIANT ENFORCEMENT

- Validate all inputs during construction
- Throw `DomainError` on invalid values
- Encapsulate rules like formatting, length, bounds, structure, etc.
- Examples:

  - `EmailAddress.create("not-an-email")` → throws
  - `CurrencyAmount.create(-1)` → throws

---

## 📚 METHOD GROUPING & ORDER

Structure methods in this exact order, with comments:

1. 🏭 Factory Methods

   - `static create*`, `static from*`, `static parse*`

2. 🔄 Transformation Methods

   - Methods that return **new ValueObjects** based on logic
   - Example: `multiplyBy()`, `adjustedForTax()`

3. 🔍 Query Methods (Read-Only)

   - Example: `isValid()`, `isPositive()`

4. 👀 Property Accessors

   - Getters like `value`, `toString()`, `asNumber()`

5. ⚖️ Utility Methods

   - `equals()`, `toJSON()`, `toString()`
   - Validation helpers: `validate*`, `ensure*`

6. 🔒 Private Methods

---

## 🗣️ DOMAIN LANGUAGE

- Use rich domain terminology in method and variable names
- ✅ `FullName.create('John Doe')`
- ✅ `Price.adjustedForTax(rate)`
- ❌ `new FullName('John Doe')`
- ❌ `price.add(anotherPrice) // without context`

---

## 🔁 EQUALITY

- Use `equals(other: ValueObject)` method for comparison
- Compare **all properties** deeply
- Use deep equality for nested value objects

---

## 🧪 SERIALIZATION & INTEROPERABILITY

- Implement:

  - `toPrimitive()`: primitive form (string, number, etc.)
  - `toJSON()`: plain object for storage or network

- Avoid coupling to frameworks or libraries
- Do **not** expose internal formatting logic outside

---

## 📦 DOMAIN EVENTS

- **DO NOT** emit domain events from value objects
  (They are stateless and pure)

---

## 📦 OUTPUT FORMAT

- No external libraries or infrastructure code
- Pure business logic
- Follow naming, grouping, and structural conventions

---

## NOTE

Ask the human if you not 95% sure that:

- The value object contains **multiple fields** (e.g., `FullName`)
- The value object should support **transformation logic**
- The object needs **serialization methods** (`toJSON`, `fromJSON`, etc.)
- The object will be compared deeply or by one field (`value`, `code`, etc.)
