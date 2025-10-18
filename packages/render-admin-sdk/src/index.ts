// Main transpiler export
export { transpile } from './transpiler/transpiler.js'
export { getPredefinedComponents, DEFAULT_COMPONENTS } from './transpiler/utils.js'

// Transpiler type exports
export type {
  JsonNode,
  ComponentMetadata,
  JSXElement,
  JSXText,
  ASTNode,
  TranspilerConfig,
} from './transpiler/types.js'

// Runtime Store API exports
export { store, Store, StoreScope, StoreStorage } from './runtime/index.js'
export type {
  StoreConfig,
} from './runtime/index.js'

// Declarative action type exports
export type {
  ActionDescriptor,
  ActionKind,
  StoreSetAction,
  StoreRemoveAction,
  StoreMergeAction,
  StoreTransactionAction,
  NavigationPushAction,
  NavigationPopAction,
  NavigationReplaceAction,
  NavigationModalAction,
  ShowToastAction,
  ShowAlertAction,
  ShareAction,
  OpenUrlAction,
  HapticAction,
  SequenceAction,
  ConditionalAction,
  StoreDescriptor,
  ScenarioMeta,
  TranspiledScenario,
} from './runtime/index.js'

// Value descriptor exports
export type {
  ValueDescriptor,
  LiteralValue,
  StoreValueRef,
  ComputedValue,
  EventDataRef,
  ConditionDescriptor,
  StoreReference,
} from './runtime/index.js'

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
  api,
  apiRequest,
} from './actions/index.js'

export type { ToastDuration, ToastPosition, HapticStyle, ApiRequestConfig, HttpMethod } from './actions/index.js'

// Default export
export { transpile as default } from './transpiler/transpiler.js'
