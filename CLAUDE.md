# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Server-Driven UI System** (editor + playground apps + framework) that enables dynamic user interface rendering across multiple platforms (Web, iOS, Android) through JSON-based UI descriptions. The system decouples UI definition from client applications, allowing real-time UI updates without requiring app store releases.

The project uses specification driven approach for implementation. All components must be specified before implementation. Follow the specification writing guidelines in `specs/spec/spec-writing.spec.md`. THE SPECIFICATION SHOULD BE WRITTEN BEFORE IMPLEMENTATION IN 100% OF CASES.

## Architecture

The project follows **Clean Architecture** with **Domain-Driven Design (DDD)** principles:

- **Domain Layer** (`packages/domain/`): Core business logic, entities, value objects, domain services, and events
- **Application Layer** (`packages/application/`): Use cases, application services, DTOs, and business orchestration
- **Infrastructure Layer**: Not yet implemented (planned for databases, external APIs, etc.)
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
```

### Package Level Commands

```bash
# Domain package
cd packages/domain
pnpm build            # Compile TypeScript and resolve aliases
pnpm build:watch      # Watch mode compilation with concurrent processes
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier formatting
pnpm test             # Vitest test runner

# Application package
cd packages/application
pnpm build            # Compile TypeScript and resolve aliases
pnpm build:watch      # Watch mode compilation with concurrent processes
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier formatting
pnpm test             # Vitest test runner
```

### Running Individual Tests

```bash
# Run specific test file
pnpm test path/to/file.test.ts

# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode
pnpm test --watch
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

### Specification-Driven Development

- The project uses comprehensive specifications in the `specs/` directory
- All components must be specified before implementation
- Follow the specification writing guidelines in `specs/spec/spec-writing.spec.md`
- THE SPECIFICATION SHOULD BE WRITTEN BEFORE IMPLEMENTATION IN 100% OF CASES

## Current Project State

- **Domain Package**: Recently cleaned out (ready for new domain entities and value objects)
- **Application Package**: Basic structure exists with directories for DTOs, jobs, services, and use-cases
- **ESLint Config**: Fully configured and ready for use
- **Specifications**: Comprehensive documentation system with detailed writing standards
- **Apps Directory**: Empty placeholder for future client applications

## Technology Stack

- **Language**: TypeScript with ES modules
- **Testing**: Vitest with global test environment
- **Build**: TypeScript compiler
- **Linting**: ESLint with @antfu/eslint-config
- **Package Management**: pnpm workspaces
- **Domain Dependencies**: uuid, zod, tsrynge
- **Architecture**: Clean Architecture + DDD patterns

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

## Testing Guidelines

- Use Vitest for all testing
- Tests should be comprehensive and cover all business rules
- Follow the testing requirements specified in each component's specification
- Global test environment configuration provided in each package
