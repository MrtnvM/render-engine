# Design System Components

This directory contains the refactored design system components that provide a modular and extensible showcase for all design system components.

## Structure

### Core Components

- **`ComponentList.tsx`** - Sidebar component that displays all available design system components organized by category
- **`ComponentShowcase.tsx`** - Main content area that displays the selected component's showcase
- **`DesignSystemLayout.tsx`** - Main layout component that combines the component list and showcase
- **`ButtonShowcase.tsx`** - Specific showcase for the Button component
- **`InputShowcase.tsx`** - Specific showcase for the Input component
- **`InputFieldSetShowcase.tsx`** - Specific showcase for the InputFieldSet component

### Key Features

1. **Single Page Layout** - All components fit on a single page with a sidebar navigation
2. **Component Selection** - Click on any component in the sidebar to view its showcase
3. **Categorized Organization** - Components are organized by category (Actions, Forms, Layout, etc.)
4. **Extensible** - Easy to add new components by:
   - Adding a new component to the `components` array in `DesignSystemShowcase.tsx`
   - Creating a new showcase component (e.g., `InputShowcase.tsx`)
   - Adding a case to the `renderComponent` function

## Usage

```tsx
import { DesignSystemShowcase } from '../components/DesignSystemShowcase'

// Use the main showcase component

;<DesignSystemShowcase />
```

## Adding New Components

1. Create a new showcase component (e.g., `InputShowcase.tsx`)
2. Add the component to the `components` array in `DesignSystemShowcase.tsx`:
   ```tsx
   {
     id: 'input',
     name: 'Input',
     description: 'Text input component with validation states',
     category: 'Forms',
     icon: '📝',
   }
   ```
3. Add a case to the `renderComponent` function:
   ```tsx
   case 'input':
     return <InputShowcase />
   ```

## Component Interface

Each component in the list should implement the `ComponentItem` interface:

```tsx
interface ComponentItem {
  id: string
  name: string
  description: string
  category: string
  icon?: string
}
```

## Layout Structure

The design system uses a two-column layout:

- **Left Sidebar (320px)**: Component list with categories
- **Right Content Area**: Component showcase that updates based on selection

The layout is responsive and maintains the single-page experience while providing easy navigation between components.
