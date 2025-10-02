/**
 * Pure utility functions for AST manipulation
 * These functions have no side effects and are easy to test
 */

import type { File } from '@babel/types'
import type {
  ASTNode,
  ComponentMetadata,
  ComponentInfo,
  ExportType,
  JSXElement,
} from '../types.js'

/**
 * Extract SCENARIO_KEY from AST
 * Looks for: export const SCENARIO_KEY = 'some-value'
 */
export function extractScenarioKey(ast: File): string | null {
  if (!ast.body) return null

  for (const statement of ast.body) {
    if (statement.type === 'ExportNamedDeclaration' && statement.declaration?.type === 'VariableDeclaration') {
      const declarations = statement.declaration.declarations

      for (const declarator of declarations) {
        if (
          declarator.type === 'VariableDeclarator' &&
          declarator.id?.type === 'Identifier' &&
          declarator.id.name === 'SCENARIO_KEY' &&
          declarator.init?.type === 'StringLiteral'
        ) {
          return declarator.init.value
        }
      }
    }
  }

  return null
}

/**
 * Find all exported components in the AST
 */
export function findExportedComponents(ast: File): ComponentInfo[] {
  const components: ComponentInfo[] = []
  
  if (!ast.body) return components

  for (const statement of ast.body) {
    // Check default exports
    if (statement.type === 'ExportDefaultDeclaration') {
      const component = extractComponentFromDefaultExport(statement as any)
      if (component) {
        components.push(component)
      }
    }
    // Check named exports
    else if (statement.type === 'ExportNamedDeclaration') {
      const namedComponents = extractComponentsFromNamedExport(statement as any)
      components.push(...namedComponents)
    }
    // Check function declarations (potential helper components)
    else if (statement.type === 'FunctionDeclaration') {
      const component = extractComponentFromFunctionDeclaration(statement as any)
      if (component) {
        components.push(component)
      }
    }
  }

  return components
}

/**
 * Extract function parameters from various node types
 */
export function extractFunctionParams(node: ASTNode): Set<string> {
  const params = new Set<string>()

  if (!node.params) return params

  for (const param of node.params) {
    if (param.type === 'Identifier') {
      params.add(param.name!)
    } else if (param.type === 'ObjectPattern') {
      // Handle destructured parameters like { storeName, rating }
      const properties = (param as any).properties || []
      for (const prop of properties) {
        if (prop.type === 'ObjectProperty' && prop.key?.type === 'Identifier') {
          params.add(prop.key.name!)
        }
      }
    }
  }

  return params
}

/**
 * Check if a node represents a component function
 */
export function isComponentFunction(node: ASTNode): boolean {
  // Check if it's a function that returns JSX
  if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
    return hasJSXReturn(node)
  }

  return false
}

/**
 * Extract component info from default export
 */
function extractComponentFromDefaultExport(node: ASTNode): ComponentInfo | null {
  const declaration = node.declaration

  if (!declaration) return null

  // Handle: export default function ComponentName() { return <JSX>... }
  if (declaration.type === 'FunctionDeclaration') {
    const jsxElement = findJSXInFunction(declaration)
    if (jsxElement) {
      return {
        name: declaration.id?.name || 'default',
        exportType: 'default',
        jsxElement,
        params: extractFunctionParams(declaration),
      }
    }
  }
  // Handle: export default () => <JSX>...
  else if (declaration.type === 'ArrowFunctionExpression') {
    const jsxElement = findJSXInArrowFunction(declaration)
    if (jsxElement) {
      return {
        name: 'default',
        exportType: 'default',
        jsxElement,
        params: extractFunctionParams(declaration),
      }
    }
  }

  return null
}

/**
 * Extract components from named export
 */
function extractComponentsFromNamedExport(node: ASTNode): ComponentInfo[] {
  const components: ComponentInfo[] = []
  const declaration = node.declaration

  if (!declaration) return components

  if (declaration.type === 'VariableDeclaration') {
    for (const declarator of declaration.declarations) {
      if (
        declarator.type === 'VariableDeclarator' &&
        declarator.id?.type === 'Identifier' &&
        declarator.init?.type === 'ArrowFunctionExpression'
      ) {
        const jsxElement = findJSXInArrowFunction(declarator.init)
        if (jsxElement) {
          components.push({
            name: declarator.id.name!,
            exportType: 'named',
            jsxElement,
            params: extractFunctionParams(declarator.init),
          })
        }
      }
    }
  }

  return components
}

/**
 * Extract component from function declaration (helper function)
 */
function extractComponentFromFunctionDeclaration(node: ASTNode): ComponentInfo | null {
  if (node.type !== 'FunctionDeclaration' || !node.id?.name) return null

  const jsxElement = findJSXInFunction(node)
  if (jsxElement) {
    return {
      name: node.id.name,
      exportType: 'helper',
      jsxElement,
      params: extractFunctionParams(node),
    }
  }

  return null
}

/**
 * Check if a function node has JSX return
 */
function hasJSXReturn(node: ASTNode): boolean {
  if (node.type === 'ArrowFunctionExpression') {
    // Direct JSX return: () => <JSX>
    if (node.body?.type === 'JSXElement') return true

    // Block body with return statement
    if (node.body?.type === 'BlockStatement') {
      return hasJSXReturnInBlock(node.body)
    }
  } else if (node.type === 'FunctionDeclaration') {
    if (node.body?.type === 'BlockStatement') {
      return hasJSXReturnInBlock(node.body)
    }
  }

  return false
}

/**
 * Find JSX element in function body
 */
function findJSXInFunction(node: ASTNode): JSXElement | null {
  if (node.body?.type === 'BlockStatement') {
    return findJSXInBlock(node.body)
  }

  return null
}

/**
 * Find JSX element in arrow function
 */
function findJSXInArrowFunction(node: ASTNode): JSXElement | null {
  // Direct JSX return: () => <JSX>
  if (node.body?.type === 'JSXElement') {
    return node.body as JSXElement
  }

  // Block body with return statement
  if (node.body?.type === 'BlockStatement') {
    return findJSXInBlock(node.body)
  }

  return null
}

/**
 * Check if block has JSX return statement
 */
function hasJSXReturnInBlock(block: any): boolean {
  if (!block.body) return false

  for (const statement of block.body) {
    if (statement.type === 'ReturnStatement' && statement.argument?.type === 'JSXElement') {
      return true
    }
  }

  return false
}

/**
 * Find JSX element in block statement
 */
function findJSXInBlock(block: any): JSXElement | null {
  if (!block.body) return null

  for (const statement of block.body) {
    if (statement.type === 'ReturnStatement' && statement.argument?.type === 'JSXElement') {
      return statement.argument as JSXElement
    }
  }

  return null
}

/**
 * Generate a unique component key
 */
export function generateComponentKey(baseName = 'component', existingKeys: Set<string> = new Set()): string {
  let counter = 1
  let key = `${baseName}-${counter}`

  while (existingKeys.has(key)) {
    counter++
    key = `${baseName}-${counter}`
  }

  return key
}

/**
 * Check if a string is a valid component name (PascalCase)
 */
export function isValidComponentName(name: string): boolean {
  // Component names should be PascalCase (start with uppercase letter)
  return /^[A-Z][a-zA-Z0-9]*$/.test(name)
}

/**
 * Normalize component name to PascalCase
 */
export function normalizeComponentName(name: string): string {
  if (!name) return 'Component'

  // Convert to PascalCase
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
}