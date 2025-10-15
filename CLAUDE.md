# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Render Engine is a Backend-Driven UI (BDUI) framework that enables dynamic mobile and web interfaces through server-side configurations. It allows creating, deploying, and updating UI components without app releases. The project is written in Russian with documentation primarily in Russian.

## Monorepo Structure

This is a pnpm workspace monorepo with the following structure:

### Applications

- **`apps/admin`** - React admin panel (Vite + TanStack Router) for managing UI configurations
- **`apps/admin-backend`** - Backend API service (Hono + Drizzle ORM) for the admin panel
- **`apps/render-cli`** - CLI tool for managing configurations and transpiling JSX to JSON schemas
- **`apps/render-ios-playground`** - iOS playground app for testing configurations (Swift)
- **`apps/render-android-playground`** - Android playground app for testing configurations (Kotlin)

### Packages

- **`packages/admin-backend/`** - Clean Architecture layers for backend:
  - **`domain/`** - Domain entities, value objects, and business rules (organized by DDD domains)
  - **`application/`** - Use cases, DTOs, and services
  - **`infrastructure/`** - Database implementations, external services
- **`packages/render-admin-sdk`** - JSX-to-JSON transpiler SDK using Babel (the core transpiler)
- **`packages/render-ios-sdk`** - Swift SDK for iOS applications
- **`packages/eslint-config`** - Shared ESLint configuration

## Development Commands

Run from the root directory:

```bash
# Development
pnpm dev              # Start all dev servers in parallel
pnpm build            # Build all packages and apps
pnpm test             # Run all tests across all packages
pnpm lint             # Run linters on all packages
pnpm format           # Format all code with Prettier

# Individual apps/packages
cd apps/admin && pnpm dev          # Admin panel only
cd apps/admin-backend && pnpm dev  # Backend only
cd apps/render-cli && pnpm dev     # CLI only

# Admin backend specific
cd apps/admin-backend
pnpm db:generate     # Generate Drizzle migrations
pnpm db:migrate      # Run migrations
pnpm db:push         # Push schema changes directly
pnpm db:studio       # Open Drizzle Studio
pnpm db:seed         # Seed database with sample data

# Testing individual packages
cd packages/domain && pnpm test
cd packages/render-admin-sdk && pnpm test
```

## Architecture Principles

### DDD Domain Structure

The backend follows Domain-Driven Design organized by business capabilities:

**Key Domains:**
- **Schema Management** (`packages/admin-backend/domain/src/schema-management/`) - UI component schemas, templates, validation
- **Deployment & Distribution** (`packages/admin-backend/domain/src/deployment-and-distribution/`) - Release management, A/B testing
- **Kernel** (`packages/admin-backend/domain/src/kernel/`) - Shared domain primitives

Each domain subdomain contains:
- `entities/` - Domain entities with business logic
- `value-objects/` - Immutable value objects
- `domain-events/` - Domain events
- `domain-errors/` - Domain-specific errors
- `shared/types.ts` - Shared types and interfaces

### Clean Architecture Layers

The backend strictly follows Clean Architecture:

1. **Domain Layer** (`packages/admin-backend/domain/`) - Pure business logic, no external dependencies
2. **Application Layer** (`packages/admin-backend/application/`) - Use cases, DTOs, orchestration
3. **Infrastructure Layer** (`packages/admin-backend/infrastructure/`) - Database, external APIs, I/O

**Dependency Rule:** Domain ← Application ← Infrastructure (dependencies flow inward only)

### Transpiler Architecture

The JSX-to-JSON transpiler (`packages/render-admin-sdk/`) uses Babel to convert React JSX DSL into JSON schemas:

**Core Flow:**
1. **Parser** - Parse JSX string to Babel AST
2. **ExportAnalyzer** - Extract scenario metadata from AST
3. **Babel Plugin** - Transform JSX elements to JSON using visitors:
   - `PropTracker` - Track function parameters across scopes
   - `JSXTransformer` - Convert JSX elements to JSON nodes
   - `ComponentCollector` - Collect exported components
4. **ScenarioAssembler** - Build final `TranspiledScenario` output

See `docs/transpiler-architecture.md` for detailed architecture diagrams.

## Key Technologies

- **Frontend:** React 19, TanStack Router, TanStack Query, ShadcnUI, TailwindCSS 4
- **Backend:** Hono, Drizzle ORM, PostgreSQL
- **Transpiler:** Babel parser/traverse
- **Testing:** Vitest
- **Dependency Injection:** tsyringe (domain/application layers)
- **Validation:** Zod
- **Monorepo:** pnpm workspaces

## Important Conventions

### TypeScript Configuration

Base configuration in `tsconfig.base.json`:
- Target: ES2022
- Module: ESNext with Bundler resolution
- Strict mode enabled
- JSX: react-jsx

### Code Quality

Pre-commit hooks (via Husky + lint-staged) automatically:
- Format code with Prettier
- Run ESLint checks
- Validate changes

### Testing Strategy

- Unit tests for domain logic (pure functions, value objects, entities)
- Integration tests for use cases (application layer)
- End-to-end tests for transpiler (full JSX → JSON pipeline)

### Domain Layer Rules

When working in `packages/admin-backend/domain/`:
- NO external dependencies (except reflect-metadata, tsyringe, uuid, zod)
- NO I/O operations (no file system, no database, no network)
- Business logic should be pure and testable
- Use value objects for domain concepts
- Use entities for objects with identity
- Emit domain events for significant state changes

### Application Layer Rules

When working in `packages/admin-backend/application/`:
- Orchestrate domain objects through use cases
- Define DTOs for input/output boundaries
- No direct database access (use repositories from infrastructure)
- Use dependency injection for repositories and services

### Admin Panel Structure

The admin panel (`apps/admin`) uses:
- **TanStack Router** with file-based routing in `src/routes/`
- **TanStack Query** for server state management
- **Zustand** for client state
- **React Hook Form** + Zod for forms
- **ShadcnUI** components in `src/components/ui/`
- **Features** organized in `src/features/` by domain

## Common Development Tasks

### Adding a New Domain Entity

1. Create entity in `packages/admin-backend/domain/src/{domain}/entities/`
2. Define value objects in `value-objects/`
3. Add domain events in `domain-events/`
4. Create repository interface in domain layer
5. Implement repository in `packages/admin-backend/infrastructure/`
6. Create use cases in `packages/admin-backend/application/use-cases/`

### Adding a New Admin Page

1. Create route file in `apps/admin/src/routes/` (e.g., `my-page.tsx`)
2. Create feature components in `apps/admin/src/features/{feature-name}/`
3. Add API queries/mutations using TanStack Query
4. Connect to backend API endpoints

### Working with the Transpiler

The transpiler converts React JSX DSL files to JSON schemas:

```typescript
import { transpile } from '@render-engine/admin-sdk/transpiler'

const jsxCode = `
export const SCENARIO_KEY = "my-scenario"
export default function Main() {
  return <View><Text>Hello</Text></View>
}
`

const result = transpile(jsxCode)
// result: { key, version, main, components }
```

**Component Registry:** Defines valid components and their properties
**Validation:** Happens during transpilation to catch errors early

### Database Migrations

Using Drizzle ORM:
1. Update schema in `packages/admin-backend/infrastructure/src/database/schema/`
2. Run `pnpm db:generate` to create migration
3. Run `pnpm db:migrate` to apply migration
4. Use `pnpm db:studio` to inspect database

## Documentation

Key documentation files:
- `docs/transpiler-architecture.md` - Detailed transpiler architecture and data flow
- `specs/project/ddd-domains.spec.md` - Complete DDD domain decomposition
- `docs/design-system/` - UI component design specifications
- `packages/render-ios-sdk/README.md` - iOS SDK documentation
- `packages/render-admin-sdk/README.md` - Admin SDK documentation

## Requirements

- **Node.js** 22+
- **pnpm** 10.17.1+ (specified in package.json)
- **Xcode** 15+ (for iOS development)
- **Android Studio** (for Android development)
- **PostgreSQL** (for admin backend)
