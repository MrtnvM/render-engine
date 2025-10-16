import type { File } from '@babel/types'
import { traverse } from '../traverse.js'
import type { TranspilerConfig } from '../types.js'
import type { StoreDescriptor, StoreValueDescriptor } from '../../runtime/action-types.js'

/**
 * Collect store() declarations and track store variable mappings
 */
export function collectStores(
  ast: File,
  config?: TranspilerConfig,
): {
  stores: Map<string, StoreDescriptor>
  storeVarToConfig: Map<string, { scope: string; storage: string }>
} {
  const stores: Map<string, StoreDescriptor> = new Map()
  const storeVarToConfig: Map<string, { scope: string; storage: string }> = new Map()

  traverse(ast, {
    // Detect: const myStore = store<Type>({ ... })
    VariableDeclarator(path: any) {
      const init = path.node.init
      if (init?.type === 'CallExpression' && init.callee?.type === 'Identifier' && init.callee.name === 'store') {
        const storeVarName = path.node.id?.name
        if (!storeVarName) return

        const configArg = init.arguments[0]
        if (configArg?.type === 'ObjectExpression') {
          try {
            const storeDescriptor = parseStoreConfig(configArg)
            const key = `${storeDescriptor.scope}.${storeDescriptor.storage}`
            stores.set(key, storeDescriptor)

            // Track variable name → (scope, storage) mapping
            storeVarToConfig.set(storeVarName, {
              scope: storeDescriptor.scope,
              storage: storeDescriptor.storage,
            })
          } catch (error) {
            console.warn('Failed to parse store config:', error)
          }
        }
      }
    },
  } as any)

  return { stores, storeVarToConfig }
}

/**
 * Parse store configuration from ObjectExpression AST node
 */
function parseStoreConfig(node: any): StoreDescriptor {
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

/**
 * Convert AST ObjectExpression to StoreValueDescriptor format
 */
function parseObjectToStoreValue(node: any): Record<string, StoreValueDescriptor> {
  const result: Record<string, StoreValueDescriptor> = {}

  for (const prop of node.properties || []) {
    if (prop.type === 'ObjectProperty') {
      let key: string
      if (prop.key.type === 'Identifier') {
        key = prop.key.name
      } else if (prop.key.type === 'StringLiteral') {
        key = prop.key.value
      } else {
        continue
      }

      result[key] = serializeValue(prop.value)
    }
  }

  return result
}

/**
 * Serialize AST node to StoreValueDescriptor
 */
function serializeValue(node: any): StoreValueDescriptor {
  if (!node) return { type: 'null' }

  switch (node.type) {
    case 'StringLiteral':
      return { type: 'string', value: node.value }

    case 'NumericLiteral':
      return Number.isInteger(node.value)
        ? { type: 'integer', value: node.value }
        : { type: 'number', value: node.value }

    case 'BooleanLiteral':
      return { type: 'bool', value: node.value }

    case 'NullLiteral':
      return { type: 'null' }

    case 'ArrayExpression':
      return {
        type: 'array',
        value: (node.elements || []).map((el: any) => {
          if (!el || el.type === 'SpreadElement') return { type: 'null' }
          return serializeValue(el)
        }),
      }

    case 'ObjectExpression':
      const obj: Record<string, StoreValueDescriptor> = {}
      for (const prop of node.properties || []) {
        if (prop.type === 'ObjectProperty') {
          if (prop.key?.type === 'Identifier') {
            obj[prop.key.name] = serializeValue(prop.value)
          }
        }
      }
      return { type: 'object', value: obj }

    default:
      console.warn(`Unsupported value type in store config: ${node.type}`)
      return { type: 'null' }
  }
}
