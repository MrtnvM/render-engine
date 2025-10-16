import type { File } from '@babel/types'
import type { Visitor } from '@babel/traverse'
import type { TranspilerConfig } from '../types.js'
import type { ActionDescriptor, ActionType, StoreValueDescriptor } from '../../runtime/action-types.js'
import { TranspilerPlugin } from './base-plugin.js'
import { serializeValue, extractStringValue } from './serialization-utils.js'

export interface ActionCollectorResult {
  actions: Map<string, ActionDescriptor>
}

/**
 * Plugin to collect store method calls and convert them to actions.
 *
 * Detects patterns:
 * - `myStore.set('key', value)`
 * - `myStore.remove('key')`
 * - `myStore.merge('key', value)`
 * - `myStore.transaction(...)`
 */
export class ActionCollectorPlugin extends TranspilerPlugin<ActionCollectorResult> {
  private actions: Map<string, ActionDescriptor> = new Map()
  private storeVarToConfig: Map<string, { scope: string; storage: string }>

  constructor(
    storeVarToConfig: Map<string, { scope: string; storage: string }>,
    config?: TranspilerConfig
  ) {
    super(config)
    this.storeVarToConfig = storeVarToConfig
  }

  protected getVisitors(): Visitor {
    return {
      // Detect: myStore.set('key', value), myStore.transaction(...)
      CallExpression: (path: any) => {
        const callee = path.node.callee

        if (callee?.type === 'MemberExpression') {
          const object = callee.object
          const property = callee.property

          if (object?.type === 'Identifier' && property?.type === 'Identifier' && this.storeVarToConfig.has(object.name)) {
            const storeConfig = this.storeVarToConfig.get(object.name)!
            const methodName = property.name

            if (['set', 'remove', 'merge', 'transaction'].includes(methodName)) {
              try {
                const action = this.parseStoreAction(storeConfig.scope, storeConfig.storage, methodName, path.node.arguments)
                this.actions.set(action.id, action)
              } catch (error) {
                console.warn(`Failed to parse action ${methodName}:`, error)
              }
            }
          }
        }
      },
    }
  }

  protected afterTraverse(ast: File, state: any): ActionCollectorResult {
    return { actions: this.actions }
  }

  /**
   * Parse store action from method call arguments
   */
  private parseStoreAction(scope: string, storage: string, method: string, args: any[]): ActionDescriptor {
    const identifier = `${scope}.${storage}`

    // Extract keyPath (first argument)
    const keyPathNode = args[0]
    const keyPath = extractStringValue(keyPathNode)

    // Extract value (second argument for set/merge)
    let value: StoreValueDescriptor | undefined
    if (method === 'set' || method === 'merge') {
      const valueNode = args[1]
      if (valueNode) {
        value = serializeValue(valueNode)
      }
    }

    // Handle transaction - collect nested actions
    let nestedActions: ActionDescriptor[] | undefined
    if (method === 'transaction') {
      // For transactions, we would need to analyze the callback function
      // This is complex and may require runtime execution or static analysis
      // For now, we'll leave this as undefined and handle it later
      nestedActions = []
    }

    return {
      id: `${identifier}_${method}_${keyPath.replace(/\./g, '_')}`,
      type: `store.${method}` as ActionType,
      scope: scope as any,
      storage: storage as any,
      keyPath,
      value,
      actions: nestedActions,
    }
  }
}
