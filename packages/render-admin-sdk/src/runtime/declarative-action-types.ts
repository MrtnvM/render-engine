/**
 * Declarative Action Types for Render Engine
 *
 * These action descriptors are analyzed from JavaScript handlers at transpile time
 * and executed natively on iOS/Android without JavaScript runtime.
 */

import type { ValueDescriptor, ConditionDescriptor, StoreReference } from './value-descriptors.js'

/**
 * Base action interface
 */
export interface BaseAction {
  id: string
  kind: ActionKind
  metadata?: {
    sourceLocation?: { line: number; column: number }
    description?: string
  }
}

/**
 * All supported action kinds
 */
export type ActionKind =
  // Store operations
  | 'store.set'
  | 'store.remove'
  | 'store.merge'
  | 'store.transaction'
  // Navigation
  | 'navigation.push'
  | 'navigation.pop'
  | 'navigation.replace'
  | 'navigation.modal'
  | 'navigation.dismissModal'
  | 'navigation.popTo'
  | 'navigation.reset'
  // UI
  | 'ui.showToast'
  | 'ui.showAlert'
  | 'ui.showSheet'
  | 'ui.dismissSheet'
  | 'ui.showLoading'
  | 'ui.hideLoading'
  // System
  | 'system.share'
  | 'system.openUrl'
  | 'system.haptic'
  | 'system.copyToClipboard'
  | 'system.requestPermission'
  // API
  | 'api.request'
  // Control flow
  | 'sequence'
  | 'conditional'
  | 'switch'

/**
 * Union type of all action descriptors
 */
export type ActionDescriptor =
  | StoreSetAction
  | StoreRemoveAction
  | StoreMergeAction
  | StoreTransactionAction
  | NavigationPushAction
  | NavigationPopAction
  | NavigationReplaceAction
  | NavigationModalAction
  | NavigationDismissModalAction
  | NavigationPopToAction
  | NavigationResetAction
  | ShowToastAction
  | ShowAlertAction
  | ShowSheetAction
  | DismissSheetAction
  | ShowLoadingAction
  | HideLoadingAction
  | ShareAction
  | OpenUrlAction
  | HapticAction
  | CopyToClipboardAction
  | RequestPermissionAction
  | ApiRequestAction
  | SequenceAction
  | ConditionalAction
  | SwitchAction

// ==================== Store Actions ====================

export interface StoreSetAction extends BaseAction {
  kind: 'store.set'
  storeRef: StoreReference
  keyPath: string
  value: ValueDescriptor
}

export interface StoreRemoveAction extends BaseAction {
  kind: 'store.remove'
  storeRef: StoreReference
  keyPath: string
}

export interface StoreMergeAction extends BaseAction {
  kind: 'store.merge'
  storeRef: StoreReference
  keyPath: string
  value: ValueDescriptor // Must resolve to object type
}

export interface StoreTransactionAction extends BaseAction {
  kind: 'store.transaction'
  storeRef: StoreReference
  actions: StoreAction[]
}

export type StoreAction = StoreSetAction | StoreRemoveAction | StoreMergeAction

// ==================== Navigation Actions ====================

export interface NavigationPushAction extends BaseAction {
  kind: 'navigation.push'
  screenId: string
  params?: Record<string, ValueDescriptor>
  animated?: boolean
}

export interface NavigationPopAction extends BaseAction {
  kind: 'navigation.pop'
  count?: number
  animated?: boolean
}

export interface NavigationReplaceAction extends BaseAction {
  kind: 'navigation.replace'
  screenId: string
  params?: Record<string, ValueDescriptor>
}

export interface NavigationModalAction extends BaseAction {
  kind: 'navigation.modal'
  screenId: string
  params?: Record<string, ValueDescriptor>
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet'
}

export interface NavigationDismissModalAction extends BaseAction {
  kind: 'navigation.dismissModal'
}

export interface NavigationPopToAction extends BaseAction {
  kind: 'navigation.popTo'
  screenId: string
}

export interface NavigationResetAction extends BaseAction {
  kind: 'navigation.reset'
  screenId: string
  params?: Record<string, ValueDescriptor>
}

// ==================== UI Actions ====================

export interface ShowToastAction extends BaseAction {
  kind: 'ui.showToast'
  message: ValueDescriptor
  duration?: number // milliseconds
  position?: 'top' | 'center' | 'bottom'
}

export interface ShowAlertAction extends BaseAction {
  kind: 'ui.showAlert'
  title: ValueDescriptor
  message?: ValueDescriptor
  buttons: AlertButton[]
}

export interface AlertButton {
  text: string
  style: 'default' | 'cancel' | 'destructive'
  action?: ActionDescriptor
}

export interface ShowSheetAction extends BaseAction {
  kind: 'ui.showSheet'
  title?: ValueDescriptor
  options: SheetOption[]
}

export interface SheetOption {
  text: string
  icon?: string
  action?: ActionDescriptor
}

export interface DismissSheetAction extends BaseAction {
  kind: 'ui.dismissSheet'
}

export interface ShowLoadingAction extends BaseAction {
  kind: 'ui.showLoading'
  message?: ValueDescriptor
}

export interface HideLoadingAction extends BaseAction {
  kind: 'ui.hideLoading'
}

// ==================== System Actions ====================

export interface ShareAction extends BaseAction {
  kind: 'system.share'
  content: {
    text?: ValueDescriptor
    url?: ValueDescriptor
    image?: ValueDescriptor
  }
}

export interface OpenUrlAction extends BaseAction {
  kind: 'system.openUrl'
  url: ValueDescriptor
  inApp?: boolean
}

export interface HapticAction extends BaseAction {
  kind: 'system.haptic'
  style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'
}

export interface CopyToClipboardAction extends BaseAction {
  kind: 'system.copyToClipboard'
  text: string
}

export interface RequestPermissionAction extends BaseAction {
  kind: 'system.requestPermission'
  permission: 'camera' | 'photoLibrary' | 'location' | 'notification'
}

// ==================== API Actions ====================

export interface ApiRequestAction extends BaseAction {
  kind: 'api.request'
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, ValueDescriptor>
  body?: ValueDescriptor
  onSuccess?: SequenceAction
  onError?: SequenceAction
  responseMapping?: {
    targetStoreRef: StoreReference
    keyPath: string
    transform?: ResponseTransform
  }
}

export interface ResponseTransform {
  type: 'jsonPath' | 'template'
  expression: string
}

// ==================== Control Flow Actions ====================

export interface SequenceAction extends BaseAction {
  kind: 'sequence'
  actions: ActionDescriptor[]
  strategy: 'serial' | 'parallel'
  stopOnError?: boolean
}

export interface ConditionalAction extends BaseAction {
  kind: 'conditional'
  condition: ConditionDescriptor
  then: ActionDescriptor[]
  else?: ActionDescriptor[]
}

export interface SwitchAction extends BaseAction {
  kind: 'switch'
  value: ValueDescriptor
  cases: Array<{
    match: ValueDescriptor
    actions: ActionDescriptor[]
  }>
  default?: ActionDescriptor[]
}

// ==================== Helper Types ====================

/**
 * Store descriptor for scenario initialization
 */
export interface StoreDescriptor {
  scope: 'app' | 'scenario'
  storage: 'memory' | 'userPrefs' | 'file' | 'backend'
  initialValue?: Record<string, any>
}

/**
 * Scenario metadata
 */
export interface ScenarioMeta {
  key: string
  name: string
  description: string
  version: string
}

/**
 * Transpiled scenario with declarative actions
 */
export interface TranspiledScenario extends ScenarioMeta {
  main: any // JSON node for main component
  components?: Record<string, any> // Named components
  stores?: StoreDescriptor[]
  actions?: ActionDescriptor[]
}
