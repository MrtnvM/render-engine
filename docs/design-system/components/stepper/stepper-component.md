# Stepper Component

## Overview

The Stepper component is a quantity selector interface element that allows users to increment and decrement values through intuitive plus and minus controls.

## Component Details

- **Component Set ID**: `16013:43734`
- **Component Key**: `92e7b23213da7f92007b8c6ad71e0a8ce6a0dc9b`
- **Name**: Stepper
- **Description**: ✅ iOS, Web, BDUI (iOS, Android, MAV)

## Structure

The Stepper component consists of:

1. **Container Frame** - Main stepper container with rounded corners
2. **Left Icon** - Minus button for decrementing
3. **Quantity Display** - Central text showing current value
4. **Right Icon** - Add button for incrementing
5. **Padding Elements** - Spacers for proper alignment

## Sizes

### Small (S)
- **Border Radius**: 12px
- **Padding**: 9px 12px 11px
- **Icon Size**: 16x16px
- **Typography**: S20 · <P size=s dense> (13px, 500 weight)

### Medium (M) 
- **Border Radius**: 12px
- **Padding**: 11px 14px 13px
- **Icon Size**: 20x20px
- **Typography**: M20 · <P dense> (15px, 500 weight)

### Large (L)
- **Border Radius**: 16px
- **Padding**: 15px 16px 17px
- **Icon Size**: 20x20px
- **Typography**: M20 · <P dense> (15px, 500 weight)

## Presets

### Default Preset
- **Background**: #F2F1F0 (Light gray)
- **Use Case**: Standard interface contexts

### Overlay Preset
- **Background**: #FFFFFF (White)
- **Use Case**: Overlay contexts, modals, popups

## States

### Default State
- Standard appearance with enabled controls
- Icons in black (#000000)
- Text in black (#000000)

### Active State
- **Border**: 3px solid #45C1FF (Blue focus ring)
- **Cursor**: Black vertical line indicating text input focus
- Used when user is actively editing the quantity

### Focus State
- **Border**: 3px solid #45C1FF (Blue focus ring)
- Indicates keyboard navigation focus

### Loading State
- **Icons**: Disabled gray (#A3A3A3)
- **Spinner**: Animated loading indicator replaces quantity text
- **Spinner Size**: 16x20px (M), 14x16px (S)

### Disabled States

#### + Disabled
- **Add Icon**: Gray (#A3A3A3)
- **Minus Icon**: Black (enabled)
- **Quantity**: Black (enabled)

#### - Disabled  
- **Minus Icon**: Gray (#A3A3A3)
- **Add Icon**: Black (enabled)
- **Quantity**: Black (enabled)

#### Fully Disabled
- **All Icons**: Gray (#A3A3A3)
- **Quantity**: Gray (#A3A3A3)

### Error State
- **Border**: 1px solid #FF4053 (Red)
- **Error Message**: "Ошибка" in red (#FF4053)
- **Typography**: S10 · <P size=s> (13px, 500 weight)
- **Spacer**: 6px height between stepper and error message

## Interactive Elements

### Minus Icon
- **Purpose**: Decrement quantity
- **Sizes**: 10x16px (S), 12x20px (M)
- **Color**: Black (#000000) when enabled, Gray (#A3A3A3) when disabled

### Add Icon
- **Purpose**: Increment quantity  
- **Sizes**: 11x16px (S), 13x20px (M)
- **Color**: Black (#000000) when enabled, Gray (#A3A3A3) when disabled

### Quantity Display
- **Purpose**: Shows current value
- **Alignment**: Center
- **Typography**: Varies by size (see Sizes section)
- **Color**: Black (#000000) when enabled, Gray (#A3A3A3) when disabled

## Accessibility

- Clear visual hierarchy with proper contrast ratios
- Focus indicators for keyboard navigation
- Disabled states provide clear visual feedback
- Error states communicate validation issues
- Consistent sizing across platforms

## Platform Considerations

### iOS
- Follows iOS Human Interface Guidelines
- Touch-friendly sizing (minimum 44pt touch targets)
- Native feel with appropriate animations

### Web
- Keyboard accessible
- Screen reader compatible
- Responsive design considerations

### BDUI (iOS, Android, MAV)
- Cross-platform consistency
- Adaptive to platform conventions
- Optimized for various screen densities