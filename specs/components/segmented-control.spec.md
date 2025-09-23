# SegmentedControl Component

## Overview

A SegmentedControl component that allows users to select one option from a set of mutually exclusive choices. The component displays options as connected segments with a single selected state, following the Avito Design System patterns for consistent styling and behavior.

## Properties

### Core Properties

- `options: SegmentedControlOption[]` - Array of selectable options
- `value?: string` - Currently selected option value
- `onChange?: (value: string) => void` - Callback when selection changes
- `disabled?: boolean` - Whether the entire control is disabled

### Styling Properties

- `size?: 'xs' | 's' | 'm' | 'l' | 'xl'` - Size variant (default: 'm')
- `variant?: 'default' | 'accent' | 'pay' | 'success' | 'danger'` - Color variant (default: 'default')
- `preset?: 'default' | 'overlay'` - Preset styling (default: 'default')
- `className?: string` - Additional CSS classes

### Accessibility Properties

- `name?: string` - Form field name for accessibility
- `id?: string` - Unique identifier
- `ariaLabel?: string` - Accessible label for screen readers

## Data Structure

### SegmentedControlOption

```typescript
interface SegmentedControlOption {
  value: string
  label: string
  disabled?: boolean
}
```

## Methods

### Component Behavior

- `handleOptionClick(value: string)` - Handles option selection
- `handleKeyDown(event: KeyboardEvent)` - Handles keyboard navigation
- `getSelectedIndex()` - Returns index of currently selected option
- `focusOption(index: number)` - Focuses specific option for accessibility

## Business Rules

1. **Single Selection**: Only one option can be selected at a time
2. **Required Options**: Must have at least 2 options to be meaningful
3. **Disabled State**: When disabled, all interactions are prevented
4. **Keyboard Navigation**: Arrow keys navigate between options
5. **Accessibility**: Proper ARIA attributes and keyboard support
6. **Visual Feedback**: Clear indication of selected and hover states

## Styling Requirements

### Size Variants

- **xs**: Height 30px, font-size 13px, padding 6px 8px
- **s**: Height 36px, font-size 15px, padding 9px 11px  
- **m**: Height 44px, font-size 15px, padding 11px 13px
- **l**: Height 52px, font-size 18px, padding 15px 15px
- **xl**: Height 64px, font-size 18px, padding 20px 21px

### Color Variants

- **default**: Primary text on secondary background
- **accent**: Accent color scheme
- **pay**: Pay color scheme  
- **success**: Success color scheme
- **danger**: Danger color scheme

### States

- **default**: Normal appearance
- **selected**: Highlighted selected option
- **hover**: Subtle hover effect
- **disabled**: Reduced opacity and no interactions
- **focus**: Focus ring for keyboard navigation

## Dependencies

### Base Classes

- React.forwardRef for ref forwarding
- HTMLDivElement for container
- HTMLButtonElement for individual options

### Design System

- Avito Design System theme variables
- cn utility for class composition
- Consistent spacing and typography tokens

### Accessibility

- ARIA attributes for screen reader support
- Keyboard event handling
- Focus management

## Tests

### Essential Tests

- Renders with provided options
- Handles selection changes correctly
- Respects disabled state
- Supports keyboard navigation
- Applies correct styling variants
- Forwards refs properly
- Handles edge cases (empty options, invalid values)

### Accessibility Tests

- Keyboard navigation works correctly
- ARIA attributes are properly set
- Screen reader announcements work
- Focus management is correct

## Usage Examples

### Basic Usage

```tsx
<SegmentedControl
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ]}
  value="option1"
  onChange={(value) => console.log('Selected:', value)}
/>
```

### With Styling Variants

```tsx
<SegmentedControl
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  size="l"
  variant="accent"
  preset="overlay"
/>
```

### Disabled State

```tsx
<SegmentedControl
  options={options}
  value={selectedValue}
  onChange={setSelectedValue}
  disabled
/>
```

## Metadata

Version: 1.0.0
Last Updated: 2025-01-27
Location: `apps/admin/src/components/avito-design-system/components/SegmentedControl.tsx`