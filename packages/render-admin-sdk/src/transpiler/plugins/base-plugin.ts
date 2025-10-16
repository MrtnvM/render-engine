import type { File } from '@babel/types'
import type { Visitor } from '@babel/traverse'
import { traverse } from '../traverse.js'
import type { TranspilerConfig } from '../types.js'

/**
 * Base abstract class for transpiler plugins.
 * All transpiler plugins should extend this class and implement the required methods.
 */
export abstract class TranspilerPlugin<TResult = any> {
  protected config?: TranspilerConfig

  constructor(config?: TranspilerConfig) {
    this.config = config
  }

  /**
   * Execute the plugin on the provided AST.
   * This is the main entry point for the plugin.
   *
   * @param ast The Babel AST to process
   * @returns The plugin's result
   */
  public async execute(ast: File): Promise<TResult> {
    const result = this.beforeTraverse(ast)

    let traverseFunction: any = null

    if (typeof traverse === 'function') {
      traverseFunction = traverse
    } else {
      const loadedTraverse: any = await import('@babel/traverse')

      if (typeof loadedTraverse === 'function') {
        traverseFunction = loadedTraverse
      } else if (typeof loadedTraverse.default === 'function') {
        traverseFunction = loadedTraverse.default
      } else if (typeof loadedTraverse.default?.default === 'function') {
        traverseFunction = loadedTraverse.default.default
      }
    }

    if (!traverseFunction) {
      throw new Error('Failed to load @babel/traverse')
    }

    traverseFunction(ast, this.getVisitors() as any)

    return this.afterTraverse(ast, result)
  }

  /**
   * Hook called before AST traversal begins.
   * Override this to initialize state or perform setup.
   *
   * @param ast The Babel AST
   * @returns Initial state or result object
   */
  protected beforeTraverse(ast: File): any {
    return undefined
  }

  /**
   * Get the Babel visitor configuration for this plugin.
   * Override this to define which AST nodes to visit and how to process them.
   *
   * @returns Babel visitor object
   */
  protected abstract getVisitors(): Visitor

  /**
   * Hook called after AST traversal completes.
   * Override this to finalize results or perform cleanup.
   *
   * @param ast The Babel AST
   * @param state The state returned from beforeTraverse
   * @returns The final plugin result
   */
  protected abstract afterTraverse(ast: File, state: any): TResult

  /**
   * Get the plugin configuration.
   */
  protected getConfig(): TranspilerConfig | undefined {
    return this.config
  }
}
