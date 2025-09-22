import { ViewProps } from './layout.js' // Assuming Layout.tsx is in the same directory

// --- Action Definition ---

/**
 * Defines a generic action to be triggered by user interaction.
 * This structure is transpiled into a JSON object that the native
 * client interprets to perform tasks like navigation, API calls, or state updates.
 */
export interface Action {
  /** The unique identifier for the action type (e.g., "navigate", "submit", "showAlert"). */
  type: string
  /** An optional payload containing data relevant to the action. */
  payload?: Record<string, any>
}

// --- Prop Interfaces for UI Components ---

/**
 * Props for the Text component.
 */
export interface TextProps extends ViewProps {
  /** The string content to be displayed. */
  children: string

  /** The color of the text. */
  textColor?: string

  /** The size of the font. */
  fontSize?: number

  /** The weight of the font (e.g., 'normal', 'bold', '500'). */
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'

  /** The alignment of the text. */
  textAlign?: 'left' | 'center' | 'right' | 'justify'

  /** Limits the text to a specific number of lines, truncating if necessary. */
  numberOfLines?: number
}

/**
 * Props for the Image component.
 */
export interface ImageProps extends ViewProps {
  /** The source URL of the image. */
  src: string

  /**
   * Determines how the image should be resized to fit its container.
   * Maps to `UIView.ContentMode` on the native side.
   */
  resizeMode?: 'cover' | 'contain' | 'stretch'
}

/**
 * Props for the Button component.
 */
export interface ButtonProps extends ViewProps {
  /** The text label displayed on the button. */
  title?: string

  /** The action to be executed when the button is tapped. */
  onPress?: Action

  /** The color of the button's text label. */
  titleColor?: string

  /** The font size of the button's text label. */
  fontSize?: number

  /** The font weight of the button's text label. */
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
}

// --- UI Component Implementations ---

/**
 * A component for displaying text.
 *
 * Transpilation: This is converted into a JSON object with `type: "UILabel"` (or a custom "text" type)
 * and its props are mapped to the corresponding native properties.
 */
export const Text = (props: TextProps): null => null

/**
 * A component for displaying images.
 *
 * Transpilation: This is converted into a JSON object with `type: "UIImageView"` (or a custom "image" type).
 * The `src` prop is used by the native client to fetch and display the image.
 */
export const Image = (props: ImageProps): null => null

/**
 * A component that triggers an action when tapped.
 *
 * Transpilation: This is converted into a JSON object with `type: "UIButton"` (or a custom "button" type).
 * The `onPress` prop is serialized into a JSON object that the native client uses to route the action.
 * The button's appearance is controlled by the inherited ViewProps.
 */
export const Button = (props: ButtonProps): null => null
