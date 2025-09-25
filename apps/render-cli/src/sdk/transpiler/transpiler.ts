import { parse } from '@babel/parser'
import type { File } from '@babel/types'
import jsxToJsonPlugin from './babel-plugin-jsx-to-json.js'

// Type definitions
interface JsonNode {
  type: string
  style?: Record<string, any>
  properties?: Record<string, any>
  children?: JsonNode[]
}

interface TranspiledScenario {
  id: string
  version: string
  main: JsonNode
  components: Record<string, JsonNode>
}

/**
 * Transpiles a React JSX string into a server-driven UI JSON schema.
 * @param jsxString The JSX code to transpile.
 * @returns The JSON schema object.
 */
export async function transpile(jsxString: string): Promise<TranspiledScenario> {
  const traverseModule = await import('@babel/traverse')
  const traverse = (traverseModule.default as any).default

  const ast: File = parse(jsxString, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'], // Enable JSX and TypeScript parsing
  })

  let rootJson: JsonNode | null = null
  const components: Record<string, JsonNode> = {}

  // Use the updated plugin structure
  const pluginResult = jsxToJsonPlugin()
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

  // Wrap the root component in the final scenario structure
  const scenario: TranspiledScenario = {
    id: 'generated-scenario-1',
    version: '1.0.0',
    main: rootJson,
    components,
  }
  console.log(JSON.stringify(scenario, null, 2))
  return scenario
}
