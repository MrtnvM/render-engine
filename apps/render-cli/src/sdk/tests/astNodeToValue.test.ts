import { describe, it, expect } from 'vitest'
import { astNodeToValue } from '../transpiler/babel-plugin-jsx-to-json'
import type { ASTNode } from '../transpiler/types'

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

      it('should handle string with special characters', () => {
        const node: ASTNode = {
          type: 'StringLiteral',
          value: 'hello\nworld',
        }
        expect(astNodeToValue(node)).toBe('hello\nworld')
      })

      it('should handle unicode strings', () => {
        const node: ASTNode = {
          type: 'StringLiteral',
          value: '🚀',
        }
        expect(astNodeToValue(node)).toBe('🚀')
      })

      it('should handle escaped characters', () => {
        const node: ASTNode = {
          type: 'StringLiteral',
          value: 'he said "hello"',
        }
        expect(astNodeToValue(node)).toBe('he said "hello"')
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

      it('should handle negative numbers', () => {
        const node: ASTNode = {
          type: 'NumericLiteral',
          value: -42,
        }
        expect(astNodeToValue(node)).toBe(-42)
      })

      it('should handle floating point numbers', () => {
        const node: ASTNode = {
          type: 'NumericLiteral',
          value: 3.14,
        }
        expect(astNodeToValue(node)).toBe(3.14)
      })

      it('should handle zero', () => {
        const node: ASTNode = {
          type: 'NumericLiteral',
          value: 0,
        }
        expect(astNodeToValue(node)).toBe(0)
      })

      it('should handle scientific notation', () => {
        const node: ASTNode = {
          type: 'NumericLiteral',
          value: 1e5,
        }
        expect(astNodeToValue(node)).toBe(1e5)
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

      it('should return false for BooleanLiteral with false value', () => {
        const node: ASTNode = {
          type: 'BooleanLiteral',
          value: false,
        }
        expect(astNodeToValue(node)).toBe(false)
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

  describe('Identifier Handling', () => {
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

      it('should return prop object for different component prop names', () => {
        const node: ASTNode = {
          type: 'Identifier',
          name: 'isVisible',
        }
        const componentProps = new Set(['title', 'count', 'isVisible'])

        expect(astNodeToValue(node, componentProps)).toEqual({
          type: 'prop',
          key: 'isVisible',
        })
      })

      it('should handle component props with empty name', () => {
        const node: ASTNode = {
          type: 'Identifier',
          name: '',
        }
        const componentProps = new Set([''])

        expect(astNodeToValue(node, componentProps)).toEqual({
          type: 'prop',
          key: '',
        })
      })
    })

    describe('Non-Component Props', () => {
      it('should return null for identifier not in componentProps', () => {
        const node: ASTNode = {
          type: 'Identifier',
          name: 'unknownVar',
        }
        const componentProps = new Set(['title', 'count'])

        expect(astNodeToValue(node, componentProps)).toBe(null)
      })

      it('should return null for identifier with undefined componentProps', () => {
        const node: ASTNode = {
          type: 'Identifier',
          name: 'someVar',
        }

        expect(astNodeToValue(node, undefined)).toBe(null)
      })

      it('should return null for identifier with empty componentProps set', () => {
        const node: ASTNode = {
          type: 'Identifier',
          name: 'someVar',
        }
        const componentProps = new Set<string>()

        expect(astNodeToValue(node, componentProps)).toBe(null)
      })
    })
  })

  describe('Expression Container', () => {
    it('should handle string literal inside JSXExpressionContainer', () => {
      const node: ASTNode = {
        type: 'JSXExpressionContainer',
        expression: {
          type: 'StringLiteral',
          value: 'hello',
        },
      }

      expect(astNodeToValue(node)).toBe('hello')
    })

    it('should handle number literal inside JSXExpressionContainer', () => {
      const node: ASTNode = {
        type: 'JSXExpressionContainer',
        expression: {
          type: 'NumericLiteral',
          value: 42,
        },
      }

      expect(astNodeToValue(node)).toBe(42)
    })

    it('should handle boolean inside JSXExpressionContainer', () => {
      const node: ASTNode = {
        type: 'JSXExpressionContainer',
        expression: {
          type: 'BooleanLiteral',
          value: true,
        },
      }

      expect(astNodeToValue(node)).toBe(true)
    })

    it('should handle identifier inside JSXExpressionContainer', () => {
      const node: ASTNode = {
        type: 'JSXExpressionContainer',
        expression: {
          type: 'Identifier',
          name: 'myVar',
        },
      }
      const componentProps = new Set(['myVar'])

      expect(astNodeToValue(node, componentProps)).toEqual({
        type: 'prop',
        key: 'myVar',
      })
    })

    it('should handle object inside JSXExpressionContainer', () => {
      const node: ASTNode = {
        type: 'JSXExpressionContainer',
        expression: {
          type: 'ObjectExpression',
          properties: [
            {
              key: { type: 'Identifier', name: 'key' },
              value: { type: 'StringLiteral', value: 'value' },
            },
          ],
        },
      }

      expect(astNodeToValue(node)).toEqual({ key: 'value' })
    })
  })

  describe('Object Expression', () => {
    describe('Simple Objects', () => {
      it('should return empty object for empty ObjectExpression', () => {
        const node: ASTNode = {
          type: 'ObjectExpression',
          properties: [],
        }

        expect(astNodeToValue(node)).toEqual({})
      })

      it('should return empty object for ObjectExpression with undefined properties', () => {
        const node: ASTNode = {
          type: 'ObjectExpression',
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

      it('should handle multiple properties object', () => {
        const node: ASTNode = {
          type: 'ObjectExpression',
          properties: [
            {
              key: { type: 'Identifier', name: 'name' },
              value: { type: 'StringLiteral', value: 'John' },
            },
            {
              key: { type: 'Identifier', name: 'age' },
              value: { type: 'NumericLiteral', value: 30 },
            },
          ],
        }

        expect(astNodeToValue(node)).toEqual({ name: 'John', age: 30 })
      })
    })

    describe('Key Types', () => {
      it('should handle Identifier keys', () => {
        const node: ASTNode = {
          type: 'ObjectExpression',
          properties: [
            {
              key: { type: 'Identifier', name: 'title' },
              value: { type: 'StringLiteral', value: 'Hello' },
            },
          ],
        }

        expect(astNodeToValue(node)).toEqual({ title: 'Hello' })
      })

      it('should handle StringLiteral keys', () => {
        const node: ASTNode = {
          type: 'ObjectExpression',
          properties: [
            {
              key: { type: 'StringLiteral', value: 'title' },
              value: { type: 'StringLiteral', value: 'Hello' },
            },
          ],
        }

        expect(astNodeToValue(node)).toEqual({ title: 'Hello' })
      })

      it('should handle mixed key types', () => {
        const node: ASTNode = {
          type: 'ObjectExpression',
          properties: [
            {
              key: { type: 'Identifier', name: 'name' },
              value: { type: 'StringLiteral', value: 'John' },
            },
            {
              key: { type: 'StringLiteral', value: 'age' },
              value: { type: 'NumericLiteral', value: 30 },
            },
          ],
        }

        expect(astNodeToValue(node)).toEqual({ name: 'John', age: 30 })
      })

      it('should handle keys with empty names', () => {
        const node: ASTNode = {
          type: 'ObjectExpression',
          properties: [
            {
              key: { type: 'Identifier', name: '' },
              value: { type: 'StringLiteral', value: 'empty' },
            },
          ],
        }

        expect(astNodeToValue(node)).toEqual({ unknown: 'empty' })
      })

      it('should handle keys with empty string values', () => {
        const node: ASTNode = {
          type: 'ObjectExpression',
          properties: [
            {
              key: { type: 'StringLiteral', value: '' },
              value: { type: 'StringLiteral', value: 'empty' },
            },
          ],
        }

        expect(astNodeToValue(node)).toEqual({ unknown: 'empty' })
      })

      it('should fallback to String() for unsupported key types', () => {
        const node: ASTNode = {
          type: 'ObjectExpression',
          properties: [
            {
              key: { type: 'NumericLiteral', value: 123 } as any,
              value: { type: 'StringLiteral', value: 'test' },
            },
          ],
        }

        expect(astNodeToValue(node)).toEqual({ '[object Object]': 'test' })
      })
    })

    describe('Nested Objects', () => {
      it('should handle objects within objects', () => {
        const node: ASTNode = {
          type: 'ObjectExpression',
          properties: [
            {
              key: { type: 'Identifier', name: 'user' },
              value: {
                type: 'ObjectExpression',
                properties: [
                  {
                    key: { type: 'Identifier', name: 'name' },
                    value: { type: 'StringLiteral', value: 'John' },
                  },
                ],
              },
            },
          ],
        }

        expect(astNodeToValue(node)).toEqual({ user: { name: 'John' } })
      })

      it('should handle complex nested structures', () => {
        const node: ASTNode = {
          type: 'ObjectExpression',
          properties: [
            {
              key: { type: 'Identifier', name: 'config' },
              value: {
                type: 'ObjectExpression',
                properties: [
                  {
                    key: { type: 'Identifier', name: 'theme' },
                    value: { type: 'StringLiteral', value: 'dark' },
                  },
                  {
                    key: { type: 'Identifier', name: 'settings' },
                    value: {
                      type: 'ObjectExpression',
                      properties: [
                        {
                          key: { type: 'Identifier', name: 'debug' },
                          value: { type: 'BooleanLiteral', value: true },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        }

        expect(astNodeToValue(node)).toEqual({
          config: {
            theme: 'dark',
            settings: {
              debug: true,
            },
          },
        })
      })
    })
  })

  describe('Edge Cases', () => {
    it('should return null for null input', () => {
      expect(astNodeToValue(null)).toBe(null)
    })

    it('should return null for undefined input', () => {
      expect(astNodeToValue(undefined)).toBe(null)
    })

    it('should return null for unsupported node types', () => {
      const node: ASTNode = {
        type: 'UnsupportedType' as any,
      }

      expect(astNodeToValue(node)).toBe(null)
    })

    it('should handle malformed objects with missing properties', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        // properties is undefined
      }

      expect(astNodeToValue(node)).toEqual({})
    })

    it('should handle properties with missing key', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [
          {
            key: {} as any, // missing type
            value: { type: 'StringLiteral', value: 'test' },
          },
        ],
      }

      expect(astNodeToValue(node)).toEqual({ '[object Object]': 'test' })
    })

    it('should handle properties with missing value', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [
          {
            key: { type: 'Identifier', name: 'test' },
            value: null as any,
          },
        ],
      }

      expect(astNodeToValue(node)).toEqual({ test: null })
    })
  })

  describe('Component Props Integration', () => {
    it('should handle objects with mixed component props and regular values', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [
          {
            key: { type: 'Identifier', name: 'title' },
            value: { type: 'StringLiteral', value: 'Hello' },
          },
          {
            key: { type: 'Identifier', name: 'isVisible' },
            value: { type: 'Identifier', name: 'isVisible' },
          },
        ],
      }
      const componentProps = new Set(['isVisible'])

      expect(astNodeToValue(node, componentProps)).toEqual({
        title: 'Hello',
        isVisible: { type: 'prop', key: 'isVisible' },
      })
    })

    it('should handle nested objects with component props', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [
          {
            key: { type: 'Identifier', name: 'config' },
            value: {
              type: 'ObjectExpression',
              properties: [
                {
                  key: { type: 'Identifier', name: 'enabled' },
                  value: { type: 'Identifier', name: 'enabled' },
                },
              ],
            },
          },
        ],
      }
      const componentProps = new Set(['enabled'])

      expect(astNodeToValue(node, componentProps)).toEqual({
        config: {
          enabled: { type: 'prop', key: 'enabled' },
        },
      })
    })
  })
})
