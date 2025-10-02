/**
 * Public API for the refactored transpiler system.
 * Provides clean, backward-compatible interface.
 */

import type {
  TranspilerConfig,
  TranspiledScenario,
  ComponentRegistry,
  ComponentDefinition,
  ValidationResult,
  JsonNode,
  Result,
} from './types.js'
import { createTranspilerService, consoleLogger, silentLogger } from './transpiler-service.js'
import { TranspilerError, isTranspilerError } from './errors.js'

/**
 * Main transpile function - backward compatible API
 * 
 * @example
 * ```typescript
 * const scenario = await transpile(`
 *   export default function App() {
 *     return <View><Text>Hello</Text></View>
 *   }
 * `)
 * ```
 * 
 * @param jsxString - The JSX code to transpile
 * @param config - Optional configuration
 * @returns The JSON schema object
 * @throws {TranspilerError} if transpilation fails
 */
export async function transpile(
  jsxString: string,
  config?: Partial<TranspilerConfig>
): Promise<TranspiledScenario> {
  const service = await createTranspilerService(config)
  return service.transpile(jsxString)
}

/**
 * Safe transpile function that returns Result type instead of throwing
 * 
 * @example
 * ```typescript
 * const result = await transpileSafe(jsxString)
 * if (result.success) {
 *   console.log(result.value)
 * } else {
 *   console.error(result.error.message)
 * }
 * ```
 */
export async function transpileSafe(
  jsxString: string,
  config?: Partial<TranspilerConfig>
): Promise<Result<TranspiledScenario, TranspilerError>> {
  try {
    const result = await transpile(jsxString, config)
    return { success: true, value: result }
  } catch (error) {
    const transpilerError = isTranspilerError(error) 
      ? error 
      : new TranspilerError('Unknown error occurred', { cause: error })
    
    return { success: false, error: transpilerError }
  }
}

/**
 * Validate JSX without full transpilation
 */
export async function validateJsx(
  jsxString: string,
  config?: Partial<TranspilerConfig>
): Promise<ValidationResult> {
  const service = await createTranspilerService(config)
  const validation = await service.validateJsx(jsxString)
  
  return {
    valid: validation.isValid,
    violations: [
      ...validation.errors.map(error => ({
        field: 'jsx',
        message: error,
        severity: 'error' as const,
      })),
      ...validation.warnings.map(warning => ({
        field: 'jsx',
        message: warning,
        severity: 'warning' as const,
      })),
    ],
  }
}

/**
 * Create a component registry with custom components
 * 
 * @example
 * ```typescript
 * const registry = createComponentRegistry([
 *   {
 *     name: 'CustomButton',
 *     defaultStyles: { backgroundColor: 'blue' },
 *     supportedProps: ['onClick'],
 *     childrenAllowed: true,
 *     textChildrenAllowed: false,
 *   }
 * ])
 * ```
 */
export async function createComponentRegistry(
  customComponents: ComponentDefinition[] = []
): Promise<ComponentRegistry> {
  const { createDefaultRegistry } = await import('./core/component-registry.js')
  const registry = createDefaultRegistry()
  
  for (const component of customComponents) {
    registry.registerComponent(component)
  }
  
  return registry
}

/**
 * Get transpiler information and statistics
 */
export async function getTranspilerInfo(config?: Partial<TranspilerConfig>) {
  const service = await createTranspilerService(config)
  return service.getInfo()
}

/**
 * Test the transpiler with a simple component
 */
export async function testTranspiler(config?: Partial<TranspilerConfig>) {
  const service = await createTranspilerService(config)
  return service.test()
}

/**
 * Create a transpiler configuration
 * 
 * @example
 * ```typescript
 * const config = await createTranspilerConfig({
 *   strictMode: true,
 *   logger: console
 * })
 * ```
 */
export async function createTranspilerConfig(
  overrides?: Partial<TranspilerConfig>
): Promise<TranspilerConfig> {
  const { createDefaultRegistry } = await import('./core/component-registry.js')
  
  return {
    componentRegistry: createDefaultRegistry(),
    strictMode: false,
    allowUnknownComponents: true,
    logger: undefined,
    ...overrides,
  }
}

// Re-export types for external use
export type {
  TranspiledScenario,
  TranspilerConfig,
  ComponentRegistry,
  ComponentDefinition,
  JsonNode,
  ValidationResult,
  Logger,
} from './types.js'

// Re-export errors for external use
export {
  TranspilerError,
  ParseError,
  ComponentNotFoundError,
  ValidationError,
  ConversionError,
  AssemblyError,
  isTranspilerError,
} from './errors.js'

// Re-export service for advanced use
export { TranspilerService, createTranspilerService } from './transpiler-service.js'

// Re-export loggers
export { consoleLogger, silentLogger } from './transpiler-service.js'

/**
 * Default export for backward compatibility
 */
export default transpile