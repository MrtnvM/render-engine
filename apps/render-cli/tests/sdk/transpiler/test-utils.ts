/**
 * Test utilities for the transpiler system.
 * Provides mocks, fixtures, and helper functions for testing.
 */

import type {
  ComponentRegistry,
  ComponentDefinition,
  ProcessingContext,
  ConversionContext,
  TranspilerConfig,
  JsonNode,
  ComponentMetadata,
  ValidationResult,
  JSXElement,
} from '@/sdk/transpiler/types.js'
import { ComponentRegistry as ComponentRegistryImpl } from '@/sdk/transpiler/core/component-registry.js'

/**
 * Create a mock component registry with specified components
 */
export function createMockComponentRegistry(componentNames: string[] = []): ComponentRegistry {
  const registry = new ComponentRegistryImpl()

  for (const name of componentNames) {
    registry.registerComponent(createMockComponentDefinition(name))
  }

  return registry
}

/**
 * Create a mock component definition
 */
export function createMockComponentDefinition(
  name: string,
  overrides?: Partial<ComponentDefinition>
): ComponentDefinition {
  return {
    name,
    defaultStyles: {},
    supportedProps: ['id'],
    childrenAllowed: true,
    textChildrenAllowed: name === 'Text',
    ...overrides,
  }
}

/**
 * Create a test processing context
 */
export function createTestProcessingContext(
  overrides?: Partial<ProcessingContext>
): ProcessingContext {
  return {
    componentProps: new Set(),
    depth: 0,
    ...overrides,
  }
}

/**
 * Create a test conversion context
 */
export function createTestConversionContext(
  overrides?: Partial<ConversionContext>
): ConversionContext {
  return {
    componentProps: new Set(),
    strictMode: false,
    ...overrides,
  }
}

/**
 * Create a test transpiler config
 */
export function createTestTranspilerConfig(
  overrides?: Partial<TranspilerConfig>
): TranspilerConfig {
  return {
    componentRegistry: createMockComponentRegistry(['View', 'Text', 'Button']),
    strictMode: false,
    allowUnknownComponents: true,
    logger: undefined, // Silent by default in tests
    ...overrides,
  }
}

/**
 * Create a mock JSON node
 */
export function createMockJsonNode(
  type: string,
  overrides?: Partial<JsonNode>
): JsonNode {
  return {
    type,
    ...overrides,
  }
}

/**
 * Create mock component metadata
 */
export function createMockComponentMetadata(
  name: string,
  overrides?: Partial<ComponentMetadata>
): ComponentMetadata {
  return {
    name,
    exportType: 'named',
    jsonNode: createMockJsonNode('View'),
    ...overrides,
  }
}

/**
 * Create a mock JSX element
 */
export function createMockJSXElement(
  componentName: string,
  attributes: Array<{ name: string; value?: any }> = [],
  children: any[] = []
): JSXElement {
  return {
    type: 'JSXElement',
    openingElement: {
      name: { type: 'JSXIdentifier', name: componentName },
      attributes: attributes.map(attr => ({
        type: 'JSXAttribute',
        name: { name: attr.name },
        value: attr.value,
      })),
    },
    children,
  }
}

/**
 * Create a mock AST node
 */
export function createMockASTNode(
  type: string,
  properties: Record<string, any> = {}
): any {
  return {
    type,
    ...properties,
  }
}

/**
 * Assert that a validation result is valid
 */
export function assertValidationPassed(result: ValidationResult): void {
  if (!result.valid) {
    const violationMessages = result.violations
      .map(v => `${v.field}: ${v.message}`)
      .join('\n')
    throw new Error(`Validation failed:\n${violationMessages}`)
  }
}

/**
 * Assert that a validation result has specific violations
 */
export function assertValidationFailed(
  result: ValidationResult,
  expectedViolations: Array<{ field?: string; message?: string }> = []
): void {
  if (result.valid) {
    throw new Error('Expected validation to fail, but it passed')
  }

  for (const expected of expectedViolations) {
    const found = result.violations.some(violation => {
      const fieldMatches = !expected.field || violation.field.includes(expected.field)
      const messageMatches = !expected.message || violation.message.includes(expected.message)
      return fieldMatches && messageMatches
    })

    if (!found) {
      const violationMessages = result.violations
        .map(v => `${v.field}: ${v.message}`)
        .join('\n')
      throw new Error(
        `Expected violation not found: ${JSON.stringify(expected)}\nActual violations:\n${violationMessages}`
      )
    }
  }
}

/**
 * Test fixture: Simple component JSX
 */
export const SIMPLE_COMPONENT_JSX = `
export default function SimpleComponent() {
  return <View><Text>Hello World</Text></View>
}
`

/**
 * Test fixture: Component with props
 */
export const COMPONENT_WITH_PROPS_JSX = `
export default function ComponentWithProps({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View>
      <Text>{title}</Text>
      <Text>{subtitle}</Text>
    </View>
  )
}
`

/**
 * Test fixture: Component with styles
 */
export const COMPONENT_WITH_STYLES_JSX = `
export default function StyledComponent() {
  return (
    <View style={{ backgroundColor: 'blue', padding: 16 }}>
      <Text style={{ color: 'white', fontSize: 18 }}>
        Styled Text
      </Text>
    </View>
  )
}
`

/**
 * Test fixture: Complex nested component
 */
export const COMPLEX_COMPONENT_JSX = `
export const SCENARIO_KEY = 'test-scenario'

export const Header = () => (
  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Header</Text>
)

export default function ComplexComponent({ items }: { items: string[] }) {
  return (
    <View style={{ flex: 1 }}>
      <Header />
      <View style={{ flexDirection: 'row' }}>
        {items.map(item => (
          <Text key={item}>{item}</Text>
        ))}
      </View>
    </View>
  )
}
`

/**
 * Test fixture: Invalid JSX
 */
export const INVALID_JSX = `
export default function Invalid() {
  return <UnknownComponent><BadSyntax></BadSyntax>
}
`

/**
 * Expected JSON for simple component
 */
export const SIMPLE_COMPONENT_EXPECTED_JSON: JsonNode = {
  type: 'View',
  children: [
    {
      type: 'Text',
      properties: {
        text: 'Hello World',
      },
    },
  ],
}

/**
 * Mock logger for testing
 */
export const mockLogger = {
  debug: vi ? vi.fn() : jest.fn(),
  info: vi ? vi.fn() : jest.fn(),
  warn: vi ? vi.fn() : jest.fn(),
  error: vi ? vi.fn() : jest.fn(),
}

/**
 * Clear all mock calls (works with both Jest and Vitest)
 */
export function clearMockLogger(): void {
  if ('mockClear' in mockLogger.debug) {
    // Jest
    mockLogger.debug.mockClear()
    mockLogger.info.mockClear()
    mockLogger.warn.mockClear()
    mockLogger.error.mockClear()
  } else if ('mockReset' in mockLogger.debug) {
    // Vitest
    mockLogger.debug.mockReset()
    mockLogger.info.mockReset()
    mockLogger.warn.mockReset()
    mockLogger.error.mockReset()
  }
}

/**
 * Sleep utility for async tests
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create a temporary component registry for isolated tests
 */
export function withTempRegistry<T>(
  components: ComponentDefinition[],
  callback: (registry: ComponentRegistry) => T
): T {
  const registry = new ComponentRegistryImpl()
  
  for (const component of components) {
    registry.registerComponent(component)
  }
  
  return callback(registry)
}

/**
 * Normalize whitespace in strings for comparison
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim()
}

/**
 * Deep freeze an object for immutable test data
 */
export function deepFreeze<T>(obj: T): T {
  Object.freeze(obj)
  
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = (obj as any)[prop]
    if (value && typeof value === 'object') {
      deepFreeze(value)
    }
  })
  
  return obj
}