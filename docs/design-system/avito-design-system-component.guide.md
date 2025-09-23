# Avito Design System Component Implementation Guide

This guide describes how to extend the Avito design system that powers the admin app. Follow these steps whenever you need to add a new component (e.g., Toggle, Badge, Tooltip) so that tokens, React APIs, documentation, and the in-app gallery stay in sync.

## 1. Review the Existing Foundations

- **Global theme** – `apps/admin/src/components/avito-design-system/theme.css` loads Manrope font faces, core design tokens, and button-specific variables. Study it first to understand naming conventions such as `--avito-<category>-<token>` and modifier classes like `.avito-button--primary-accent`.
- **Component pattern** – `components/Button.tsx` under the same directory demonstrates the preferred React wrapper: `React.forwardRef`, prop defaults, the `cn` helper for class composition, and encapsulated variant logic.
- **Showcase wiring** – `components/DesignSystemShowcase.tsx` registers each component alongside its `design-system/*Showcase.tsx` playground. The admin route `/_authenticated/avito-design-system` renders this gallery so designers and engineers can explore every state of the system.

## 2. Capture Tokens and Assets

1. Audit the Figma spec for the component you are implementing. Extract colors, typography, elevation, spacing, state tokens (hover/focus/disabled), and illustrations or icons.
2. Add any missing foundation tokens to the root `:root` block in `theme.css`. Keep the grouped sections (colors, typography, spacing, radii, etc.) intact to avoid duplication later.
3. Declare component-specific variables right below the shared tokens using the pattern `--avito-<component>-<state>-<property>`. For example, follow the button entries such as `--avito-button-primary-default-bg`.
4. When the component introduces new interaction states, define separate variables for each (`default`, `hover`, `pressed`, `focused`, `disabled`) so that JavaScript never has to hardcode hex values.
5. If assets (SVGs, fonts) are required, add them under `apps/admin/public/` and reference them via the `public` path. Keep license files alongside any third-party assets.

## 3. Implement the Reusable React Component

1. Create the component under `apps/admin/src/components/avito-design-system/components/`, mirroring the Button file structure (`<ComponentName>.tsx`).
2. Use `React.forwardRef<HTML...>` so downstream consumers can attach refs for accessibility or focus control.
3. Mirror the Button prop flow:
   - Declare default prop values so the component renders correctly out of the box.
   - Derive CSS class names by mapping prop combinations to the class modifiers you defined in `theme.css`.
   - Use the shared `cn` utility from `../utils/cn` to combine base classes, variant classes, and consumer-provided `className`.
   - Gate interactions (e.g., `onClick`, `onChange`) on `disabled` or `state` props so logic and styling stay consistent.
4. Keep business logic inside the design-system component and expose simple props. The showcase should never need internal state hacks to demonstrate functionality.

## 4. Extend the Type Definitions and Public API

1. Update `apps/admin/src/components/avito-design-system/types/components.ts` with a dedicated interface that enumerates the component’s props and variant union types. This type acts as the contract for both consumers and the showcase matrices.
2. Export the new component and its types from `apps/admin/src/components/avito-design-system/index.tsx` so feature code can import it via `@/components/avito-design-system`.
3. Document the component API inside `apps/admin/src/components/avito-design-system/README.md`: include usage snippets, prop tables, and explanations of variants/sizes/presets, following the existing Button section as a template.

## 5. Style the Component in `theme.css`

1. After adding the tokens, append the component’s base class (e.g., `.avito-toggle`) and modifier classes to `theme.css`.
2. Reference the variables created earlier instead of raw colors or pixel values. This guarantees theming consistency and makes global adjustments trivial.
3. Include responsive states (`:hover`, `:active`, `:focus-visible`) next to their corresponding base rules so designers can quickly match the file to the Figma spec.
4. Keep the CSS organized in the order used for the button: base styles, size modifiers, variant modifiers, presets, states.

## 6. Build an Immersive Showcase Experience

1. Create a new showcase under `apps/admin/src/components/avito-design-system/design-system/` (for example, `ToggleShowcase.tsx`). Start from `ButtonShowcase.tsx` to reuse layout and helper patterns (section headers, stateful demos, variant grids).
2. Include at least:
   - A summary section describing the component’s purpose and best practices.
   - An interactive example that exercises key props or state transitions.
   - A matrix that iterates through every size/variant/preset combination defined in the component props.
   - Accessibility callouts (e.g., keyboard usage, ARIA attributes) where relevant.
3. Export the showcase from `design-system/index.ts` so `DesignSystemShowcase` can import it.

## 7. Register the Component in the Gallery

1. Update `components/DesignSystemShowcase.tsx`:
   - Append an entry to the `components` array with a stable `id`, human-friendly `name`, succinct `description`, category grouping (e.g., “Actions”, “Forms”), and optional emoji icon.
   - Extend the `renderComponent` switch to return your new `<ComponentShowcase />` when its `id` is selected.
2. No additional routing work is required. The authenticated page automatically lists your component in the sidebar and renders the showcase content via the render prop provided to `DesignSystemLayout`.

## 8. Verify the Implementation

1. Run the admin app and visit `/_authenticated/avito-design-system` to ensure the new component appears, the sidebar selection works, and all examples render correctly.
2. Compare colors, typography, and spacing against Figma while interacting with hover, focus, and disabled states.
3. Cross-check the README usage snippets with the actual component API to prevent drift.
4. Execute relevant quality gates before shipping (e.g., `pnpm lint`, unit tests, or Storybook visual tests if available).

## 9. Plan for Iteration

- If you publish a placeholder (like the current `InputShowcase`), annotate the file with `TODO` comments referencing Jira tickets so the backlog captures follow-up work.
- When multiple components share tokens (e.g., border radii, shadows), consider consolidating them into shared variables at the top of `theme.css` to maintain a single source of truth.
- Keep changelog entries or release notes for the design system so consuming teams can adopt new components confidently.

Following this checklist ensures every new component integrates seamlessly with the Avito design language, React APIs, documentation, and the in-app gallery experience.

USE "docs/design-system/showcase.spec.md" FOR IMPLEMENTATION OF COMPONENT SHOWCASE.
