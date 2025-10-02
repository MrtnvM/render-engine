/**
 * Babel plugin factory for JSX to JSON transformation.
 * Orchestrates PropTracker, JSXTransformer, and ComponentCollector.
 */

import type { 
  PluginConfig, 
  BabelPlugin, 
  ComponentMetadata, 
  ComponentRegistry, 
  ValueConverter 
} from '../types.js'
import { PropTracker } from './prop-tracker.js'
import { JSXTransformer, createJSXTransformer } from './jsx-transformer.js'
import { ComponentCollector } from './component-collector.js'
import { wrapError } from '../errors.js'

/**
 * Configuration for the JSX to JSON Babel plugin
 */
export interface JSXToJsonPluginConfig {
  /** Component registry for validation */
  readonly componentRegistry: ComponentRegistry
  /** JSX processor for element transformation */
  readonly jsxProcessor: any // Will be JSXProcessor, but avoiding circular import
  /** Value converter for AST nodes */
  readonly valueConverter: ValueConverter
  /** Allow unknown components */
  readonly allowUnknownComponents: boolean
}

/**
 * Create JSX to JSON Babel plugin
 */
export function createJsxToJsonPlugin(config: JSXToJsonPluginConfig): BabelPlugin {
  const propTracker = new PropTracker()
  const componentCollector = new ComponentCollector()
  const jsxTransformer = createJSXTransformer(config.jsxProcessor, propTracker)

  const plugin: BabelPlugin = {
    visitor: {
      // Track function parameters for arrow functions and function declarations
      ArrowFunctionExpression: propTracker.createArrowFunctionVisitor(),
      FunctionDeclaration: propTracker.createFunctionVisitor(),

      // Transform JSX elements to JSON
      JSXElement: jsxTransformer.createJSXVisitor(),

      // Collect component exports
      ExportDefaultDeclaration: componentCollector.createDefaultExportVisitor(),
      ExportNamedDeclaration: componentCollector.createNamedExportVisitor(),

    },

    getCollectedComponents(): ComponentMetadata[] {
      return componentCollector.getComponents()
    },
  }

  return plugin
}

/**
 * Analyze helper function for component collection
 */
function analyzeHelperFunction(node: any, collector: ComponentCollector): ComponentMetadata | null {
  // Only process function declarations that haven't been exported
  if (node.type === 'FunctionDeclaration' && node.id?.name) {
    // Check if this function returns JSX
    const jsxElement = findJSXInFunction(node)
    if (jsxElement && (jsxElement as any).json) {
      const component: ComponentMetadata = {
        name: node.id.name,
        exportType: 'helper',
        jsonNode: (jsxElement as any).json,
      }

      // Add to collector (it will handle validation and duplicates)
      try {
        collector.getComponents().push(component) // Temporary - should use private method
        return component
      } catch (error) {
        // Ignore helper function collection errors
        return null
      }
    }
  }

  return null
}

/**
 * Find JSX element in function body
 */
function findJSXInFunction(node: any): any | null {
  const body = node.body

  if (body?.type === 'BlockStatement' && body.body) {
    for (const statement of body.body) {
      if (statement.type === 'ReturnStatement' && statement.argument?.type === 'JSXElement') {
        return statement.argument
      }
    }
  }

  return null
}

/**
 * Create default plugin configuration
 */
export function createDefaultPluginConfig(
  componentRegistry: ComponentRegistry,
  jsxProcessor: any,
  valueConverter: ValueConverter
): JSXToJsonPluginConfig {
  return {
    componentRegistry,
    jsxProcessor,
    valueConverter,
    allowUnknownComponents: true,
  }
}

/**
 * Plugin statistics and debugging
 */
export interface PluginStats {
  totalComponents: number
  defaultExports: number
  namedExports: number
  helperFunctions: number
  propsTracked: number
  scopeDepth: number
}

/**
 * Get plugin statistics (useful for debugging)
 */
export function getPluginStats(plugin: BabelPlugin): PluginStats {
  const components = plugin.getCollectedComponents()
  
  return {
    totalComponents: components.length,
    defaultExports: components.filter(c => c.exportType === 'default').length,
    namedExports: components.filter(c => c.exportType === 'named').length,
    helperFunctions: components.filter(c => c.exportType === 'helper').length,
    propsTracked: 0, // Would need to track this in PropTracker
    scopeDepth: 0,   // Would need to track this in PropTracker
  }
}

/**
 * Legacy plugin creator for backward compatibility
 */
export function jsxToJsonPlugin(): { 
  plugin: { visitor: Record<string, any> }, 
  components: ComponentMetadata[] 
} {
  // This is for backward compatibility with the old API
  // It creates a simplified version without full configuration
  let collectedComponents: ComponentMetadata[] = []

  const plugin = {
    visitor: {
      JSXElement: {
        exit(path: any) {
          // Simple JSX processing for backward compatibility
          // This would need to be implemented with a minimal processor
        },
      },
    },
  }

  return {
    plugin,
    components: collectedComponents,
  }
}

/**
 * Plugin error handler
 */
export function handlePluginError(error: unknown, context: string): never {
  throw wrapError(error, `Plugin error in ${context}`)
}