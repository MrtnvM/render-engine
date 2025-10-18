/**
 * Transpiler error types and error reporting utilities
 */

import type { Node } from '@babel/types'

/**
 * Structured error for transpiler failures
 */
export class TranspilerError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly location?: {
      line?: number
      column?: number
      file?: string
    },
    public readonly suggestion?: string,
    public readonly relatedDocs?: string,
  ) {
    super(message)
    this.name = 'TranspilerError'
  }

  /**
   * Format error for display in terminal/IDE
   */
  format(): string {
    let output = `Error [${this.code}]: ${this.message}\n`

    if (this.location) {
      output += `  --> ${this.location.file || '<input>'}:${this.location.line}:${this.location.column}\n`
    }

    if (this.suggestion) {
      output += `\nSuggestion: ${this.suggestion}\n`
    }

    if (this.relatedDocs) {
      output += `\nDocumentation: ${this.relatedDocs}\n`
    }

    return output
  }
}

/**
 * Error codes for different transpiler failures
 */
export enum TranspilerErrorCode {
  // External references
  EXTERNAL_VARIABLE_REFERENCE = 'E001',
  EXTERNAL_FUNCTION_REFERENCE = 'E002',

  // Unsupported patterns
  ASYNC_HANDLER = 'E010',
  COMPLEX_LOOP = 'E011',
  UNKNOWN_FUNCTION = 'E012',
  UNSUPPORTED_STATEMENT = 'E013',
  UNSUPPORTED_EXPRESSION = 'E014',

  // Store operations
  INVALID_STORE_OPERATION = 'E020',
  MISSING_STORE_REFERENCE = 'E021',
  INVALID_KEY_PATH = 'E022',

  // Conditions
  INVALID_CONDITION = 'E030',
  UNSUPPORTED_COMPARISON = 'E031',

  // General
  PARSE_ERROR = 'E900',
  INTERNAL_ERROR = 'E999',
}

/**
 * Create error for external variable reference
 */
export function createExternalVariableError(variableName: string, node: Node): TranspilerError {
  return new TranspilerError(
    TranspilerErrorCode.EXTERNAL_VARIABLE_REFERENCE,
    `Cannot reference external variable '${variableName}' from enclosing scope`,
    getLocation(node),
    `Use store values instead:
  store.get('${variableName}')

Or define the value inline as a literal.`,
    'https://docs.render-engine.com/actions/variable-scope',
  )
}

/**
 * Create error for async handlers
 */
export function createAsyncHandlerError(node: Node): TranspilerError {
  return new TranspilerError(
    TranspilerErrorCode.ASYNC_HANDLER,
    'Async handlers are not supported',
    getLocation(node),
    `Use 'apiRequest' action for API calls:

import { apiRequest } from '@render-engine/admin-sdk/actions'

apiRequest({
  endpoint: '/api/user',
  method: 'GET',
  onSuccess: {
    kind: 'sequence',
    actions: [/* actions to run on success */]
  }
})`,
    'https://docs.render-engine.com/actions/api-requests',
  )
}

/**
 * Create error for complex loops
 */
export function createComplexLoopError(node: Node): TranspilerError {
  return new TranspilerError(
    TranspilerErrorCode.COMPLEX_LOOP,
    'Dynamic loops are not supported',
    getLocation(node),
    `Use array literals or batch operations instead:

// Instead of:
for (let i = 0; i < items.length; i++) {
  store.set(\`item_\${i}\`, items[i])
}

// Use:
store.merge('items', { /* object with all items */ })`,
    'https://docs.render-engine.com/actions/loops',
  )
}

/**
 * Create error for unknown function calls
 */
export function createUnknownFunctionError(functionName: string, node: Node): TranspilerError {
  return new TranspilerError(
    TranspilerErrorCode.UNKNOWN_FUNCTION,
    `Unknown function '${functionName}'. Only predefined actions are allowed`,
    getLocation(node),
    `Available actions:
- store.set(), store.get(), store.remove(), store.merge()
- navigate.push(), navigate.pop(), navigate.replace()
- ui.showToast(), ui.showAlert()
- system.share(), system.openUrl(), system.haptic()

Import them from '@render-engine/admin-sdk/actions'`,
    'https://docs.render-engine.com/actions/available-actions',
  )
}

/**
 * Create error for unsupported statements
 */
export function createUnsupportedStatementError(statementType: string, node: Node): TranspilerError {
  return new TranspilerError(
    TranspilerErrorCode.UNSUPPORTED_STATEMENT,
    `Unsupported statement type: ${statementType}`,
    getLocation(node),
    `Supported patterns:
- Variable declarations: const x = ...
- If statements: if (condition) { ... }
- Expression statements: store.set(...), navigate.push(...)
- Return statements: return value

See documentation for full list of supported patterns.`,
    'https://docs.render-engine.com/actions/supported-patterns',
  )
}

/**
 * Create error for unsupported expressions
 */
export function createUnsupportedExpressionError(expressionType: string, node: Node): TranspilerError {
  return new TranspilerError(
    TranspilerErrorCode.UNSUPPORTED_EXPRESSION,
    `Unsupported expression type: ${expressionType}`,
    getLocation(node),
    `Supported expressions:
- Literals: strings, numbers, booleans, null
- Binary operations: +, -, *, /, >, <, ===, etc.
- Member access: object.property
- Function calls: store.set(), navigate.push(), etc.

Complex expressions may need to be simplified.`,
    'https://docs.render-engine.com/actions/expressions',
  )
}

/**
 * Create error for invalid store operation
 */
export function createInvalidStoreOperationError(message: string, node: Node): TranspilerError {
  return new TranspilerError(
    TranspilerErrorCode.INVALID_STORE_OPERATION,
    message,
    getLocation(node),
    undefined,
    'https://docs.render-engine.com/actions/store-operations',
  )
}

/**
 * Create error for invalid condition
 */
export function createInvalidConditionError(message: string, node: Node): TranspilerError {
  return new TranspilerError(
    TranspilerErrorCode.INVALID_CONDITION,
    message,
    getLocation(node),
    `Supported condition operators:
- Comparison: ===, !==, >, >=, <, <=
- Logical: &&, ||, !
- String methods: .includes(), .startsWith(), .endsWith()`,
    'https://docs.render-engine.com/actions/conditions',
  )
}

/**
 * Extract location from Babel node
 */
function getLocation(node: Node): { line?: number; column?: number } | undefined {
  if (node.loc) {
    return {
      line: node.loc.start.line,
      column: node.loc.start.column,
    }
  }
  return undefined
}

/**
 * Check if error is a TranspilerError
 */
export function isTranspilerError(error: unknown): error is TranspilerError {
  return error instanceof TranspilerError
}
