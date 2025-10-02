/**
 * Type guards for AST node types
 * These provide type-safe checks for Babel AST nodes
 */

import type {
  ASTNode,
  JSXElement,
  JSXText,
  JSXExpressionContainer,
  StringLiteral,
  NumericLiteral,
  BooleanLiteral,
  NullLiteral,
  Identifier,
  ObjectExpression,
  LiteralNode,
  ObjectProperty,
} from '../types.js'

/**
 * Type guard for JSXElement nodes
 */
export function isJSXElement(node: any): node is JSXElement {
  return node && node.type === 'JSXElement'
}

/**
 * Type guard for JSXText nodes
 */
export function isJSXText(node: any): node is JSXText {
  return node && node.type === 'JSXText'
}

/**
 * Type guard for JSXExpressionContainer nodes
 */
export function isJSXExpressionContainer(node: any): node is JSXExpressionContainer {
  return node && node.type === 'JSXExpressionContainer'
}

/**
 * Type guard for StringLiteral nodes
 */
export function isStringLiteral(node: any): node is StringLiteral {
  return node && node.type === 'StringLiteral'
}

/**
 * Type guard for NumericLiteral nodes
 */
export function isNumericLiteral(node: any): node is NumericLiteral {
  return node && node.type === 'NumericLiteral'
}

/**
 * Type guard for BooleanLiteral nodes
 */
export function isBooleanLiteral(node: any): node is BooleanLiteral {
  return node && node.type === 'BooleanLiteral'
}

/**
 * Type guard for NullLiteral nodes
 */
export function isNullLiteral(node: any): node is NullLiteral {
  return node && node.type === 'NullLiteral'
}

/**
 * Type guard for Identifier nodes
 */
export function isIdentifier(node: any): node is Identifier {
  return node && node.type === 'Identifier'
}

/**
 * Type guard for ObjectExpression nodes
 */
export function isObjectExpression(node: any): node is ObjectExpression {
  return node && node.type === 'ObjectExpression'
}

/**
 * Type guard for literal nodes (string, number, boolean, null)
 */
export function isLiteralNode(node: any): node is LiteralNode {
  return (
    isStringLiteral(node) ||
    isNumericLiteral(node) ||
    isBooleanLiteral(node) ||
    isNullLiteral(node)
  )
}

/**
 * Type guard for ObjectProperty nodes
 */
export function isObjectProperty(node: any): node is ObjectProperty {
  return node && node.type === 'ObjectProperty'
}

/**
 * Type guard for function-like nodes
 */
export function isFunctionLike(node: any): boolean {
  return (
    node &&
    (node.type === 'FunctionDeclaration' ||
      node.type === 'ArrowFunctionExpression' ||
      node.type === 'FunctionExpression')
  )
}

/**
 * Type guard for export declarations
 */
export function isExportDeclaration(node: any): boolean {
  return (
    node &&
    (node.type === 'ExportDefaultDeclaration' ||
      node.type === 'ExportNamedDeclaration' ||
      node.type === 'ExportAllDeclaration')
  )
}

/**
 * Type guard for variable declarations
 */
export function isVariableDeclaration(node: any): boolean {
  return node && node.type === 'VariableDeclaration'
}

/**
 * Type guard for block statements
 */
export function isBlockStatement(node: any): boolean {
  return node && node.type === 'BlockStatement'
}

/**
 * Type guard for return statements
 */
export function isReturnStatement(node: any): boolean {
  return node && node.type === 'ReturnStatement'
}

/**
 * Check if node has a valid string property
 */
export function hasStringProperty(node: any, prop: string): boolean {
  return node && typeof node[prop] === 'string' && node[prop].length > 0
}

/**
 * Check if node has a valid array property
 */
export function hasArrayProperty(node: any, prop: string): boolean {
  return node && Array.isArray(node[prop])
}

/**
 * Type guard for nodes with location information
 */
export function hasLocation(node: any): boolean {
  return node && node.loc && typeof node.loc.start === 'object' && typeof node.loc.end === 'object'
}