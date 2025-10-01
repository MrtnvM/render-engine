# Transpiler Refactoring Progress Tracker

**Status:** 🔴 Not Started  
**Start Date:** TBD  
**Target Completion:** TBD

---

## Quick Stats

| Metric            | Current | Target | Status |
| ----------------- | ------- | ------ | ------ |
| Test Coverage     | 0%      | 90%    | 🔴     |
| Lines of Code     | ~400    | ~1200  | -      |
| Number of Modules | 4       | 20+    | 🔴     |
| `any` Types       | ~15     | 0      | 🔴     |
| Tests Written     | 0       | 50+    | 🔴     |

---

## Phase 1: Extract & Separate Concerns (5 days)

### 1.1 AST Utilities Module ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/ast/ast-utils.ts`
- [ ] Implement `extractScenarioKey(ast: File): string | null`
- [ ] Implement `findExportedComponents(ast: File): ComponentMetadata[]`
- [ ] Implement `extractFunctionParams(node: ASTNode): Set<string>`
- [ ] Implement `isComponentFunction(node: ASTNode): boolean`
- [ ] Write tests in `tests/sdk/transpiler/unit/ast-utils.test.ts`
- [ ] Achieve 95%+ coverage

**Acceptance Criteria:**

- All functions are pure (no side effects)
- All functions have proper TypeScript types
- All edge cases covered by tests
- Documentation comments added

### 1.2 Value Converter Module ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/ast/value-converter.ts`
- [ ] Extract and refactor `astNodeToValue` logic
- [ ] Implement `convertLiteral(node: ASTNode): Primitive`
- [ ] Implement `convertObjectExpression(node: ASTNode, context: ConversionContext): Record<string, any>`
- [ ] Implement `convertIdentifier(node: ASTNode, context: ConversionContext): any`
- [ ] Create `ConversionContext` interface
- [ ] Write tests in `tests/sdk/transpiler/unit/value-converter.test.ts`
- [ ] Achieve 95%+ coverage

**Acceptance Criteria:**

- Handles all AST node types from Babel
- Proper error handling for unsupported types
- Context-aware conversion (component props)
- Comprehensive tests

### 1.3 Component Registry Module ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/core/component-registry.ts`
- [ ] Implement `ComponentRegistry` class
- [ ] Implement `registerComponent(name, definition)` method
- [ ] Implement `isRegistered(name)` method
- [ ] Implement `getDefinition(name)` method
- [ ] Implement `getDefaultStyles(componentType)` method
- [ ] Create default registry factory
- [ ] Write tests in `tests/sdk/transpiler/unit/component-registry.test.ts`
- [ ] Achieve 95%+ coverage

**Acceptance Criteria:**

- No filesystem dependencies
- Type-safe component definitions
- Easy to extend with custom components
- Fast lookups (Map-based)

### 1.4 JSX Processor Module ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/jsx/jsx-processor.ts`
- [ ] Implement `JSXProcessor` class
- [ ] Implement `processElement(element, context)` method
- [ ] Implement `processAttributes(attributes, context)` method
- [ ] Implement `processChildren(children, context)` method
- [ ] Implement `processTextContent(text, parentType)` method
- [ ] Write tests in `tests/sdk/transpiler/unit/jsx-processor.test.ts`
- [ ] Achieve 95%+ coverage

**Acceptance Criteria:**

- Dependency injection for registry and converter
- Context-aware processing
- Proper handling of nested components
- Special handling for Text children

### 1.5 Export Analyzer Module ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/core/export-analyzer.ts`
- [ ] Implement `ExportAnalyzer` class
- [ ] Implement `analyzeDefaultExport(node)` method
- [ ] Implement `analyzeNamedExport(node)` method
- [ ] Implement `analyzeHelperFunction(node)` method
- [ ] Implement `extractComponentFromDeclaration(declaration)` method
- [ ] Write tests in `tests/sdk/transpiler/unit/export-analyzer.test.ts`
- [ ] Achieve 95%+ coverage

**Acceptance Criteria:**

- Handles all export patterns
- Consistent ComponentInfo output
- Clear error messages for invalid exports

---

## Phase 2: Improve Type Safety (3 days)

### 2.1 Enhance Type Definitions ⬜

- [ ] Update `apps/render-cli/src/sdk/transpiler/types.ts`
- [ ] Add `TranspilerConfig` interface
- [ ] Add `ProcessingContext` interface
- [ ] Add `ConversionContext` interface
- [ ] Add `ComponentDefinition` interface
- [ ] Add `NodeAttributes` interface
- [ ] Add `ComponentInfo` interface
- [ ] Add `ValidationResult` interface
- [ ] Add `ErrorContext` interface

**Acceptance Criteria:**

- All interfaces documented with JSDoc
- Proper use of readonly where applicable
- Use of branded types where appropriate

### 2.2 Create Type Guards ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/ast/type-guards.ts`
- [ ] Implement `isJSXElement(node): node is JSXElement`
- [ ] Implement `isJSXText(node): node is JSXText`
- [ ] Implement `isStringLiteral(node): node is StringLiteral`
- [ ] Implement `isNumericLiteral(node): node is NumericLiteral`
- [ ] Implement `isBooleanLiteral(node): node is BooleanLiteral`
- [ ] Implement `isObjectExpression(node): node is ObjectExpression`
- [ ] Write tests

**Acceptance Criteria:**

- All type guards properly narrow types
- Used throughout codebase instead of type assertions

### 2.3 Remove 'any' Types ⬜

- [ ] Audit all files for `any` usage
- [ ] Replace with proper types or `unknown`
- [ ] Use generics where appropriate
- [ ] Enable TypeScript strict mode
- [ ] Fix all strict mode errors

**Acceptance Criteria:**

- Zero `any` types (except Babel internals)
- TypeScript strict mode passes
- No type assertions except where necessary

---

## Phase 3: Refactor Babel Plugin (4 days)

### 3.1 Create Plugin Factory ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/babel-plugin/index.ts`
- [ ] Implement `createJsxToJsonPlugin(config)` factory
- [ ] Wire up all visitors
- [ ] Implement `getCollectedComponents()` method
- [ ] Write tests in `tests/sdk/transpiler/unit/babel-plugin.test.ts`

**Acceptance Criteria:**

- Clean plugin interface
- All visitors properly orchestrated
- Easy to test

### 3.2 Create PropTracker ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/babel-plugin/prop-tracker.ts`
- [ ] Implement `PropTracker` class
- [ ] Implement `createArrowFunctionVisitor()` method
- [ ] Implement `createFunctionVisitor()` method
- [ ] Implement `getCurrentProps()` method
- [ ] Extract common param extraction logic
- [ ] Write tests in `tests/sdk/transpiler/unit/prop-tracker.test.ts`

**Acceptance Criteria:**

- No code duplication
- Handles all param patterns (simple, destructured)
- Proper stack management

### 3.3 Create JSX Transformer ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/babel-plugin/jsx-transformer.ts`
- [ ] Implement `JSXTransformer` class
- [ ] Implement `createJSXVisitor()` method
- [ ] Integrate with JSXProcessor
- [ ] Write tests in `tests/sdk/transpiler/unit/jsx-transformer.test.ts`

**Acceptance Criteria:**

- Clean visitor creation
- Proper integration with JSXProcessor
- Error handling

### 3.4 Create Component Collector ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/babel-plugin/component-collector.ts`
- [ ] Implement `ComponentCollector` class
- [ ] Implement `createDefaultExportVisitor()` method
- [ ] Implement `createNamedExportVisitor()` method
- [ ] Implement `createHelperFunctionVisitor()` method
- [ ] Implement `getComponents()` method
- [ ] Write tests in `tests/sdk/transpiler/unit/component-collector.test.ts`

**Acceptance Criteria:**

- All export patterns handled
- Clean component metadata output
- No code duplication

---

## Phase 4: Refactor Main Transpiler (5 days)

### 4.1 Create Parser Wrapper ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/core/parser.ts`
- [ ] Implement `Parser` class
- [ ] Implement `parse(source)` method with error handling
- [ ] Implement `traverse(ast, visitor)` method
- [ ] Write tests in `tests/sdk/transpiler/unit/parser.test.ts`

**Acceptance Criteria:**

- Clean error handling
- Proper typing for Babel types
- Easy to mock

### 4.2 Create Scenario Assembler ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/core/scenario-assembler.ts`
- [ ] Implement `ScenarioAssembler` class
- [ ] Implement `assemble(input)` method
- [ ] Implement `validateComponents(components)` method
- [ ] Implement `findMainComponent(components)` method
- [ ] Implement `extractNamedComponents(components)` method
- [ ] Implement `generateKey()` method
- [ ] Write tests in `tests/sdk/transpiler/unit/scenario-assembler.test.ts`

**Acceptance Criteria:**

- Clear validation rules
- Good error messages
- Predictable key generation

### 4.3 Create Transpiler Service ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/transpiler-service.ts`
- [ ] Implement `TranspilerService` class
- [ ] Implement `transpile(jsxString)` method
- [ ] Wire up all dependencies
- [ ] Implement configuration support
- [ ] Write tests in `tests/sdk/transpiler/integration/transpiler-service.test.ts`

**Acceptance Criteria:**

- Clean orchestration
- Dependency injection
- Configuration support
- Integration tests pass

### 4.4 Update Entry Point ⬜

- [ ] Refactor `apps/render-cli/src/sdk/transpiler/transpiler.ts`
- [ ] Create thin wrapper around TranspilerService
- [ ] Implement `createTranspilerService(config)` factory
- [ ] Maintain backward compatibility
- [ ] Add feature flag for old/new implementation

**Acceptance Criteria:**

- Simple, clean public API
- No breaking changes
- Easy to switch between implementations

---

## Phase 5: Error Handling & Validation (3 days)

### 5.1 Create Error Hierarchy ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/errors.ts`
- [ ] Implement `TranspilerError` base class
- [ ] Implement `ParseError` class
- [ ] Implement `ComponentNotFoundError` class
- [ ] Implement `InvalidExportError` class
- [ ] Implement `ValidationError` class
- [ ] Add error context support

**Acceptance Criteria:**

- Clear error hierarchy
- Rich context information
- Good error messages

### 5.2 Create Validator ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/core/validator.ts`
- [ ] Implement `TranspilerValidator` class
- [ ] Implement `validateJsonNode(node, definition)` method
- [ ] Implement `validateScenario(scenario)` method
- [ ] Write tests in `tests/sdk/transpiler/unit/validator.test.ts`

**Acceptance Criteria:**

- Comprehensive validation rules
- Clear violation messages
- Easy to extend

### 5.3 Add Result Wrapper (Optional) ⬜

- [ ] Create `apps/render-cli/src/sdk/transpiler/result.ts`
- [ ] Implement `Result<T, E>` type
- [ ] Implement `Success<T>` class
- [ ] Implement `Failure<E>` class
- [ ] Add `transpileSafe()` function

**Acceptance Criteria:**

- Type-safe error handling
- No throwing in safe variant

---

## Phase 6: Testing Infrastructure (5 days)

### 6.1 Set Up Test Infrastructure ⬜

- [ ] Create `apps/render-cli/vitest.config.ts`
- [ ] Configure coverage reporting
- [ ] Set up test scripts in package.json
- [ ] Create test directory structure

**Acceptance Criteria:**

- Tests run fast (< 5s)
- Coverage reporting works
- Watch mode works

### 6.2 Create Test Utilities ⬜

- [ ] Create `tests/sdk/transpiler/test-utils.ts`
- [ ] Implement `createMockComponentRegistry(components)`
- [ ] Implement `createTestContext(overrides)`
- [ ] Implement `createTestConfig(overrides)`
- [ ] Add assertion helpers

**Acceptance Criteria:**

- Easy to create test data
- Reusable across tests
- Well documented

### 6.3 Create Test Fixtures ⬜

- [ ] Create `tests/sdk/transpiler/fixtures/simple.fixture.tsx`
- [ ] Create `tests/sdk/transpiler/fixtures/complex.fixture.tsx`
- [ ] Create `tests/sdk/transpiler/fixtures/edge-cases.fixture.tsx`
- [ ] Create `tests/sdk/transpiler/fixtures/errors.fixture.tsx`
- [ ] Create expected output JSON files

**Acceptance Criteria:**

- Cover all common patterns
- Cover edge cases
- Cover error cases

### 6.4 Write Unit Tests ⬜

- [ ] Tests for ast-utils (20+ tests)
- [ ] Tests for value-converter (20+ tests)
- [ ] Tests for component-registry (10+ tests)
- [ ] Tests for jsx-processor (20+ tests)
- [ ] Tests for export-analyzer (15+ tests)
- [ ] Tests for scenario-assembler (15+ tests)
- [ ] Tests for validator (15+ tests)
- [ ] Tests for parser (10+ tests)

**Target:** 90%+ coverage for each module

### 6.5 Write Integration Tests ⬜

- [ ] Tests for transpiler-service (15+ tests)
- [ ] Tests for babel-plugin (10+ tests)
- [ ] Tests for prop-tracker (10+ tests)
- [ ] Tests for component-collector (10+ tests)

**Target:** All integration scenarios covered

### 6.6 Write E2E Tests ⬜

- [ ] Test transpiling cart.tsx
- [ ] Test transpiling simple components
- [ ] Test transpiling complex nested structures
- [ ] Test error scenarios
- [ ] Test edge cases

**Target:** 100% of use cases covered

---

## Phase 7: Documentation & Examples (3 days)

### 7.1 Architecture Documentation ⬜

- [ ] Document in `apps/render-cli/src/sdk/transpiler/README.md`
- [ ] Add architecture overview
- [ ] Add component descriptions
- [ ] Add data flow diagrams
- [ ] Add extension points documentation

### 7.2 API Documentation ⬜

- [ ] Document public API in `API.md`
- [ ] Add usage examples
- [ ] Add configuration options
- [ ] Add error handling examples
- [ ] Add extension examples

### 7.3 Migration Guide ⬜

- [ ] Create `MIGRATION.md`
- [ ] Document breaking changes (if any)
- [ ] Document migration steps
- [ ] Add before/after examples

### 7.4 Code Comments ⬜

- [ ] Add JSDoc to all public interfaces
- [ ] Add JSDoc to all public methods
- [ ] Add inline comments for complex logic
- [ ] Add examples in comments

---

## Migration & Cleanup

### Migration Steps ⬜

- [ ] Verify all tests pass with new implementation
- [ ] Test with cart.tsx
- [ ] Test with all existing fixtures
- [ ] Performance comparison
- [ ] Switch default to new implementation
- [ ] Run in production for monitoring period
- [ ] Remove old implementation
- [ ] Clean up unused dependencies

### Final Verification ⬜

- [ ] All original tests pass
- [ ] New tests pass (90%+ coverage)
- [ ] Performance is acceptable
- [ ] Memory usage is acceptable
- [ ] Error messages are clear
- [ ] Documentation is complete
- [ ] Code review completed
- [ ] Sign-off from team

---

## Risks & Mitigation

| Risk                              | Impact | Probability | Mitigation                                           |
| --------------------------------- | ------ | ----------- | ---------------------------------------------------- |
| Breaking changes in output format | High   | Medium      | Compare outputs byte-by-byte with old implementation |
| Performance regression            | Medium | Low         | Benchmark before/after, optimize if needed           |
| Increased complexity              | Medium | Medium      | Keep modules small, well-documented                  |
| Time overrun                      | Medium | Medium      | Prioritize phases, cut optional features if needed   |
| Babel API changes                 | Low    | Low         | Pin Babel versions, test thoroughly                  |

---

## Notes & Decisions

### Key Decisions

- **Decision:** Use class-based approach for services

  - **Rationale:** Better dependency injection, easier to extend
  - **Date:** TBD

- **Decision:** Keep Result wrapper optional
  - **Rationale:** Can add later if needed, not critical for initial refactor
  - **Date:** TBD

### Open Questions

- Should we support async transformations?
- Should we add plugin system for custom transformers?
- Should we support source maps?

---

## Daily Log

### Day 1 - TBD

- [ ] Set up test infrastructure
- [ ] Create type definitions
- [ ] Start AST utilities module

### Day 2 - TBD

- [ ] Complete AST utilities
- [ ] Start value converter
- [ ] Start component registry

### Day 3 - TBD

- [ ] Complete value converter
- [ ] Complete component registry
- [ ] Start JSX processor

... (continue for remaining days)

---

## Retrospective (After Completion)

### What Went Well

- TBD

### What Could Be Improved

- TBD

### Lessons Learned

- TBD

### Metrics

- Lines of code added: TBD
- Lines of code removed: TBD
- Test coverage achieved: TBD%
- Time taken: TBD days
- Bugs found: TBD
- Performance impact: TBD
