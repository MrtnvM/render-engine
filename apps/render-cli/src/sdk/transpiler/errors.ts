/**
 * Error hierarchy for the transpiler system
 */

import type { ErrorContext, ValidationViolation } from './types.js'

/**
 * Base error class for all transpiler errors
 */
export class TranspilerError extends Error {
  public readonly context?: ErrorContext

  constructor(message: string, context?: ErrorContext) {
    super(message)
    this.name = 'TranspilerError'
    this.context = context
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TranspilerError)
    }
  }
}

/**
 * Error thrown when JSX parsing fails
 */
export class ParseError extends TranspilerError {
  constructor(message: string, context?: { source?: string; line?: number; column?: number }) {
    super(`Parse error: ${message}`, context)
    this.name = 'ParseError'
  }
}

/**
 * Error thrown when a component is not found in the registry
 */
export class ComponentNotFoundError extends TranspilerError {
  public readonly componentName: string

  constructor(componentName: string, context?: { availableComponents?: string[] }) {
    const message = `Component '${componentName}' not found in registry`
    super(message, { componentName, ...context })
    this.name = 'ComponentNotFoundError'
    this.componentName = componentName
  }
}

/**
 * Error thrown when component registration fails
 */
export class RegistrationError extends TranspilerError {
  constructor(message: string, context?: ErrorContext) {
    super(`Component registration error: ${message}`, context)
    this.name = 'RegistrationError'
  }
}

/**
 * Error thrown when export analysis fails
 */
export class InvalidExportError extends TranspilerError {
  constructor(message: string, context?: ErrorContext) {
    super(`Invalid export: ${message}`, context)
    this.name = 'InvalidExportError'
  }
}

/**
 * Error thrown when AST node conversion fails
 */
export class ConversionError extends TranspilerError {
  public readonly nodeType?: string

  constructor(message: string, context?: ErrorContext & { nodeType?: string }) {
    super(`Conversion error: ${message}`, context)
    this.name = 'ConversionError'
    this.nodeType = context?.nodeType as string
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends TranspilerError {
  public readonly violations: readonly ValidationViolation[]

  constructor(message: string, violations: ValidationViolation[], context?: ErrorContext) {
    super(message, { violations, ...context })
    this.name = 'ValidationError'
    this.violations = violations
  }
}

/**
 * Error thrown when scenario assembly fails
 */
export class AssemblyError extends TranspilerError {
  constructor(message: string, context?: ErrorContext) {
    super(`Assembly error: ${message}`, context)
    this.name = 'AssemblyError'
  }
}

/**
 * Helper function to check if an error is a transpiler error
 */
export function isTranspilerError(error: unknown): error is TranspilerError {
  return error instanceof TranspilerError
}

/**
 * Helper function to wrap unknown errors as TranspilerErrors
 */
export function wrapError(error: unknown, message = 'Unknown error occurred'): TranspilerError {
  if (isTranspilerError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new TranspilerError(`${message}: ${error.message}`, {
      originalError: error.message,
      originalStack: error.stack,
    })
  }

  return new TranspilerError(`${message}: ${String(error)}`, {
    originalError: String(error),
  })
}

/**
 * Helper function to create error context from AST node
 */
export function createNodeContext(node: any): ErrorContext {
  return {
    nodeType: node?.type,
    loc: node?.loc && {
      start: node.loc.start,
      end: node.loc.end,
    },
  }
}