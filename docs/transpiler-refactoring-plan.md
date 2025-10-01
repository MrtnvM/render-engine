# Transpiler Refactoring Plan

## Overview

Refactor the transpiler to be more modular, testable, and maintainable for both human developers and AI coding agents.

## Current Issues Analysis

### 1. **Type Safety**

- Heavy use of `any` types throughout the codebase
- Weak type definitions for AST nodes
- Missing type guards and validation

### 2. **Modularity**

- `transpiler.ts` has too many responsibilities (parsing, extraction, collection, assembly)
- Plugin mixes multiple concerns (prop tracking, JSX conversion, component collection)
- Hard-coded logic for component discovery via filesystem regex

### 3. **Testability**

- Tightly coupled components
- No clear interfaces between modules
- Side effects (console.log, filesystem reads) embedded in core logic
- No test coverage

### 4. **Readability**

- Complex fallback logic buried in nested conditions
- Duplicated code for parameter extraction (arrow functions vs function declarations)
- Unclear separation of concerns
- Poor naming conventions

### 5. **Error Handling**

- Minimal error handling
- Errors lack context
- No validation of intermediate results

---

## Refactoring Strategy

### Phase 1: Extract & Separate Concerns (Week 1)

Break down the monolithic transpiler into focused, single-responsibility modules.

#### 1.1 Create AST Utilities Module

**File:** `apps/render-cli/src/sdk/transpiler/ast-utils.ts`

```typescript
// Pure functions for AST manipulation
- extractScenarioKey(ast: File): string | null
- findExportedComponents(ast: File): ComponentMetadata[]
- extractFunctionParams(node: ASTNode): Set<string>
- isComponentFunction(node: ASTNode): boolean
```

**Benefits:**

- Isolated, testable functions
- Clear input/output contracts
- No side effects

#### 1.2 Create Value Converter Module

**File:** `apps/render-cli/src/sdk/transpiler/value-converter.ts`

```typescript
// Extract astNodeToValue and related logic
- astNodeToValue(node: ASTNode, context: ConversionContext): any
- convertLiteral(node: ASTNode): Primitive
- convertObjectExpression(node: ASTNode, context: ConversionContext): Record<string, any>
- convertIdentifier(node: ASTNode, context: ConversionContext): any
```

**Benefits:**

- Focused responsibility
- Easy to extend with new node types
- Testable in isolation

#### 1.3 Create Component Registry Module

**File:** `apps/render-cli/src/sdk/transpiler/component-registry.ts`

```typescript
// Replace filesystem regex reading
class ComponentRegistry {
  private components: Map<string, ComponentDefinition>

  registerComponent(name: string, definition: ComponentDefinition): void
  isRegistered(name: string): boolean
  getDefinition(name: string): ComponentDefinition | undefined
  getDefaultStyles(componentType: string): Record<string, any>
}
```

**Benefits:**

- Type-safe component definitions
- No runtime filesystem dependencies
- Easy to mock for testing
- Extensible for custom components

#### 1.4 Create JSX Processor Module

**File:** `apps/render-cli/src/sdk/transpiler/jsx-processor.ts`

```typescript
// Extract JSX-to-JSON conversion logic
class JSXProcessor {
  constructor(private registry: ComponentRegistry, private valueConverter: ValueConverter)

  processElement(element: JSXElement, context: ProcessingContext): JsonNode
  processAttributes(attributes: JSXAttribute[], context: ProcessingContext): NodeAttributes
  processChildren(children: JSXChild[], context: ProcessingContext): JsonNode[]
  processTextContent(text: JSXText, parentType: string): string | null
}
```

**Benefits:**

- Clear separation of JSX processing logic
- Dependency injection for testability
- Context-aware processing

#### 1.5 Create Export Analyzer Module

**File:** `apps/render-cli/src/sdk/transpiler/export-analyzer.ts`

```typescript
// Extract component export detection
class ExportAnalyzer {
  analyzeDefaultExport(node: ExportDefaultDeclaration): ComponentInfo | null
  analyzeNamedExport(node: ExportNamedDeclaration): ComponentInfo[]
  analyzeHelperFunction(node: FunctionDeclaration): ComponentInfo | null
  extractComponentFromDeclaration(declaration: Declaration): ComponentInfo | null
}
```

**Benefits:**

- Centralized export handling
- Consistent behavior across export types
- Easy to extend for new export patterns

---

### Phase 2: Improve Type Safety (Week 1-2)

#### 2.1 Enhance Type Definitions

**File:** `apps/render-cli/src/sdk/transpiler/types.ts`

```typescript
// Add comprehensive types
export interface TranspilerConfig {
  componentRegistry: ComponentRegistry
  strictMode: boolean
  allowUnknownComponents: boolean
  logger?: Logger
}

export interface ProcessingContext {
  componentProps: Set<string>
  parentComponent?: string
  depth: number
}

export interface ConversionContext {
  componentProps: Set<string>
  strictMode: boolean
}

export interface ComponentDefinition {
  name: string
  defaultStyles: Record<string, any>
  supportedProps: string[]
  childrenAllowed: boolean
}

export interface NodeAttributes {
  style: Record<string, any>
  properties: Record<string, any>
  data: Record<string, any>
}

export interface ComponentInfo {
  name: string
  exportType: 'default' | 'named' | 'helper'
  jsxElement: JSXElement
  params: Set<string>
}

// Add type guards
export function isJSXElement(node: any): node is JSXElement
export function isJSXText(node: any): node is JSXText
export function isStringLiteral(node: any): node is StringLiteral
```

**Benefits:**

- Better IDE support
- Compile-time error checking
- Self-documenting code
- Type-safe refactoring

#### 2.2 Remove 'any' Types

Replace all `any` with proper types or generic constraints:

- Use `unknown` where type is truly unknown
- Use generics where appropriate
- Create union types for Babel AST nodes

---

### Phase 3: Refactor Babel Plugin (Week 2)

#### 3.1 Split Plugin Concerns

**File:** `apps/render-cli/src/sdk/transpiler/babel-plugin/index.ts`

```typescript
// Main plugin orchestrator
export function createJsxToJsonPlugin(config: PluginConfig) {
  const propTracker = new PropTracker()
  const jsxTransformer = new JSXTransformer(config)
  const componentCollector = new ComponentCollector()

  return {
    visitor: {
      ArrowFunctionExpression: propTracker.createArrowFunctionVisitor(),
      FunctionDeclaration: propTracker.createFunctionVisitor(),
      JSXElement: jsxTransformer.createJSXVisitor(),
      ExportDefaultDeclaration: componentCollector.createDefaultExportVisitor(),
      ExportNamedDeclaration: componentCollector.createNamedExportVisitor(),
    },
    getCollectedComponents: () => componentCollector.getComponents(),
  }
}
```

#### 3.2 Create Prop Tracker

**File:** `apps/render-cli/src/sdk/transpiler/babel-plugin/prop-tracker.ts`

```typescript
class PropTracker {
  private propsStack: Set<string>[] = []

  createArrowFunctionVisitor(): Visitor
  createFunctionVisitor(): Visitor
  getCurrentProps(): Set<string>
  private extractParamsFromNode(node: ASTNode): Set<string>
}
```

#### 3.3 Create JSX Transformer

**File:** `apps/render-cli/src/sdk/transpiler/babel-plugin/jsx-transformer.ts`

```typescript
class JSXTransformer {
  constructor(private processor: JSXProcessor)

  createJSXVisitor(): Visitor
}
```

#### 3.4 Create Component Collector

**File:** `apps/render-cli/src/sdk/transpiler/babel-plugin/component-collector.ts`

```typescript
class ComponentCollector {
  private components: ComponentMetadata[] = []

  createDefaultExportVisitor(): Visitor
  createNamedExportVisitor(): Visitor
  createHelperFunctionVisitor(): Visitor
  getComponents(): ComponentMetadata[]
}
```

**Benefits:**

- Single Responsibility Principle
- Easier to test each concern
- Cleaner visitor definitions
- Easier to extend

---

### Phase 4: Refactor Main Transpiler (Week 2-3)

#### 4.1 Create Transpiler Service

**File:** `apps/render-cli/src/sdk/transpiler/transpiler-service.ts`

```typescript
export class TranspilerService {
  constructor(
    private config: TranspilerConfig,
    private parser: Parser,
    private analyzer: ExportAnalyzer,
    private assembler: ScenarioAssembler,
  ) {}

  async transpile(jsxString: string): Promise<TranspiledScenario> {
    // 1. Parse
    const ast = this.parser.parse(jsxString)

    // 2. Extract metadata
    const scenarioKey = this.analyzer.extractScenarioKey(ast)

    // 3. Transform JSX to JSON
    const plugin = this.createPlugin()
    const transformed = this.parser.traverse(ast, plugin.visitor)

    // 4. Collect components
    const components = plugin.getCollectedComponents()

    // 5. Assemble result
    return this.assembler.assemble({
      key: scenarioKey,
      components,
      metadata: { version: '1.0.0' },
    })
  }

  private createPlugin() {
    /* ... */
  }
}
```

#### 4.2 Create Parser Wrapper

**File:** `apps/render-cli/src/sdk/transpiler/parser.ts`

```typescript
export class Parser {
  parse(source: string): File {
    try {
      return parse(source, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      })
    } catch (error) {
      throw new TranspilerError('Parse failed', { cause: error, source })
    }
  }

  async traverse(ast: File, visitor: Visitor): Promise<void> {
    const traverseModule = await import('@babel/traverse')
    const traverse = (traverseModule.default as any).default
    traverse(ast, visitor)
  }
}
```

#### 4.3 Create Scenario Assembler

**File:** `apps/render-cli/src/sdk/transpiler/scenario-assembler.ts`

```typescript
export class ScenarioAssembler {
  assemble(input: AssemblyInput): TranspiledScenario {
    const { key, components, metadata } = input

    // Validate
    this.validateComponents(components)

    // Find main component
    const main = this.findMainComponent(components)
    if (!main) {
      throw new TranspilerError('No default export found')
    }

    // Extract named components
    const namedComponents = this.extractNamedComponents(components)

    return {
      key: key || this.generateKey(),
      version: metadata.version,
      main: main.jsonNode,
      components: namedComponents,
    }
  }

  private validateComponents(components: ComponentMetadata[]): void
  private findMainComponent(components: ComponentMetadata[]): ComponentMetadata | null
  private extractNamedComponents(components: ComponentMetadata[]): Record<string, JsonNode>
  private generateKey(): string
}
```

#### 4.4 Update transpiler.ts Entry Point

**File:** `apps/render-cli/src/sdk/transpiler/transpiler.ts`

```typescript
// Clean, simple entry point
export async function transpile(jsxString: string, config?: Partial<TranspilerConfig>): Promise<TranspiledScenario> {
  const service = createTranspilerService(config)
  return service.transpile(jsxString)
}

export function createTranspilerService(config?: Partial<TranspilerConfig>): TranspilerService {
  const fullConfig: TranspilerConfig = {
    componentRegistry: createDefaultRegistry(),
    strictMode: false,
    allowUnknownComponents: true,
    logger: console,
    ...config,
  }

  return new TranspilerService(fullConfig, new Parser(), new ExportAnalyzer(), new ScenarioAssembler())
}
```

**Benefits:**

- Clear separation of concerns
- Dependency injection
- Easy to mock for tests
- Configuration support
- Clean public API

---

### Phase 5: Error Handling & Validation (Week 3)

#### 5.1 Create Error Hierarchy

**File:** `apps/render-cli/src/sdk/transpiler/errors.ts`

```typescript
export class TranspilerError extends Error {
  constructor(message: string, public readonly context?: ErrorContext) {
    super(message)
    this.name = 'TranspilerError'
  }
}

export class ParseError extends TranspilerError {
  constructor(message: string, context: { source: string; line?: number; column?: number }) {
    super(`Parse error: ${message}`, context)
    this.name = 'ParseError'
  }
}

export class ComponentNotFoundError extends TranspilerError {
  constructor(componentName: string) {
    super(`Component '${componentName}' not found in registry`, { componentName })
    this.name = 'ComponentNotFoundError'
  }
}

export class InvalidExportError extends TranspilerError {
  constructor(message: string, context?: ErrorContext) {
    super(`Invalid export: ${message}`, context)
    this.name = 'InvalidExportError'
  }
}

export class ValidationError extends TranspilerError {
  constructor(message: string, public readonly violations: ValidationViolation[]) {
    super(message, { violations })
    this.name = 'ValidationError'
  }
}
```

#### 5.2 Create Validator

**File:** `apps/render-cli/src/sdk/transpiler/validator.ts`

```typescript
export class TranspilerValidator {
  validateJsonNode(node: JsonNode, definition: ComponentDefinition): ValidationResult {
    const violations: ValidationViolation[] = []

    // Validate component type
    if (!node.type) {
      violations.push({ field: 'type', message: 'Component type is required' })
    }

    // Validate props against definition
    if (node.data) {
      for (const prop of Object.keys(node.data)) {
        if (!definition.supportedProps.includes(prop)) {
          violations.push({
            field: `data.${prop}`,
            message: `Unsupported prop '${prop}' for component '${definition.name}'`,
          })
        }
      }
    }

    // Validate children
    if (node.children && !definition.childrenAllowed) {
      violations.push({
        field: 'children',
        message: `Component '${definition.name}' does not support children`,
      })
    }

    return {
      valid: violations.length === 0,
      violations,
    }
  }

  validateScenario(scenario: TranspiledScenario): ValidationResult
}
```

#### 5.3 Add Result Wrapper

**File:** `apps/render-cli/src/sdk/transpiler/result.ts`

```typescript
export type Result<T, E = Error> = Success<T> | Failure<E>

export class Success<T> {
  readonly success = true
  constructor(readonly value: T) {}
}

export class Failure<E> {
  readonly success = false
  constructor(readonly error: E) {}
}

// Usage in transpiler
export async function transpileSafe(jsxString: string): Promise<Result<TranspiledScenario, TranspilerError>> {
  try {
    const result = await transpile(jsxString)
    return new Success(result)
  } catch (error) {
    if (error instanceof TranspilerError) {
      return new Failure(error)
    }
    return new Failure(new TranspilerError('Unknown error', { cause: error }))
  }
}
```

---

### Phase 6: Testing Infrastructure (Week 3-4)

#### 6.1 Create Test Utilities

**File:** `apps/render-cli/tests/sdk/transpiler/test-utils.ts`

```typescript
export function createMockComponentRegistry(components: string[]): ComponentRegistry {
  const registry = new ComponentRegistry()
  for (const name of components) {
    registry.registerComponent(name, {
      name,
      defaultStyles: {},
      supportedProps: [],
      childrenAllowed: true,
    })
  }
  return registry
}

export function createTestContext(overrides?: Partial<ProcessingContext>): ProcessingContext {
  return {
    componentProps: new Set(),
    depth: 0,
    ...overrides,
  }
}

export const FIXTURES = {
  simpleComponent: `
    export default function Test() {
      return <View><Text>Hello</Text></View>
    }
  `,
  componentWithProps: `
    export default function Test({ title }: { title: string }) {
      return <Text>{title}</Text>
    }
  `,
  nestedComponents: `...`,
  // more fixtures
}
```

#### 6.2 Create Unit Tests Structure

```
tests/
├── sdk/
│   └── transpiler/
│       ├── test-utils.ts
│       ├── fixtures/
│       │   ├── simple.fixture.tsx
│       │   ├── complex.fixture.tsx
│       │   └── edge-cases.fixture.tsx
│       ├── unit/
│       │   ├── ast-utils.test.ts
│       │   ├── value-converter.test.ts
│       │   ├── component-registry.test.ts
│       │   ├── jsx-processor.test.ts
│       │   ├── export-analyzer.test.ts
│       │   ├── scenario-assembler.test.ts
│       │   └── validator.test.ts
│       ├── integration/
│       │   ├── transpiler-service.test.ts
│       │   ├── babel-plugin.test.ts
│       │   └── end-to-end.test.ts
│       └── snapshots/
│           ├── simple.json
│           └── complex.json
```

#### 6.3 Example Test Cases

```typescript
// value-converter.test.ts
describe('ValueConverter', () => {
  describe('astNodeToValue', () => {
    it('should convert string literal', () => {
      const node = { type: 'StringLiteral', value: 'hello' }
      expect(converter.convert(node, context)).toBe('hello')
    })

    it('should convert object expression', () => {
      const node = {
        type: 'ObjectExpression',
        properties: [{ key: { type: 'Identifier', name: 'color' }, value: { type: 'StringLiteral', value: 'red' } }],
      }
      expect(converter.convert(node, context)).toEqual({ color: 'red' })
    })

    it('should handle component props', () => {
      const context = { componentProps: new Set(['title']) }
      const node = { type: 'Identifier', name: 'title' }
      expect(converter.convert(node, context)).toEqual({ type: 'prop', key: 'title' })
    })
  })
})

// transpiler-service.test.ts
describe('TranspilerService', () => {
  it('should transpile simple component', async () => {
    const result = await service.transpile(FIXTURES.simpleComponent)
    expect(result.key).toBe('generated-scenario-1')
    expect(result.main.type).toBe('View')
    expect(result.main.children).toHaveLength(1)
  })

  it('should extract SCENARIO_KEY', async () => {
    const jsx = `
      export const SCENARIO_KEY = 'my-scenario'
      export default function Test() { return <View /> }
    `
    const result = await service.transpile(jsx)
    expect(result.key).toBe('my-scenario')
  })

  it('should handle errors gracefully', async () => {
    const invalidJsx = 'export default function Test() { return <InvalidComponent /> }'
    await expect(service.transpile(invalidJsx)).rejects.toThrow(ComponentNotFoundError)
  })
})
```

#### 6.4 Test Configuration

**File:** `apps/render-cli/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.test.ts'],
    },
  },
})
```

---

### Phase 7: Documentation & Examples (Week 4)

#### 7.1 Architecture Documentation

**File:** `apps/render-cli/src/sdk/transpiler/README.md`

```markdown
# Transpiler Architecture

## Overview

The transpiler converts React DSL (constrained JSX) into JSON schemas for server-driven UI rendering.

## Architecture Diagram

[Include mermaid diagram showing component relationships]

## Components

### Core Services

- **TranspilerService**: Main orchestrator
- **Parser**: Babel parsing wrapper
- **ComponentRegistry**: Component definitions
- **ExportAnalyzer**: Export detection
- **ScenarioAssembler**: Result assembly

### Processing Pipeline

1. Parse JSX string to AST
2. Extract metadata (scenario key, exports)
3. Transform JSX elements to JSON nodes
4. Collect and categorize components
5. Validate and assemble final schema

### Extension Points

- Custom components via ComponentRegistry
- Custom value converters
- Custom validators

## Usage Examples

[Include code examples]

## Testing

[Link to test documentation]
```

#### 7.2 API Documentation

**File:** `apps/render-cli/src/sdk/transpiler/API.md`

Generate comprehensive API docs with examples for each public interface.

---

## Migration Strategy

### Step 1: Create New Structure Alongside Old (No Breaking Changes)

- Create new modules in parallel
- Keep old transpiler.ts working
- Add feature flag to switch between implementations

### Step 2: Gradual Migration

- Migrate one component at a time
- Write tests for each migrated component
- Verify output matches old implementation

### Step 3: Update Consumers

- Update CLI commands to use new API
- Update tests
- Update documentation

### Step 4: Remove Old Implementation

- Delete old code
- Clean up unused dependencies
- Final verification

---

## Success Metrics

### Code Quality

- ✅ TypeScript strict mode enabled
- ✅ Zero `any` types (except for Babel internals)
- ✅ 90%+ test coverage
- ✅ All functions < 50 lines
- ✅ All files < 300 lines

### Maintainability

- ✅ Clear separation of concerns
- ✅ Single responsibility per module
- ✅ Comprehensive error messages
- ✅ Full API documentation
- ✅ Architecture diagrams

### Extensibility

- ✅ Easy to add new components
- ✅ Easy to add new value types
- ✅ Easy to add new validators
- ✅ Plugin system for custom transformations

### Developer Experience

- ✅ Fast test execution (< 5s)
- ✅ Clear error messages with context
- ✅ Good IDE autocomplete support
- ✅ Easy debugging with sourcemaps

---

## File Structure After Refactoring

```
apps/render-cli/src/sdk/transpiler/
├── index.ts                          # Public API exports
├── transpiler.ts                     # Main entry point (thin wrapper)
├── transpiler-service.ts             # Core orchestrator
├── types.ts                          # Type definitions
├── errors.ts                         # Error hierarchy
├── result.ts                         # Result wrapper
│
├── core/
│   ├── parser.ts                     # Babel parser wrapper
│   ├── component-registry.ts         # Component definitions
│   ├── export-analyzer.ts            # Export detection
│   ├── scenario-assembler.ts         # Result assembly
│   └── validator.ts                  # Validation logic
│
├── ast/
│   ├── ast-utils.ts                  # AST manipulation utilities
│   ├── value-converter.ts            # AST node to value conversion
│   └── type-guards.ts                # Type guard functions
│
├── jsx/
│   ├── jsx-processor.ts              # JSX to JSON conversion
│   └── jsx-utils.ts                  # JSX helper utilities
│
├── babel-plugin/
│   ├── index.ts                      # Plugin factory
│   ├── prop-tracker.ts               # Function prop tracking
│   ├── jsx-transformer.ts            # JSX transformation visitor
│   └── component-collector.ts        # Component collection visitor
│
└── README.md                         # Architecture documentation

tests/sdk/transpiler/
├── test-utils.ts
├── fixtures/
│   ├── simple.fixture.tsx
│   ├── complex.fixture.tsx
│   └── edge-cases.fixture.tsx
├── unit/
│   ├── ast-utils.test.ts
│   ├── value-converter.test.ts
│   ├── component-registry.test.ts
│   ├── jsx-processor.test.ts
│   ├── export-analyzer.test.ts
│   ├── scenario-assembler.test.ts
│   └── validator.test.ts
└── integration/
    ├── transpiler-service.test.ts
    ├── babel-plugin.test.ts
    └── end-to-end.test.ts
```

---

## Timeline

| Phase                                | Duration | Priority |
| ------------------------------------ | -------- | -------- |
| Phase 1: Extract & Separate Concerns | 5 days   | High     |
| Phase 2: Improve Type Safety         | 3 days   | High     |
| Phase 3: Refactor Babel Plugin       | 4 days   | High     |
| Phase 4: Refactor Main Transpiler    | 5 days   | High     |
| Phase 5: Error Handling & Validation | 3 days   | Medium   |
| Phase 6: Testing Infrastructure      | 5 days   | High     |
| Phase 7: Documentation & Examples    | 3 days   | Medium   |

**Total:** ~4 weeks

---

## Next Steps

1. Review and approve this plan
2. Set up testing infrastructure (vitest config)
3. Start Phase 1: Create ast-utils.ts module with tests
4. Proceed through phases incrementally
5. Continuous integration and validation

---

## Benefits Summary

### For Human Developers

- ✅ Easier to understand (single responsibility)
- ✅ Easier to debug (clear error messages)
- ✅ Easier to extend (plugin architecture)
- ✅ Faster onboarding (good docs)

### For AI Coding Agents

- ✅ Clear module boundaries
- ✅ Strong type information
- ✅ Comprehensive tests as examples
- ✅ Well-documented APIs
- ✅ Predictable structure

### For the Project

- ✅ Higher code quality
- ✅ Better maintainability
- ✅ Reduced bugs
- ✅ Faster feature development
- ✅ Better test coverage
