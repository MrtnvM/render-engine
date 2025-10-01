# Transpiler Refactoring - Code Examples

This document shows concrete before/after examples of the refactoring.

---

## Example 1: Value Conversion

### Before (Current Implementation)

```typescript
// In babel-plugin-jsx-to-json.ts
export function astNodeToValue(node?: ASTNode | null, componentProps?: Set<string>): any {
  if (!node) return null

  switch (node.type) {
    case 'StringLiteral':
      return node.value
    case 'NumericLiteral':
      return node.value
    case 'BooleanLiteral':
      return node.value
    case 'Identifier':
      if (componentProps && componentProps.has(node.name || '')) {
        return { type: 'prop', key: node.name }
      }
      return null
    case 'JSXExpressionContainer':
      return astNodeToValue(node.expression, componentProps)
    case 'ObjectExpression':
      return (
        node.properties?.reduce((obj: Record<string, any>, prop) => {
          let key: string
          if (prop.key.type === 'Identifier') {
            key = prop.key.name || 'unknown'
          } else if (prop.key.type === 'StringLiteral') {
            key = prop.key.value || 'unknown'
          } else {
            key = String(prop.key)
          }
          obj[key] = astNodeToValue(prop.value, componentProps)
          return obj
        }, {}) || {}
      )
    case 'NullLiteral':
      return null
    default:
      return null
  }
}
```

**Issues:**

- ❌ Uses `any` return type
- ❌ Optional parameters with unclear defaults
- ❌ Mixed concerns (literals, objects, identifiers)
- ❌ No error handling
- ❌ Hard to test
- ❌ No validation

### After (Refactored)

```typescript
// apps/render-cli/src/sdk/transpiler/ast/value-converter.ts

/**
 * Context for AST node value conversion
 */
export interface ConversionContext {
  /** Component props available in current scope */
  componentProps: Set<string>
  /** Whether to throw on unsupported types */
  strictMode: boolean
}

/**
 * Supported primitive value types
 */
export type Primitive = string | number | boolean | null

/**
 * Result of value conversion
 */
export type ConvertedValue = Primitive | Record<string, unknown> | PropReference

export interface PropReference {
  type: 'prop'
  key: string
}

/**
 * Converts Babel AST nodes to JavaScript values.
 * Handles literals, objects, identifiers, and component props.
 */
export class ValueConverter {
  /**
   * Convert an AST node to a JavaScript value
   * @throws {ConversionError} if node type is unsupported in strict mode
   */
  convert(node: ASTNode | null | undefined, context: ConversionContext): ConvertedValue {
    if (!node) {
      return null
    }

    // Use type guards for type-safe processing
    if (isLiteralNode(node)) {
      return this.convertLiteral(node)
    }

    if (isObjectExpression(node)) {
      return this.convertObjectExpression(node, context)
    }

    if (isIdentifier(node)) {
      return this.convertIdentifier(node, context)
    }

    if (isJSXExpressionContainer(node)) {
      return this.convert(node.expression, context)
    }

    // Handle unsupported types
    if (context.strictMode) {
      throw new ConversionError(`Unsupported AST node type: ${node.type}`)
    }

    return null
  }

  /**
   * Convert literal nodes (string, number, boolean, null)
   */
  private convertLiteral(node: LiteralNode): Primitive {
    switch (node.type) {
      case 'StringLiteral':
        return node.value
      case 'NumericLiteral':
        return node.value
      case 'BooleanLiteral':
        return node.value
      case 'NullLiteral':
        return null
      default:
        // TypeScript ensures this is unreachable
        const _exhaustive: never = node
        return null
    }
  }

  /**
   * Convert object expression to JavaScript object
   */
  private convertObjectExpression(node: ObjectExpression, context: ConversionContext): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    for (const prop of node.properties) {
      const key = this.extractPropertyKey(prop)
      const value = this.convert(prop.value, context)
      result[key] = value
    }

    return result
  }

  /**
   * Extract key from object property
   */
  private extractPropertyKey(prop: ObjectProperty): string {
    if (isIdentifier(prop.key)) {
      return prop.key.name
    }

    if (isStringLiteral(prop.key)) {
      return prop.key.value
    }

    // Fallback for computed properties
    return String(prop.key)
  }

  /**
   * Convert identifier to prop reference or null
   */
  private convertIdentifier(node: Identifier, context: ConversionContext): PropReference | null {
    // Check if this identifier refers to a component prop
    if (context.componentProps.has(node.name)) {
      return {
        type: 'prop',
        key: node.name,
      }
    }

    // Unknown identifier in strict mode
    if (context.strictMode) {
      throw new ConversionError(`Unknown identifier: ${node.name}`, {
        availableProps: Array.from(context.componentProps),
      })
    }

    return null
  }
}

// Usage example:
const converter = new ValueConverter()
const context: ConversionContext = {
  componentProps: new Set(['title', 'price']),
  strictMode: false,
}
const result = converter.convert(astNode, context)
```

**Benefits:**

- ✅ Type-safe with proper return types
- ✅ Clear separation of concerns
- ✅ Error handling with context
- ✅ Easy to test each method
- ✅ Type guards for safety
- ✅ Exhaustiveness checking
- ✅ Well-documented

---

## Example 2: Component Registry

### Before (Current Implementation)

```typescript
// In babel-plugin-jsx-to-json.ts (scattered logic)
const componentTypes = getPredefinedComponents()
if (componentTypes.includes(componentName)) {
  // ...
}

// Add default flexDirection for Row and Column components
if (componentType === 'Row') {
  jsonNode.style.flexDirection = 'row'
} else if (componentType === 'Column') {
  jsonNode.style.flexDirection = 'column'
}

// In ui.ts (filesystem reading)
export function getPredefinedComponents(): string[] {
  const uiContent = fs.readFileSync(uiPath, 'utf8')
  const exportRegex = /export const (\w+)/g
  // ... regex parsing
}
```

**Issues:**

- ❌ Filesystem dependency at runtime
- ❌ Regex parsing is fragile
- ❌ Default styles scattered in code
- ❌ No component metadata
- ❌ Hard to extend

### After (Refactored)

```typescript
// apps/render-cli/src/sdk/transpiler/core/component-registry.ts

/**
 * Component definition with metadata
 */
export interface ComponentDefinition {
  /** Component name/type */
  name: string
  /** Default styles applied to this component */
  defaultStyles: Record<string, unknown>
  /** Props supported by this component */
  supportedProps: string[]
  /** Whether this component can have children */
  childrenAllowed: boolean
  /** Whether text children are allowed */
  textChildrenAllowed: boolean
}

/**
 * Registry for component definitions.
 * Manages component metadata and validation rules.
 */
export class ComponentRegistry {
  private readonly components = new Map<string, ComponentDefinition>()

  /**
   * Register a component definition
   * @throws {RegistrationError} if component already registered
   */
  registerComponent(definition: ComponentDefinition): void {
    if (this.components.has(definition.name)) {
      throw new RegistrationError(`Component '${definition.name}' is already registered`)
    }

    this.components.set(definition.name, definition)
  }

  /**
   * Check if a component is registered
   */
  isRegistered(name: string): boolean {
    return this.components.has(name)
  }

  /**
   * Get component definition
   * @throws {ComponentNotFoundError} if component not found
   */
  getDefinition(name: string): ComponentDefinition {
    const definition = this.components.get(name)

    if (!definition) {
      throw new ComponentNotFoundError(name, {
        availableComponents: Array.from(this.components.keys()),
      })
    }

    return definition
  }

  /**
   * Get default styles for a component
   */
  getDefaultStyles(name: string): Record<string, unknown> {
    const definition = this.getDefinition(name)
    return { ...definition.defaultStyles }
  }

  /**
   * Get all registered component names
   */
  getAllComponentNames(): string[] {
    return Array.from(this.components.keys())
  }

  /**
   * Check if a component supports a specific prop
   */
  supportsProp(componentName: string, propName: string): boolean {
    const definition = this.getDefinition(componentName)
    return definition.supportedProps.includes(propName)
  }
}

/**
 * Create a registry with default UI components
 */
export function createDefaultRegistry(): ComponentRegistry {
  const registry = new ComponentRegistry()

  // View
  registry.registerComponent({
    name: 'View',
    defaultStyles: {},
    supportedProps: ['id'],
    childrenAllowed: true,
    textChildrenAllowed: false,
  })

  // Row
  registry.registerComponent({
    name: 'Row',
    defaultStyles: { flexDirection: 'row' },
    supportedProps: ['id'],
    childrenAllowed: true,
    textChildrenAllowed: false,
  })

  // Column
  registry.registerComponent({
    name: 'Column',
    defaultStyles: { flexDirection: 'column' },
    supportedProps: ['id'],
    childrenAllowed: true,
    textChildrenAllowed: false,
  })

  // Stack
  registry.registerComponent({
    name: 'Stack',
    defaultStyles: {},
    supportedProps: ['id'],
    childrenAllowed: true,
    textChildrenAllowed: false,
  })

  // Text
  registry.registerComponent({
    name: 'Text',
    defaultStyles: {},
    supportedProps: [],
    childrenAllowed: true,
    textChildrenAllowed: true,
  })

  // Image
  registry.registerComponent({
    name: 'Image',
    defaultStyles: {},
    supportedProps: ['source'],
    childrenAllowed: false,
    textChildrenAllowed: false,
  })

  // Button
  registry.registerComponent({
    name: 'Button',
    defaultStyles: {},
    supportedProps: ['title', 'image'],
    childrenAllowed: false,
    textChildrenAllowed: false,
  })

  // ... other components

  return registry
}

// Usage example:
const registry = createDefaultRegistry()

// Add custom component
registry.registerComponent({
  name: 'CustomButton',
  defaultStyles: { backgroundColor: 'blue' },
  supportedProps: ['onClick', 'disabled'],
  childrenAllowed: true,
  textChildrenAllowed: false,
})

// Check if component exists
if (registry.isRegistered('CustomButton')) {
  const definition = registry.getDefinition('CustomButton')
  console.log(definition.defaultStyles) // { backgroundColor: 'blue' }
}
```

**Benefits:**

- ✅ No filesystem dependencies
- ✅ Type-safe component definitions
- ✅ Centralized metadata
- ✅ Easy to extend
- ✅ Fast lookups (Map-based)
- ✅ Validation support
- ✅ Well-documented

---

## Example 3: Main Transpiler

### Before (Current Implementation)

```typescript
// apps/render-cli/src/sdk/transpiler/transpiler.ts (monolithic)
export async function transpile(jsxString: string): Promise<TranspiledScenario> {
  const traverseModule = await import('@babel/traverse')
  const traverse = (traverseModule.default as any).default

  const ast: File = parse(jsxString, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })

  let rootJson: JsonNode | null = null
  const components: Record<string, JsonNode> = {}
  let scenarioKey: string | null = null

  // Extract SCENARIO_KEY
  traverse(ast, {
    ExportNamedDeclaration: {
      exit(path: any) {
        const declaration = path.node.declaration
        if (declaration?.type === 'VariableDeclaration') {
          declaration.declarations.forEach((declarator: any) => {
            if (declarator.id?.name === 'SCENARIO_KEY' && declarator.init?.type === 'StringLiteral') {
              scenarioKey = declarator.init.value
            }
          })
        }
      },
    },
  } as any)

  // Use the plugin
  const pluginResult = jsxToJsonPlugin()
  const visitor = pluginResult.plugin.visitor
  const collectedComponents = pluginResult.components

  traverse(ast, {
    Program: {
      exit(path: any) {
        // ... complex fallback logic
      },
    },
    ...visitor,
  } as any)

  if (!rootJson) {
    throw new Error('Transpilation failed: Could not find a root JSX element.')
  }

  const finalScenarioKey = scenarioKey || 'generated-scenario-1'

  const scenario: TranspiledScenario = {
    key: finalScenarioKey,
    version: '1.0.0',
    main: rootJson,
    components,
  }
  console.log(JSON.stringify(scenario, null, 2))
  return scenario
}
```

**Issues:**

- ❌ Monolithic function doing everything
- ❌ Heavy use of `any`
- ❌ Multiple traversals
- ❌ Embedded side effects (console.log)
- ❌ Hard to test
- ❌ Complex fallback logic
- ❌ No configuration support

### After (Refactored)

````typescript
// apps/render-cli/src/sdk/transpiler/transpiler-service.ts

/**
 * Configuration for the transpiler
 */
export interface TranspilerConfig {
  /** Component registry to use */
  componentRegistry: ComponentRegistry
  /** Enable strict validation */
  strictMode: boolean
  /** Allow unknown components */
  allowUnknownComponents: boolean
  /** Logger instance (optional) */
  logger?: Logger
}

/**
 * Main transpiler service.
 * Orchestrates the transpilation process from JSX to JSON schema.
 */
export class TranspilerService {
  constructor(
    private readonly config: TranspilerConfig,
    private readonly parser: Parser,
    private readonly analyzer: ExportAnalyzer,
    private readonly assembler: ScenarioAssembler,
  ) {}

  /**
   * Transpile JSX string to scenario JSON
   * @throws {TranspilerError} if transpilation fails
   */
  async transpile(jsxString: string): Promise<TranspiledScenario> {
    try {
      // Phase 1: Parse JSX to AST
      const ast = this.parser.parse(jsxString)
      this.config.logger?.debug('Parsed JSX to AST')

      // Phase 2: Extract scenario key
      const scenarioKey = this.analyzer.extractScenarioKey(ast)
      this.config.logger?.debug('Extracted scenario key:', scenarioKey)

      // Phase 3: Create and apply transformation plugin
      const plugin = this.createPlugin()
      await this.parser.traverse(ast, plugin.visitor)
      this.config.logger?.debug('Transformed JSX to JSON')

      // Phase 4: Collect components
      const components = plugin.getCollectedComponents()
      this.config.logger?.debug('Collected components:', components.length)

      // Phase 5: Assemble final scenario
      const scenario = this.assembler.assemble({
        key: scenarioKey,
        components,
        metadata: { version: '1.0.0' },
      })
      this.config.logger?.info('Transpilation complete')

      return scenario
    } catch (error) {
      if (error instanceof TranspilerError) {
        throw error
      }
      throw new TranspilerError('Transpilation failed', { cause: error })
    }
  }

  /**
   * Create Babel plugin instance with current configuration
   */
  private createPlugin(): BabelPlugin {
    const valueConverter = new ValueConverter()
    const jsxProcessor = new JSXProcessor(this.config.componentRegistry, valueConverter)

    return createJsxToJsonPlugin({
      jsxProcessor,
      allowUnknownComponents: this.config.allowUnknownComponents,
    })
  }
}

// apps/render-cli/src/sdk/transpiler/transpiler.ts (clean entry point)

/**
 * Transpile JSX string to server-driven UI JSON schema.
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
export async function transpile(jsxString: string, config?: Partial<TranspilerConfig>): Promise<TranspiledScenario> {
  const service = createTranspilerService(config)
  return service.transpile(jsxString)
}

/**
 * Create a transpiler service with configuration
 */
export function createTranspilerService(config?: Partial<TranspilerConfig>): TranspilerService {
  const fullConfig: TranspilerConfig = {
    componentRegistry: createDefaultRegistry(),
    strictMode: false,
    allowUnknownComponents: true,
    logger: undefined,
    ...config,
  }

  return new TranspilerService(fullConfig, new Parser(), new ExportAnalyzer(), new ScenarioAssembler())
}

// Usage examples:

// Basic usage
const scenario = await transpile(jsxString)

// With custom components
const registry = createDefaultRegistry()
registry.registerComponent({
  name: 'MyComponent',
  defaultStyles: {},
  supportedProps: ['custom'],
  childrenAllowed: true,
  textChildrenAllowed: false,
})

const customScenario = await transpile(jsxString, {
  componentRegistry: registry,
  strictMode: true,
})

// With logging
const scenarioWithLogs = await transpile(jsxString, {
  logger: console,
})
````

**Benefits:**

- ✅ Clear separation of concerns
- ✅ Dependency injection
- ✅ Easy to test (mock dependencies)
- ✅ Configuration support
- ✅ Proper error handling
- ✅ Logging support
- ✅ Clean public API
- ✅ Well-documented

---

## Example 4: Testing

### Before (Current Implementation)

No tests exist! ❌

### After (Refactored)

```typescript
// tests/sdk/transpiler/unit/value-converter.test.ts

import { describe, it, expect } from 'vitest'
import { ValueConverter, ConversionContext } from '@/sdk/transpiler/ast/value-converter'

describe('ValueConverter', () => {
  const converter = new ValueConverter()

  describe('convertLiteral', () => {
    it('should convert string literal', () => {
      const node = { type: 'StringLiteral', value: 'hello' }
      const context: ConversionContext = { componentProps: new Set(), strictMode: false }

      expect(converter.convert(node, context)).toBe('hello')
    })

    it('should convert numeric literal', () => {
      const node = { type: 'NumericLiteral', value: 42 }
      const context: ConversionContext = { componentProps: new Set(), strictMode: false }

      expect(converter.convert(node, context)).toBe(42)
    })

    it('should convert boolean literal', () => {
      const node = { type: 'BooleanLiteral', value: true }
      const context: ConversionContext = { componentProps: new Set(), strictMode: false }

      expect(converter.convert(node, context)).toBe(true)
    })

    it('should convert null literal', () => {
      const node = { type: 'NullLiteral' }
      const context: ConversionContext = { componentProps: new Set(), strictMode: false }

      expect(converter.convert(node, context)).toBe(null)
    })
  })

  describe('convertObjectExpression', () => {
    it('should convert simple object', () => {
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            key: { type: 'Identifier', name: 'color' },
            value: { type: 'StringLiteral', value: 'red' },
          },
          {
            key: { type: 'Identifier', name: 'fontSize' },
            value: { type: 'NumericLiteral', value: 16 },
          },
        ],
      }
      const context: ConversionContext = { componentProps: new Set(), strictMode: false }

      expect(converter.convert(node, context)).toEqual({
        color: 'red',
        fontSize: 16,
      })
    })

    it('should convert nested objects', () => {
      const node = {
        type: 'ObjectExpression',
        properties: [
          {
            key: { type: 'Identifier', name: 'style' },
            value: {
              type: 'ObjectExpression',
              properties: [
                {
                  key: { type: 'Identifier', name: 'color' },
                  value: { type: 'StringLiteral', value: 'blue' },
                },
              ],
            },
          },
        ],
      }
      const context: ConversionContext = { componentProps: new Set(), strictMode: false }

      expect(converter.convert(node, context)).toEqual({
        style: {
          color: 'blue',
        },
      })
    })
  })

  describe('convertIdentifier', () => {
    it('should convert component prop to prop reference', () => {
      const node = { type: 'Identifier', name: 'title' }
      const context: ConversionContext = {
        componentProps: new Set(['title', 'price']),
        strictMode: false,
      }

      expect(converter.convert(node, context)).toEqual({
        type: 'prop',
        key: 'title',
      })
    })

    it('should return null for unknown identifier in non-strict mode', () => {
      const node = { type: 'Identifier', name: 'unknown' }
      const context: ConversionContext = {
        componentProps: new Set(['title']),
        strictMode: false,
      }

      expect(converter.convert(node, context)).toBe(null)
    })

    it('should throw error for unknown identifier in strict mode', () => {
      const node = { type: 'Identifier', name: 'unknown' }
      const context: ConversionContext = {
        componentProps: new Set(['title']),
        strictMode: true,
      }

      expect(() => converter.convert(node, context)).toThrow(ConversionError)
      expect(() => converter.convert(node, context)).toThrow('Unknown identifier: unknown')
    })
  })

  describe('edge cases', () => {
    it('should handle null node', () => {
      const context: ConversionContext = { componentProps: new Set(), strictMode: false }
      expect(converter.convert(null, context)).toBe(null)
    })

    it('should handle undefined node', () => {
      const context: ConversionContext = { componentProps: new Set(), strictMode: false }
      expect(converter.convert(undefined, context)).toBe(null)
    })

    it('should throw for unsupported type in strict mode', () => {
      const node = { type: 'UnsupportedType' }
      const context: ConversionContext = { componentProps: new Set(), strictMode: true }

      expect(() => converter.convert(node, context)).toThrow(ConversionError)
    })

    it('should return null for unsupported type in non-strict mode', () => {
      const node = { type: 'UnsupportedType' }
      const context: ConversionContext = { componentProps: new Set(), strictMode: false }

      expect(converter.convert(node, context)).toBe(null)
    })
  })
})
```

```typescript
// tests/sdk/transpiler/integration/transpiler-service.test.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { transpile, createTranspilerService } from '@/sdk/transpiler'
import { FIXTURES } from '../test-utils'

describe('TranspilerService Integration', () => {
  describe('transpile()', () => {
    it('should transpile simple component', async () => {
      const jsx = `
        export default function App() {
          return <View><Text>Hello</Text></View>
        }
      `

      const result = await transpile(jsx)

      expect(result).toMatchObject({
        key: expect.any(String),
        version: '1.0.0',
        main: {
          type: 'View',
          children: [
            {
              type: 'Text',
              properties: { text: 'Hello' },
            },
          ],
        },
      })
    })

    it('should extract SCENARIO_KEY', async () => {
      const jsx = `
        export const SCENARIO_KEY = 'my-cart'

        export default function App() {
          return <View />
        }
      `

      const result = await transpile(jsx)
      expect(result.key).toBe('my-cart')
    })

    it('should handle component props', async () => {
      const jsx = `
        export default function App({ title }: { title: string }) {
          return <Text>{title}</Text>
        }
      `

      const result = await transpile(jsx)

      expect(result.main).toMatchObject({
        type: 'Text',
        data: {
          type: 'prop',
          key: 'title',
        },
      })
    })

    it('should collect named exports', async () => {
      const jsx = `
        export const Header = () => <Text>Header</Text>

        export default function App() {
          return <View />
        }
      `

      const result = await transpile(jsx)

      expect(result.components).toHaveProperty('Header')
      expect(result.components.Header).toMatchObject({
        type: 'Text',
        properties: { text: 'Header' },
      })
    })

    it('should apply default styles', async () => {
      const jsx = `
        export default function App() {
          return <Row />
        }
      `

      const result = await transpile(jsx)

      expect(result.main.style).toMatchObject({
        flexDirection: 'row',
      })
    })

    it('should throw error for unknown component in strict mode', async () => {
      const jsx = `
        export default function App() {
          return <UnknownComponent />
        }
      `

      await expect(transpile(jsx, { strictMode: true })).rejects.toThrow(ComponentNotFoundError)
    })
  })

  describe('with custom registry', () => {
    it('should support custom components', async () => {
      const registry = createDefaultRegistry()
      registry.registerComponent({
        name: 'CustomButton',
        defaultStyles: { backgroundColor: 'blue' },
        supportedProps: ['onClick'],
        childrenAllowed: true,
        textChildrenAllowed: false,
      })

      const jsx = `
        export default function App() {
          return <CustomButton />
        }
      `

      const result = await transpile(jsx, { componentRegistry: registry })

      expect(result.main).toMatchObject({
        type: 'CustomButton',
        style: { backgroundColor: 'blue' },
      })
    })
  })
})
```

**Benefits:**

- ✅ Comprehensive test coverage
- ✅ Fast execution
- ✅ Clear test names
- ✅ Good assertions
- ✅ Tests serve as documentation
- ✅ Easy to extend

---

## Summary

The refactoring transforms the transpiler from a monolithic, hard-to-maintain codebase into a modular, testable, and extensible system:

### Key Improvements

| Aspect             | Before                      | After                            |
| ------------------ | --------------------------- | -------------------------------- |
| **Type Safety**    | Heavy use of `any`          | Fully typed with strict mode     |
| **Modularity**     | 4 files, mixed concerns     | 20+ files, single responsibility |
| **Testability**    | Untestable, no tests        | Highly testable, 90%+ coverage   |
| **Error Handling** | Minimal, unclear errors     | Rich errors with context         |
| **Extensibility**  | Hard-coded logic            | Plugin system, registries        |
| **Documentation**  | Minimal                     | Comprehensive                    |
| **Performance**    | Filesystem reads at runtime | Preloaded registry               |

### For Developers

- **Easier to understand**: Each module has one clear purpose
- **Easier to debug**: Clear error messages with context
- **Easier to extend**: Well-defined extension points
- **Faster to onboard**: Good documentation and examples

### For AI Agents

- **Clear structure**: Predictable file organization
- **Strong types**: Better code generation
- **Good examples**: Tests serve as usage examples
- **Consistent patterns**: Easier to learn and apply
