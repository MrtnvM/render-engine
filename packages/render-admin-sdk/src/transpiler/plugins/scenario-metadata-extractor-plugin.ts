import type { File } from '@babel/types'
import type { Visitor } from '@babel/traverse'
import type { TranspilerConfig } from '../types.js'
import type { ScenarioMeta } from '../../runtime/declarative-action-types.js'
import { TranspilerPlugin } from './base-plugin.js'

/**
 * Plugin to extract SCENARIO metadata from export declarations.
 *
 * Looks for pattern: `export const SCENARIO = { key: '...', name: '...', description: '...', version: '...' }`
 * Throws an error if SCENARIO is not found or missing required fields.
 */
export class ScenarioMetadataExtractorPlugin extends TranspilerPlugin<ScenarioMeta> {
  private scenarioMeta: Partial<ScenarioMeta> = {}

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
              declarator.id?.name === 'SCENARIO' &&
              declarator.init?.type === 'ObjectExpression'
            ) {
              this.scenarioMeta = this.parseScenarioObject(declarator.init)
            }
          })
        }
      },
    }
  }

  protected afterTraverse(ast: File, state: any): ScenarioMeta {
    // Validate required fields
    if (!this.scenarioMeta.key) {
      throw new Error(
        'Ошибка транспиляции: необходимо экспортировать SCENARIO с полем "key". ' +
        'Пример: export const SCENARIO = { key: "my-scenario", name: "My Scenario", description: "...", version: "1.0.0" }',
      )
    }
    if (!this.scenarioMeta.name) {
      throw new Error(
        'Ошибка транспиляции: SCENARIO должен содержать поле "name". ' +
        'Пример: export const SCENARIO = { key: "my-scenario", name: "My Scenario", description: "...", version: "1.0.0" }',
      )
    }
    if (!this.scenarioMeta.description) {
      throw new Error(
        'Ошибка транспиляции: SCENARIO должен содержать поле "description". ' +
        'Пример: export const SCENARIO = { key: "my-scenario", name: "My Scenario", description: "...", version: "1.0.0" }',
      )
    }
    if (!this.scenarioMeta.version) {
      throw new Error(
        'Ошибка транспиляции: SCENARIO должен содержать поле "version". ' +
        'Пример: export const SCENARIO = { key: "my-scenario", name: "My Scenario", description: "...", version: "1.0.0" }',
      )
    }

    return this.scenarioMeta as ScenarioMeta
  }

  /**
   * Parse SCENARIO object from AST ObjectExpression
   */
  private parseScenarioObject(node: any): Partial<ScenarioMeta> {
    const meta: Partial<ScenarioMeta> = {}

    for (const prop of node.properties || []) {
      if (prop.type === 'ObjectProperty' && prop.key?.type === 'Identifier') {
        const key = prop.key.name
        const value = prop.value

        if (value?.type === 'StringLiteral') {
          if (key === 'key') meta.key = value.value
          else if (key === 'name') meta.name = value.value
          else if (key === 'description') meta.description = value.value
          else if (key === 'version') meta.version = value.value
        }
      }
    }

    return meta
  }
}
