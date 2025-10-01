/**
 * ExportAnalyzer class for detecting and analyzing component exports from AST.
 * Handles default exports, named exports, and helper functions.
 */

import type { File } from '@babel/types'
import type {
  ASTNode,
  ComponentInfo,
  JSXElement,
  ExportAnalyzer as IExportAnalyzer,
} from '../types.js'
import { extractScenarioKey, extractFunctionParams } from '../ast/ast-utils.js'
import { isJSXElement, isFunctionLike, isVariableDeclaration } from '../ast/type-guards.js'
import { InvalidExportError } from '../errors.js'

/**
 * Analyzes AST nodes to extract component export information.
 * Handles various export patterns and component detection.
 */
export class ExportAnalyzer implements IExportAnalyzer {
  /**
   * Extract SCENARIO_KEY from AST
   */
  extractScenarioKey(ast: File): string | null {
    return extractScenarioKey(ast)
  }

  /**
   * Analyze default export declaration
   */
  analyzeDefaultExport(node: ASTNode): ComponentInfo | null {
    const declaration = (node as any).declaration

    if (!declaration) {
      return null
    }

    // Handle: export default function ComponentName() { return <JSX>... }
    if (declaration.type === 'FunctionDeclaration') {
      const jsxElement = this.findJSXInFunction(declaration)
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
      const jsxElement = this.findJSXInArrowFunction(declaration)
      if (jsxElement) {
        return {
          name: 'default',
          exportType: 'default',
          jsxElement,
          params: extractFunctionParams(declaration),
        }
      }
    }
    // Handle: export default ComponentName (identifier reference)
    else if (declaration.type === 'Identifier') {
      // This would require looking up the identifier in the scope
      // For now, we'll handle this case in the future if needed
      throw new InvalidExportError(
        `Export default with identifier reference not yet supported: ${declaration.name}`,
        { identifierName: declaration.name }
      )
    }

    return null
  }

  /**
   * Analyze named export declaration
   */
  analyzeNamedExport(node: ASTNode): ComponentInfo[] {
    const components: ComponentInfo[] = []
    const declaration = (node as any).declaration

    if (!declaration) {
      return components
    }

    // Handle: export const ComponentName = () => <JSX>...
    if (isVariableDeclaration(declaration)) {
      for (const declarator of declaration.declarations) {
        if (
          declarator.type === 'VariableDeclarator' &&
          declarator.id?.type === 'Identifier' &&
          declarator.init
        ) {
          const componentName = declarator.id.name!

          // Handle arrow function: export const Comp = () => <JSX>...
          if (declarator.init.type === 'ArrowFunctionExpression') {
            const jsxElement = this.findJSXInArrowFunction(declarator.init)
            if (jsxElement) {
              components.push({
                name: componentName,
                exportType: 'named',
                jsxElement,
                params: extractFunctionParams(declarator.init),
              })
            }
          }
          // Handle function expression: export const Comp = function() { return <JSX>... }
          else if (declarator.init.type === 'FunctionExpression') {
            const jsxElement = this.findJSXInFunction(declarator.init)
            if (jsxElement) {
              components.push({
                name: componentName,
                exportType: 'named',
                jsxElement,
                params: extractFunctionParams(declarator.init),
              })
            }
          }
        }
      }
    }
    // Handle: export function ComponentName() { return <JSX>... }
    else if (declaration.type === 'FunctionDeclaration') {
      const jsxElement = this.findJSXInFunction(declaration)
      if (jsxElement && declaration.id?.name) {
        components.push({
          name: declaration.id.name,
          exportType: 'named',
          jsxElement,
          params: extractFunctionParams(declaration),
        })
      }
    }

    return components
  }

  /**
   * Analyze helper function (non-exported function that returns JSX)
   */
  analyzeHelperFunction(node: ASTNode): ComponentInfo | null {
    if (node.type !== 'FunctionDeclaration' || !(node as any).id?.name) {
      return null
    }

    const functionName = (node as any).id.name
    const jsxElement = this.findJSXInFunction(node)

    if (jsxElement) {
      return {
        name: functionName,
        exportType: 'helper',
        jsxElement,
        params: extractFunctionParams(node),
      }
    }

    return null
  }

  /**
   * Extract component from any declaration node
   */
  extractComponentFromDeclaration(declaration: ASTNode): ComponentInfo | null {
    if (isFunctionLike(declaration)) {
      return this.analyzeHelperFunction(declaration)
    }

    return null
  }

  /**
   * Find JSX element in function body
   */
  private findJSXInFunction(node: ASTNode): JSXElement | null {
    const body = (node as any).body

    if (body?.type === 'BlockStatement') {
      return this.findJSXInBlock(body)
    }

    return null
  }

  /**
   * Find JSX element in arrow function
   */
  private findJSXInArrowFunction(node: ASTNode): JSXElement | null {
    const body = (node as any).body

    // Direct JSX return: () => <JSX>
    if (isJSXElement(body)) {
      return body as JSXElement
    }

    // Block body with return statement: () => { return <JSX> }
    if (body?.type === 'BlockStatement') {
      return this.findJSXInBlock(body)
    }

    return null
  }

  /**
   * Find JSX element in block statement
   */
  private findJSXInBlock(block: any): JSXElement | null {
    if (!block.body || !Array.isArray(block.body)) {
      return null
    }

    for (const statement of block.body) {
      if (statement.type === 'ReturnStatement') {
        const argument = statement.argument
        if (isJSXElement(argument)) {
          return argument as JSXElement
        }
      }
    }

    return null
  }

  /**
   * Validate component info
   */
  private validateComponentInfo(info: ComponentInfo): void {
    if (!info.name) {
      throw new InvalidExportError('Component name cannot be empty')
    }

    if (!info.jsxElement) {
      throw new InvalidExportError(`No JSX element found in component: ${info.name}`)
    }

    // Validate component name format (PascalCase for components)
    if (info.exportType !== 'helper' && !info.name.match(/^[A-Z][a-zA-Z0-9]*$/)) {
      throw new InvalidExportError(
        `Component name '${info.name}' should be PascalCase (start with uppercase)`
      )
    }
  }
}

/**
 * Convenience function to analyze all exports in an AST
 */
export function analyzeAllExports(ast: File): {
  scenarioKey: string | null
  components: ComponentInfo[]
} {
  const analyzer = new ExportAnalyzer()
  const components: ComponentInfo[] = []

  // Extract scenario key
  const scenarioKey = analyzer.extractScenarioKey(ast)

  // Analyze all statements in the AST
  if (ast.body) {
    for (const statement of ast.body) {
      // Handle default exports
      if (statement.type === 'ExportDefaultDeclaration') {
        const component = analyzer.analyzeDefaultExport(statement as any)
        if (component) {
          components.push(component)
        }
      }
      // Handle named exports
      else if (statement.type === 'ExportNamedDeclaration') {
        const namedComponents = analyzer.analyzeNamedExport(statement as any)
        components.push(...namedComponents)
      }
      // Handle helper functions
      else if (statement.type === 'FunctionDeclaration') {
        const helperComponent = analyzer.analyzeHelperFunction(statement as any)
        if (helperComponent) {
          components.push(helperComponent)
        }
      }
    }
  }

  return {
    scenarioKey,
    components,
  }
}