import type { File } from '@babel/types'
import type { Visitor } from '@babel/traverse'
import type { TranspilerConfig } from '../types.js'
import type { StoreDescriptor, StoreValueDescriptor } from '../../runtime/action-types.js'
import { TranspilerPlugin } from './base-plugin.js'
import { parseObjectToStoreValue } from './serialization-utils.js'

export interface StoreCollectorResult {
  stores: Map<string, StoreDescriptor>
  storeVarToConfig: Map<string, { scope: string; storage: string }>
}

/**
 * Plugin to collect store() declarations and track store variable mappings.
 *
 * Detects pattern: `const myStore = store<Type>({ scope, storage, initialValue })`
 */
export class StoreCollectorPlugin extends TranspilerPlugin<StoreCollectorResult> {
  private stores: Map<string, StoreDescriptor> = new Map()
  private storeVarToConfig: Map<string, { scope: string; storage: string }> = new Map()

  constructor(config?: TranspilerConfig) {
    super(config)
  }

  protected getVisitors(): Visitor {
    return {
      // Detect: const myStore = store<Type>({ ... })
      VariableDeclarator: (path: any) => {
        const init = path.node.init
        if (init?.type === 'CallExpression' && init.callee?.type === 'Identifier' && init.callee.name === 'store') {
          const storeVarName = path.node.id?.name
          if (!storeVarName) return

          const configArg = init.arguments[0]
          if (configArg?.type === 'ObjectExpression') {
            try {
              const storeDescriptor = this.parseStoreConfig(configArg)
              const key = `${storeDescriptor.scope}.${storeDescriptor.storage}`
              this.stores.set(key, storeDescriptor)

              // Track variable name → (scope, storage) mapping
              this.storeVarToConfig.set(storeVarName, {
                scope: storeDescriptor.scope,
                storage: storeDescriptor.storage,
              })
            } catch (error) {
              console.warn('Failed to parse store config:', error)
            }
          }
        }
      },
    }
  }

  protected afterTraverse(ast: File, state: any): StoreCollectorResult {
    return {
      stores: this.stores,
      storeVarToConfig: this.storeVarToConfig,
    }
  }

  /**
   * Parse store configuration from ObjectExpression AST node
   */
  private parseStoreConfig(node: any): StoreDescriptor {
    const props: Record<string, any> = {}

    for (const prop of node.properties || []) {
      if (prop.type === 'ObjectProperty') {
        const key = prop.key?.name
        if (!key) continue

        const value = prop.value

        if (value.type === 'MemberExpression') {
          // StoreScope.App → 'app', StoreStorage.Memory → 'memory'
          const property = value.property
          if (property?.type === 'Identifier') {
            props[key] = property.name.toLowerCase()
          }
        } else if (value.type === 'ObjectExpression') {
          // initialValue object
          props[key] = parseObjectToStoreValue(value)
        }
      }
    }

    return {
      scope: props.scope || 'scenario',
      storage: props.storage || 'memory',
      initialValue: props.initialValue,
    }
  }
}
