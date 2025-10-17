// Main transpiler exports
export { transpile } from './transpiler/transpiler.js'
export { getPredefinedComponents, DEFAULT_COMPONENTS } from './transpiler/utils.js'

// Type exports
export type {
  JsonNode,
  TranspiledScenario,
  ComponentMetadata,
  JSXElement,
  JSXText,
  ASTNode,
  TranspilerConfig,
} from './transpiler/types.js'

// Runtime Store API exports
export { store, Store, Action, ActionContext } from './runtime/index.js'
export type {
  StoreConfig,
  ActionDescriptor,
  StoreActionDescriptor,
  HandlerActionDescriptor,
  StoreDescriptor,
  StoreValueDescriptor,
  TranspiledScenarioWithActions,
} from './runtime/index.js'
export { ActionType, StoreScope, StoreStorage } from './runtime/index.js'

// UI type exports
export type {
  ViewStyle,
  TextStyle,
  ImageStyle,
  FlexStyle,
  ShadowStyle,
  ColorValue,
  DimensionValue,
  ImageResizeMode,
} from './ui/index.js'

// UI component exports
export type {
  ViewProps,
  TextProps,
  ImageProps,
  ButtonProps,
  CheckboxProps,
  StepperProps,
  RatingProps,
  SpacerProps,
} from './ui/ui.js'

// Default export
export { transpile as default } from './transpiler/transpiler.js'
