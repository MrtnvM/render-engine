# Component Variants

## Stepper Component Variants

The Stepper component includes 60+ variants covering different combinations of presets, sizes, and states.

## Variant Matrix

### Presets × Sizes × States

| Preset | Size | State | Component ID | Description |
|--------|------|-------|--------------|-------------|
| Default | M | Default | 16013:43735 | Standard medium stepper |
| Default | M | Active | 20312:41716 | Medium with focus ring and cursor |
| Default | M | Focus | 20312:41235 | Medium with focus ring |
| Default | M | Loading | 16013:44012 | Medium with spinner |
| Default | M | + Disabled | 16013:43820 | Medium with add button disabled |
| Default | M | - Disabled | 16013:43868 | Medium with minus button disabled |
| Default | M | Disabled | 16013:43916 | Medium fully disabled |
| Default | M | Error | 16013:43964 | Medium with error state |
| Default | L | Default | 16013:43752 | Standard large stepper |
| Default | L | Active | 20312:41734 | Large with focus ring and cursor |
| Default | L | Focus | 20312:41253 | Large with focus ring |
| Default | L | Loading | 16013:43769 | Large with spinner |
| Default | L | + Disabled | 16013:43836 | Large with add button disabled |
| Default | L | - Disabled | 16013:43884 | Large with minus button disabled |
| Default | L | Disabled | 16013:43932 | Large fully disabled |
| Default | L | Error | 16013:43980 | Large with error state |
| Default | S | Default | 16013:43786 | Standard small stepper |
| Default | S | Active | 20312:41752 | Small with focus ring and cursor |
| Default | S | Focus | 20312:41271 | Small with focus ring |
| Default | S | Loading | 16013:43803 | Small with spinner |
| Default | S | + Disabled | 16013:43852 | Small with add button disabled |
| Default | S | - Disabled | 16013:43900 | Small with minus button disabled |
| Default | S | Disabled | 16013:43948 | Small fully disabled |
| Default | S | Error | 16013:43996 | Small with error state |
| Overlay | M | Default | 168636:120446 | Overlay medium stepper |
| Overlay | M | Active | 168636:120463 | Overlay medium with focus ring and cursor |
| Overlay | M | Focus | 168636:120481 | Overlay medium with focus ring |
| Overlay | M | Loading | 168636:120825 | Overlay medium with spinner |
| Overlay | M | + Disabled | 168636:120632 | Overlay medium with add button disabled |
| Overlay | M | - Disabled | 168636:120680 | Overlay medium with minus button disabled |
| Overlay | M | Disabled | 168636:120728 | Overlay medium fully disabled |
| Overlay | M | Error | 168636:120776 | Overlay medium with error state |
| Overlay | L | Default | 168636:120498 | Overlay large stepper |
| Overlay | L | Active | 168636:120515 | Overlay large with focus ring and cursor |
| Overlay | L | Focus | 168636:120533 | Overlay large with focus ring |
| Overlay | L | Loading | 168636:120550 | Overlay large with spinner |
| Overlay | L | + Disabled | 168636:120648 | Overlay large with add button disabled |
| Overlay | L | - Disabled | 168636:120696 | Overlay large with minus button disabled |
| Overlay | L | Disabled | 168636:120744 | Overlay large fully disabled |
| Overlay | L | Error | 168636:120792 | Overlay large with error state |
| Overlay | S | Default | 168636:120565 | Overlay small stepper |
| Overlay | S | Active | 168636:120582 | Overlay small with focus ring and cursor |
| Overlay | S | Focus | 168636:120600 | Overlay small with focus ring |
| Overlay | S | Loading | 168636:120617 | Overlay small with spinner |
| Overlay | S | + Disabled | 168636:120664 | Overlay small with add button disabled |
| Overlay | S | - Disabled | 168636:120712 | Overlay small with minus button disabled |
| Overlay | S | Disabled | 168636:120760 | Overlay small fully disabled |
| Overlay | S | Error | 168636:120809 | Overlay small with error state |

## State Descriptions

### Default State
- Standard appearance
- All controls enabled
- Black icons and text
- No special styling

### Active State
- Blue focus ring (3px solid #45C1FF)
- Text cursor visible
- Indicates user is actively editing

### Focus State
- Blue focus ring (3px solid #45C1FF)
- Keyboard navigation focus
- No text cursor

### Loading State
- Spinner replaces quantity text
- Icons disabled (gray)
- Indicates processing/updating

### + Disabled State
- Add button disabled (gray)
- Minus button enabled (black)
- Quantity text enabled (black)

### - Disabled State
- Minus button disabled (gray)
- Add button enabled (black)
- Quantity text enabled (black)

### Disabled State
- All controls disabled (gray)
- Quantity text disabled (gray)
- Complete interaction disabled

### Error State
- Red border (1px solid #FF4053)
- Error message below component
- "Ошибка" text in red

## Preset Differences

### Default Preset
- **Background**: #F2F1F0 (Light gray)
- **Use Case**: Standard interface contexts
- **Platform**: Primary interface elements

### Overlay Preset
- **Background**: #FFFFFF (White)
- **Use Case**: Modal dialogs, popups, overlays
- **Platform**: Secondary interface contexts

## Size Specifications

### Small (S)
- **Height**: Compact
- **Padding**: 9px 12px 11px
- **Border Radius**: 12px
- **Icon Size**: 16x16px
- **Typography**: 13px, 500 weight

### Medium (M)
- **Height**: Standard
- **Padding**: 11px 14px 13px
- **Border Radius**: 12px
- **Icon Size**: 20x20px
- **Typography**: 15px, 500 weight

### Large (L)
- **Height**: Spacious
- **Padding**: 15px 16px 17px
- **Border Radius**: 16px
- **Icon Size**: 20x20px
- **Typography**: 15px, 500 weight

## Usage Guidelines

### When to Use Each Size
- **Small (S)**: Compact interfaces, mobile-first designs, space-constrained layouts
- **Medium (M)**: Standard interfaces, balanced layouts, most common use case
- **Large (L)**: Touch interfaces, accessibility-focused designs, prominent interactions

### When to Use Each Preset
- **Default**: Primary interface contexts, main application screens
- **Overlay**: Modal dialogs, popups, secondary interface layers

### State Transitions
1. **Default** → **Focus** (keyboard navigation)
2. **Focus** → **Active** (user interaction)
3. **Active** → **Loading** (processing)
4. **Loading** → **Default** (success) or **Error** (failure)
5. **Any State** → **Disabled** (contextual disabling)