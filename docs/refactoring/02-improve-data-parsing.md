
# Refactoring Task: Improve Data Parsing with Codable

- **Status:** Proposed
- **Severity:** High

---

## 1. Background

The SDK currently uses a custom `Config` class, which is a wrapper around a `[String: Any?]` dictionary, for parsing the JSON scenario. Data is accessed using string-based keys (e.g., `config.getString(forKey: "type")`), and object creation involves manual, recursive parsing. While an intermediate `ScenarioJSON` struct uses `Codable`, this pattern is not applied to the entire component tree.

## 2. Problem Statement

This manual parsing approach has several drawbacks:

- **Brittle and Error-Prone:** It's susceptible to runtime errors from simple typos in string keys or unexpected `nil` values.
- **Unsafe:** It bypasses Swift's strong type system, requiring frequent type casting and optional handling that can fail silently.
- **Poor Error Handling:** Parsing errors (e.g., a missing required field) are handled with `guard` statements or `try?`, which can swallow important errors and make debugging difficult. It's hard to know *why* a component failed to parse.
- **Maintenance Overhead:** Any change in the JSON schema requires manually updating the parsing logic in multiple places.

## 3. Proposed Solution

Refactor the data models to fully embrace Swift's `Codable` protocol. This will replace the manual `Config` wrapper with a type-safe, declarative decoding process.

### Step-by-Step Implementation Plan

1.  **Make `Component` and `ViewStyle` `Codable`:**
    Define the `Component` class and its properties (like `ViewStyle`) to conform to `Codable`. Use an enum for `type` to ensure only valid component types are parsed.

    ```swift
    public enum ComponentType: String, Codable {
        case view = "View"
        case text = "Text"
        case image = "Image"
        // Add other component types
    }

    public struct ViewStyle: Codable { ... }

    public struct Component: Codable {
        public let id: String
        public let type: ComponentType
        public let style: ViewStyle?
        public let properties: [String: JSONValue]? // Or a more specific Codable struct
        public let children: [Component]?
    }
    ```

2.  **Create `Codable` Property Structs:**
    For each component type, define a specific `Codable` struct for its `properties` to avoid dictionary-based access.

    ```swift
    public struct TextProperties: Codable {
        public let text: String
        public let alignment: String? // Use enums where possible
    }
    ```

3.  **Refactor `Scenario` to use `JSONDecoder`:**
    Update the `Scenario` model to use `JSONDecoder` to parse the entire JSON tree in one go. This eliminates the `Config` wrapper and the `ScenarioJSON` intermediate object.

    ```swift
    // In Scenario.swift
    public static func create(from data: Data) throws -> Scenario {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(Scenario.self, from: data)
    }
    ```

4.  **Implement Robust Error Handling:**
    The call to `decoder.decode` will throw detailed, specific errors if parsing fails (e.g., `keyNotFound`, `typeMismatch`). These errors can be caught, logged, and handled gracefully, providing much better diagnostic information.

## 4. Benefits

- **Type Safety:** The entire parsing process becomes type-safe, catching schema mismatches at compile time (within the decoding logic) instead of runtime.
- **Robustness:** The SDK becomes more resilient to malformed or unexpected JSON.
- **Improved Debugging:** `Codable` provides descriptive errors that pinpoint the exact location and cause of a parsing failure.
- **Maintainability:** The `Codable` conformance is declarative. Updating the schema is as simple as updating the Swift structs.
