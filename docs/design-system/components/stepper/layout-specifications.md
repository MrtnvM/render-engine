# Layout Specifications

## Component Layout System

The Stepper component uses a sophisticated layout system with multiple layout modes and precise positioning.

## Layout Modes

### Row Layout (Primary Container)
- **Mode**: Row
- **Justify Content**: Space Between
- **Align Items**: Center
- **Align Self**: Stretch
- **Sizing**: Fill (horizontal), Fixed (vertical)

### Column Layout (Variant Container)
- **Mode**: Column
- **Sizing**: Hug (horizontal), Hug (vertical)

### None Layout (Icon Containers)
- **Mode**: None
- **Sizing**: Fixed (horizontal), Fixed (vertical)

## Component Dimensions

### Overall Container
- **Width**: 3008px (design canvas)
- **Height**: 348px (design canvas)
- **Mode**: None
- **Sizing**: Empty object

### Individual Variants
- **Width**: Hug content
- **Height**: Hug content
- **Mode**: Column
- **Sizing**: Hug (horizontal), Hug (vertical)

## Stepper Frame Layouts

### Small (S) Stepper Frame
- **Mode**: Row
- **Justify Content**: Space Between
- **Align Items**: Center
- **Align Self**: Stretch
- **Padding**: 9px 12px 11px
- **Sizing**: Fill (horizontal), Hug (vertical)
- **Border Radius**: 12px

### Medium (M) Stepper Frame
- **Mode**: Row
- **Justify Content**: Space Between
- **Align Items**: Center
- **Align Self**: Stretch
- **Padding**: 11px 14px 13px
- **Sizing**: Fill (horizontal), Hug (vertical)
- **Border Radius**: 12px

### Large (L) Stepper Frame
- **Mode**: Row
- **Justify Content**: Space Between
- **Align Items**: Center
- **Align Self**: Stretch
- **Padding**: 15px 16px 17px
- **Sizing**: Fill (horizontal), Hug (vertical)
- **Border Radius**: 16px

## Icon Layout Specifications

### Icon Container (ECJJNV)
- **Mode**: None
- **Sizing**: Fixed (horizontal), Fixed (vertical)
- **Dimensions**: 20x20px (M/L), 16x16px (S)

### Minus Icon Layout (WCSW05)
- **Mode**: Column
- **Sizing**: Hug (horizontal), Hug (vertical)
- **Position**: Offset positioning for visual alignment

### Add Icon Layout (2H3WAI)
- **Mode**: Column
- **Sizing**: Hug (horizontal), Hug (vertical)
- **Position**: Offset positioning for visual alignment

## Spacer Layouts

### Small Spacer (U5P0QM)
- **Mode**: Column
- **Justify Content**: Center
- **Sizing**: Fixed (horizontal), Fixed (vertical)
- **Dimensions**: 8x16px

### Medium Spacer (LFA0OA)
- **Mode**: Column
- **Justify Content**: Center
- **Sizing**: Fixed (horizontal), Hug (vertical)
- **Dimensions**: 10px width

### Large Spacer (SDOQ66)
- **Mode**: Column
- **Justify Content**: Center
- **Sizing**: Fixed (horizontal), Hug (vertical)
- **Dimensions**: 16px width

## Text Layout Specifications

### Quantity Text Container (EPTROV)
- **Mode**: Column
- **Justify Content**: Center
- **Align Items**: Center
- **Sizing**: Hug (horizontal), Hug (vertical)

### Quantity Text (C0ZXBS)
- **Mode**: None
- **Sizing**: Hug (horizontal), Hug (vertical)

### Error Text (Q8O112)
- **Mode**: None
- **Sizing**: Fill (horizontal), Hug (vertical)

## Positioning System

### Absolute Positioning
- **Text Cursor**: Absolute positioning within quantity text
- **Icon Elements**: Offset positioning for visual alignment

### Relative Positioning
- **Component Variants**: Relative to parent container
- **Internal Elements**: Relative to stepper frame

## Spacing System

### Internal Spacing
- **Icon to Spacer**: Variable based on size
- **Spacer to Text**: Variable based on size
- **Text to Spacer**: Variable based on size
- **Spacer to Icon**: Variable based on size

### External Spacing
- **Component Spacing**: Defined by variant positioning
- **Error Message Spacing**: 6px spacer element

## Responsive Behavior

### Horizontal Scaling
- **Stepper Frame**: Fill container width
- **Internal Elements**: Fixed widths with flexible spacing
- **Icons**: Fixed dimensions
- **Text**: Hug content

### Vertical Scaling
- **Stepper Frame**: Fixed height based on size variant
- **Internal Elements**: Center aligned
- **Error Messages**: Below component with spacer

## Layout Constraints

### Minimum Dimensions
- **Touch Targets**: 44pt minimum (iOS guidelines)
- **Icon Containers**: Meet accessibility requirements
- **Text Readability**: Sufficient contrast and sizing

### Maximum Dimensions
- **Container Width**: Responsive to parent
- **Text Length**: Handled by text truncation
- **Icon Size**: Fixed based on variant

## Alignment System

### Horizontal Alignment
- **Main Container**: Space between for icon-text-icon layout
- **Text**: Center aligned
- **Icons**: Center aligned within containers

### Vertical Alignment
- **All Elements**: Center aligned
- **Error Messages**: Below component
- **Spacers**: Center justified

## Layout Hierarchy

```
Component Set (16013:43734)
├── Variant Container (Column Layout)
    ├── Stepper Frame (Row Layout)
    │   ├── Left Icon Container (Fixed)
    │   ├── Spacer Elements (Fixed Width)
    │   ├── Quantity Text Container (Hug)
    │   ├── Spacer Elements (Fixed Width)
    │   └── Right Icon Container (Fixed)
    └── Error Message (if applicable)
```

## Platform-Specific Layouts

### iOS
- **Touch Targets**: Minimum 44pt
- **Spacing**: iOS Human Interface Guidelines
- **Alignment**: Native iOS conventions

### Web
- **Responsive**: Flexible width, fixed height
- **Accessibility**: Keyboard navigation support
- **Cross-browser**: Consistent rendering

### BDUI (Cross-platform)
- **Adaptive**: Platform-specific optimizations
- **Consistent**: Unified design language
- **Scalable**: Multiple screen densities