import type { Store } from './store.js'
import type { ActionDescriptor, ActionType, StoreDescriptor, StoreScope, StoreStorage, StoreValueDescriptor } from './action-types.js'

/**
 * Global context to collect stores and actions during component rendering
 */
export class ActionContext {
  private static stores: Map<string, Store<any>> = new Map()
  private static actions: Map<string, ActionDescriptor> = new Map()

  static registerStore(store: Store<any>): void {
    this.stores.set(store.identifier, store)
  }

  static registerAction(action: Action): void {
    this.actions.set(action.id, action.toDescriptor())
  }

  static getStores(): StoreDescriptor[] {
    return Array.from(this.stores.values()).map(s => ({
      scope: s.config.scope,
      storage: s.config.storage,
      initialValue: s.config.initialValue
    }))
  }

  static getActions(): ActionDescriptor[] {
    return Array.from(this.actions.values())
  }

  static reset(): void {
    this.stores.clear()
    this.actions.clear()
  }
}

/**
 * Action instance that can be converted to ActionDescriptor
 */
export class Action {
  constructor(
    public readonly id: string,
    public readonly type: ActionType,
    public readonly scope: StoreScope,
    public readonly storage: StoreStorage,
    public readonly keyPath: string,
    public readonly value?: any,
    public readonly actions?: Action[]
  ) {
    // Register action in context
    ActionContext.registerAction(this)
  }

  toDescriptor(): ActionDescriptor {
    return {
      id: this.id,
      type: this.type,
      scope: this.scope,
      storage: this.storage,
      keyPath: this.keyPath,
      value: this.value !== undefined ? this.serializeValue(this.value) : undefined,
      actions: this.actions?.map(a => a.toDescriptor())
    }
  }

  private serializeValue(value: any): StoreValueDescriptor {
    if (value === null) return { type: 'null' }
    if (typeof value === 'string') return { type: 'string', value }
    if (typeof value === 'number') {
      return Number.isInteger(value)
        ? { type: 'integer', value }
        : { type: 'number', value }
    }
    if (typeof value === 'boolean') return { type: 'bool', value }
    if (Array.isArray(value)) {
      return {
        type: 'array',
        value: value.map(v => this.serializeValue(v))
      }
    }
    if (typeof value === 'object') {
      const obj: Record<string, StoreValueDescriptor> = {}
      for (const [k, v] of Object.entries(value)) {
        obj[k] = this.serializeValue(v)
      }
      return { type: 'object', value: obj }
    }
    throw new Error(`Unsupported value type: ${typeof value}`)
  }
}
