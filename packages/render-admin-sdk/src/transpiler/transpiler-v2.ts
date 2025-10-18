/**
 * Transpiler V2 - Declarative Action System
 *
 * This transpiler converts JSX handlers to declarative action descriptors
 * that can be executed natively on iOS/Android without JavaScript runtime.
 */

import { parse } from '@babel/parser'
import type { File } from '@babel/types'
import type { TranspilerConfig } from './types.js'
import type { TranspiledScenario, StoreDescriptor } from '../runtime/declarative-action-types.js'
import type { StoreReference } from '../runtime/value-descriptors.js'
import {
  ScenarioMetadataExtractorPlugin,
  StoreCollectorPlugin,
  ActionHandlerAnalyzerPlugin,
  JsxToJsonPlugin,
} from './plugins/index.js'

/**
 * Transpile JSX string to scenario with declarative actions
 */
export async function transpileV2(jsxString: string, config?: TranspilerConfig): Promise<TranspiledScenario> {
  // Parse JSX code to AST once
  const ast: File = parse(jsxString, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })

  // Extract scenario metadata
  const scenarioMetadataPlugin = new ScenarioMetadataExtractorPlugin(config)
  const scenarioMeta = await scenarioMetadataPlugin.execute(ast)

  // Collect store declarations
  const storeCollectorPlugin = new StoreCollectorPlugin(config)
  const { stores, storeVarToConfig } = await storeCollectorPlugin.execute(ast)

  // Convert store var mapping to StoreReference format
  const storeRefMap = new Map<string, StoreReference>()
  for (const [varName, config] of storeVarToConfig.entries()) {
    storeRefMap.set(varName, {
      scope: config.scope as 'app' | 'scenario',
      storage: config.storage as 'memory' | 'userPrefs' | 'file' | 'backend',
    })
  }

  // Analyze action handlers and convert to declarative actions
  const actionHandlerAnalyzerPlugin = new ActionHandlerAnalyzerPlugin(storeRefMap, config)
  const { actionHandlers, handlerIdByFunction } = await actionHandlerAnalyzerPlugin.execute(ast)

  // Convert JSX to JSON (this will reference action IDs)
  const jsxToJsonPlugin = new JsxToJsonPlugin(config)
  // Pass handler ID mapping to JSX plugin so it can reference actions by ID
  ;(jsxToJsonPlugin as any).handlerIdByFunction = handlerIdByFunction
  const { rootJson, components } = await jsxToJsonPlugin.execute(ast)

  // Validate root JSON
  if (!rootJson) {
    throw new Error('Ошибка транспиляции: не найден корневой JSX элемент.')
  }

  // Convert stores to StoreDescriptor format
  const storeDescriptors: StoreDescriptor[] = Array.from(stores.values()).map((store) => ({
    scope: store.scope as 'app' | 'scenario',
    storage: store.storage as 'memory' | 'userPrefs' | 'file' | 'backend',
    initialValue: store.initialValue,
  }))

  // Assemble final scenario
  const scenario: TranspiledScenario = {
    ...scenarioMeta,
    main: rootJson,
    components,
    stores: storeDescriptors.length > 0 ? storeDescriptors : undefined,
    actions: actionHandlers.size > 0 ? Array.from(actionHandlers.values()) : undefined,
  }

  return scenario
}

/**
 * Helper to check if transpiler should use v2 (declarative actions)
 */
export function shouldUseV2(config?: TranspilerConfig): boolean {
  return (config as any)?.useDeclarativeActions === true
}
