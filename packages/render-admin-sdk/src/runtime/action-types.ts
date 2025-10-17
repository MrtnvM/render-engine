import type { SerializedActionHandler } from './serialized-handler-types.js'

/**
 * Action types for Store operations
 */
export enum ActionType {
  StoreSet = 'store.set',
  StoreRemove = 'store.remove',
  StoreMerge = 'store.merge',
  StoreTransaction = 'store.transaction',
}

/**
 * Store scope - where the store is bound
 */
export enum StoreScope {
  App = 'app',
  Scenario = 'scenario',
}

/**
 * Storage mechanism for the store
 */
export enum StoreStorage {
  Memory = 'memory',
  UserPrefs = 'userPrefs',
  File = 'file',
  Backend = 'backend',
}

/**
 * Store value descriptor in JSON format
 */
export interface StoreValueDescriptor {
  type: 'string' | 'number' | 'integer' | 'bool' | 'color' | 'url' | 'array' | 'object' | 'null'
  value?: any
}

/**
 * Action descriptors in JSON format
 */
export interface StoreActionDescriptor {
  kind: 'store'
  id: string
  type: ActionType
  scope: StoreScope
  storage: StoreStorage
  keyPath: string
  value?: StoreValueDescriptor
  actions?: StoreActionDescriptor[] // For transactions
  handlerId?: string
}

export interface HandlerActionDescriptor {
  kind: 'handler'
  id: string
  handler: SerializedActionHandler
  linkedActionIds?: string[]
}

export type ActionDescriptor = StoreActionDescriptor | HandlerActionDescriptor

/**
 * Store descriptor in JSON format
 */
export interface StoreDescriptor {
  scope: StoreScope
  storage: StoreStorage
  initialValue?: Record<string, StoreValueDescriptor>
}

export interface ScenarioMeta {
  key: string
  name: string
  description: string
  version: string
}

/**
 * Transpiled scenario with stores and actions
 */
export interface TranspiledScenarioWithActions {
  key: string
  name: string
  description: string
  version: string
  main: any
  components?: Record<string, any>
  stores?: StoreDescriptor[]
  actions?: ActionDescriptor[]
}
