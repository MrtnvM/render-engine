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

  traverse(ast, {
    Program: {
      exit(path: any) {
        // Look for JSX elements in the program body
        for (const node of path.node.body) {
          if (node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'VariableDeclaration') {
            // Handle export const MyScreen = () => (<JSX>)
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
            // Handle direct JSX elements
            rootJson = (node.expression as any).json as JsonNode
            break
          }
        }
      },
    },
    ...jsxToJsonPlugin().visitor, // Spread our plugin's visitor here
  } as any)

  if (!rootJson) {
    throw new Error('Transpilation failed: Could not find a root JSX element.')
  }

  // Wrap the root component in the final scenario structure
  const scenario: TranspiledScenario = {
    id: 'generated-scenario-1',
    version: '1.0.0',
    main: rootJson,
  }
  console.log(JSON.stringify(scenario, null, 2))
  return scenario
}
