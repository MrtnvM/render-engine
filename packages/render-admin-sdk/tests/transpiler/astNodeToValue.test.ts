import { describe, it, expect } from 'vitest'
import { astNodeToValue } from '../../src/transpiler/babel-plugin-jsx-to-json'
import type { ASTNode } from '../../src/transpiler/types'

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
