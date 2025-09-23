# Avito Design System Theme Refactoring Specification

## Overview

Comprehensive refactoring plan for the Avito Design System theme.css file to improve maintainability, reduce duplication, and create a more scalable CSS architecture following modern best practices.

## Current State Analysis

### Issues Identified

1. **Monolithic Structure**: Single 1060+ line file containing all theme definitions
2. **Code Duplication**: Extensive repetition in component variant definitions
3. **Inconsistent Naming**: Mix of semantic and non-semantic variable names
4. **Mixed Concerns**: Font faces, CSS variables, and component styles in one file
5. **Hard-coded Values**: Some colors and values not using CSS custom properties
6. **Poor Organization**: Related styles scattered throughout the file
7. **Maintenance Burden**: Difficult to locate and modify specific component styles

### Current File Structure

```
theme.css (1060+ lines)
├── Font Faces (lines 1-26)
├── Base Theme Variables (lines 28-124)
├── Component-specific Variables (lines 126-336)
├── Button Styles (lines 338-520)
├── Input Styles (lines 521-687)
├── InputFieldSet Styles (lines 714-801)
└── Select Styles (lines 802-1060)
```

## Refactoring Goals

1. **Modular Architecture**: Split into focused, maintainable files
2. **Eliminate Duplication**: Create reusable patterns and utilities
3. **Semantic Naming**: Consistent, meaningful variable names
4. **Better Organization**: Logical grouping of related styles
5. **Improved Maintainability**: Easier to locate and modify styles
6. **Enhanced Scalability**: Support for future component additions

## Proposed Architecture

### Co-located File Structure

```
avito-design-system/
├── components/
│   ├── Button.tsx
│   ├── Button.css                # Button-specific styles
│   ├── Input.tsx
│   ├── Input.css                 # Input-specific styles
│   ├── InputFieldSet.tsx
│   ├── InputFieldSet.css         # InputFieldSet-specific styles
│   ├── Select.tsx
│   ├── Select.css                # Select-specific styles
│   ├── SelectFieldset.tsx
│   └── SelectFieldset.css        # SelectFieldset-specific styles
├── theme/
│   ├── index.css                 # Main entry point - imports all styles
│   ├── fonts.css                 # Font face definitions
│   └── tokens/
│       ├── colors.css             # Shared color palette
│       ├── typography.css         # Shared font and text styles
│       ├── spacing.css            # Shared spacing and sizing
│       ├── borders.css            # Shared border radius and styles
│       └── effects.css            # Shared shadows and transitions
└── utils/
    ├── cn.ts                     # Class name utility
    └── variants.css              # Common variant patterns (if needed)
```

### Main Theme Entry Point

The `theme/index.css` file will serve as the main entry point that imports all styles:

```css
/* theme/index.css */

/* Import shared tokens first */
@import './tokens/colors.css';
@import './tokens/typography.css';
@import './tokens/spacing.css';
@import './tokens/borders.css';
@import './tokens/effects.css';

/* Import fonts */
@import './fonts.css';

/* Import component styles */
@import '../components/Button.css';
@import '../components/Input.css';
@import '../components/InputFieldSet.css';
@import '../components/Select.css';
@import '../components/SelectFieldset.css';
```

### Component CSS Structure

Each component will have its own CSS file with a clear structure:

```css
/* components/Button.css */

/* Import shared tokens */
@import '../theme/tokens/colors.css';
@import '../theme/tokens/typography.css';
@import '../theme/tokens/spacing.css';
@import '../theme/tokens/borders.css';
@import '../theme/tokens/effects.css';

/* Base button styles */
.avito-button {
  /* Common properties using tokens */
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  /* ... other base styles */
}

/* Size variants */
.avito-button--xs { /* xs styles using tokens */ }
.avito-button--sm { /* sm styles using tokens */ }
/* ... other size variants */

/* Variant styles */
.avito-button--primary-default {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}
/* ... other variants */
```

### CSS Custom Properties Organization

#### Color System
```css
/* Semantic color tokens */
:root {
  /* Primary colors */
  --color-primary: #141414;
  --color-primary-accent: #00aaff;
  --color-primary-pay: #965eeb;
  --color-primary-success: #02d15c;
  --color-primary-danger: #ff4053;
  
  /* Secondary colors */
  --color-secondary: #f2f1f0;
  --color-secondary-accent: #cfedff;
  --color-secondary-pay: #e9ddfd;
  --color-secondary-success: #e9fdf0;
  --color-secondary-danger: #ffe9eb;
  
  /* Text colors */
  --color-text-primary: #000000;
  --color-text-secondary: #a3a3a3;
  --color-text-inverse: #ffffff;
  --color-text-inverse-disabled: #5c5c5c;
  
  /* Background colors */
  --color-bg-default: #ffffff;
  --color-bg-inverse: #141414;
  --color-bg-overlay: #ffffff;
  
  /* Border colors */
  --color-border-default: #f2f1f0;
  --color-border-accent: #cfedff;
  --color-border-pay: #e9ddfd;
}
```

#### Typography System
```css
:root {
  /* Font families */
  --font-family-primary: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Font weights */
  --font-weight-medium: 500;
  --font-weight-bold: 800;
  
  /* Font sizes */
  --font-size-xs: 13px;
  --font-size-sm: 15px;
  --font-size-base: 15px;
  --font-size-lg: 18px;
  --font-size-xl: 18px;
  
  /* Line heights */
  --line-height-xs: 1.23;
  --line-height-sm: 1.33;
  --line-height-base: 1.33;
  --line-height-lg: 1.22;
  --line-height-xl: 1.22;
}
```

#### Spacing System
```css
:root {
  /* Spacing scale */
  --space-xs: 6px;
  --space-sm: 9px;
  --space-md: 11px;
  --space-lg: 15px;
  --space-xl: 20px;
  
  /* Component heights */
  --height-xs: 30px;
  --height-sm: 36px;
  --height-md: 44px;
  --height-lg: 52px;
  --height-xl: 64px;
  
  /* Padding combinations */
  --padding-xs: var(--space-xs) var(--space-sm);
  --padding-sm: var(--space-sm) var(--space-sm);
  --padding-md: var(--space-md) var(--space-md);
  --padding-lg: var(--space-lg) var(--space-lg);
  --padding-xl: var(--space-xl) var(--space-xl);
}
```

#### Border and Effects
```css
:root {
  /* Border radius */
  --radius-xs: 10px;
  --radius-sm: 12px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-round: 32px;
  
  /* Shadows */
  --shadow-button: none;
  --shadow-overlay: none;
  --shadow-dropdown: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```

## Component-Specific Improvements

### Button Component Refactoring

#### Current Issues
- Repetitive variant definitions (15+ variants)
- Hard-coded color values in some variants
- Inconsistent naming patterns

#### Proposed Solution
```css
/* Base button styles */
.avito-button {
  /* Common properties */
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  outline: none;
  box-shadow: var(--shadow-button);
}

/* Size variants using utility classes */
.avito-button--xs { /* xs styles */ }
.avito-button--sm { /* sm styles */ }
.avito-button--md { /* md styles */ }
.avito-button--lg { /* lg styles */ }
.avito-button--xl { /* xl styles */ }

/* Variant system using data attributes */
.avito-button[data-variant="primary-default"] {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.avito-button[data-variant="primary-accent"] {
  background-color: var(--color-primary-accent);
  color: var(--color-text-inverse);
}

/* State variants */
.avito-button[data-state="disabled"] {
  background-color: var(--color-secondary);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}
```

### Input Component Refactoring

#### Current Issues
- Duplicate styles for overlay variants
- Inconsistent error state handling
- Complex nested selectors

#### Proposed Solution
```css
/* Base input styles */
.avito-input {
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  border: 1px solid;
  outline: none;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

/* Variant system */
.avito-input[data-variant="default"] {
  background-color: var(--color-secondary);
  color: var(--color-text-primary);
  border-color: var(--color-secondary);
}

.avito-input[data-variant="overlay"] {
  background-color: var(--color-bg-overlay);
  color: var(--color-text-primary);
  border-color: var(--color-bg-overlay);
  box-shadow: var(--shadow-overlay);
}

/* State system */
.avito-input[data-state="error"] {
  border-color: var(--color-primary-danger);
}

.avito-input[data-state="disabled"] {
  background-color: var(--color-secondary);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}
```

## Implementation Strategy

### Phase 1: Foundation
1. Create shared token system in `theme/tokens/`
2. Extract and organize CSS custom properties
3. Create main theme entry point (`theme/index.css`)

### Phase 2: Component Migration (Co-located)
1. Create `Button.css` next to `Button.tsx`
2. Create `Input.css` next to `Input.tsx`
3. Create `InputFieldSet.css` next to `InputFieldSet.tsx`
4. Create `Select.css` next to `Select.tsx`
5. Create `SelectFieldset.css` next to `SelectFieldset.tsx`

### Phase 3: Integration
1. Update component imports to use co-located CSS files
2. Update main theme entry point to import all component styles
3. Eliminate duplication between components
4. Optimize CSS custom property usage

### Phase 4: Documentation and Testing
1. Update component documentation
2. Create style guide documentation
3. Add visual regression tests
4. Performance testing

## Benefits

### Maintainability
- **Co-located Styles**: CSS files next to component files for easy maintenance
- **Reduced Duplication**: Shared tokens eliminate repetitive code
- **Clear Organization**: Component-specific styles isolated from shared tokens
- **Single Source of Truth**: Each component's styles in one place

### Scalability
- **Token System**: Easy to add new colors, sizes, and effects
- **Component Isolation**: New components don't affect existing ones
- **Consistent Patterns**: Shared tokens ensure consistency across components
- **Easy Component Addition**: New components get their own CSS file

### Performance
- **Smaller Bundle Size**: Eliminated duplication reduces CSS size
- **Better Caching**: Modular files enable better caching strategies
- **Optimized Selectors**: More efficient CSS selectors
- **Tree Shaking**: Unused component styles can be eliminated

### Developer Experience
- **Better IntelliSense**: Organized tokens provide better IDE support
- **Easier Debugging**: CSS files next to components make debugging simpler
- **Consistent API**: Predictable naming conventions
- **Component-First Approach**: Styles and logic stay together

## Migration Plan

### Backward Compatibility
- Maintain existing class names during transition
- Gradual migration of components
- Comprehensive testing to ensure no visual regressions

### Testing Strategy
- Visual regression testing for all components
- Cross-browser compatibility testing
- Performance benchmarking
- Accessibility testing

## Dependencies

### Build Tools
- CSS bundling system (Vite/Webpack)
- PostCSS for CSS processing
- CSS custom property polyfills (if needed)

### Development Tools
- CSS linting (Stylelint)
- CSS formatting (Prettier)
- CSS organization tools

## Success Metrics

1. **File Size Reduction**: Target 30% reduction in total CSS size
2. **Duplication Elimination**: Remove 80% of repetitive code
3. **Maintainability Score**: Improved developer experience metrics
4. **Performance**: Faster build times and runtime performance
5. **Consistency**: 100% consistent naming and patterns

## Metadata

Version: 1.0.0
Last Updated: 2025-01-27
Location: `apps/admin/src/components/avito-design-system/theme.css`