/**
 * Unit tests for ValueConverter class
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ValueConverter } from '@/sdk/transpiler/ast/value-converter.js'
import { ConversionError } from '@/sdk/transpiler/errors.js'
import { createTestConversionContext } from '../test-utils.js'
import type { ConversionContext, ASTNode } from '@/sdk/transpiler/types.js'

describe('ValueConverter', () => {
  let converter: ValueConverter
  let context: ConversionContext

  beforeEach(() => {
    converter = new ValueConverter()
    context = createTestConversionContext()
  })

  describe('convert()', () => {
    it('should return null for null input', () => {
      expect(converter.convert(null, context)).toBe(null)
    })

    it('should return null for undefined input', () => {
      expect(converter.convert(undefined, context)).toBe(null)
    })
  })

  describe('literal conversion', () => {
    it('should convert string literal', () => {
      const node: ASTNode = { type: 'StringLiteral', value: 'hello world' }
      expect(converter.convert(node, context)).toBe('hello world')
    })

    it('should convert numeric literal', () => {
      const node: ASTNode = { type: 'NumericLiteral', value: 42 }
      expect(converter.convert(node, context)).toBe(42)
    })

    it('should convert boolean literal (true)', () => {
      const node: ASTNode = { type: 'BooleanLiteral', value: true }
      expect(converter.convert(node, context)).toBe(true)
    })

    it('should convert boolean literal (false)', () => {
      const node: ASTNode = { type: 'BooleanLiteral', value: false }
      expect(converter.convert(node, context)).toBe(false)
    })

    it('should convert null literal', () => {
      const node: ASTNode = { type: 'NullLiteral' }
      expect(converter.convert(node, context)).toBe(null)
    })

    it('should handle empty string literal', () => {
      const node: ASTNode = { type: 'StringLiteral', value: '' }
      expect(converter.convert(node, context)).toBe('')
    })

    it('should handle zero numeric literal', () => {
      const node: ASTNode = { type: 'NumericLiteral', value: 0 }
      expect(converter.convert(node, context)).toBe(0)
    })

    it('should handle negative numeric literal', () => {
      const node: ASTNode = { type: 'NumericLiteral', value: -123.45 }
      expect(converter.convert(node, context)).toBe(-123.45)
    })
  })

  describe('object expression conversion', () => {
    it('should convert simple object expression', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'color' },
            value: { type: 'StringLiteral', value: 'red' },
          },
          {
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'fontSize' },
            value: { type: 'NumericLiteral', value: 16 },
          },
        ],
      }

      const result = converter.convert(node, context)
      expect(result).toEqual({
        color: 'red',
        fontSize: 16,
      })
    })

    it('should convert object with string literal keys', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'ObjectProperty',
            key: { type: 'StringLiteral', value: 'background-color' },
            value: { type: 'StringLiteral', value: 'blue' },
          },
        ],
      }

      const result = converter.convert(node, context)
      expect(result).toEqual({
        'background-color': 'blue',
      })
    })

    it('should convert nested object expressions', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'style' },
            value: {
              type: 'ObjectExpression',
              properties: [
                {
                  type: 'ObjectProperty',
                  key: { type: 'Identifier', name: 'color' },
                  value: { type: 'StringLiteral', value: 'white' },
                },
                {
                  type: 'ObjectProperty',
                  key: { type: 'Identifier', name: 'margin' },
                  value: { type: 'NumericLiteral', value: 8 },
                },
              ],
            },
          },
        ],
      }

      const result = converter.convert(node, context)
      expect(result).toEqual({
        style: {
          color: 'white',
          margin: 8,
        },
      })
    })

    it('should convert empty object expression', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [],
      }

      const result = converter.convert(node, context)
      expect(result).toEqual({})
    })

    it('should handle object with mixed value types', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'text' },
            value: { type: 'StringLiteral', value: 'Hello' },
          },
          {
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'count' },
            value: { type: 'NumericLiteral', value: 5 },
          },
          {
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'enabled' },
            value: { type: 'BooleanLiteral', value: true },
          },
          {
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'data' },
            value: { type: 'NullLiteral' },
          },
        ],
      }

      const result = converter.convert(node, context)
      expect(result).toEqual({
        text: 'Hello',
        count: 5,
        enabled: true,
        data: null,
      })
    })
  })

  describe('identifier conversion', () => {
    it('should convert component prop to prop reference', () => {
      const contextWithProps = createTestConversionContext({
        componentProps: new Set(['title', 'subtitle']),
      })
      const node: ASTNode = { type: 'Identifier', name: 'title' }

      const result = converter.convert(node, contextWithProps)
      expect(result).toEqual({
        type: 'prop',
        key: 'title',
      })
    })

    it('should return null for unknown identifier in non-strict mode', () => {
      const node: ASTNode = { type: 'Identifier', name: 'unknownVariable' }

      const result = converter.convert(node, context)
      expect(result).toBe(null)
    })

    it('should throw error for unknown identifier in strict mode', () => {
      const strictContext = createTestConversionContext({
        componentProps: new Set(['title']),
        strictMode: true,
      })
      const node: ASTNode = { type: 'Identifier', name: 'unknownVariable' }

      expect(() => converter.convert(node, strictContext)).toThrow(ConversionError)
      expect(() => converter.convert(node, strictContext)).toThrow('Unknown identifier: unknownVariable')
    })

    it('should provide helpful context in strict mode error', () => {
      const strictContext = createTestConversionContext({
        componentProps: new Set(['title', 'subtitle', 'description']),
        strictMode: true,
      })
      const node: ASTNode = { type: 'Identifier', name: 'unknownProp' }

      try {
        converter.convert(node, strictContext)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(ConversionError)
        const conversionError = error as ConversionError
        expect(conversionError.context?.availableProps).toEqual(['title', 'subtitle', 'description'])
      }
    })
  })

  describe('JSX expression container conversion', () => {
    it('should convert JSX expression container', () => {
      const node: ASTNode = {
        type: 'JSXExpressionContainer',
        expression: { type: 'StringLiteral', value: 'dynamic content' },
      }

      const result = converter.convert(node, context)
      expect(result).toBe('dynamic content')
    })

    it('should convert nested JSX expression container', () => {
      const node: ASTNode = {
        type: 'JSXExpressionContainer',
        expression: {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'ObjectProperty',
              key: { type: 'Identifier', name: 'color' },
              value: { type: 'StringLiteral', value: 'green' },
            },
          ],
        },
      }

      const result = converter.convert(node, context)
      expect(result).toEqual({ color: 'green' })
    })
  })

  describe('unsupported types', () => {
    it('should return null for unsupported type in non-strict mode', () => {
      const node: ASTNode = { type: 'UnsupportedType' }

      const result = converter.convert(node, context)
      expect(result).toBe(null)
    })

    it('should throw error for unsupported type in strict mode', () => {
      const strictContext = createTestConversionContext({ strictMode: true })
      const node: ASTNode = { type: 'UnsupportedType' }

      expect(() => converter.convert(node, strictContext)).toThrow(ConversionError)
      expect(() => converter.convert(node, strictContext)).toThrow('Unsupported AST node type: UnsupportedType')
    })

    it('should include node type in error context', () => {
      const strictContext = createTestConversionContext({ strictMode: true })
      const node: ASTNode = { type: 'CustomType' }

      try {
        converter.convert(node, strictContext)
        expect.fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(ConversionError)
        const conversionError = error as ConversionError
        expect(conversionError.context?.nodeType).toBe('CustomType')
      }
    })
  })

  describe('edge cases', () => {
    it('should handle object property with unknown key type', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'ObjectProperty',
            key: { type: 'UnknownKeyType', value: 'fallback' },
            value: { type: 'StringLiteral', value: 'test' },
          },
        ],
      }

      const result = converter.convert(node, context)
      expect(result).toEqual({
        fallback: 'test',
      })
    })

    it('should handle object property with missing key name', () => {
      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'ObjectProperty',
            key: { type: 'Identifier' }, // Missing name
            value: { type: 'StringLiteral', value: 'test' },
          },
        ],
      }

      const result = converter.convert(node, context)
      expect(result).toEqual({
        unknown: 'test',
      })
    })

    it('should handle identifier without name', () => {
      const node: ASTNode = { type: 'Identifier' } // Missing name

      const result = converter.convert(node, context)
      expect(result).toBe(null)
    })

    it('should handle complex nested prop references', () => {
      const contextWithProps = createTestConversionContext({
        componentProps: new Set(['user', 'settings']),
      })

      const node: ASTNode = {
        type: 'ObjectExpression',
        properties: [
          {
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'userName' },
            value: { type: 'Identifier', name: 'user' },
          },
          {
            type: 'ObjectProperty',
            key: { type: 'Identifier', name: 'config' },
            value: { type: 'Identifier', name: 'settings' },
          },
        ],
      }

      const result = converter.convert(node, contextWithProps)
      expect(result).toEqual({
        userName: { type: 'prop', key: 'user' },
        config: { type: 'prop', key: 'settings' },
      })
    })
  })

  describe('performance and memory', () => {
    it('should handle large objects efficiently', () => {
      const properties = []
      for (let i = 0; i < 1000; i++) {
        properties.push({
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: `prop${i}` },
          value: { type: 'NumericLiteral', value: i },
        })
      }

      const node: ASTNode = {
        type: 'ObjectExpression',
        properties,
      }

      const startTime = Date.now()
      const result = converter.convert(node, context)
      const endTime = Date.now()

      expect(Object.keys(result as object)).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(100) // Should be fast
    })

    it('should handle deep nesting', () => {
      // Create deeply nested object (10 levels)
      let innerNode: ASTNode = { type: 'StringLiteral', value: 'deep value' }
      
      for (let i = 0; i < 10; i++) {
        innerNode = {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'ObjectProperty',
              key: { type: 'Identifier', name: `level${i}` },
              value: innerNode,
            },
          ],
        }
      }

      const result = converter.convert(innerNode, context)
      
      // Navigate to the deep value
      let current = result as any
      for (let i = 9; i >= 0; i--) {
        current = current[`level${i}`]
      }
      
      expect(current).toBe('deep value')
    })
  })
})