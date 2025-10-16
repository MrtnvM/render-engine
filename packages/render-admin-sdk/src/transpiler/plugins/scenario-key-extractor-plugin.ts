import type { File } from '@babel/types'
import type { Visitor } from '@babel/traverse'
import type { TranspilerConfig } from '../types.js'
import { TranspilerPlugin } from './base-plugin.js'

/**
 * Plugin to extract SCENARIO_KEY from export declarations.
 *
 * Looks for pattern: `export const SCENARIO_KEY = "value"`
 * Throws an error if SCENARIO_KEY is not found.
 */
export class ScenarioKeyExtractorPlugin extends TranspilerPlugin<{ scenarioKey: string }> {
  private scenarioKey: string | null = null

  constructor(config?: TranspilerConfig) {
    super(config)
  }

  protected getVisitors(): Visitor {
    return {
      ExportNamedDeclaration: (path: any) => {
        const declaration = path.node.declaration
        if (declaration?.type === 'VariableDeclaration') {
          declaration.declarations.forEach((declarator: any) => {
            if (
              declarator.id?.name === 'SCENARIO_KEY' &&
              declarator.init?.type === 'StringLiteral'
            ) {
              this.scenarioKey = declarator.init.value
            }
          })
        }
      },
    }
  }

  protected afterTraverse(ast: File, state: any): { scenarioKey: string } {
    if (!this.scenarioKey) {
      throw new Error(
        'Ошибка транспиляции: необходимо экспортировать SCENARIO_KEY. Пример: export const SCENARIO_KEY = "my-scenario"',
      )
    }
    return { scenarioKey: this.scenarioKey }
  }
}
