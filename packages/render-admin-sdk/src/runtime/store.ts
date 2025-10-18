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
 * Store configuration
 */
export interface StoreConfig<T = any> {
  scope: StoreScope
  storage: StoreStorage
  initialValue?: T
}

/**
 * Type-safe Store API for managing scenario data
 *
 * Note: This Store API is used in the Admin SDK runtime DSL for type-safe operations.
 * The transpiler analyzes calls to these methods and converts them to declarative actions.
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
   * @transpiled This method is analyzed by the transpiler and converted to StoreSetAction
   */
  set(keyPath: string, value: any): void
  set<K extends keyof T>(keyPath: K, value: T[K]): void
  set(keyPath: string | keyof T, value: any): void {
    // This method is only for type safety in the DSL
    // The transpiler converts this to a StoreSetAction
    throw new Error('Store.set() is transpiled and should not be called at runtime')
  }

  /**
   * Get a value at the specified keyPath
   * @transpiled This method is analyzed by the transpiler and converted to StoreValueRef
   */
  get(keyPath: string): any
  get<K extends keyof T>(keyPath: K): T[K] | undefined
  get(keyPath: string | keyof T): any {
    // This method is only for type safety in the DSL
    // The transpiler converts this to a StoreValueRef descriptor
    throw new Error('Store.get() is transpiled and should not be called at runtime')
  }

  /**
   * Remove a value at the specified keyPath
   * @transpiled This method is analyzed by the transpiler and converted to StoreRemoveAction
   */
  remove(keyPath: string): void
  remove<K extends keyof T>(keyPath: K): void
  remove(keyPath: string | keyof T): void {
    // This method is only for type safety in the DSL
    // The transpiler converts this to a StoreRemoveAction
    throw new Error('Store.remove() is transpiled and should not be called at runtime')
  }

  /**
   * Merge an object at the specified keyPath
   * @transpiled This method is analyzed by the transpiler and converted to StoreMergeAction
   */
  merge(keyPath: string, value: Record<string, any>): void
  merge<K extends keyof T>(keyPath: K, value: Partial<T[K]>): void
  merge(keyPath: string | keyof T, value: any): void {
    // This method is only for type safety in the DSL
    // The transpiler converts this to a StoreMergeAction
    throw new Error('Store.merge() is transpiled and should not be called at runtime')
  }

  /**
   * Execute multiple mutations as a single transaction
   * @transpiled This method is analyzed by the transpiler and converted to StoreTransactionAction
   */
  transaction(block: (store: Store<T>) => void): void {
    // This method is only for type safety in the DSL
    // The transpiler converts this to a StoreTransactionAction
    throw new Error('Store.transaction() is transpiled and should not be called at runtime')
  }
}

/**
 * Factory function to create a type-safe store
 *
 * @example
 * const userStore = store<{ name: string, age: number }>({
 *   scope: StoreScope.Scenario,
 *   storage: StoreStorage.Memory,
 *   initialValue: { name: '', age: 0 }
 * })
 */
export function store<T = any>(config: StoreConfig<T>): Store<T> {
  return new Store<T>(config)
}
