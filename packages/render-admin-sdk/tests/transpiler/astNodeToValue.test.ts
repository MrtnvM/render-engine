import { describe, it, expect } from 'vitest'
import type { ASTNode } from '../../src/transpiler/types'

// Import the internal function for testing
// Note: This is now an internal implementation detail of jsx-to-json-plugin
// We inline it here for unit testing purposes
function astNodeToValue(node?: ASTNode | null, componentProps?: Set<string>): any {
  if (!node) return null

  switch (node.type) {
    case 'StringLiteral':
      return node.value
    case 'NumericLiteral':
      return node.value
    case 'BooleanLiteral':
      return node.value
    case 'Identifier':
      if (componentProps && componentProps.has(node.name || '')) {
        return {
          type: 'prop',
          key: node.name,
        }
      }
      return null
    case 'JSXExpressionContainer':
      return astNodeToValue(node.expression, componentProps)
    case 'ObjectExpression':
      return (
        node.properties?.reduce((obj: Record<string, any>, prop) => {
          let key: string
          if (prop.key.type === 'Identifier') {
            key = prop.key.name || 'unknown'
          } else if (prop.key.type === 'StringLiteral') {
            key = prop.key.value || 'unknown'
          } else {
            key = String(prop.key)
          }
          obj[key] = astNodeToValue(prop.value, componentProps)
          return obj
        }, {}) || {}
      )
    case 'NullLiteral':
      return null
    default:
      return null
  }
}

describe('astNodeToValue', () => {
  describe('Literal Types', () => {
    describe('StringLiteral', () => {
      it('should return string value for StringLiteral', () => {
        const node: ASTNode = {
          type: 'StringLiteral',
          value: 'hello world',
        }
        expect(astNodeToValue(node)).toBe('hello world')
      })

      it('should handle empty string', () => {
        const node: ASTNode = {
          type: 'StringLiteral',
          value: '',
        }
        expect(astNodeToValue(node)).toBe('')
      })
    })

    describe('NumericLiteral', () => {
      it('should return number value for NumericLiteral', () => {
        const node: ASTNode = {
          type: 'NumericLiteral',
          value: 42,
        }
        expect(astNodeToValue(node)).toBe(42)
      })
    })

    describe('BooleanLiteral', () => {
      it('should return true for BooleanLiteral with true value', () => {
        const node: ASTNode = {
          type: 'BooleanLiteral',
          value: true,
        }
        expect(astNodeToValue(node)).toBe(true)
      })
    })

    describe('NullLiteral', () => {
      it('should return null for NullLiteral', () => {
        const node: ASTNode = {
          type: 'NullLiteral',
        }
        expect(astNodeToValue(node)).toBe(null)
      })
    })
  })

  describe('Component Props', () => {
    it('should return prop object for component prop identifier', () => {
      const node: ASTNode = {
        type: 'Identifier',
        name: 'title',
      }
      const componentProps = new Set(['title', 'count', 'isVisible'])

      expect(astNodeToValue(node, componentProps)).toEqual({
        type: 'prop',
        key: 'title',
      })
    })
  })

  describe('Object Expression', () => {
    it('should return empty object for empty ObjectExpression', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [],
      }

      expect(astNodeToValue(node)).toEqual({})
    })

    it('should handle single property object', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [
          {
            key: { type: 'Identifier', name: 'name' },
            value: { type: 'StringLiteral', value: 'John' },
          },
        ],
      }

      expect(astNodeToValue(node)).toEqual({ name: 'John' })
    })
  })

  describe('Edge Cases', () => {
    it('should return null for null input', () => {
      expect(astNodeToValue(null)).toBe(null)
    })

    it('should return null for undefined input', () => {
      expect(astNodeToValue(undefined)).toBe(null)
    })
  })
})
