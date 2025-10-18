/**
 * Runtime API for Store and Declarative Actions
 */

// Store API
export { store, Store, StoreScope, StoreStorage, type StoreConfig } from './store.js'

// Declarative action types
export type {
  ActionDescriptor,
  ActionKind,
  BaseAction,
  StoreSetAction,
  StoreRemoveAction,
  StoreMergeAction,
  StoreTransactionAction,
  NavigationPushAction,
  NavigationPopAction,
  NavigationReplaceAction,
  NavigationModalAction,
  NavigationDismissModalAction,
  NavigationPopToAction,
  NavigationResetAction,
  ShowToastAction,
  ShowAlertAction,
  ShowSheetAction,
  DismissSheetAction,
  ShowLoadingAction,
  HideLoadingAction,
  ShareAction,
  OpenUrlAction,
  HapticAction,
  CopyToClipboardAction,
  RequestPermissionAction,
  ApiRequestAction,
  SequenceAction,
  ConditionalAction,
  SwitchAction,
  StoreDescriptor,
  ScenarioMeta,
  TranspiledScenario,
} from './declarative-action-types.js'

// Value descriptors
export type {
  ValueDescriptor,
  LiteralValue,
  StoreValueRef,
  ComputedValue,
  EventDataRef,
  StoreReference,
  ConditionDescriptor,
  ConditionType,
  ComputedOperation,
} from './value-descriptors.js'

export { literal, storeValue, computed, eventData } from './value-descriptors.js'
