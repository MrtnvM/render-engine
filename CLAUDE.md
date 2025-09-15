# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Server-Driven UI System** (editor + playground apps + framework) that enables dynamic user interface rendering across multiple platforms (Web, iOS, Android) through JSON-based UI descriptions. The system decouples UI definition from client applications, allowing real-time UI updates without requiring app store releases.

The project uses specification driven approach for implementation. All components must be specified before implementation. Follow the specification writing guidelines in `specs/spec/spec-writing.spec.md`. THE SPECIFICATION SHOULD BE WRITTEN BEFORE IMPLEMENTATION IN 100% OF CASES.

## Architecture

The project follows **Clean Architecture** with **Domain-Driven Design (DDD)** principles:

- **Domain Layer** (`packages/domain/`): Core business logic, entities, value objects, domain services, and events
- **Application Layer** (`packages/application/`): Use cases, application services, DTOs, and business orchestration
- **Infrastructure Layer** (`packages/infrastructure/`): Database access, external API integrations, repositories, and LLM services
- **Apps Layer** (`apps/`): Placeholder for future realtime editor + client applications (Web, iOS, Android)

## Common Development Commands

### Root Level Commands

```bash
# Development
pnpm dev              # Run development servers in parallel across all packages
pnpm build            # Build all packages
pnpm test             # Run tests in parallel across all packages
pnpm lint             # Run linting in parallel across all packages
pnpm format           # Run formatting in parallel across all packages
pnpm deploy           # Build and deploy all packages
pnpm prepare          # Install husky git hooks
```

### Package Level Commands

```bash
# Domain package (@render-engine/domain)
cd packages/domain
pnpm build            # Compile TypeScript with tsc
pnpm build:watch      # Watch mode compilation
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier formatting
pnpm test             # Run Vitest tests once

# Application package (@render-engine/application)
cd packages/application
pnpm build            # Compile TypeScript with tsc
pnpm build:watch      # Watch mode compilation
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier formatting
pnpm test             # Run Vitest tests once

# Infrastructure package (@render-engine/infrastructure)
cd packages/infrastructure
pnpm build            # Compile TypeScript with tsc
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier formatting
pnpm test             # Run Vitest tests once
pnpm db:generate      # Generate database schema with drizzle-kit
pnpm db:migrate       # Run database migrations
pnpm db:push          # Push schema changes to database
pnpm db:studio        # Open drizzle studio for database management
pnpm db:drop          # Drop database tables

# ESLint config package (@render-engine/eslint-config)
cd packages/eslint-config
pnpm format           # Prettier formatting only
```

### Running Individual Tests

```bash
# From package directory:
pnpm test                     # Run all tests once
pnpm test path/to/file.test.ts # Run specific test file
pnpm test --coverage          # Run tests with coverage
pnpm test --watch             # Run tests in watch mode

# From root:
pnpm -F @render-engine/domain test --watch    # Run domain tests in watch mode
pnpm -F @render-engine/application test        # Run application tests
pnpm -F @render-engine/infrastructure test    # Run infrastructure tests
```

## Key Development Requirements

### Package Manager

- **Must use pnpm 10.13.1** or compatible version
- The project uses pnpm workspaces for monorepo management

### File Naming Conventions

- Use kebab-case unless the file defines a frontend component (then PascalCase)
- Use dot notation to indicate purpose: `user.controller.ts`, `user.service.ts`, `user.service.interface.ts`, `user.repository.ts`
- Avoid very long file names – keep them meaningful but concise

### Code Style and Quality

- ESLint configuration is shared via `@render-engine/eslint-config` package
- Prettier for code formatting
- Pre-commit hooks via husky and lint-staged
- TypeScript with strict mode enabled
- **Always use existing ID value object**: When creating entities, use the existing `ID` value object from `packages/domain/src/kernel/value-objects/id.value-object.ts` instead of creating custom ID types. All entities should extend `Entity<ID>` and use `ID.create()` for ID generation.

### Specification-Driven Development

- The project uses comprehensive specifications in the `specs/` directory
- All components must be specified before implementation
- Follow the specification writing guidelines in `specs/spec/spec-writing.spec.md`
- THE SPECIFICATION SHOULD BE WRITTEN BEFORE IMPLEMENTATION IN 100% OF CASES

## Current Project State

- **Domain Package** (`@render-engine/domain`): Recently cleaned out (ready for new domain entities and value objects). Dependencies: uuid, zod, tsyringe (DI container)
- **Application Package** (`@render-engine/application`): Basic structure exists with directories for DTOs, jobs, services, and use-cases. Depends on domain package
- **Infrastructure Package** (`@render-engine/infrastructure`): Database access with Drizzle ORM + LibSQL, LLM integrations (OpenAI, OpenRouter), HTTP client, and repository patterns. Depends on domain and application packages
- **ESLint Config** (`@render-engine/eslint-config`): Fully configured with @antfu/eslint-config and ready for use
- **Specifications**: Comprehensive documentation system with detailed writing standards in `specs/` directory
- **Apps Directory**: Empty placeholder for future realtime editor + client applications (Web, iOS, Android)

## Technology Stack

- **Language**: TypeScript with ES modules (.js extension)
- **Testing**: Vitest with global test environment
- **Build**: TypeScript compiler (tsc)
- **Linting**: ESLint with @antfu/eslint-config and prettier integration
- **Package Management**: pnpm workspaces (pnpm@10.13.1 required)
- **Domain Dependencies**: uuid, zod, tsyringe (dependency injection)
- **Infrastructure Dependencies**: Drizzle ORM, LibSQL (database), OpenAI SDK, OpenRouter AI SDK, axios (HTTP), LangSmith (LLM observability)
- **Architecture**: Clean Architecture + DDD patterns
- **Pre-commit**: husky + lint-staged for automatic formatting and linting

## Important Architecture Patterns

### Domain Layer Structure

- **Entities**: Objects with identity and business logic
- **Value Objects**: Immutable domain concepts without identity
- **Domain Services**: Stateless business logic units
- **Domain Events**: Event-driven architecture components
- **Domain Errors**: Domain-specific error types

### Application Layer Structure

- **Use Cases**: Application business workflows
- **DTOs**: Data transfer objects
- **Jobs**: Background tasks and processes
- **Application Services**: Application-level business logic

### Infrastructure Layer Structure

- **Repositories**: Data access patterns implementing domain repository interfaces
- **Controllers**: HTTP API controllers for external communication
- **Gateways**: External service integrations and API clients
- **LLM Services**: AI model integrations (OpenAI, OpenRouter) with observability
- **Database**: Drizzle ORM with LibSQL for schema management and migrations

## Testing Guidelines

- Use Vitest for all testing
- Tests should be comprehensive and cover all business rules
- Follow the testing requirements specified in each component's specification
- Global test environment configuration provided in each package
