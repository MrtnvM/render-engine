import type { ActionDescriptor, ActionType, StoreValueDescriptor } from '../runtime/action-types'

/**
 * Babel plugin to collect store method calls and convert them to actions
 */
export default function actionCollectorPlugin(storeVarToConfig: Map<string, { scope: string; storage: string }>) {
  const actions: Map<string, ActionDescriptor> = new Map()

  const plugin = {
    visitor: {
      // Detect: myStore.set('key', value), myStore.transaction(...)
      CallExpression(path: any) {
        const callee = path.node.callee

        if (callee?.type === 'MemberExpression') {
          const object = callee.object
          const property = callee.property

          if (
            object?.type === 'Identifier' &&
            property?.type === 'Identifier' &&
            storeVarToConfig.has(object.name)
          ) {
            const storeConfig = storeVarToConfig.get(object.name)!
            const methodName = property.name

            if (['set', 'remove', 'merge', 'transaction'].includes(methodName)) {
              try {
                const action = parseStoreAction(
                  storeConfig.scope,
                  storeConfig.storage,
                  methodName,
                  path.node.arguments
                )
                actions.set(action.id, action)
              } catch (error) {
                console.warn(`Failed to parse action ${methodName}:`, error)
              }
            }
          }
        }
      }
    }
  }

  return { plugin, actions }
}

/**
 * Parse store action from method call arguments
 */
function parseStoreAction(
  scope: string,
  storage: string,
  method: string,
  args: any[]
): ActionDescriptor {
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
    actions: nestedActions
  }
}

/**
 * Extract string value from AST node
 */
function extractStringValue(node: any): string {
  if (!node) throw new Error('KeyPath is required')

  if (node.type === 'StringLiteral') {
    return node.value
  }

  if (node.type === 'TemplateLiteral') {
    // Handle simple template strings
    if (node.quasis && node.quasis.length === 1) {
      return node.quasis[0].value.raw
    }
  }

  throw new Error('KeyPath must be a string literal')
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
        })
      }

    case 'ObjectExpression':
      const obj: Record<string, StoreValueDescriptor> = {}
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
          obj[key] = serializeValue(prop.value)
        }
      }
      return { type: 'object', value: obj }

    case 'Identifier':
      // For identifiers, we can't statically resolve the value
      // This would need runtime evaluation or more complex analysis
      console.warn(`Cannot serialize identifier: ${node.name}`)
      return { type: 'null' }

    default:
      console.warn(`Unsupported value type in action: ${node.type}`)
      return { type: 'null' }
  }
}
