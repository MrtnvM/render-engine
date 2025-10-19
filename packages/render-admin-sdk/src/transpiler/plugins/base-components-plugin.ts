/**
 * Base Components Plugin
 *
 * Auto-discovers base UI components from ui.tsx file.
 * This provides a single source of truth for valid base component names.
 */

import { readFileSync } from 'fs'
import { parse } from '@babel/parser'
import _traverse from '@babel/traverse'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { File } from '@babel/types'
import type { Visitor } from '@babel/traverse'
import { TranspilerPlugin } from './base-plugin.js'
import type { ComponentRegistry } from './component-registry.js'
import type { TranspilerConfig } from '../types.js'

// Handle both CommonJS and ESM imports
const traverse = (_traverse as any).default || _traverse

export interface BaseComponentsResult {
  baseComponents: string[]
}

/**
 * Plugin to extract and register base UI components from ui.tsx
 */
export class BaseComponentsPlugin extends TranspilerPlugin<BaseComponentsResult> {
  private baseComponents: string[] = []
  private registry: ComponentRegistry

  constructor(registry: ComponentRegistry, config?: TranspilerConfig) {
    super(config)
    this.registry = registry
  }

  /**
   * This plugin doesn't traverse the scenario AST.
   * Instead, it reads and parses ui.tsx separately.
   */
  async execute(ast: File, state?: any): Promise<BaseComponentsResult> {
    this.baseComponents = this.extractComponentsFromUIFile()

    // Register all base components in the registry
    this.registry.registerBaseComponents(this.baseComponents)

    return {
      baseComponents: this.baseComponents,
    }
  }

  /**
   * Not used - this plugin doesn't traverse the scenario AST
   */
  protected getVisitors(): Visitor {
    return {}
  }

  /**
   * Not used - this plugin doesn't traverse the scenario AST
   */
  protected afterTraverse(ast: File, state: any): BaseComponentsResult {
    return {
      baseComponents: this.baseComponents,
    }
  }

  /**
   * Extract component names from ui.tsx by parsing exported const declarations
   */
  private extractComponentsFromUIFile(): string[] {
    try {
      // Get the path to ui.tsx (need to handle both src and dist paths)
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = dirname(__filename)

      // Try src path first (for development), then dist path
      let uiFilePath = join(__dirname, '../../ui/ui.tsx')

      // If running from dist, adjust path to source
      if (__dirname.includes('/dist/')) {
        // Go up from dist/transpiler/plugins to packages/render-admin-sdk/src/ui/ui.tsx
        const packageRoot = __dirname.split('/dist/')[0]
        uiFilePath = join(packageRoot, 'src/ui/ui.tsx')
      }

      // Read and parse ui.tsx
      const uiFileContent = readFileSync(uiFilePath, 'utf-8')
      const ast = parse(uiFileContent, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      })

      const components: string[] = []

      // Traverse AST to find exported const declarations (component definitions)
      traverse(ast, {
        ExportNamedDeclaration(path: any) {
          const declaration = path.node.declaration

          // Look for: export const ComponentName = ...
          if (declaration?.type === 'VariableDeclaration') {
            declaration.declarations.forEach((declarator: any) => {
              if (declarator.id.type === 'Identifier') {
                const componentName = declarator.id.name

                // Filter out non-component exports (interfaces, types, etc.)
                // Component names start with uppercase
                if (/^[A-Z]/.test(componentName)) {
                  components.push(componentName)
                }
              }
            })
          }
        },
      })

      return components
    } catch (error) {
      // Fallback to empty array if ui.tsx cannot be read
      console.warn('Failed to extract components from ui.tsx:', error)
      return []
    }
  }
}
