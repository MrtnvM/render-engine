/**
 * ValueConverter class for converting Babel AST nodes to JavaScript values.
 * Handles literals, objects, identifiers, and component props.
 */

import type {
  ASTNode,
  ConversionContext,
  Primitive,
  PropReference,
  ConvertedValue,
  LiteralNode,
  ObjectExpression,
  ObjectProperty,
  Identifier,
} from '../types.js'
import {
  isLiteralNode,
  isObjectExpression,
  isIdentifier,
  isJSXExpressionContainer,
  isStringLiteral,
  isObjectProperty,
} from './type-guards.js'
import { ConversionError } from '../errors.js'

/**
 * Converts Babel AST nodes to JavaScript values.
 * Handles literals, objects, identifiers, and component props.
 */
export class ValueConverter {
  /**
   * Convert an AST node to a JavaScript value
   * @throws {ConversionError} if node type is unsupported in strict mode
   */
  convert(node: ASTNode | null | undefined, context: ConversionContext): ConvertedValue {
    if (!node) {
      return null
    }

    // Use type guards for type-safe processing
    if (isLiteralNode(node)) {
      return this.convertLiteral(node)
    }

    if (isObjectExpression(node)) {
      return this.convertObjectExpression(node, context)
    }

    if (isIdentifier(node)) {
      return this.convertIdentifier(node, context)
    }

    if (isJSXExpressionContainer(node)) {
      return this.convert(node.expression as ASTNode, context)
    }

    // Handle unsupported types
    if (context.strictMode) {
      throw new ConversionError(`Unsupported AST node type: ${node.type}`, {
        nodeType: node.type,
      })
    }

    return null
  }

  /**
   * Convert literal nodes (string, number, boolean, null)
   */
  private convertLiteral(node: LiteralNode): Primitive {
    switch (node.type) {
      case 'StringLiteral':
        return node.value
      case 'NumericLiteral':
        return node.value
      case 'BooleanLiteral':
        return node.value
      case 'NullLiteral':
        return null
      default:
        // TypeScript ensures this is unreachable with proper types
        const _exhaustive: never = node
        return null
    }
  }

  /**
   * Convert object expression to JavaScript object
   */
  private convertObjectExpression(node: ObjectExpression, context: ConversionContext): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    for (const prop of node.properties) {
      if (isObjectProperty(prop)) {
        const key = this.extractPropertyKey(prop)
        const value = this.convert(prop.value as ASTNode, context)
        result[key] = value
      }
    }

    return result
  }

  /**
   * Extract key from object property
   */
  private extractPropertyKey(prop: ObjectProperty): string {
    const key = prop.key as ASTNode

    if (isIdentifier(key)) {
      return key.name || 'unknown'
    }

    if (isStringLiteral(key)) {
      return key.value
    }

    // Fallback for computed properties or other key types
    if (key.value !== undefined) {
      return String(key.value)
    }

    // Last resort fallback
    return 'unknown'
  }

  /**
   * Convert identifier to prop reference or null
   */
  private convertIdentifier(node: Identifier, context: ConversionContext): PropReference | null {
    // Check if this identifier refers to a component prop
    if (context.componentProps.has(node.name)) {
      return {
        type: 'prop',
        key: node.name,
      }
    }

    // Unknown identifier in strict mode
    if (context.strictMode) {
      throw new ConversionError(`Unknown identifier: ${node.name}`, {
        identifier: node.name,
        availableProps: Array.from(context.componentProps),
      })
    }

    return null
  }
}

/**
 * Create a default conversion context
 */
export function createConversionContext(overrides?: Partial<ConversionContext>): ConversionContext {
  return {
    componentProps: new Set(),
    strictMode: false,
    ...overrides,
  }
}