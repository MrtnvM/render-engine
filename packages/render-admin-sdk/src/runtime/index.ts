/**
 * Runtime API for Store and Actions
 */

export { store, Store, type StoreConfig } from './store.js'
export { StoreAction as Action, ActionContext } from './action-context.js'

// Legacy action types (to be deprecated)
export {
  ActionType,
  StoreScope,
  StoreStorage,
  type ActionDescriptor as LegacyActionDescriptor,
  type StoreActionDescriptor,
  type StoreDescriptor as LegacyStoreDescriptor,
  type StoreValueDescriptor,
  type TranspiledScenarioWithActions as LegacyTranspiledScenario,
} from './action-types.js'

// New declarative action types
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
  ShowToastAction,
  ShowAlertAction,
  ShowSheetAction,
  ShareAction,
  OpenUrlAction,
  HapticAction,
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
