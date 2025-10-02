# Transpiler Architecture

```
                        ┌─────────────────────────┐
                        │   transpiler.ts         │
                        │   (Public API)          │
                        └───────────┬─────────────┘
                                    │
                                    ↓
                    ┌───────────────────────────────┐
                    │   TranspilerService           │
                    │   (Orchestrator)              │
                    └───────────┬───────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ↓                   ↓                   ↓
    ┌───────────────┐   ┌──────────────┐   ┌──────────────┐
    │    Parser     │   │   Registry   │   │  Assembler   │
    │ • parse()     │   │ • components │   │ • assemble() │
    │ • traverse()  │   │ • validate() │   │ • validate() │
    └───────┬───────┘   └──────────────┘   └──────────────┘
            │
            ↓
    ┌───────────────────────────────────────┐
    │       Babel Plugin Factory            │
    │  ┌─────────────────────────────────┐  │
    │  │ • PropTracker                   │  │
    │  │ • JSXTransformer                │  │
    │  │ • ComponentCollector            │  │
    │  └─────────────────────────────────┘  │
    └───────────────┬───────────────────────┘
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
  ┌──────────┐ ┌─────────┐ ┌──────────┐
  │   AST    │ │   JSX   │ │  Value   │
  │  Utils   │ │Processor│ │Converter │
  └──────────┘ └─────────┘ └──────────┘

Benefits:
✅ Clear separation of concerns
✅ Single responsibility per module
✅ Easy to test in isolation
✅ Strong type safety
✅ Dependency injection
```

---

## Data Flow Diagram

```
Input: JSX String
    │
    ↓
┌─────────────────────┐
│ 1. Parser.parse()   │──→ Babel AST
└─────────────────────┘
    │
    ↓
┌─────────────────────────────────────────────────┐
│ 2. ExportAnalyzer.extractScenarioKey()         │──→ string | null
└─────────────────────────────────────────────────┘
    │
    ↓
┌─────────────────────────────────────────────────┐
│ 3. Create Plugin with:                          │
│    • ComponentRegistry                          │
│    • JSXProcessor (ValueConverter)              │
│    • PropTracker                                │
└─────────────────────────────────────────────────┘
    │
    ↓
┌─────────────────────────────────────────────────┐
│ 4. Parser.traverse(ast, plugin.visitor)        │
│                                                 │
│    Plugin processes:                            │
│    ┌──────────────────────────────────────┐    │
│    │ a) Track function parameters         │    │
│    │ b) Transform JSX → JSON              │    │
│    │ c) Collect exports                   │    │
│    └──────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
    │
    ↓
┌─────────────────────────────────────────────────┐
│ 5. plugin.getCollectedComponents()             │──→ ComponentMetadata[]
└─────────────────────────────────────────────────┘
    │
    ↓
┌─────────────────────────────────────────────────┐
│ 6. ScenarioAssembler.assemble()                │
│    • Validate components                        │
│    • Find default export (main)                 │
│    • Extract named exports                      │
│    • Generate key if missing                    │
└─────────────────────────────────────────────────┘
    │
    ↓
Output: TranspiledScenario
    {
      key: string,
      version: string,
      main: JsonNode,
      components: Record<string, JsonNode>
    }
```

---

## Module Responsibilities

### Core Layer

#### TranspilerService

- **Purpose:** Main orchestrator
- **Responsibilities:**
  - Coordinate all phases of transpilation
  - Manage configuration
  - Handle top-level error catching
- **Dependencies:** Parser, ExportAnalyzer, ScenarioAssembler
- **Testability:** Mock all dependencies

#### Parser

- **Purpose:** Babel wrapper
- **Responsibilities:**
  - Parse JSX string to AST
  - Provide traverse functionality
  - Handle parse errors
- **Dependencies:** @babel/parser, @babel/traverse
- **Testability:** Test with various JSX inputs

#### ComponentRegistry

- **Purpose:** Component definitions store
- **Responsibilities:**
  - Store component metadata
  - Validate component names
  - Provide default styles
  - Define supported props
- **Dependencies:** None
- **Testability:** Pure, easy to test

#### ExportAnalyzer

- **Purpose:** Extract metadata from AST
- **Responsibilities:**
  - Extract SCENARIO_KEY
  - Find export declarations
  - Identify component types (default/named/helper)
- **Dependencies:** AST utilities
- **Testability:** Test with AST fixtures

#### ScenarioAssembler

- **Purpose:** Build final output
- **Responsibilities:**
  - Validate component metadata
  - Find main component
  - Organize named components
  - Generate keys
- **Dependencies:** Validator
- **Testability:** Test with component metadata fixtures

---

### Processing Layer

#### JSXProcessor

- **Purpose:** Convert JSX elements to JSON nodes
- **Responsibilities:**
  - Process JSX elements
  - Process attributes (style, props, data)
  - Process children
  - Apply component defaults
- **Dependencies:** ComponentRegistry, ValueConverter
- **Testability:** Test with JSX element fixtures

#### ValueConverter

- **Purpose:** Convert AST nodes to JavaScript values
- **Responsibilities:**
  - Convert literals
  - Convert objects
  - Convert identifiers (including props)
  - Handle special cases
- **Dependencies:** None (pure functions)
- **Testability:** Highly testable with node fixtures

---

### Babel Plugin Layer

#### PropTracker

- **Purpose:** Track function parameters across scopes
- **Responsibilities:**
  - Maintain props stack
  - Extract params from functions
  - Extract params from arrow functions
  - Handle destructured params
- **Dependencies:** None
- **Testability:** Test visitor behavior

#### JSXTransformer

- **Purpose:** Transform JSX in AST
- **Responsibilities:**
  - Create JSX visitor
  - Coordinate with JSXProcessor
  - Attach JSON to AST nodes
- **Dependencies:** JSXProcessor
- **Testability:** Test with JSX AST nodes

#### ComponentCollector

- **Purpose:** Collect exported components
- **Responsibilities:**
  - Track default exports
  - Track named exports
  - Track helper functions
  - Return metadata
- **Dependencies:** None
- **Testability:** Test with export AST nodes

---

## Testing Strategy

### Unit Tests (Fast, Isolated)

```
ValueConverter
├── Convert string literals
├── Convert numeric literals
├── Convert boolean literals
├── Convert null literals
├── Convert object expressions
├── Convert identifiers
└── Convert component props

ComponentRegistry
├── Register components
├── Check if registered
├── Get component definition
├── Get default styles
└── Validate component names

JSXProcessor
├── Process View elements
├── Process Text elements
├── Process nested children
├── Process style attributes
├── Process data attributes
└── Process properties
```

### Integration Tests (Component Interaction)

```
TranspilerService
├── Parse simple component
├── Parse component with props
├── Parse nested components
├── Extract SCENARIO_KEY
├── Handle named exports
├── Handle default exports
└── Error handling
```

### End-to-End Tests (Full Pipeline)

```
transpile()
├── cart.tsx → JSON
├── Complex nested structure
├── Multiple components
├── Props propagation
└── Edge cases
```

---

## Error Handling Flow

```
Input: JSX String
    │
    ↓
┌─────────────────────┐
│  Parse              │──→ ParseError
└─────────────────────┘       • Syntax errors
    │                         • Invalid JSX
    ↓
┌─────────────────────┐
│  Transform          │──→ ComponentNotFoundError
└─────────────────────┘       • Unknown component
    │                    ──→ ValidationError
    ↓                         • Invalid props
┌─────────────────────┐
│  Validate           │──→ ValidationError
└─────────────────────┘       • Missing required props
    │                         • Children not allowed
    ↓
┌─────────────────────┐
│  Assemble           │──→ InvalidExportError
└─────────────────────┘       • No default export
    │                         • Multiple defaults
    ↓
Output: TranspiledScenario or TranspilerError
```

---

## Extension Points

### 1. Custom Components

```typescript
const registry = new ComponentRegistry()
registry.registerComponent('CustomButton', {
  name: 'CustomButton',
  defaultStyles: { backgroundColor: 'blue' },
  supportedProps: ['onClick', 'disabled'],
  childrenAllowed: true,
})
```

### 2. Custom Value Converters

```typescript
class CustomValueConverter extends ValueConverter {
  convert(node: ASTNode, context: ConversionContext): any {
    if (node.type === 'CustomType') {
      return this.handleCustomType(node)
    }
    return super.convert(node, context)
  }
}
```

### 3. Custom Validators

```typescript
class CustomValidator extends TranspilerValidator {
  validateJsonNode(node: JsonNode, definition: ComponentDefinition): ValidationResult {
    const result = super.validateJsonNode(node, definition)

    // Add custom validation
    if (node.type === 'CustomButton' && !node.properties?.onClick) {
      result.violations.push({
        field: 'properties.onClick',
        message: 'CustomButton requires onClick handler',
      })
    }

    return result
  }
}
```

### 4. Transform Hooks

```typescript
interface TransformHooks {
  beforeParse?(source: string): string
  afterParse?(ast: File): void
  beforeTransform?(element: JSXElement): void
  afterTransform?(jsonNode: JsonNode): JsonNode
  beforeAssemble?(components: ComponentMetadata[]): void
}
```

---

## Performance Considerations

### Current Issues

- Filesystem reads during transpilation
- No caching of parsed ASTs
- No memoization of conversions

### Improvements

1. **Component Registry Preloading**

   - Load all components once at startup
   - No filesystem access during transpilation

2. **AST Caching**

   - Cache parsed ASTs for identical inputs
   - Use LRU cache with size limits

3. **Memoization**

   - Memoize style conversions
   - Memoize prop conversions

4. **Batch Processing**
   - Support batch transpilation of multiple files
   - Share registry and context

---

## Success Criteria

### Functional

- [ ] All existing tests pass
- [ ] cart.tsx transpiles correctly
- [ ] Output matches current implementation
- [ ] Error messages are clear and actionable

### Code Quality

- [ ] 90%+ test coverage
- [ ] Zero `any` types (except Babel internals)
- [ ] All linter rules pass
- [ ] TypeScript strict mode enabled

### Documentation

- [ ] Architecture documented
- [ ] API documented
- [ ] Extension points documented
- [ ] Migration guide written

### Developer Experience

- [ ] Tests run in < 5 seconds
- [ ] Good IDE autocomplete
- [ ] Clear error messages
- [ ] Easy to extend
