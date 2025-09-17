# Overview

**Job** – a scheduled or long-running operation that orchestrates application logic across use cases, aggregates, or external services.

**Key Points:**

- 🧠 Encapsulates application-specific workflows (not domain logic)
- 🧩 Lives in the **Application Layer**
- ⏱️ May be triggered manually, by schedule, or by events
- 🧼 Should be side-effect free during orchestration, side-effectful only via repositories/gateways
- ♻️ Re-runnable / idempotent where possible

---

## 🧱 RESPONSIBILITIES

- Invoke **use cases** to achieve a specific workflow
- Handle **cross-cutting concerns** (logging, retries, transactions)
- Coordinate **repositories**, **gateways**, and **domain entities**
- Emit **application events** or **domain events** through use cases

---

## ✳️ JOB TYPES

- **Scheduled** – runs periodically (e.g., nightly cleanup)
- **Triggered** – invoked by an external event (e.g., webhook, queue message)
- **Manual/Ad-hoc** – triggered by an admin or backend task

---

## 🛠️ IMPLEMENTATION STRATEGY

- Jobs are implemented as **Application Services** (classes)
- Must be **purely application-layer**: no controller/framework logic
- Use **dependency injection** for all collaborators (use cases, repos)
- Group in `application/jobs` folder
- Prefer **named jobs** (e.g., `SyncUserDataJob`, `GenerateMonthlyReportsJob`)

---

## 📋 STRUCTURE

Structure inside a Job class:

1. **Constructor**
   - Inject use cases, repositories, gateways, loggers

2. **Public `run()` Method**
   - Orchestrates the entire job
   - Must return success/failure result or throw domain/application error
   - Handles retryable and non-retryable failure modes

3. **Private Helpers**
   - Break down complex logic into small private methods
   - Pure and testable logic (where possible)

---

## 🧪 TESTABILITY

- Jobs should be **unit-testable** in isolation
- Inject all dependencies (no hardcoded implementations)
- Assert side effects via mocks (e.g., `expect(sendEmail).toHaveBeenCalled()`)

---

## 🚫 AVOID

- ❌ Direct DB access (always go through repositories)
- ❌ Domain logic inside jobs (delegate to use cases and entities)
- ❌ Framework-specific logic (e.g., Express, CRON packages)
- ❌ Emitting events directly (unless use case triggers them)

---

## 🧠 DOMAIN AWARENESS

- Jobs **use domain models** but do not define or alter domain rules
- Validation/invariants must happen in **use cases** or **domain layer**
- Jobs may read state and delegate change through commands

---

## 🔄 IDEMPOTENCY

- Wherever possible, make jobs **idempotent**
  - E.g., re-running `SyncCustomerDataJob` should not break system state

- Use domain models’ invariants and timestamps to skip redundant updates

---

## 🧭 NAMING & ORGANIZATION

- Name jobs with intent:
  ✅ `ArchiveExpiredSessionsJob`
  ❌ `DoStuffJob`

- Organize in `application/jobs/`

- Filename convention: `kebab-case` (e.g., `sync-orders.job.ts`)

---

## ✅ EXAMPLE

```ts
@injectable()
export class SendOverdueRemindersJob {
  constructor(
    @inject(FetchOverdueUsersUseCase)
    private fetchOverdueUsers: FetchOverdueUsersUseCase,
    @inject(FetchOverdueUsersUseCase)
    private readonly sendReminder: SendReminderUseCase,
    @inject('ILogger')
    private readonly logger: ILogger,
  ) {}

  async run(): Promise<void> {
    const users = await this.fetchOverdueUsers.execute()
    for (const user of users) {
      try {
        await this.sendReminder.execute({ userId: user.id })
      } catch (err) {
        this.logger.warn(`Reminder failed for ${user.id}: ${err}`)
      }
    }
  }
}
```

---

## 📦 OUTPUT FORMAT

- No framework code
- No HTTP concerns
- No CLI scaffolding
- Just business orchestration logic

---

## NOTE

Ask a human for business logic clarity, schedule rules, and what to do when conflicting workflows emerge or if you not 95% sure about implementation.
