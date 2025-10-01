/**
 * TranspilerService - Main orchestrator for the transpilation process.
 * Coordinates Parser, ExportAnalyzer, JSXProcessor, and ScenarioAssembler.
 */

import type {
  TranspilerConfig,
  TranspiledScenario,
  Logger,
  Parser,
  ExportAnalyzer,
  ScenarioAssembler,
  ComponentRegistry,
  ValueConverter,
  JSXProcessor,
  BabelPlugin,
  ComponentMetadata,
} from './types.js'
import { createJsxToJsonPlugin, createDefaultPluginConfig } from './babel-plugin/index.js'
import { TranspilerError, wrapError } from './errors.js'

/**
 * Main transpiler service that orchestrates the transpilation process.
 * Uses dependency injection for all major components.
 */
export class TranspilerService {
  constructor(
    private readonly config: TranspilerConfig,
    private readonly parser: Parser,
    private readonly analyzer: ExportAnalyzer,
    private readonly assembler: ScenarioAssembler,
    private readonly valueConverter: ValueConverter,
    private readonly jsxProcessor: JSXProcessor
  ) {}

  /**
   * Transpile JSX string to scenario JSON
   * @throws {TranspilerError} if transpilation fails
   */
  async transpile(jsxString: string): Promise<TranspiledScenario> {
    const startTime = Date.now()
    
    try {
      this.config.logger?.info('Starting transpilation process')

      // Phase 1: Parse JSX to AST
      this.config.logger?.debug('Phase 1: Parsing JSX to AST')
      const ast = this.parser.parse(jsxString)
      this.config.logger?.debug(`Parsed AST with ${ast.body?.length || 0} top-level statements`)

      // Phase 2: Extract scenario key
      this.config.logger?.debug('Phase 2: Extracting scenario key')
      const scenarioKey = this.analyzer.extractScenarioKey(ast)
      this.config.logger?.debug(`Scenario key: ${scenarioKey || 'none found'}`)

      // Phase 3: Create and apply transformation plugin
      this.config.logger?.debug('Phase 3: Creating transformation plugin')
      const plugin = this.createPlugin()
      await this.parser.traverse(ast, plugin.visitor)
      this.config.logger?.debug('JSX transformation completed')

      // Phase 4: Collect components
      this.config.logger?.debug('Phase 4: Collecting components')
      const components = plugin.getCollectedComponents()
      this.config.logger?.debug(`Collected ${components.length} components`)

      this.logComponentStats(components)

      // Phase 5: Assemble final scenario
      this.config.logger?.debug('Phase 5: Assembling final scenario')
      const scenario = this.assembler.assemble({
        key: scenarioKey,
        components,
        metadata: { version: '1.0.0' },
      })

      const duration = Date.now() - startTime
      this.config.logger?.info(`Transpilation completed in ${duration}ms`)

      return scenario
    } catch (error) {
      const duration = Date.now() - startTime
      this.config.logger?.error(`Transpilation failed after ${duration}ms`, error)

      if (error instanceof TranspilerError) {
        throw error
      }
      
      throw wrapError(error, 'Transpilation failed')
    }
  }

  /**
   * Validate JSX string before transpilation
   */
  async validateJsx(jsxString: string): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Try to parse
      const ast = this.parser.parse(jsxString)
      
      // Check for common issues
      if (!ast.body || ast.body.length === 0) {
        warnings.push('Empty JSX file')
      }

      // Check for exports
      const hasDefaultExport = ast.body?.some(
        node => node.type === 'ExportDefaultDeclaration'
      )
      
      if (!hasDefaultExport) {
        warnings.push('No default export found - this may not render properly')
      }

      // Could add more validation here

    } catch (error) {
      if (error instanceof TranspilerError) {
        errors.push(error.message)
      } else {
        errors.push(`Parse error: ${String(error)}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Get transpiler statistics and information
   */
  getInfo(): {
    version: string
    registeredComponents: string[]
    config: {
      strictMode: boolean
      allowUnknownComponents: boolean
    }
  } {
    return {
      version: '2.0.0', // New refactored version
      registeredComponents: this.config.componentRegistry.getAllComponentNames(),
      config: {
        strictMode: this.config.strictMode,
        allowUnknownComponents: this.config.allowUnknownComponents,
      },
    }
  }

  /**
   * Test transpiler with a simple component
   */
  async test(): Promise<{
    success: boolean
    result?: TranspiledScenario
    error?: string
  }> {
    const testJsx = `
      export default function TestComponent() {
        return <View><Text>Hello World</Text></View>
      }
    `

    try {
      const result = await this.transpile(testJsx)
      return {
        success: true,
        result,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Create Babel plugin instance with current configuration
   */
  private createPlugin(): BabelPlugin {
    const pluginConfig = createDefaultPluginConfig(
      this.config.componentRegistry,
      this.jsxProcessor,
      this.valueConverter
    )

    return createJsxToJsonPlugin(pluginConfig)
  }

  /**
   * Log component statistics
   */
  private logComponentStats(components: ComponentMetadata[]): void {
    if (!this.config.logger) return

    const stats = {
      total: components.length,
      default: components.filter(c => c.exportType === 'default').length,
      named: components.filter(c => c.exportType === 'named').length,
      helper: components.filter(c => c.exportType === 'helper').length,
    }

    this.config.logger.debug('Component statistics:', stats)

    if (stats.total > 0) {
      const componentNames = components.map(c => `${c.name} (${c.exportType})`).join(', ')
      this.config.logger.debug('Components found:', componentNames)
    }
  }
}

/**
 * Create a transpiler service with default dependencies
 */
export async function createTranspilerService(
  config?: Partial<TranspilerConfig>
): Promise<TranspilerService> {
  // Dynamic imports to handle potential circular dependencies
  const { createParser } = await import('./core/parser.js')
  const { ExportAnalyzer } = await import('./core/export-analyzer.js')
  const { createScenarioAssembler } = await import('./core/scenario-assembler.js')
  const { ValueConverter } = await import('./ast/value-converter.js')
  const { JSXProcessor } = await import('./jsx/jsx-processor.js')
  const { createDefaultRegistry } = await import('./core/component-registry.js')

  // Create dependencies
  const parser = createParser()
  const analyzer = new ExportAnalyzer()
  const assembler = createScenarioAssembler()
  const valueConverter = new ValueConverter()
  const componentRegistry = createDefaultRegistry()
  const jsxProcessor = new JSXProcessor(componentRegistry, valueConverter)

  // Create full configuration
  const fullConfig: TranspilerConfig = {
    componentRegistry,
    strictMode: false,
    allowUnknownComponents: true,
    logger: undefined,
    ...config,
  }

  return new TranspilerService(
    fullConfig,
    parser,
    analyzer,
    assembler,
    valueConverter,
    jsxProcessor
  )
}

/**
 * Default logger that outputs to console
 */
export const consoleLogger: Logger = {
  debug: (...args) => console.debug('[TRANSPILER]', ...args),
  info: (...args) => console.info('[TRANSPILER]', ...args),
  warn: (...args) => console.warn('[TRANSPILER]', ...args),
  error: (...args) => console.error('[TRANSPILER]', ...args),
}

/**
 * Silent logger that doesn't output anything
 */
export const silentLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}