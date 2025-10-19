import React from 'react'
import { ImageStyle, TextStyle, ViewStyle } from './stylesheet.types.js'

// ---------------- VIEW ----------------
export interface ViewProps {
  id?: string
  children?: React.ReactNode
  style?: ViewStyle
}

export const View = (props: ViewProps): null => null

// ---------------- CONTAINERS ----------------

export const Row = (props: ViewProps): null => null

export const Column = (props: ViewProps): null => null

export const Stack = (props: ViewProps): null => null

// ---------------- TEXT ----------------

export interface TextProps extends ViewStyle {
  style?: TextStyle
  properties?: {
    text: string
  }
}

export const Text = (props: TextProps): null => null

// ---------------- IMAGE ----------------

export interface ImageProps extends ViewStyle {
  style?: ImageStyle
  properties?: {
    source: string
  }
}

export const Image = (props: ImageProps): null => null

// ---------------- BUTTON ----------------

export interface ButtonProps extends ViewStyle {
  style?: ViewStyle
  titleStyle?: TextStyle
  properties?: {
    title?: string
    image?: string
  }
}

export const Button = (props: ButtonProps): null => null

// ---------------- CHECKBOX ----------------

export interface CheckboxProps extends ViewStyle {
  style?: ViewStyle
  properties?: {
    checked: boolean
    disabled: boolean
  }
}

export const Checkbox = (props: CheckboxProps): null => null

// ---------------- STEPPER ----------------

export interface StepperProps extends ViewStyle {
  style?: ViewStyle
  properties?: {
    value: number
    minimumValue: number
    maximumValue: number
    disabled: boolean
  }
}

export const Stepper = (props: StepperProps): null => null

// ---------------- RATING ----------------

export interface RatingProps extends ViewStyle {
  style?: ViewStyle
  properties?: {
    rating: number
    maxRating: number
    interactive: boolean
  }
}

export const Rating = (props: RatingProps): null => null

// ---------------- SPACER ----------------

export interface SpacerProps extends ViewStyle {
  style?: ViewStyle
  properties?: {
    size?: number
    minSize?: number
  }
}

export const Spacer = (props: SpacerProps): null => null

// ---------------- SAFE AREA VIEW ----------------

export interface SafeAreaViewProps {
  id?: string
  children?: React.ReactNode
  style?: ViewStyle
  properties?: {
    edges?: ('top' | 'bottom' | 'left' | 'right')[]
  }
}

export const SafeAreaView = (props: SafeAreaViewProps): null => null

// ---------------- NAVBAR ----------------

export interface NavbarProps extends ViewStyle {
  style?: ViewStyle
  properties?: {
    title?: string
    leftButtonTitle?: string
    rightButtonTitle?: string
  }
}

export const Navbar = (props: NavbarProps): null => null

// ---------------- LIST ----------------

export interface ListProps<T = any> {
  id?: string
  style?: ViewStyle
  data: T[]
  getItem?: (id: T) => any
  renderItem: (item: T, index: number) => React.ReactElement
  keyExtractor?: (item: T, index: number) => string
}

export const List = <T,>(props: ListProps<T>): null => null
