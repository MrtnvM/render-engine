/**
 * ComponentCollector class for collecting exported components from AST.
 * Handles default exports, named exports, and helper functions.
 */

import type { ComponentMetadata, ExportType, JSXElement } from '../types.js'
import { isJSXElement } from '../ast/type-guards.js'
import { extractFunctionParams } from '../ast/ast-utils.js'
import { wrapError, InvalidExportError } from '../errors.js'

/**
 * Collects component metadata from various export types during AST traversal.
 * Maintains a list of found components with their metadata.
 */
export class ComponentCollector {
  private readonly components: ComponentMetadata[] = []
  private readonly processedExports = new Set<string>()

  /**
   * Create visitor for default export declarations
   */
  createDefaultExportVisitor(): {
    exit: (path: any) => void
  } {
    return {
      exit: (path: any) => {
        try {
          const component = this.analyzeDefaultExport(path.node)
          if (component) {
            this.addComponent(component)
          }
        } catch (error) {
          throw wrapError(error, 'Failed to process default export')
        }
      },
    }
  }

  /**
   * Create visitor for named export declarations
   */
  createNamedExportVisitor(): {
    exit: (path: any) => void
  } {
    return {
      exit: (path: any) => {
        try {
          const components = this.analyzeNamedExport(path.node)
          for (const component of components) {
            this.addComponent(component)
          }
        } catch (error) {
          throw wrapError(error, 'Failed to process named export')
        }
      },
    }
  }

  /**
   * Create visitor for helper function declarations
   */
  createHelperFunctionVisitor(): {
    exit: (path: any) => void
  } {
    return {
      exit: (path: any) => {
        try {
          const component = this.analyzeHelperFunction(path.node)
          if (component) {
            this.addComponent(component)
          }
        } catch (error) {
          throw wrapError(error, 'Failed to process helper function')
        }
      },
    }
  }

  /**
   * Get collected components
   */
  getComponents(): ComponentMetadata[] {
    return [...this.components] // Return a copy to prevent external mutation
  }

  /**
   * Get components by export type
   */
  getComponentsByType(exportType: ExportType): ComponentMetadata[] {
    return this.components.filter(c => c.exportType === exportType)
  }

  /**
   * Get component by name
   */
  getComponentByName(name: string): ComponentMetadata | null {
    return this.components.find(c => c.name === name) || null
  }

  /**
   * Check if a component with given name exists
   */
  hasComponent(name: string): boolean {
    return this.components.some(c => c.name === name)
  }

  /**
   * Get collection statistics
   */
  getStats(): {
    total: number
    defaultExports: number
    namedExports: number
    helperFunctions: number
    componentNames: string[]
  } {
    const stats = {
      total: this.components.length,
      defaultExports: 0,
      namedExports: 0,
      helperFunctions: 0,
      componentNames: this.components.map(c => c.name).sort(),
    }

    for (const component of this.components) {
      switch (component.exportType) {
        case 'default':
          stats.defaultExports++
          break
        case 'named':
          stats.namedExports++
          break
        case 'helper':
          stats.helperFunctions++
          break
      }
    }

    return stats
  }

  /**
   * Reset collector state (useful for testing)
   */
  reset(): void {
    this.components.length = 0
    this.processedExports.clear()
  }

  /**
   * Add component to collection with validation
   */
  private addComponent(component: ComponentMetadata): void {
    // Validate component
    this.validateComponent(component)

    // Check for duplicates
    const existingComponent = this.getComponentByName(component.name)
    if (existingComponent) {
      throw new InvalidExportError(
        `Duplicate component name: '${component.name}' (${existingComponent.exportType} and ${component.exportType})`,
        {
          componentName: component.name,
          existingType: existingComponent.exportType,
          newType: component.exportType,
        }
      )
    }

    // Check for multiple default exports
    if (component.exportType === 'default') {
      const hasDefault = this.components.some(c => c.exportType === 'default')
      if (hasDefault) {
        throw new InvalidExportError('Multiple default exports found')
      }
    }

    this.components.push(component)
  }

  /**
   * Analyze default export declaration
   */
  private analyzeDefaultExport(node: any): ComponentMetadata | null {
    const declaration = node.declaration

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
          jsonNode: (jsxElement as any).json,
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
          jsonNode: (jsxElement as any).json,
        }
      }
    }

    return null
  }

  /**
   * Analyze named export declaration
   */
  private analyzeNamedExport(node: any): ComponentMetadata[] {
    const components: ComponentMetadata[] = []
    const declaration = node.declaration

    if (!declaration) {
      return components
    }

    // Handle: export const ComponentName = () => <JSX>...
    if (declaration.type === 'VariableDeclaration') {
      for (const declarator of declaration.declarations) {
        if (
          declarator.type === 'VariableDeclarator' &&
          declarator.id?.type === 'Identifier' &&
          declarator.init
        ) {
          const componentName = declarator.id.name

          if (declarator.init.type === 'ArrowFunctionExpression') {
            const jsxElement = this.findJSXInArrowFunction(declarator.init)
            if (jsxElement && (jsxElement as any).json) {
              components.push({
                name: componentName,
                exportType: 'named',
                jsonNode: (jsxElement as any).json,
              })
            }
          }
        }
      }
    }

    return components
  }

  /**
   * Analyze helper function declaration
   */
  private analyzeHelperFunction(node: any): ComponentMetadata | null {
    if (node.type !== 'FunctionDeclaration' || !node.id?.name) {
      return null
    }

    const functionName = node.id.name
    const jsxElement = this.findJSXInFunction(node)

    if (jsxElement && (jsxElement as any).json) {
      return {
        name: functionName,
        exportType: 'helper',
        jsonNode: (jsxElement as any).json,
      }
    }

    return null
  }

  /**
   * Find JSX element in function body
   */
  private findJSXInFunction(node: any): JSXElement | null {
    const body = node.body

    if (body?.type === 'BlockStatement' && body.body) {
      for (const statement of body.body) {
        if (statement.type === 'ReturnStatement' && isJSXElement(statement.argument)) {
          return statement.argument
        }
      }
    }

    return null
  }

  /**
   * Find JSX element in arrow function
   */
  private findJSXInArrowFunction(node: any): JSXElement | null {
    const body = node.body

    // Direct JSX return: () => <JSX>
    if (isJSXElement(body)) {
      return body
    }

    // Block body with return statement: () => { return <JSX> }
    if (body?.type === 'BlockStatement' && body.body) {
      for (const statement of body.body) {
        if (statement.type === 'ReturnStatement' && isJSXElement(statement.argument)) {
          return statement.argument
        }
      }
    }

    return null
  }

  /**
   * Validate component metadata
   */
  private validateComponent(component: ComponentMetadata): void {
    if (!component.name || typeof component.name !== 'string') {
      throw new InvalidExportError('Component name is required and must be a string')
    }

    if (!['default', 'named', 'helper'].includes(component.exportType)) {
      throw new InvalidExportError(
        `Invalid export type: '${component.exportType}'. Must be 'default', 'named', or 'helper'`
      )
    }

    if (!component.jsonNode) {
      throw new InvalidExportError(`Component '${component.name}' has no JSON node`)
    }

    if (!component.jsonNode.type || typeof component.jsonNode.type !== 'string') {
      throw new InvalidExportError(
        `Component '${component.name}' JSON node must have a valid type`
      )
    }
  }
}