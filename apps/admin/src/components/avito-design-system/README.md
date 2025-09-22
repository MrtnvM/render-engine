# Avito Design System

A comprehensive design system based on the Avito Figma components.

## Button Component

The Button component supports multiple variants, sizes, colors, and states as defined in the Figma design.

### Usage

```tsx
import { Button } from '@/components/avito-design-system';

// Basic usage
<Button>Click me</Button>

// With different variants
<Button variant="primary" color="accent">Primary Accent</Button>
<Button variant="secondary" color="pay">Secondary Pay</Button>
<Button variant="ghost" color="success">Ghost Success</Button>

// Different sizes
<Button size="xs">Extra Small</Button>
<Button size="s">Small</Button>
<Button size="m">Medium</Button>
<Button size="l">Large</Button>
<Button size="xl">Extra Large</Button>

// Round buttons
<Button round>Round Button</Button>

// Disabled state
<Button disabled>Disabled Button</Button>
<Button state="disabled">Disabled State</Button>

// Different presets
<Button preset="overlay">Overlay Button</Button>
<Button preset="inverse">Inverse Button</Button>
```

### Props

| Prop        | Type                                                      | Default     | Description                |
| ----------- | --------------------------------------------------------- | ----------- | -------------------------- |
| `children`  | `React.ReactNode`                                         | -           | Button content             |
| `variant`   | `'primary' \| 'secondary' \| 'ghost'`                     | `'primary'` | Button variant             |
| `color`     | `'default' \| 'accent' \| 'pay' \| 'success' \| 'danger'` | `'default'` | Button color theme         |
| `size`      | `'xs' \| 's' \| 'm' \| 'l' \| 'xl'`                       | `'m'`       | Button size                |
| `state`     | `'default' \| 'disabled'`                                 | `'default'` | Button state               |
| `round`     | `boolean`                                                 | `false`     | Whether button is round    |
| `preset`    | `'default' \| 'overlay' \| 'inverse'`                     | `'default'` | Button preset theme        |
| `onClick`   | `() => void`                                              | -           | Click handler              |
| `type`      | `'button' \| 'submit' \| 'reset'`                         | `'button'`  | Button type                |
| `disabled`  | `boolean`                                                 | `false`     | Whether button is disabled |
| `className` | `string`                                                  | -           | Additional CSS classes     |

### Variants

- **Primary**: Filled buttons with solid backgrounds
- **Secondary**: Outlined buttons with light backgrounds
- **Ghost**: Transparent buttons with borders

### Colors

- **Default**: Gray/black theme
- **Accent**: Blue theme
- **Pay**: Purple theme
- **Success**: Green theme
- **Danger**: Red theme

### Sizes

- **XS**: Extra small (30px height)
- **S**: Small (36px height)
- **M**: Medium (44px height)
- **L**: Large (52px height)
- **XL**: Extra large (64px height)

### Presets

- **Default**: Standard button styling
- **Overlay**: For use over images or colored backgrounds
- **Inverse**: For use on dark backgrounds

## InputFieldSet Component

The InputFieldSet component provides a complete input field with label and status text following the Avito Design System specifications. It combines a label, input field, and optional status text in a single component.

### Usage

```tsx
import { InputFieldSet } from '@/components/avito-design-system';

// Basic usage
<InputFieldSet label="Заголовок" placeholder="Введите текст" />

// With different sizes
<InputFieldSet size="xs" label="Extra Small" placeholder="XS input" />
<InputFieldSet size="s" label="Small" placeholder="S input" />
<InputFieldSet size="m" label="Medium" placeholder="M input" />
<InputFieldSet size="l" label="Large" placeholder="L input" />
<InputFieldSet size="xl" label="Extra Large" placeholder="XL input" />

// Different states
<InputFieldSet state="default" label="Default" placeholder="Default state" />
<InputFieldSet state="filled" label="Filled" value="BMW" showCloseButton onClear={() => {}} />
<InputFieldSet state="error" label="Error" placeholder="Error state" statusText="Ошибка" statusType="error" />
<InputFieldSet state="error-filled" label="Error Filled" value="BMW" statusText="Ошибка" statusType="error" showCloseButton onClear={() => {}} />
<InputFieldSet state="disabled" label="Disabled" value="BMW" />

// With status text
<InputFieldSet
  label="Марка автомобиля"
  placeholder="Введите марку"
  statusText="Введите марку автомобиля"
  statusType="hint"
/>

// With close button
<InputFieldSet
  label="Марка"
  value="BMW"
  showCloseButton
  onClear={() => console.log('Cleared')}
/>

// Controlled input
<InputFieldSet
  label="Controlled"
  value={value}
  onChange={setValue}
  placeholder="Controlled input"
/>
```

### Props

| Prop              | Type                                                               | Default     | Description                  |
| ----------------- | ------------------------------------------------------------------ | ----------- | ---------------------------- |
| `label`           | `string`                                                           | -           | Label text                   |
| `value`           | `string`                                                           | `''`        | Input value                  |
| `placeholder`     | `string`                                                           | `''`        | Placeholder text             |
| `size`            | `'xs' \| 's' \| 'm' \| 'l' \| 'xl'`                                | `'m'`       | Input size                   |
| `state`           | `'default' \| 'filled' \| 'error' \| 'error-filled' \| 'disabled'` | `'default'` | Input state                  |
| `preset`          | `'default' \| 'overlay'`                                           | `'default'` | Input preset theme           |
| `statusText`      | `string`                                                           | -           | Status text below input      |
| `statusType`      | `'error' \| 'hint' \| 'success'`                                   | `'hint'`    | Status text type             |
| `showCloseButton` | `boolean`                                                          | `false`     | Whether to show close button |
| `onChange`        | `(value: string) => void`                                          | -           | Change handler               |
| `onClear`         | `() => void`                                                       | -           | Clear button handler         |
| `disabled`        | `boolean`                                                          | `false`     | Whether input is disabled    |
| `type`            | `'text' \| 'email' \| 'password' \| 'search' \| 'tel' \| 'url'`    | `'text'`    | Input type                   |
| `name`            | `string`                                                           | -           | Input name attribute         |
| `id`              | `string`                                                           | -           | Input id attribute           |
| `autoComplete`    | `string`                                                           | -           | Autocomplete attribute       |
| `autoFocus`       | `boolean`                                                          | `false`     | Whether to auto focus        |
| `maxLength`       | `number`                                                           | -           | Maximum input length         |
| `minLength`       | `number`                                                           | -           | Minimum input length         |
| `pattern`         | `string`                                                           | -           | Input pattern                |
| `required`        | `boolean`                                                          | `false`     | Whether input is required    |
| `readOnly`        | `boolean`                                                          | `false`     | Whether input is read-only   |
| `className`       | `string`                                                           | -           | Additional CSS classes       |

### States

- **Default**: Empty input field
- **Filled**: Input with value and optional close button
- **Error**: Input with error styling and error status text
- **Error-filled**: Filled input with error styling and close button
- **Disabled**: Disabled input with muted styling

### Status Types

- **Error**: Red error text for validation errors
- **Hint**: Gray hint text for helpful information
- **Success**: Green success text for positive feedback

### Sizes

- **XS**: Extra small size with compact spacing
- **S**: Small size
- **M**: Medium size (default)
- **L**: Large size
- **XL**: Extra large size with larger text

### Presets

- **Default**: Standard input styling
- **Overlay**: Input with shadow for overlay contexts

## Input Component

The Input component provides text input functionality with multiple sizes, states, and presets following the Avito Design System specifications.

### Usage

```tsx
import { Input } from '@/components/avito-design-system';

// Basic usage
<Input placeholder="Enter text" />

// With different sizes
<Input size="xs" placeholder="Extra Small" />
<Input size="s" placeholder="Small" />
<Input size="m" placeholder="Medium" />
<Input size="l" placeholder="Large" />
<Input size="xl" placeholder="Extra Large" />

// Different states
<Input state="default" placeholder="Default state" />
<Input state="filled" value="BMW" showCloseButton onClear={() => {}} />
<Input state="error" placeholder="Error state" />
<Input state="error-filled" value="BMW" showCloseButton onClear={() => {}} />
<Input state="disabled" value="Disabled" />

// Different presets
<Input preset="default" placeholder="Default preset" />
<Input preset="overlay" placeholder="Overlay preset" />

// With close button
<Input
  value="BMW"
  showCloseButton
  onClear={() => console.log('Cleared')}
/>

// Controlled input
<Input
  value={value}
  onChange={setValue}
  placeholder="Controlled input"
/>
```

### Props

| Prop              | Type                                                               | Default     | Description                  |
| ----------------- | ------------------------------------------------------------------ | ----------- | ---------------------------- |
| `value`           | `string`                                                           | `''`        | Input value                  |
| `placeholder`     | `string`                                                           | `''`        | Placeholder text             |
| `size`            | `'xs' \| 's' \| 'm' \| 'l' \| 'xl'`                                | `'m'`       | Input size                   |
| `state`           | `'default' \| 'filled' \| 'error' \| 'error-filled' \| 'disabled'` | `'default'` | Input state                  |
| `preset`          | `'default' \| 'overlay'`                                           | `'default'` | Input preset theme           |
| `showCloseButton` | `boolean`                                                          | `false`     | Whether to show close button |
| `onChange`        | `(value: string) => void`                                          | -           | Change handler               |
| `onClear`         | `() => void`                                                       | -           | Clear button handler         |
| `disabled`        | `boolean`                                                          | `false`     | Whether input is disabled    |
| `type`            | `'text' \| 'email' \| 'password' \| 'search' \| 'tel' \| 'url'`    | `'text'`    | Input type                   |
| `name`            | `string`                                                           | -           | Input name attribute         |
| `id`              | `string`                                                           | -           | Input id attribute           |
| `autoComplete`    | `string`                                                           | -           | Autocomplete attribute       |
| `autoFocus`       | `boolean`                                                          | `false`     | Whether to auto focus        |
| `maxLength`       | `number`                                                           | -           | Maximum input length         |
| `minLength`       | `number`                                                           | -           | Minimum input length         |
| `pattern`         | `string`                                                           | -           | Input pattern                |
| `required`        | `boolean`                                                          | `false`     | Whether input is required    |
| `readOnly`        | `boolean`                                                          | `false`     | Whether input is read-only   |
| `className`       | `string`                                                           | -           | Additional CSS classes       |

### States

- **Default**: Empty input with placeholder
- **Filled**: Input with value, optionally with close button
- **Error**: Input with error styling (red border)
- **Error Filled**: Input with value and error styling
- **Disabled**: Disabled input with muted styling

### Sizes

- **XS**: Extra small (30px height, 10px border radius)
- **S**: Small (36px height, 12px border radius)
- **M**: Medium (44px height, 12px border radius)
- **L**: Large (52px height, 16px border radius)
- **XL**: Extra large (64px height, 20px border radius)

### Presets

- **Default**: Standard input styling with light background
- **Overlay**: For use over images or colored backgrounds with shadow

### Features

- **Close Button**: Optional close button for filled inputs
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **Focus Management**: Visual focus indicators
- **Error States**: Clear error communication
- **Responsive**: Adapts to different screen sizes
