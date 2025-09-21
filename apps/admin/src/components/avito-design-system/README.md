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
