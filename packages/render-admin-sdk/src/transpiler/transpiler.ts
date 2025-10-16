import { parse } from '@babel/parser'
import type { File } from '@babel/types'
import jsxToJsonPlugin from './babel-plugin-jsx-to-json.js'
import storeCollectorPlugin from './babel-plugin-store-collector.js'
import actionCollectorPlugin from './babel-plugin-action-collector.js'
import type { JsonNode, TranspiledScenario, TranspilerConfig } from './types.js'
import type { TranspiledScenarioWithActions } from '../runtime/action-types.js'

/**
 * Transpiles a React JSX string into a server-driven UI JSON schema.
 * @param jsxString The JSX code to transpile.
 * @param config Optional configuration
 * @returns The JSON schema object with stores and actions.
 */
export async function transpile(jsxString: string, config?: TranspilerConfig): Promise<TranspiledScenarioWithActions> {
  const traverseModule = await import('@babel/traverse')
  const traverse = traverseModule.default

  const ast: File = parse(jsxString, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'estree'], // Enable JSX and TypeScript parsing
  })

  let rootJson: JsonNode | null = null
  const components: Record<string, JsonNode> = {}
  let scenarioKey: string | null = null

  // First, extract SCENARIO_KEY from the AST
  traverse(ast, {
    ExportNamedDeclaration: {
      exit(path: any) {
        const declaration = path.node.declaration
        if (declaration?.type === 'VariableDeclaration') {
          declaration.declarations.forEach((declarator: any) => {
            if (declarator.id?.name === 'SCENARIO_KEY' && declarator.init?.type === 'StringLiteral') {
              scenarioKey = declarator.init.value
            }
          })
        }
      },
    },
  } as any)

  // Initialize store and action collectors
  const storeCollectorResult = storeCollectorPlugin()
  const actionCollectorResult = actionCollectorPlugin(storeCollectorResult.storeVarToConfig)

  // First pass: collect stores
  traverse(ast, storeCollectorResult.plugin.visitor as any)

  // Second pass: collect actions (depends on store mapping)
  traverse(ast, actionCollectorResult.plugin.visitor as any)

  // Use the updated plugin structure for JSX transformation
  const pluginResult = jsxToJsonPlugin(config)
  const visitor = pluginResult.plugin.visitor
  const collectedComponents = pluginResult.components

  traverse(ast, {
    Program: {
      exit(path: any) {
        // Process collected components after traversal
        for (const component of collectedComponents) {
          if (component.exportType === 'default') {
            rootJson = component.jsonNode
          } else if (component.exportType === 'named' || component.exportType === 'helper') {
            components[component.name] = component.jsonNode
          }
        }

        // Fallback: Look for JSX elements in the program body (for backward compatibility)
        if (!rootJson) {
          for (const node of path.node.body) {
            if (node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'VariableDeclaration') {
              const declaration = node.declaration
              if (declaration.declarations.length > 0) {
                const variableDeclarator = declaration.declarations[0]
                if (
                  variableDeclarator.init?.type === 'ArrowFunctionExpression' &&
                  variableDeclarator.init.body?.type === 'JSXElement' &&
                  (variableDeclarator.init.body as any).json
                ) {
                  rootJson = (variableDeclarator.init.body as any).json as JsonNode
                  break
                }
              }
            } else if (
              node.type === 'ExpressionStatement' &&
              node.expression.type === 'JSXElement' &&
              (node.expression as any).json
            ) {
              rootJson = (node.expression as any).json as JsonNode
              break
            }
          }
        }
      },
    },
    ...visitor, // Use the updated plugin's visitor
  } as any)

  if (!rootJson) {
    throw new Error('Transpilation failed: Could not find a root JSX element.')
  }

  // Use extracted SCENARIO_KEY or fallback to generated key
  const finalScenarioKey = scenarioKey || 'generated-scenario-1'

  // Collect stores and actions
  const stores = Array.from(storeCollectorResult.stores.values())
  const actions = Array.from(actionCollectorResult.actions.values())

  // Wrap the root component in the final scenario structure
  const scenario: TranspiledScenarioWithActions = {
    key: finalScenarioKey,
    version: '1.0.0',
    main: rootJson,
    components,
    stores: stores.length > 0 ? stores : undefined,
    actions: actions.length > 0 ? actions : undefined,
  }

  return scenario
}
