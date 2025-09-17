# Overview

**DTO (Data Transfer Object)** – a structured contract for **data crossing application boundaries** (e.g., controller ↔ use case ↔ presenter).

**Key Points:**

- 🧩 Lives in the **Application Layer**
- 📦 Declared as **Zod schemas** (`z.object(...)`)
- 🧠 Types are inferred from Zod (`z.infer<typeof schema>`)
- 🚫 Contains **no logic**, just structure and validation
- 🔄 Used for input validation and output shaping

---

## 📂 FILE STRUCTURE

Each DTO lives in its own file in `dto/`, grouped by use case or entity.

**Example:**

```
dto/
    create-user.dto.ts
    user-response.dto.ts
```

---

## 📐 ZOD SCHEMA CONVENTIONS

- Define schema using `z.object({ ... })`
- Always **export the schema** and the **inferred type**
- Name conventions:
  - Schema: `createUserDtoSchema`
  - Type: `CreateUserDto`

**Example:**

```ts
// create-user.dto.ts
import { z } from 'zod'

export const createUserDtoSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
})

export type CreateUserDto = z.infer<typeof createUserDtoSchema>
```

---

## ✅ WHEN TO USE DTOs

- ✅ **Input from controllers** → UseCase
- ✅ **Output from use cases** → Presenter
- ✅ External data mapping (e.g. HTTP, CLI, API, file import)

---

## ❌ WHAT NOT TO DO

- ❌ Don’t add business logic or domain logic
- ❌ Don’t inject services
- ❌ Don’t reuse entities or persistence models
- ❌ Don’t put domain types here

---

## 🧠 NAMING RULES

| Context | Prefix Example          | Meaning                         |
| ------- | ----------------------- | ------------------------------- |
| Input   | `createUserDtoSchema`   | Data going _into_ the system    |
| Output  | `userResponseDtoSchema` | Data coming _out_ of the system |
| Partial | `updateUserDtoSchema`   | Partial updates (PATCH-like)    |

---

## 📤 DTO vs ENTITY

|            | DTO                | Entity                        |
| ---------- | ------------------ | ----------------------------- |
| Location   | `application/dto/` | `domain/`                     |
| Purpose    | Data transfer only | Domain rules, state, behavior |
| Logic      | ❌ None            | ✅ Yes                        |
| Validation | ✅ With Zod        | ✅ With zod/code + exceptions |
| Format     | JSON-safe          | Rich object                   |

---

## 🛠️ COMMON PATTERNS

- Combine multiple DTOs into `request`/`response` objects for complex use cases.
- Use `.refine()` or `.superRefine()` for advanced validation logic.
- You can `.transform()` only to shape data _without logic_ (e.g., `trim()`).

---

## 🔄 USE WITH CASES

Inside a Use Case:

```ts
import { createUserDtoSchema, CreateUserDto } from '@/application/dto/create-user.dto'

function execute(input: CreateUserDto): void {
  const parsed: CreateUserDto = createUserDtoSchema.parse(input)
  // Use parsed DTO to map to Domain Entity
}
```

---

## NOTE

Ask a human about naming, validation complexity, or any DTO transformations that may affect domain consistency.
