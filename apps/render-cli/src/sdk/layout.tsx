import React from 'react'

// --- Type Definitions for Styling ---

/**
 * Defines alignment of items along the main axis (horizontal for Row, vertical for Column).
 * Maps to `justifyContent` in FlexLayout.
 */
type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'

/**
 * Defines alignment of items along the cross axis (vertical for Row, horizontal for Column).
 * Maps to `alignItems` in FlexLayout.
 */
type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'

/**
 * Defines positioning strategy for an element, crucial for the Stack component.
 * Maps to `position` in FlexLayout.
 */
type Position = 'relative' | 'absolute'

// --- Prop Interfaces for Layout Components ---

/**
 * Shared styling and layout properties for all visual components.
 * These props directly map to the properties defined in the native `ViewStyle.swift`.
 */
export interface ViewProps {
  /** A unique identifier for the component. */
  id?: string

  /** The content to be rendered inside the component. */
  children?: React.ReactNode

  // Sizing
  width?: number | string // number for pixels, string for percentage (e.g., "50%")
  height?: number | string

  // Spacing
  padding?: number
  paddingHorizontal?: number
  paddingVertical?: number
  paddingTop?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingRight?: number

  margin?: number
  marginHorizontal?: number
  marginVertical?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number

  // Visual Styles
  backgroundColor?: string // e.g., "#FF0000FF" or a named color
  cornerRadius?: number
  borderWidth?: number
  borderColor?: string

  // Positioning (for use within a Stack)
  position?: Position
  top?: number
  bottom?: number
  left?: number
  right?: number
}

/**
 * Props for the Row and Column components.
 */
export interface FlexContainerProps extends ViewProps {
  /** Aligns children along the main axis. */
  justifyContent?: JustifyContent
  /** Aligns children along the cross axis. */
  alignItems?: AlignItems
}

/**
 * Props for the Stack component. It uses the base ViewProps.
 */
export interface StackProps extends ViewProps {}

// --- Layout Component Implementations ---

/**
 * A layout component that arranges its children in a horizontal line.
 *
 * Transpilation: This component will be converted into a JSON object with
 * `type: "view"` and a style object containing `direction: "row"`.
 * The `justifyContent` and `alignItems` props are mapped to their FlexLayout equivalents.
 */
export const Row = (props: FlexContainerProps): null => null

/**
 * A layout component that arranges its children in a vertical line.
 *
 * Transpilation: This component will be converted into a JSON object with
 * `type: "view"` and a style object containing `direction: "column"`.
 * The `justifyContent` and `alignItems` props are mapped to their FlexLayout equivalents.
 */
export const Column = (props: FlexContainerProps): null => null

/**
 * A layout component that stacks its children on top of each other (Z-axis).
 *
 * Transpilation:
 * 1. The `<Stack>` itself becomes a JSON object with `type: "view"` and `position: "relative"`.
 * 2. Its direct children are transpiled with their `position` property set to `absolute`,
 *    allowing them to be layered. Positioning can be controlled via `top`, `bottom`, `left`,
 *    and `right` props on the child elements.
 */
export const Stack = (props: StackProps): null => null
