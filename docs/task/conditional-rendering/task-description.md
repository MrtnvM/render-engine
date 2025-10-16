# Task: Implement Conditional Rendering

## Problem Statement: Conditional Rendering

The current Backend-Driven UI (BDUI) framework allows for dynamic updates of screen layouts without app releases. However, the UI representation is static. To create variations of a screen (e.g., for A/B testing, feature flags, or different user states), a separate JSON configuration is required for each variation.

This approach has several limitations:

- **Configuration Duplication:** A small change between two screen variations requires duplicating the entire JSON configuration, leading to maintenance overhead.
- **Scalability Issues:** As the number of A/B tests and user segments grows, the number of screen configurations can become unmanageable.
- **Limited Dynamic Behavior:** The UI cannot react to data or user state within the client. For example, showing or hiding a component based on the content of a data field is not possible without fetching a completely new screen configuration.

To address these issues and increase the flexibility of the BDUI framework, there is a need to introduce conditional rendering logic directly into the UI configurations.

This task is to extend the Backend-Driven UI (BDUI) framework to support conditional rendering logic within the UI configurations.

## Task Description

**Requirements:**

- **DSL Extension:** The React-based Domain Specific Language (DSL) must be extended to allow developers to express conditional logic for rendering UI components. The syntax should be clear and easy to use (if/else conditions, &&, ||, ternary operator).
- **Transpiler Support:** The transpiler must be updated to understand the new conditional syntax in the DSL and reflect it in the output JSON schema.
- **Platform Support:** The conditional rendering must be supported on all client platforms (currently only iOS) that use the BDUI framework.
- **Data Binding:** The conditional logic should be able to use data provided to the screen (e.g., from a backend API or client-side state) to make rendering decisions.

**Scope:**

- The implementation should support common conditional patterns, such as showing/hiding a single element and choosing between two or more elements.
- The solution should not require significant changes to the client-side rendering logic.

**Deliverables:**

- A working implementation of conditional rendering in the BDUI framework.
- An example screen that demonstrates the use of conditional rendering.
- Documentation for developers on how to use the new conditional rendering syntax in the DSL.
