import { ImageResizeMode } from './image-resize-mode.types'

export type ColorValue = string
export type FlexAlignType = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
export type AlignContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
export type DimensionValue = number | 'auto' | `${number}%` | null

export type CursorValue = 'auto' | 'pointer'

export interface FlexStyle {
  alignContent?: AlignContent | undefined
  alignItems?: FlexAlignType | undefined
  alignSelf?: 'auto' | FlexAlignType | undefined
  aspectRatio?: number | string | undefined
  borderBottomWidth?: number | undefined
  borderEndWidth?: number | undefined
  borderLeftWidth?: number | undefined
  borderRightWidth?: number | undefined
  borderStartWidth?: number | undefined
  borderTopWidth?: number | undefined
  borderWidth?: number | undefined
  bottom?: DimensionValue | undefined
  boxSizing?: 'border-box' | 'content-box' | undefined
  display?: 'none' | 'flex' | 'contents' | undefined
  end?: DimensionValue | undefined
  flex?: number | undefined
  flexBasis?: DimensionValue | undefined
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse' | undefined
  rowGap?: number | string | undefined
  gap?: number | string | undefined
  columnGap?: number | string | undefined
  flexGrow?: number | undefined
  flexShrink?: number | undefined
  flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse' | undefined
  height?: DimensionValue | undefined
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | undefined
  left?: DimensionValue | undefined
  margin?: DimensionValue | undefined
  marginBottom?: DimensionValue | undefined
  marginEnd?: DimensionValue | undefined
  marginHorizontal?: DimensionValue | undefined
  marginLeft?: DimensionValue | undefined
  marginRight?: DimensionValue | undefined
  marginStart?: DimensionValue | undefined
  marginTop?: DimensionValue | undefined
  marginVertical?: DimensionValue | undefined
  maxHeight?: DimensionValue | undefined
  maxWidth?: DimensionValue | undefined
  minHeight?: DimensionValue | undefined
  minWidth?: DimensionValue | undefined
  overflow?: 'visible' | 'hidden' | 'scroll' | undefined
  padding?: DimensionValue | undefined
  paddingBottom?: DimensionValue | undefined
  paddingEnd?: DimensionValue | undefined
  paddingHorizontal?: DimensionValue | undefined
  paddingLeft?: DimensionValue | undefined
  paddingRight?: DimensionValue | undefined
  paddingStart?: DimensionValue | undefined
  paddingTop?: DimensionValue | undefined
  paddingVertical?: DimensionValue | undefined
  position?: 'absolute' | 'relative' | 'static' | undefined
  right?: DimensionValue | undefined
  start?: DimensionValue | undefined
  top?: DimensionValue | undefined
  width?: DimensionValue | undefined
  zIndex?: number | undefined
  direction?: 'inherit' | 'ltr' | 'rtl' | undefined

  /**
   * Equivalent to `top`, `bottom`, `right` and `left`
   */
  inset?: DimensionValue | undefined

  /**
   * Equivalent to `top`, `bottom`
   */
  insetBlock?: DimensionValue | undefined

  /**
   * Equivalent to `bottom`
   */
  insetBlockEnd?: DimensionValue | undefined

  /**
   * Equivalent to `top`
   */
  insetBlockStart?: DimensionValue | undefined

  /**
   * Equivalent to `right` and `left`
   */
  insetInline?: DimensionValue | undefined

  /**
   * Equivalent to `right` or `left`
   */
  insetInlineEnd?: DimensionValue | undefined

  /**
   * Equivalent to `right` or `left`
   */
  insetInlineStart?: DimensionValue | undefined

  /**
   * Equivalent to `marginVertical`
   */
  marginBlock?: DimensionValue | undefined

  /**
   * Equivalent to `marginBottom`
   */
  marginBlockEnd?: DimensionValue | undefined

  /**
   * Equivalent to `marginTop`
   */
  marginBlockStart?: DimensionValue | undefined

  /**
   * Equivalent to `marginHorizontal`
   */
  marginInline?: DimensionValue | undefined

  /**
   * Equivalent to `marginEnd`
   */
  marginInlineEnd?: DimensionValue | undefined

  /**
   * Equivalent to `marginStart`
   */
  marginInlineStart?: DimensionValue | undefined

  /**
   * Equivalent to `paddingVertical`
   */
  paddingBlock?: DimensionValue | undefined

  /**
   * Equivalent to `paddingBottom`
   */
  paddingBlockEnd?: DimensionValue | undefined

  /**
   * Equivalent to `paddingTop`
   */
  paddingBlockStart?: DimensionValue | undefined

  /**
   * Equivalent to `paddingHorizontal`
   */
  paddingInline?: DimensionValue | undefined

  /**
   * Equivalent to `paddingEnd`
   */
  paddingInlineEnd?: DimensionValue | undefined

  /**
   * Equivalent to `paddingStart`
   */
  paddingInlineStart?: DimensionValue | undefined
}

export interface ShadowStyleIOS {
  iosShadowColor?: ColorValue | undefined
  iosShadowOffset?: Readonly<{ width: number; height: number }> | undefined
  iosShadowOpacity?: number | undefined
  iosShadowRadius?: number | undefined
}

export type FilterFunction =
  | { brightness: number | string }
  | { blur: number | string }
  | { contrast: number | string }
  | { grayscale: number | string }
  | { hueRotate: number | string }
  | { invert: number | string }
  | { opacity: number | string }
  | { saturate: number | string }
  | { sepia: number | string }
  | { dropShadow: DropShadowValue | string }

export type DropShadowValue = {
  offsetX: number | string
  offsetY: number | string
  standardDeviation?: number | string | undefined
  color?: ColorValue | number | undefined
}

export type BoxShadowValue = {
  offsetX: number | string
  offsetY: number | string
  color?: string | undefined
  blurRadius?: ColorValue | number | undefined
  spreadDistance?: number | string | undefined
  inset?: boolean | undefined
}

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity'

export type GradientValue = {
  type: 'linear-gradient'
  // Angle or direction enums
  direction?: string | undefined
  colorStops: ReadonlyArray<{
    color: ColorValue | null
    positions?: ReadonlyArray<string[]> | undefined
  }>
}

export interface ViewStyle extends FlexStyle, ShadowStyleIOS {
  backfaceVisibility?: 'visible' | 'hidden' | undefined
  backgroundColor?: ColorValue | undefined
  borderBlockColor?: ColorValue | undefined
  borderBlockEndColor?: ColorValue | undefined
  borderBlockStartColor?: ColorValue | undefined
  borderBottomColor?: ColorValue | undefined
  borderBottomEndRadius?: number | undefined
  borderBottomLeftRadius?: number | undefined
  borderBottomRightRadius?: number | undefined
  borderBottomStartRadius?: number | undefined
  borderColor?: ColorValue | undefined
  borderCurve?: 'circular' | 'continuous' | undefined
  borderEndColor?: ColorValue | undefined
  borderEndEndRadius?: number | undefined
  borderEndStartRadius?: number | undefined
  borderLeftColor?: ColorValue | undefined
  borderRadius?: number | undefined
  borderRightColor?: ColorValue | undefined
  borderStartColor?: ColorValue | undefined
  borderStartEndRadius?: number | undefined
  borderStartStartRadius?: number | undefined
  borderStyle?: 'solid' | 'dotted' | 'dashed' | undefined
  borderTopColor?: ColorValue | undefined
  borderTopEndRadius?: number | undefined
  borderTopLeftRadius?: number | undefined
  borderTopRightRadius?: number | undefined
  borderTopStartRadius?: number | undefined
  outlineColor?: ColorValue | undefined
  outlineOffset?: number | undefined
  outlineStyle?: 'solid' | 'dotted' | 'dashed' | undefined
  outlineWidth?: number | undefined
  opacity?: number | undefined
  /**
   * Sets the elevation of a view, using Android's underlying
   * [elevation API](https://developer.android.com/training/material/shadows-clipping.html#Elevation).
   * This adds a drop shadow to the item and affects z-order for overlapping views.
   * Only supported on Android 5.0+, has no effect on earlier versions.
   */
  androidElevation?: number | undefined
  /**
   * Controls whether the View can be the target of touch events.
   */
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto' | undefined
  isolation?: 'auto' | 'isolate' | undefined
  cursor?: CursorValue | undefined
  boxShadow?: ReadonlyArray<BoxShadowValue> | string | undefined
  filter?: ReadonlyArray<FilterFunction> | string | undefined

  mixBlendMode?: BlendMode | undefined
  experimental_backgroundImage?: ReadonlyArray<GradientValue> | string | undefined
}

export type FontVariant =
  | 'small-caps'
  | 'oldstyle-nums'
  | 'lining-nums'
  | 'tabular-nums'
  | 'common-ligatures'
  | 'no-common-ligatures'
  | 'discretionary-ligatures'
  | 'no-discretionary-ligatures'
  | 'historical-ligatures'
  | 'no-historical-ligatures'
  | 'contextual'
  | 'no-contextual'
  | 'proportional-nums'
  | 'stylistic-one'
  | 'stylistic-two'
  | 'stylistic-three'
  | 'stylistic-four'
  | 'stylistic-five'
  | 'stylistic-six'
  | 'stylistic-seven'
  | 'stylistic-eight'
  | 'stylistic-nine'
  | 'stylistic-ten'
  | 'stylistic-eleven'
  | 'stylistic-twelve'
  | 'stylistic-thirteen'
  | 'stylistic-fourteen'
  | 'stylistic-fifteen'
  | 'stylistic-sixteen'
  | 'stylistic-seventeen'
  | 'stylistic-eighteen'
  | 'stylistic-nineteen'
  | 'stylistic-twenty'
export interface TextStyleIOS extends ViewStyle {
  iosFontVariant?: FontVariant[] | undefined
  iosTextDecorationColor?: ColorValue | undefined
  iosTextDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed' | undefined
  iosWritingDirection?: 'auto' | 'ltr' | 'rtl' | undefined
}

export interface TextStyleAndroid extends ViewStyle {
  androidTextAlignVertical?: 'auto' | 'top' | 'bottom' | 'center' | undefined
  androidVerticalAlign?: 'auto' | 'top' | 'bottom' | 'middle' | undefined
  androidIncludeFontPadding?: boolean | undefined
}

export interface TextStyle extends TextStyleIOS, TextStyleAndroid, ViewStyle {
  color?: ColorValue | undefined
  fontFamily?: string | undefined
  fontSize?: number | undefined
  fontStyle?: 'normal' | 'italic' | undefined
  /**
   * Specifies font weight. The values 'normal' and 'bold' are supported
   * for most fonts. Not all fonts have a variant for each of the numeric
   * values, in that case the closest one is chosen.
   */
  fontWeight?:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900'
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900
    | 'ultralight'
    | 'thin'
    | 'light'
    | 'medium'
    | 'regular'
    | 'semibold'
    | 'condensedBold'
    | 'condensed'
    | 'heavy'
    | 'black'
    | undefined
  letterSpacing?: number | undefined
  lineHeight?: number | undefined
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify' | undefined
  textDecorationLine?: 'none' | 'underline' | 'line-through' | 'underline line-through' | undefined
  iosTextDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed' | undefined
  iosTextDecorationColor?: ColorValue | undefined
  textShadowColor?: ColorValue | undefined
  textShadowOffset?: { width: number; height: number } | undefined
  textShadowRadius?: number | undefined
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase' | undefined
  userSelect?: 'auto' | 'none' | 'text' | 'contain' | 'all' | undefined
}

export interface ImageStyle extends FlexStyle, ShadowStyleIOS {
  resizeMode?: ImageResizeMode | undefined
  backfaceVisibility?: 'visible' | 'hidden' | undefined
  borderBottomLeftRadius?: number | undefined
  borderBottomRightRadius?: number | undefined
  backgroundColor?: ColorValue | undefined
  borderColor?: ColorValue | undefined
  borderRadius?: number | undefined
  borderTopLeftRadius?: number | undefined
  borderTopRightRadius?: number | undefined
  overflow?: 'visible' | 'hidden' | undefined
  overlayColor?: ColorValue | undefined
  tintColor?: ColorValue | undefined
  opacity?: number | undefined
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none' | undefined
  cursor?: CursorValue | undefined
}
