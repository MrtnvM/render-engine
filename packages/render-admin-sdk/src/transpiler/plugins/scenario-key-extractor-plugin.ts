import type { File } from '@babel/types'
import { traverse } from '../traverse.js'
import type { TranspilerConfig } from '../types.js'

/**
 * Extract SCENARIO_KEY from export declarations
 */
export function extractScenarioKey(ast: File, config?: TranspilerConfig): { scenarioKey: string | null } {
  let scenarioKey: string | null = null

  traverse(ast, {
    ExportNamedDeclaration(path: any) {
      const declaration = path.node.declaration
      if (declaration?.type === 'VariableDeclaration') {
        declaration.declarations.forEach((declarator: any) => {
          if (
            declarator.id?.name === 'SCENARIO_KEY' &&
            declarator.init?.type === 'StringLiteral'
          ) {
            scenarioKey = declarator.init.value
          }
        })
      }
    },
  } as any)

  return { scenarioKey }
}
