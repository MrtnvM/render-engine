/**
 * Transpiler plugins for converting JSX to JSON schemas.
 *
 * All plugins extend the TranspilerPlugin base class and follow a consistent API:
 * 1. Instantiate the plugin with optional configuration
 * 2. Call execute(ast) to run the plugin on a Babel AST
 * 3. The plugin returns its results
 *
 * @example
 * ```typescript
 * import { parse } from '@babel/parser'
 * import { ScenarioKeyExtractorPlugin } from './plugins'
 *
 * const ast = parse(jsxCode, { sourceType: 'module', plugins: ['jsx', 'typescript'] })
 * const plugin = new ScenarioKeyExtractorPlugin()
 * const { scenarioKey } = plugin.execute(ast)
 * ```
 */

export { TranspilerPlugin } from './base-plugin.js'
export { ScenarioMetadataExtractorPlugin } from './scenario-metadata-extractor-plugin.js'
export { StoreCollectorPlugin, type StoreCollectorResult } from './store-collector-plugin.js'
export { JsxToJsonPlugin, type JsxToJsonResult } from './jsx-to-json-plugin.js'
export { ActionHandlerAnalyzerPlugin, type ActionHandlerAnalyzerResult } from './action-handler-analyzer.js'
export * from './serialization-utils.js'
