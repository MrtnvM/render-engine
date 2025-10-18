# Render Engine

## Project Overview

Render Engine is a Backend-Driven UI (BDUI) framework developed for Avito, a leading online classifieds service. The framework enables dynamic creation and management of mobile and web interfaces through server-side configurations, allowing for rapid UI updates without requiring new application releases. The project and its documentation are primarily in Russian.

The main goal is to accelerate the delivery of new features and experiments across Android, iOS, and Web platforms, reducing the dependency on mobile release cycles.

## Monorepo Structure

This project is a monorepo managed with pnpm workspaces.

### Applications

-   **`apps/admin`**: A React-based web admin panel for managing UI configurations. It uses Vite, TanStack Router, and ShadcnUI.
-   **`apps/admin-backend`**: The backend API service for the admin panel, built with Hono and Drizzle ORM.
-   **`apps/render-cli`**: A command-line tool for managing configurations and transpiling JSX to JSON schemas.
-   **`apps/render-ios-playground`**: A native iOS app (Swift) for testing and previewing UI configurations.
-   **`apps/render-android-playground`**: A native Android app (Kotlin) for the same purpose.

### Packages

-   **`packages/admin-backend/`**: Contains the backend logic structured according to Clean Architecture principles:
    -   **`domain/`**: Core domain entities, value objects, and business rules, organized by DDD domains.
    -   **`application/`**: Use cases, Data Transfer Objects (DTOs), and application services.
    -   **`infrastructure/`**: Implementations for databases, external services, etc.
-   **`packages/render-admin-sdk`**: The core JSX-to-JSON transpiler SDK, which uses Babel.
-   **`packages/render-ios-sdk`**: The Swift SDK for iOS applications.
-   **`packages/eslint-config`**: Shared ESLint configuration for the monorepo.

## Architecture Principles

### Domain-Driven Design (DDD)

The backend is organized by business capabilities (domains):

-   **Schema Management**: Manages UI component schemas, templates, and validation.
-   **Deployment & Distribution**: Handles release management and A/B testing.
-   **Kernel**: Contains shared domain primitives.

### Clean Architecture

The backend follows a strict Clean Architecture:
1.  **Domain Layer**: Pure business logic with no external dependencies.
2.  **Application Layer**: Orchestrates domain objects and defines use cases.
3.  **Infrastructure Layer**: Handles data persistence, network calls, and other external concerns.

The dependency rule is `Domain ← Application ← Infrastructure`.

### Transpiler Architecture

The `@render-engine/admin-sdk` package transpiles a React JSX DSL into a JSON schema using a Babel plugin. This allows developers to write UI configurations using familiar JSX syntax.

## Key Technologies

-   **Frontend**: React 19, TanStack Router, TanStack Query, Zustand, ShadcnUI, TailwindCSS 4, React Hook Form
-   **Backend**: Hono, Drizzle ORM, PostgreSQL, Zod
-   **Transpiler**: Babel
-   **Testing**: Vitest
-   **Dependency Injection**: tsyringe
-   **Monorepo**: pnpm workspaces

## Building and Running

### Requirements

-   Node.js 22+
-   pnpm 10.17.1+
-   Xcode 15+ (for iOS development)
-   Android Studio (for Android development)
-   PostgreSQL

### Installation

1.  Clone the repository.
2.  Install dependencies from the root directory:
    ```bash
    pnpm install
    ```

### Development Commands

-   **`pnpm dev`**: Run all development servers in parallel.
-   **`pnpm build`**: Build all packages and applications.
-   **`pnpm test`**: Run all tests.
-   **`pnpm lint`**: Lint all packages.
-   **`pnpm format`**: Format all code with Prettier.

### Database Commands (for `apps/admin-backend`)

-   **`pnpm db:generate`**: Generate Drizzle migrations.
-   **`pnpm db:migrate`**: Run migrations.
-   **`pnpm db:push`**: Push schema changes directly to the database.
-   **`pnpm db:studio`**: Open Drizzle Studio.
-   **`pnpm db:seed`**: Seed the database with sample data.

## Development Conventions

-   **Code Quality**: Pre-commit hooks with Husky and lint-staged automatically format and lint the code.
-   **Testing**: The project uses a combination of unit tests for domain logic, integration tests for use cases, and end-to-end tests for the transpiler.
-   **Domain Layer**: The domain layer should remain pure, with no I/O operations or external dependencies.
-   **Application Layer**: This layer orchestrates domain logic and uses DTOs for input/output.

## Documentation

-   **`docs/transpiler-architecture.md`**: Detailed architecture of the JSX-to-JSON transpiler.
-   **`specs/project/ddd-domains.spec.md`**: Complete DDD domain decomposition.
-   **`docs/design-system/`**: UI component design specifications.
-   **`packages/render-ios-sdk/README.md`**: iOS SDK documentation.
-   **`packages/render-admin-sdk/README.md`**: Admin SDK documentation.