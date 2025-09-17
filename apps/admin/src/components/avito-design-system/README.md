# Avito Design System

A comprehensive, standalone design system inspired by Avito's clean, modern interface. This design system provides reusable components, tokens, and utilities for building consistent user interfaces.

## Features

- 🎨 **Complete Color System** - Avito-inspired green primary color palette
- 📝 **Typography Scale** - Clean sans-serif fonts with proper hierarchy
- 🔘 **Button Components** - Multiple variants (primary, secondary, outline, ghost)
- 🃏 **Card Components** - Flexible card layouts with headers and footers
- 📝 **Input Components** - Text inputs and text areas with validation
- 🏷️ **Badge System** - Status badges, variant badges, and dot indicators
- 👤 **Avatar Components** - User avatars with fallbacks and status indicators
- 📐 **Layout Components** - Grid, Flex, Container, and Section components
- 🛍️ **Product Cards** - E-commerce style product cards with ratings
- 📋 **List Items** - Service and item list components
- 🎭 **Showcase Page** - Complete example of all components

## Installation

Import the components you need:

```tsx
import { Button, Card, Input, Badge, Avatar } from './avito-design-system';
```

## Usage

### Basic Components

```tsx
<Button variant="primary" size="md">Click me</Button>
<Card>
  <CardHeader title="Card Title" subtitle="Card description" />
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
<Input label="Email" placeholder="Enter your email" />
<Badge variant="success">Active</Badge>
<Avatar alt="User Name" fallback="UN" />
```

### Layout Components

```tsx
<Container maxWidth="lg">
  <Section padding="lg">
    <Grid cols={{ md: 2, lg: 3 }} gap="md">
      <GridItem>
        <Card>Content</Card>
      </GridItem>
    </Grid>
  </Section>
</Container>
```

### Product Cards

```tsx
<ProductCard
  title="Professional Service"
  description="High-quality service description"
  price="From $100"
  image="/path/to/image.jpg"
  category="Category"
  rating={4.8}
  reviews={124}
  featured={true}
  actions={<Button variant="primary">View Details</Button>}
/>
```

## Component Structure

```
avito-design-system/
├── components/           # React components
│   ├── Button.tsx       # Button with variants
│   ├── Card.tsx         # Card with Header/Content/Footer
│   ├── Input.tsx        # Input and TextArea
│   ├── Badge.tsx        # Badge, StatusBadge, DotBadge
│   ├── Avatar.tsx       # Avatar and AvatarGroup
│   ├── ProductCard.tsx  # ProductCard and ListItem
│   └── Showcase.tsx     # Complete component showcase
├── layout/              # Layout components
│   ├── Container.tsx    # Container and Section
│   └── Grid.tsx         # Grid, GridItem, Flex
├── tokens/              # Design tokens
│   ├── colors.css       # Color variables
│   ├── typography.css   # Typography variables
│   ├── spacing.css      # Spacing variables
│   ├── border-radius.css # Border radius variables
│   └── shadows.css      # Shadow variables
├── types/               # TypeScript definitions
│   ├── theme.ts         # Theme interface types
│   └── components.ts    # Component prop types
├── utils/               # Utility functions
│   └── cn.ts           # Class name utility
├── theme.css           # Main CSS file with utility classes
└── index.tsx           # Main export file
```

## Design Tokens

### Colors
- **Primary**: Avito green (#00A950) with full palette
- **Semantic**: Success, warning, error colors
- **Neutral**: Complete grayscale palette
- **Utility**: White and black base colors

### Typography
- **Font Family**: System font stack (SF Pro, Segoe UI, etc.)
- **Scale**: 8-step scale from xs (12px) to 4xl (36px)
- **Weights**: Normal (400) to Bold (700)
- **Line Height**: Tight, normal, and relaxed options

### Spacing
- **Scale**: 8-point grid system from xs (4px) to 4xl (96px)

### Border Radius
- **Scale**: None to full with smooth increments

### Shadows
- **Scale**: Subtle to dramatic elevation levels

## Customization

The design system is built to be customizable. You can:

1. **Override CSS variables** in your global CSS
2. **Extend component styles** using the `className` prop
3. **Create new variants** using the existing patterns

## Examples

View the complete showcase by importing and using the `DesignSystemShowcase` component:

```tsx
import { DesignSystemShowcase } from './avito-design-system';

function App() {
  return <DesignSystemShowcase />;
}
```

## Styling Approach

This design system uses:
- **CSS Custom Properties** for theming
- **Tailwind CSS** for utility classes
- **CSS Modules** approach with custom classes
- **TypeScript** for type safety
- **Compound Component** patterns for complex components

## Browser Support

- Modern browsers with CSS custom property support
- Internet Explorer 11+ (with polyfills)
- Mobile browsers (iOS Safari 10+, Chrome for Android)

## License

MIT