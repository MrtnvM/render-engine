import { parse } from '@babel/parser'
import type { File } from '@babel/types'
import type { TranspilerConfig } from './types.js'
import type { TranspiledScenarioWithActions } from '../runtime/action-types.js'

// Dynamically import traverse to ensure it's loaded before plugins use it
let traverseModule: any = null
async function ensureTraverseLoaded() {
  if (!traverseModule) {
    traverseModule = await import('./traverse.js')
  }
}

/**
 * Transpiles a React JSX string into a server-driven UI JSON schema.
 * @param jsxString The JSX code to transpile.
 * @param config Optional configuration
 * @returns The JSON schema object with stores and actions.
 */
export async function transpile(jsxString: string, config?: TranspilerConfig): Promise<TranspiledScenarioWithActions> {
  // Ensure traverse is loaded before importing plugins
  await ensureTraverseLoaded()

  // Dynamically import plugins after traverse is loaded
  const { extractScenarioKey } = await import('./plugins/scenario-key-extractor-plugin.js')
  const { collectStores } = await import('./plugins/store-collector-plugin.js')
  const { collectActions } = await import('./plugins/action-collector-plugin.js')
  const { transformJsxToJson } = await import('./plugins/jsx-to-json-plugin.js')

  // Parse JSX code to AST once
  const ast: File = parse(jsxString, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })

  // Run plugins on the parsed AST
  const { scenarioKey } = extractScenarioKey(ast, config)
  const { stores, storeVarToConfig } = collectStores(ast, config)
  const { actions } = collectActions(ast, storeVarToConfig, config)
  const { rootJson, components } = transformJsxToJson(ast, config)

  // Validate root JSON
  if (!rootJson) {
    throw new Error('Ошибка транспиляции: не найден корневой JSX элемент.')
  }

  // Validate scenario key
  if (!scenarioKey) {
    throw new Error(
      'Ошибка транспиляции: необходимо экспортировать SCENARIO_KEY. Пример: export const SCENARIO_KEY = "my-scenario"',
    )
  }

  // Assemble final scenario
  const scenario: TranspiledScenarioWithActions = {
    key: scenarioKey,
    version: '1.0.0',
    main: rootJson,
    components,
    stores: stores.size > 0 ? Array.from(stores.values()) : undefined,
    actions: actions.size > 0 ? Array.from(actions.values()) : undefined,
  }

  return scenario
}
