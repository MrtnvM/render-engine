
# Refactoring Task: Decouple Backend Provider from Core SDK

- **Status:** Proposed
- **Severity:** Critical

---

## 1. Background

The `render-ios-sdk` currently has a hard dependency on the `supabase-swift` library. The main `RenderEngine` class is configured directly with Supabase credentials, and the internal `ScenarioRepository` is tightly coupled to the Supabase client for fetching UI configuration data.

## 2. Problem Statement

This tight coupling presents several issues:

- **Vendor Lock-In:** The SDK cannot be used with any backend other than Supabase (e.g., a custom in-house API, Firebase, other BaaS providers).
- **Limited Reusability:** The core rendering logic is not separable from the networking layer, preventing its adoption in projects with an existing backend.
- **Difficult Testing:** Mocking the networking layer for unit and UI tests is more complex than it needs to be, as it requires mocking the entire Supabase client.

## 3. Proposed Solution

Abstract the data-fetching mechanism by introducing a `ScenarioProvider` protocol. The `RenderEngine` will depend on this abstraction, not on a concrete implementation.

### Step-by-Step Implementation Plan

1.  **Define the `ScenarioProvider` Protocol:**
    Create a new protocol that defines the contract for fetching a scenario.

    ```swift
    // In Sources/RenderEngine/Providers/ScenarioProvider.swift
    public protocol ScenarioProvider {
        func fetchScenario(withKey key: String) async throws -> Scenario
    }
    ```

2.  **Create a `SupabaseScenarioProvider`:**
    Move the existing Supabase-specific fetching logic into a new class that conforms to the `ScenarioProvider` protocol.

    ```swift
    // In Sources/RenderEngine/Providers/SupabaseScenarioProvider.swift
    public class SupabaseScenarioProvider: ScenarioProvider {
        private let supabaseClient: SupabaseClient

        public init(supabaseURL: URL, supabaseKey: String) {
            self.supabaseClient = SupabaseClient(supabaseURL: supabaseURL, supabaseKey: supabaseKey)
        }

        public func fetchScenario(withKey key: String) async throws -> Scenario {
            // Current implementation of fetching from Supabase table goes here
        }
    }
    ```

3.  **Update `RenderEngine.configure()`:**
    Modify the main configuration method to accept any object conforming to `ScenarioProvider` instead of Supabase credentials.

    ```swift
    // In RenderEngine.swift
    @MainActor
    public func configure(
        scenarioProvider: ScenarioProvider,
        loggerConfiguration: LoggerConfiguration? = nil
    ) {
        // Register the provider in the DI Container
        DIContainer.shared.register(scenarioProvider)
        // ...
        isConfigured = true
    }
    ```

4.  **Update `ScenarioRepository`:**
    Refactor the `ScenarioRepository` to use the `ScenarioProvider` abstraction from the DI container, removing all direct Supabase dependencies.

## 4. Benefits

- **Backend Agnostic:** The SDK will be usable with any backend by creating a custom `ScenarioProvider`.
- **Improved Modularity:** Clear separation between the rendering engine and the data layer.
- **Enhanced Testability:** Tests can provide a simple, lightweight mock `ScenarioProvider` to test the rendering logic in isolation.
