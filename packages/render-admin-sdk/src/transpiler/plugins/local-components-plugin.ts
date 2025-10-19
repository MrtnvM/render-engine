/**
 * Local Components Plugin
 *
 * Detects and registers local components defined within scenario files.
 * This includes:
 * - Function declarations that return JSX: function Foo() { return <View /> }
 * - Arrow function components: const Foo = () => <View />
 * - Named exports: export const Foo = () => <View />
 */

import type { File } from '@babel/types'
import type { Visitor } from '@babel/traverse'
import { TranspilerPlugin } from './base-plugin.js'
import type { ComponentRegistry } from './component-registry.js'
import type { TranspilerConfig } from '../types.js'

export interface LocalComponentsResult {
  localComponents: string[]
}

/**
 * Plugin to detect and register local components in scenario files
 */
export class LocalComponentsPlugin extends TranspilerPlugin<LocalComponentsResult> {
  private localComponents = new Set<string>()
  private registry: ComponentRegistry

  constructor(registry: ComponentRegistry, config?: TranspilerConfig) {
    super(config)
    this.registry = registry
  }

  protected getVisitors(): Visitor {
    return {
      // Track function declarations that return JSX
      FunctionDeclaration: {
        exit: (path: any) => {
          const functionName = path.node.id?.name

          if (!functionName) {
            return
          }

          // Skip default export function (it's the main component, not a helper)
          if (path.parent?.type === 'ExportDefaultDeclaration') {
            return
          }

          // Check if the function body contains a JSX return
          const hasJSXReturn = this.functionReturnsJSX(path.node)

          if (hasJSXReturn) {
            this.localComponents.add(functionName)
          }
        },
      },

      // Track arrow function components (const Foo = () => <JSX/>)
      VariableDeclarator: {
        exit: (path: any) => {
          const variableName = path.node.id?.name
          const init = path.node.init

          if (!variableName || !init) {
            return
          }

          // Check if it's an arrow function that returns JSX
          if (init.type === 'ArrowFunctionExpression') {
            const hasJSXReturn = this.arrowFunctionReturnsJSX(init)

            if (hasJSXReturn) {
              // Register as local component
              // Named exports like 'export const Foo = () => <JSX/>' are valid local components
              this.localComponents.add(variableName)
            }
          }
        },
      },

      // Register components after full traversal
      Program: {
        exit: () => {
          // Register all found local components in the registry
          for (const componentName of this.localComponents) {
            this.registry.registerLocal(componentName)
          }
        },
      },
    }
  }

  protected afterTraverse(ast: File, state: any): LocalComponentsResult {
    return {
      localComponents: Array.from(this.localComponents),
    }
  }

  /**
   * Check if a function declaration returns JSX
   */
  private functionReturnsJSX(functionNode: any): boolean {
    if (functionNode.body?.type !== 'BlockStatement') {
      return false
    }

    // Look for a return statement with JSXElement
    for (const statement of functionNode.body.body) {
      if (statement.type === 'ReturnStatement' && statement.argument?.type === 'JSXElement') {
        return true
      }
    }

    return false
  }

  /**
   * Check if an arrow function returns JSX
   */
  private arrowFunctionReturnsJSX(arrowFunctionNode: any): boolean {
    const body = arrowFunctionNode.body

    // Direct JSX return: () => <View />
    if (body?.type === 'JSXElement') {
      return true
    }

    // Block body with return: () => { return <View /> }
    if (body?.type === 'BlockStatement') {
      for (const statement of body.body) {
        if (statement.type === 'ReturnStatement' && statement.argument?.type === 'JSXElement') {
          return true
        }
      }
    }

    return false
  }
}
