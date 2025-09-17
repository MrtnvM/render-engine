# Overview

**Application Service** – coordinates multiple use cases, domain entities, and external dependencies to implement a higher-level business process or feature.

**Key Points:**

- 🧠 Orchestrates **Use Cases**, **Repositories**, and **Domain Logic**
- 🏗️ Lives in the **Application Layer**
- 🧩 Pure TypeScript – no framework or infrastructure code
- 🔁 Reusable across UI, CLI, backend, mobile

---

## ⚙️ ROLE

- Encapsulates **orchestration logic** across **multiple use cases**
- May **compose other use cases**
- Should **not contain domain logic** itself
- Serves as a clean entrypoint for UI, HTTP, CLI, etc.

---

## 🔀 CAN IT USE OTHER USE CASES?

✅ **Yes. Application Services can use multiple use cases**

❌ **No. Use Cases must not call other Use Cases**

> This ensures each use case remains atomic and testable, while services handle higher-level coordination.

---

## 🧱 STRUCTURE & SHAPE

- Service is a **class**, named with a **verb phrase** (e.g., `OnboardUserService`)
- Dependencies are passed via constructor (**Dependency Injection**)

```ts
@injectable()
export class OnboardUserService {
  constructor(
    @inject(RegisterUserUseCase)
    private registerUser: RegisterUserUseCase,
    @inject(SendWelcomeEmailUseCase)
    private sendWelcome: SendWelcomeEmailUseCase,
  ) {}

  async execute(command: OnboardUserCommand): Promise<void> {
    const user = await this.registerUser.execute(command)
    await this.sendWelcome.execute({ email: user.email })
  }
}
```

---

## 🔌 DEPENDENCY RULES

- ✅ Allowed:
  - Use Cases
  - Repositories
  - Domain entities
  - Application services

- ❌ Not allowed:
  - Frameworks (e.g., Express, React, NestJS)
  - Database/HTTP clients (use ports/interfaces)
  - UI/View logic

---

## 🧪 TESTABILITY

- Fully testable with mocks or in-memory adapters
- Always test use cases separately from application services
- Services should be thin and mostly orchestration logic

---

## 🧼 STATELESSNESS

- Application services must remain stateless
- All relevant state lives in:
  - Input DTOs
  - Domain entities
  - Repositories

---

## 🧩 METHOD ORDER

1. 🏗️ Constructor with injected use cases/repositories/domain services
2. 🚀 Business centric methods (public entrypoints)
3. 🔧 Private helpers if needed

---

## 📦 DOMAIN EVENTS

- Services may trigger domain events **via use case methods**
- Domain entities hold the events → publish via `eventBus.publish(...)` after persistence
- Events should not be dispatched from services directly (unless wrapping a domain method)

---

## 🗣️ DOMAIN LANGUAGE

- Use **business-centric naming** throughout:
  - ✅ `sendVerificationEmail()`
  - ✅ `confirmUserIdentity()`
  - ❌ `setIsActive(true)`

---

## 📦 OUTPUT FORMAT

- Services return DTOs (never domain objects directly)
- Avoid leaking domain internals

---

## ✅ GOOD PRACTICES

- Keep logic lean — offload heavy work to:
  - Use cases
  - Domain methods

- Compose use cases when multiple steps are required
- Avoid overengineering; keep one class = one job

---

## NOTE

Ask the human if:

- You’re unsure whether the flow should be a single use case or a service
- You need a new use case for a specific sub-step
- You feel tempted to insert infrastructure code here
