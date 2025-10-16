/**
 * Action types for Store operations
 */
export enum ActionType {
  StoreSet = 'store.set',
  StoreRemove = 'store.remove',
  StoreMerge = 'store.merge',
  StoreTransaction = 'store.transaction'
}

/**
 * Store scope - where the store is bound
 */
export enum StoreScope {
  App = 'app',
  Scenario = 'scenario'
}

/**
 * Storage mechanism for the store
 */
export enum StoreStorage {
  Memory = 'memory',
  UserPrefs = 'userPrefs',
  File = 'file',
  Backend = 'backend'
}

/**
 * Store value descriptor in JSON format
 */
export interface StoreValueDescriptor {
  type: 'string' | 'number' | 'integer' | 'bool' | 'color' | 'url' | 'array' | 'object' | 'null'
  value?: any
}

/**
 * Action descriptor in JSON format
 */
export interface ActionDescriptor {
  id: string
  type: ActionType
  scope: StoreScope
  storage: StoreStorage
  keyPath: string
  value?: StoreValueDescriptor
  actions?: ActionDescriptor[] // For transactions
}

/**
 * Store descriptor in JSON format
 */
export interface StoreDescriptor {
  scope: StoreScope
  storage: StoreStorage
  initialValue?: Record<string, StoreValueDescriptor>
}

/**
 * Transpiled scenario with stores and actions
 */
export interface TranspiledScenarioWithActions {
  key: string
  version: string
  main: any
  components?: Record<string, any>
  stores?: StoreDescriptor[]
  actions?: ActionDescriptor[]
}
