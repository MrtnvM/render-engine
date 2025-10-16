import { ActionContext, Action } from './action-context'
import { ActionType, StoreScope, StoreStorage } from './action-types'

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
  set(keyPath: string, value: any): Action
  set<K extends keyof T>(keyPath: K, value: T[K]): Action
  set(keyPath: string | keyof T, value: any): Action {
    const keyPathStr = String(keyPath)
    const actionId = `${this.identifier}_set_${keyPathStr.replace(/\./g, '_')}`
    return new Action(
      actionId,
      ActionType.StoreSet,
      this.config.scope,
      this.config.storage,
      keyPathStr,
      value
    )
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
  remove(keyPath: string): Action
  remove<K extends keyof T>(keyPath: K): Action
  remove(keyPath: string | keyof T): Action {
    const keyPathStr = String(keyPath)
    const actionId = `${this.identifier}_remove_${keyPathStr.replace(/\./g, '_')}`
    return new Action(
      actionId,
      ActionType.StoreRemove,
      this.config.scope,
      this.config.storage,
      keyPathStr
    )
  }

  /**
   * Merge an object at the specified keyPath
   */
  merge(keyPath: string, value: Record<string, any>): Action
  merge<K extends keyof T>(keyPath: K, value: Partial<T[K]>): Action
  merge(keyPath: string | keyof T, value: any): Action {
    const keyPathStr = String(keyPath)
    const actionId = `${this.identifier}_merge_${keyPathStr.replace(/\./g, '_')}`
    return new Action(
      actionId,
      ActionType.StoreMerge,
      this.config.scope,
      this.config.storage,
      keyPathStr,
      value
    )
  }

  /**
   * Execute multiple mutations as a single transaction
   */
  transaction(block: (store: Store<T>) => void): Action {
    const transactionId = `${this.identifier}_transaction_${Date.now()}`

    // Create temporary context to collect nested actions
    const nestedActions: Action[] = []
    const proxy = new Proxy(this, {
      get: (target, prop) => {
        if (prop === 'set' || prop === 'remove' || prop === 'merge') {
          return (...args: any[]) => {
            const action = (target[prop as keyof Store<T>] as any)(...args) as Action
            nestedActions.push(action)
            return action
          }
        }
        return target[prop as keyof Store<T>]
      }
    })

    block(proxy)

    return new Action(
      transactionId,
      ActionType.StoreTransaction,
      this.config.scope,
      this.config.storage,
      '',
      undefined,
      nestedActions
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
