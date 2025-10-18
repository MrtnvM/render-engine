// Main transpiler exports
export { transpile } from './transpiler/transpiler.js'
export { getPredefinedComponents, DEFAULT_COMPONENTS } from './transpiler/utils.js'

// Type exports
export type {
  JsonNode,
  TranspiledScenario as TranspiledScenarioV1,
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
  StoreActionDescriptor,
  StoreValueDescriptor,
  LegacyTranspiledScenario as TranspiledScenarioWithActions,
} from './runtime/index.js'
export { ActionType, StoreScope, StoreStorage } from './runtime/index.js'

// New declarative action types
export type {
  ActionDescriptor,
  ActionKind,
  StoreSetAction,
  StoreRemoveAction,
  StoreMergeAction,
  ConditionalAction,
  SequenceAction,
  StoreDescriptor,
  TranspiledScenario,
} from './runtime/index.js'

// Value descriptors
export type {
  ValueDescriptor,
  LiteralValue,
  StoreValueRef,
  ComputedValue,
  ConditionDescriptor,
  StoreReference,
} from './runtime/index.js'

// Transpiler V2 (declarative actions)
export { transpileV2 } from './transpiler/transpiler-v2.js'

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

// Action APIs
export {
  navigate,
  push,
  pop,
  replace,
  modal,
  dismissModal,
  popTo,
  reset,
  ui,
  showToast,
  showAlert,
  showSheet,
  dismissSheet,
  showLoading,
  hideLoading,
  system,
  share,
  openUrl,
  haptic,
  copyToClipboard,
  requestCameraPermission,
  requestPhotoLibraryPermission,
  requestLocationPermission,
  requestNotificationPermission,
} from './actions/index.js'

export type { ToastDuration, ToastPosition, HapticStyle } from './actions/index.js'

// Default export
export { transpile as default } from './transpiler/transpiler.js'
