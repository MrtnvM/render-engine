import { ActionContext, StoreAction } from './action-context.js'
import { ActionType, StoreScope, StoreStorage } from './action-types.js'

/**
 * Store configuration
 */
export interface StoreConfig<T = any> {
  scope: StoreScope
  storage: StoreStorage
  initialValue?: T
}

/**
 * Type-safe Store API for managing scenario data
 */
export class Store<T = any> {
  constructor(public readonly config: StoreConfig<T>) {}

  /**
   * Identifier is scope + storage
   */
  get identifier(): string {
    return `${this.config.scope}.${this.config.storage}`
  }

  /**
   * Set a value at the specified keyPath
   */
  set(keyPath: string, value: any): StoreAction
  set<K extends keyof T>(keyPath: K, value: T[K]): StoreAction
  set(keyPath: string | keyof T, value: any): StoreAction {
    const keyPathStr = String(keyPath)
    const actionId = `${this.identifier}_set_${keyPathStr.replace(/\./g, '_')}`
    return new StoreAction(actionId, ActionType.StoreSet, this.config.scope, this.config.storage, keyPathStr, value)
  }

  /**
   * Get a value at the specified keyPath (runtime only - not transpiled)
   */
  get(keyPath: string): any
  get<K extends keyof T>(keyPath: K): T[K] | undefined
  get(keyPath: string | keyof T): any {
    // Runtime helper - not transpiled
    throw new Error('Store.get() is only available at runtime in iOS SDK')
  }

  /**
   * Remove a value at the specified keyPath
   */
  remove(keyPath: string): StoreAction
  remove<K extends keyof T>(keyPath: K): StoreAction
  remove(keyPath: string | keyof T): StoreAction {
    const keyPathStr = String(keyPath)
    const actionId = `${this.identifier}_remove_${keyPathStr.replace(/\./g, '_')}`
    return new StoreAction(actionId, ActionType.StoreRemove, this.config.scope, this.config.storage, keyPathStr)
  }

  /**
   * Merge an object at the specified keyPath
   */
  merge(keyPath: string, value: Record<string, any>): StoreAction
  merge<K extends keyof T>(keyPath: K, value: Partial<T[K]>): StoreAction
  merge(keyPath: string | keyof T, value: any): StoreAction {
    const keyPathStr = String(keyPath)
    const actionId = `${this.identifier}_merge_${keyPathStr.replace(/\./g, '_')}`
    return new StoreAction(actionId, ActionType.StoreMerge, this.config.scope, this.config.storage, keyPathStr, value)
  }

  /**
   * Execute multiple mutations as a single transaction
   */
  transaction(block: (store: Store<T>) => void): StoreAction {
    const transactionId = `${this.identifier}_transaction_${Date.now()}`

    // Create temporary context to collect nested actions
    const nestedActions: StoreAction[] = []
    const proxy = new Proxy(this, {
      get: (target, prop) => {
        if (prop === 'set' || prop === 'remove' || prop === 'merge') {
          return (...args: any[]) => {
            const action = (target[prop as keyof Store<T>] as any)(...args) as StoreAction
            nestedActions.push(action)
            return action
          }
        }
        return target[prop as keyof Store<T>]
      },
    })

    block(proxy)

    return new StoreAction(
      transactionId,
      ActionType.StoreTransaction,
      this.config.scope,
      this.config.storage,
      '',
      undefined,
      nestedActions,
    )
  }
}

/**
 * Factory function to create a type-safe store
 */
export function store<T = any>(config: StoreConfig<T>): Store<T> {
  const instance = new Store<T>(config)

  // Register store in action context for transpiler
  ActionContext.registerStore(instance)

  return instance
}
