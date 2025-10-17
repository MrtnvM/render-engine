import { parse } from '@babel/parser'
import type { File } from '@babel/types'
import type { TranspilerConfig } from './types.js'
import type {
  TranspiledScenarioWithActions,
  ActionDescriptor,
  HandlerActionDescriptor,
  StoreActionDescriptor,
} from '../runtime/action-types.js'
import {
  ScenarioMetadataExtractorPlugin,
  StoreCollectorPlugin,
  ActionCollectorPlugin,
  JsxToJsonPlugin,
} from './plugins/index.js'

/**
 * Transpiles a React JSX string into a server-driven UI JSON schema.
 * @param jsxString The JSX code to transpile.
 * @param config Optional configuration
 * @returns The JSON schema object with stores and actions.
 */
export async function transpile(jsxString: string, config?: TranspilerConfig): Promise<TranspiledScenarioWithActions> {
  // Parse JSX code to AST once
  const ast: File = parse(jsxString, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })

  // Instantiate and execute plugins on the parsed AST
  const scenarioMetadataPlugin = new ScenarioMetadataExtractorPlugin(config)
  const scenarioMeta = await scenarioMetadataPlugin.execute(ast)

  const storeCollectorPlugin = new StoreCollectorPlugin(config)
  const { stores, storeVarToConfig } = await storeCollectorPlugin.execute(ast)

  const jsxToJsonPlugin = new JsxToJsonPlugin(config)
  const { rootJson, components, actionHandlers } = await jsxToJsonPlugin.execute(ast)

  const actionCollectorPlugin = new ActionCollectorPlugin(storeVarToConfig, config)
  const { actions } = await actionCollectorPlugin.execute(ast)

  // Validate root JSON
  if (!rootJson) {
    throw new Error('Ошибка транспиляции: не найден корневой JSX элемент.')
  }

  // Assemble final scenario
  const storeActions: StoreActionDescriptor[] = Array.from(actions.values())

  const handlerDescriptors: HandlerActionDescriptor[] = Object.entries(actionHandlers).map(
    ([id, handler]) => ({
      kind: 'handler',
      id,
      handler,
    }),
  )

  const handlerById = new Map<string, HandlerActionDescriptor>(
    handlerDescriptors.map((descriptor) => [descriptor.id, descriptor]),
  )

  for (const action of storeActions) {
    if (action.handlerId) {
      const handler = handlerById.get(action.handlerId)
      if (handler) {
        if (!handler.linkedActionIds) {
          handler.linkedActionIds = []
        }
        handler.linkedActionIds.push(action.id)
      }
    }
  }

  const combinedActions: ActionDescriptor[] = [...handlerDescriptors, ...storeActions]

  const scenario: TranspiledScenarioWithActions = {
    ...scenarioMeta,
    main: rootJson,
    components,
    stores: stores.size > 0 ? Array.from(stores.values()) : undefined,
    actions: combinedActions.length > 0 ? combinedActions : undefined,
  }

  return scenario
}
