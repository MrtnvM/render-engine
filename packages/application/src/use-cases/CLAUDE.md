# Overview

Use Case – a specific application-level operation that orchestrates domain logic and external interfaces to achieve a business goal.

**Key Points:**

- 🎯 Encapsulates business workflows
- 🧩 Lives in the **Application Layer**
- 🏛️ Independent of frameworks, transport layers, or storage
- 🔁 Calls domain entities, domain services, and repositories

---

## 🧠 PURPOSE

- Coordinates **one business transaction** or **workflow**
- Invokes **domain logic**, emits **domain events**, and communicates with **adapters** via interfaces
- Contains **no UI**, **no DB**, and **no framework code**

---

## ⚙️ STRUCTURE

Each use case is implemented as a class:

```ts
@injectable()
export class CreateUserUseCase {
  constructor(
    @inject('IUserRepository')
    private userRepository: IUserRepository,
    @inject('IEventBus')
    private eventBus: IEventBus,
  ) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    // ...
  }
}
```

---

## 🧩 METHOD GROUPING & ORDER

Structure your use case class in this exact order:

1. 📦 Constructor
   - Inject dependencies via interfaces

2. 🏁 Public Method
   - `execute(input): Promise<output>`
   - Single entry point

3. ⚖️ Validation
   - Use domain-level validation
   - Throw domain errors

4. 🧠 Business Flow
   - Coordinate domain entities and services
   - Enforce atomicity and invariants

5. 📣 Emit Events
   - Emit domain or integration events after success

6. 📤 Return DTO
   - Always return simplified, serializable output

---

## 🧪 INPUT & OUTPUT TYPES

- Define strict DTOs:
  - `CreateUserInput` – passed to `execute()`
  - `CreateUserOutput` – returned by `execute()`

✅ Use Zod TypeScript interfaces for input validation (at boundaries)
🚫 Do **not** return domain objects directly

---

## 🛑 ERROR HANDLING

- Throw **domain errors** (not strings)
- Use specific error classes:
  `UserAlreadyExistsError`, `InvalidEmailError`
- Catch them at controller layer for translation

---

## 🔌 Interfaces

Use cases depend on **interfaces**, not infrastructure:

```ts
interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  save(user: User): Promise<void>
}

interface IEventBus {
  publish(...events: DomainEvent[]): Promise<void>
}
```

---

## 🗣️ BUSINESS LANGUAGE

- Method and class names must express intent
- ✅ `CreateUserUseCase` instead of ❌ `UserHandler`
- ✅ `SuspendAccountUseCase` instead of ❌ `SuspendAccountManager`

---

## 🔄 IDIOMATIC FLOW

```ts
1. Validate input
2. Query repository
3. Call domain logic
4. Save entities
5. Emit events (if needed)
6. Return DTO
```

---

## 🚫 WHAT NOT TO DO

- ❌ No direct DB calls
- ❌ No HTTP, or framework code
- ❌ No object mapping (handled in mappers/presenters)

---

## NOTE

Ask a human if unsure about:

- Use case boundaries
- Interface definitions
- Handling edge conditions
