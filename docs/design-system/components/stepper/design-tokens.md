# Design Tokens

## Colors

### Primary Colors
- **Black**: `#000000` - Primary text and icons
- **White**: `#FFFFFF` - Overlay backgrounds
- **Light Gray**: `#F2F1F0` - Default background

### Interactive Colors
- **Focus Blue**: `#45C1FF` - Focus rings and active states
- **Error Red**: `#FF4053` - Error states and validation messages
- **Disabled Gray**: `#A3A3A3` - Disabled states

### Utility Colors
- **Transparent Purple**: `rgba(129, 68, 219, 0.4)` - Spacer elements (hidden)

## Typography

### Font Family
- **Primary**: `Manrope_Cut_008`

### Text Styles

#### M20 · <P dense> (Medium)
- **Font Family**: Manrope_Cut_008
- **Font Weight**: 500
- **Font Size**: 15px
- **Line Height**: 1.3333333333333333em (20px)
- **Text Align**: Center (Horizontal), Top (Vertical)
- **Use Case**: Medium and Large stepper quantity text

#### S20 · <P size=s dense> (Small)
- **Font Family**: Manrope_Cut_008
- **Font Weight**: 500
- **Font Size**: 13px
- **Line Height**: 1.2307692307692308em (16px)
- **Text Align**: Center (Horizontal), Top (Vertical)
- **Use Case**: Small stepper quantity text

#### S10 · <P size=s> (Error)
- **Font Family**: Manrope_Cut_008
- **Font Weight**: 500
- **Font Size**: 13px
- **Line Height**: 1.3846153846153846em (18px)
- **Text Align**: Left (Horizontal), Top (Vertical)
- **Use Case**: Error messages

## Spacing

### Component Padding

#### Small (S)
- **Padding**: 9px 12px 11px
- **Horizontal**: 12px left/right
- **Vertical**: 9px top, 11px bottom

#### Medium (M)
- **Padding**: 11px 14px 13px
- **Horizontal**: 14px left/right
- **Vertical**: 11px top, 13px bottom

#### Large (L)
- **Padding**: 15px 16px 17px
- **Horizontal**: 16px left/right
- **Vertical**: 15px top, 17px bottom

### Internal Spacing

#### Spacer Elements
- **6px**: Error message spacing
- **8px**: Internal component spacing
- **10px**: Medium component spacing
- **16px**: Large component spacing

#### Icon Spacing
- **Icon Container**: Fixed width containers
- **Small Icons**: 16x16px containers
- **Medium/Large Icons**: 20x20px containers

## Border Radius

- **Small/Medium**: 12px
- **Large**: 16px

## Border Styles

### Focus Ring
- **Color**: #45C1FF
- **Weight**: 3px
- **Style**: Solid
- **Use Case**: Active and Focus states

### Error Border
- **Color**: #FF4053
- **Weight**: 1px
- **Style**: Solid
- **Use Case**: Error states

### Text Cursor
- **Color**: #000000
- **Weight**: 1px
- **Style**: Solid
- **Dimensions**: 0px width, 20px height (M), 16px height (S)
- **Use Case**: Active text input state

## Icon Specifications

### Minus Icon
- **Small**: 10x16px
- **Medium**: 12x20px
- **Color**: #000000 (enabled), #A3A3A3 (disabled)

### Add Icon
- **Small**: 11x16px
- **Medium**: 13x20px
- **Color**: #000000 (enabled), #A3A3A3 (disabled)

### Spinner Icon
- **Small**: 14x16px
- **Medium**: 16x20px
- **Color**: #000000
- **Use Case**: Loading states

## Layout Specifications

### Container Layouts

#### Row Layout (Main Container)
- **Mode**: Row
- **Justify Content**: Space Between
- **Align Items**: Center
- **Align Self**: Stretch
- **Sizing**: Fill (horizontal), Fixed (vertical)

#### Column Layout (Variants)
- **Mode**: Column
- **Sizing**: Hug (horizontal), Hug (vertical)

### Icon Layouts

#### Icon Container
- **Mode**: None
- **Sizing**: Fixed (horizontal), Fixed (vertical)
- **Dimensions**: 20x20px (M/L), 16x16px (S)

#### Icon Positioning
- **Minus Icon**: Offset positioning for visual alignment
- **Add Icon**: Offset positioning for visual alignment

## Component Dimensions

### Overall Component Sizes
- **Width**: Fill container (responsive)
- **Height**: Fixed based on size variant

### Internal Element Dimensions
- **Quantity Text**: Hug content
- **Icons**: Fixed dimensions
- **Spacers**: Fixed widths, fill heights

## Animation Specifications

### Loading State
- **Spinner**: Rotating animation
- **Duration**: Continuous
- **Easing**: Linear

### State Transitions
- **Focus Ring**: Instant appearance/disappearance
- **Color Changes**: Instant
- **Cursor**: Instant appearance/disappearance

## Accessibility Tokens

### Contrast Ratios
- **Black on Light Gray**: High contrast
- **Black on White**: Maximum contrast
- **Gray on Light Gray**: Sufficient contrast for disabled states
- **Red on White**: High contrast for error states

### Touch Targets
- **Minimum Size**: 44pt (iOS guidelines)
- **Icon Containers**: Meet minimum touch target requirements
- **Spacing**: Adequate spacing between interactive elements

### Focus Indicators
- **Focus Ring**: 3px solid blue (#45C1FF)
- **High Contrast**: Meets WCAG AA standards
- **Keyboard Navigation**: Clear focus indicators