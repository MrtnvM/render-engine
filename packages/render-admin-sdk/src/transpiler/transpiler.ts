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

  // Dynamically import plugin classes after traverse is loaded
  const { ScenarioKeyExtractorPlugin } = await import('./plugins/scenario-key-extractor-plugin.js')
  const { StoreCollectorPlugin } = await import('./plugins/store-collector-plugin.js')
  const { ActionCollectorPlugin } = await import('./plugins/action-collector-plugin.js')
  const { JsxToJsonPlugin } = await import('./plugins/jsx-to-json-plugin.js')

  // Parse JSX code to AST once
  const ast: File = parse(jsxString, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })

  // Instantiate and execute plugins on the parsed AST
  const scenarioKeyPlugin = new ScenarioKeyExtractorPlugin(config)
  const { scenarioKey } = scenarioKeyPlugin.execute(ast)

  const storeCollectorPlugin = new StoreCollectorPlugin(config)
  const { stores, storeVarToConfig } = storeCollectorPlugin.execute(ast)

  const actionCollectorPlugin = new ActionCollectorPlugin(storeVarToConfig, config)
  const { actions } = actionCollectorPlugin.execute(ast)

  const jsxToJsonPlugin = new JsxToJsonPlugin(config)
  const { rootJson, components } = jsxToJsonPlugin.execute(ast)

  // Validate root JSON
  if (!rootJson) {
    throw new Error('Ошибка транспиляции: не найден корневой JSX элемент.')
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
