/**
 * Comprehensive type definitions for the transpiler system
 */

import type { File, JSXElement as BabelJSXElement } from '@babel/types'

// ===== Core Configuration Types =====

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

export interface Logger {
  debug(...args: unknown[]): void
  info(...args: unknown[]): void
  warn(...args: unknown[]): void
  error(...args: unknown[]): void
}

// ===== Processing Context Types =====

export interface ProcessingContext {
  /** Component props available in current scope */
  componentProps: Set<string>
  /** Parent component type (optional) */
  parentComponent?: string
  /** Nesting depth */
  depth: number
}

export interface ConversionContext {
  /** Component props available in current scope */
  componentProps: Set<string>
  /** Whether to throw on unsupported types */
  strictMode: boolean
}

// ===== Component Definition Types =====

export interface ComponentDefinition {
  /** Component name/type */
  readonly name: string
  /** Default styles applied to this component */
  readonly defaultStyles: Record<string, unknown>
  /** Props supported by this component */
  readonly supportedProps: readonly string[]
  /** Whether this component can have children */
  readonly childrenAllowed: boolean
  /** Whether text children are allowed */
  readonly textChildrenAllowed: boolean
}

export interface ComponentRegistry {
  registerComponent(definition: ComponentDefinition): void
  isRegistered(name: string): boolean
  getDefinition(name: string): ComponentDefinition
  getDefaultStyles(name: string): Record<string, unknown>
  getAllComponentNames(): string[]
  supportsProp(componentName: string, propName: string): boolean
}

// ===== AST and JSX Types =====

export interface ASTNode {
  readonly type: string
  readonly value?: unknown
  readonly name?: string
  readonly expression?: ASTNode
  readonly properties?: readonly ObjectProperty[]
  readonly key?: ASTNode
  readonly body?: ASTNode | BlockStatement
  readonly params?: readonly ASTNode[]
  readonly declarations?: readonly VariableDeclarator[]
  readonly arguments?: readonly ASTNode[]
}

export interface ObjectProperty {
  readonly type: 'ObjectProperty'
  readonly key: ASTNode
  readonly value: ASTNode
}

export interface BlockStatement {
  readonly type: 'BlockStatement'
  readonly body: readonly ASTNode[]
}

export interface VariableDeclarator {
  readonly type: 'VariableDeclarator'
  readonly id?: ASTNode
  readonly init?: ASTNode
}

export interface JSXElement {
  readonly type: 'JSXElement'
  readonly openingElement: JSXOpeningElement
  readonly children: readonly JSXChild[]
}

export interface JSXOpeningElement {
  readonly name: JSXElementName
  readonly attributes: readonly JSXAttribute[]
}

export interface JSXElementName {
  readonly type: 'JSXIdentifier'
  readonly name: string
}

export interface JSXAttribute {
  readonly type: 'JSXAttribute'
  readonly name: JSXAttributeName
  readonly value?: ASTNode
}

export interface JSXAttributeName {
  readonly name: string
}

export interface JSXText {
  readonly type: 'JSXText'
  readonly value: string
}

export interface JSXExpressionContainer {
  readonly type: 'JSXExpressionContainer'
  readonly expression: ASTNode
}

export type JSXChild = JSXElement | JSXText | JSXExpressionContainer

// ===== Literal Types =====

export interface StringLiteral {
  readonly type: 'StringLiteral'
  readonly value: string
}

export interface NumericLiteral {
  readonly type: 'NumericLiteral'
  readonly value: number
}

export interface BooleanLiteral {
  readonly type: 'BooleanLiteral'
  readonly value: boolean
}

export interface NullLiteral {
  readonly type: 'NullLiteral'
}

export interface Identifier {
  readonly type: 'Identifier'
  readonly name: string
}

export type LiteralNode = StringLiteral | NumericLiteral | BooleanLiteral | NullLiteral

export interface ObjectExpression {
  readonly type: 'ObjectExpression'
  readonly properties: readonly ObjectProperty[]
}

// ===== JSON Node Types =====

export interface JsonNode {
  readonly type: string
  readonly style?: Record<string, unknown>
  readonly properties?: Record<string, unknown>
  readonly data?: Record<string, unknown>
  readonly children?: readonly JsonNode[]
}

export interface NodeAttributes {
  readonly style: Record<string, unknown>
  readonly properties: Record<string, unknown>
  readonly data: Record<string, unknown>
}

// ===== Component Metadata Types =====

export interface ComponentInfo {
  readonly name: string
  readonly exportType: ExportType
  readonly jsxElement: JSXElement
  readonly params: ReadonlySet<string>
}

export type ExportType = 'default' | 'named' | 'helper'

export interface ComponentMetadata {
  readonly name: string
  readonly exportType: ExportType
  readonly jsonNode: JsonNode
}

// ===== Transpiler Result Types =====

export interface TranspiledScenario {
  readonly key: string
  readonly version: string
  readonly main: JsonNode
  readonly components: Record<string, JsonNode>
}

export interface AssemblyInput {
  readonly key: string | null
  readonly components: readonly ComponentMetadata[]
  readonly metadata: {
    readonly version: string
  }
}

// ===== Validation Types =====

export interface ValidationResult {
  readonly valid: boolean
  readonly violations: readonly ValidationViolation[]
}

export interface ValidationViolation {
  readonly field: string
  readonly message: string
  readonly severity?: 'error' | 'warning'
}

// ===== Error Types =====

export interface ErrorContext {
  readonly [key: string]: unknown
}

// ===== Value Conversion Types =====

export type Primitive = string | number | boolean | null

export interface PropReference {
  readonly type: 'prop'
  readonly key: string
}

export type ConvertedValue = Primitive | Record<string, unknown> | PropReference

// ===== Plugin Types =====

export interface PluginConfig {
  readonly jsxProcessor: JSXProcessor
  readonly allowUnknownComponents: boolean
}

export interface BabelPlugin {
  readonly visitor: Record<string, unknown>
  getCollectedComponents(): ComponentMetadata[]
}

export interface JSXProcessor {
  processElement(element: JSXElement, context: ProcessingContext): JsonNode
  processAttributes(attributes: readonly JSXAttribute[], context: ProcessingContext): NodeAttributes
  processChildren(children: readonly JSXChild[], context: ProcessingContext): JsonNode[]
  processTextContent(text: JSXText, parentType: string): string | null
}

export interface ValueConverter {
  convert(node: ASTNode | null | undefined, context: ConversionContext): ConvertedValue
}

export interface Parser {
  parse(source: string): File
  traverse(ast: File, visitor: Record<string, unknown>): Promise<void>
}

export interface ExportAnalyzer {
  extractScenarioKey(ast: File): string | null
  analyzeDefaultExport(node: ASTNode): ComponentInfo | null
  analyzeNamedExport(node: ASTNode): ComponentInfo[]
  analyzeHelperFunction(node: ASTNode): ComponentInfo | null
}

export interface ScenarioAssembler {
  assemble(input: AssemblyInput): TranspiledScenario
}

export interface TranspilerValidator {
  validateJsonNode(node: JsonNode, definition: ComponentDefinition): ValidationResult
  validateScenario(scenario: TranspiledScenario): ValidationResult
}

// ===== Result Wrapper Types (Optional) =====

export type Result<T, E = Error> = Success<T> | Failure<E>

export interface Success<T> {
  readonly success: true
  readonly value: T
}

export interface Failure<E> {
  readonly success: false
  readonly error: E
}
