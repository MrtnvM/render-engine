import type { StoreValueDescriptor } from '../../runtime/action-types.js'

/**
 * Serialize an AST node to StoreValueDescriptor format.
 * This is used by store-collector and action-collector plugins.
 *
 * @param node The AST node to serialize
 * @returns The serialized value descriptor
 */
export function serializeValue(node: any): StoreValueDescriptor {
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
      console.warn(`Unsupported value type in serialization: ${node.type}`)
      return { type: 'null' }
  }
}

/**
 * Extract string value from AST node.
 * Supports StringLiteral and simple TemplateLiteral nodes.
 *
 * @param node The AST node to extract string from
 * @returns The extracted string value
 * @throws Error if the node is not a valid string literal
 */
export function extractStringValue(node: any): string {
  if (!node) throw new Error('String value is required')

  if (node.type === 'StringLiteral') {
    return node.value
  }

  if (node.type === 'TemplateLiteral') {
    // Handle simple template strings
    if (node.quasis && node.quasis.length === 1) {
      return node.quasis[0].value.raw
    }
  }

  throw new Error('Value must be a string literal')
}

/**
 * Convert AST ObjectExpression to StoreValueDescriptor format.
 * This is used by store-collector plugin to parse initialValue objects.
 *
 * @param node The ObjectExpression AST node
 * @returns Record mapping keys to their serialized values
 */
export function parseObjectToStoreValue(node: any): Record<string, StoreValueDescriptor> {
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
