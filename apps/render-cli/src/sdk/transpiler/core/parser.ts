/**
 * Parser wrapper for Babel parsing functionality.
 * Provides clean error handling and type-safe interface.
 */

import { parse } from '@babel/parser'
import type { File } from '@babel/types'
import type { Parser as IParser } from '../types.js'
import { ParseError, wrapError } from '../errors.js'

/**
 * Parser wrapper that provides clean error handling and consistent interface.
 */
export class Parser implements IParser {
  /**
   * Parse JSX/TypeScript source code to AST
   * @throws {ParseError} if parsing fails
   */
  parse(source: string): File {
    try {
      return parse(source, {
        sourceType: 'module',
        plugins: [
          'jsx',
          'typescript',
          // Additional plugins for better compatibility
          'decorators-legacy',
          'classProperties',
          'objectRestSpread',
          'functionBind',
          'exportDefaultFrom',
          'exportNamespaceFrom',
          'dynamicImport',
          'nullishCoalescingOperator',
          'optionalChaining',
          'logicalAssignment',
        ],
        // Parse in strict mode by default
        strictMode: true,
        // Allow hash-bang at start of files
        allowHashBang: true,
        // Allow return outside functions (for module exports)
        allowReturnOutsideFunction: true,
      })
    } catch (error: any) {
      // Extract useful information from Babel parse errors
      const context: any = {
        source: this.truncateSource(source),
      }

      if (error.loc) {
        context.line = error.loc.line
        context.column = error.loc.column
        context.pos = error.pos
      }

      if (error.reasonCode) {
        context.reasonCode = error.reasonCode
      }

      throw new ParseError(error.message || 'Failed to parse source code', context)
    }
  }

  /**
   * Traverse AST with visitor pattern
   */
  async traverse(ast: File, visitor: Record<string, unknown>): Promise<void> {
    try {
      // Dynamic import to handle CommonJS/ESM compatibility
      const traverseModule = await import('@babel/traverse')
      const traverse = (traverseModule.default as any).default || traverseModule.default

      traverse(ast, visitor)
    } catch (error) {
      throw wrapError(error, 'AST traversal failed')
    }
  }

  /**
   * Validate that a file is a valid AST
   */
  isValidAST(ast: unknown): ast is File {
    return (
      typeof ast === 'object' &&
      ast !== null &&
      (ast as any).type === 'File' &&
      Array.isArray((ast as any).body)
    )
  }

  /**
   * Get source location information from AST node
   */
  getSourceLocation(node: any): { line: number; column: number } | null {
    if (node?.loc?.start) {
      return {
        line: node.loc.start.line,
        column: node.loc.start.column,
      }
    }
    return null
  }

  /**
   * Truncate source code for error messages (to avoid huge logs)
   */
  private truncateSource(source: string, maxLength = 200): string {
    if (source.length <= maxLength) {
      return source
    }

    return source.slice(0, maxLength) + '...'
  }

  /**
   * Extract snippet around error location
   */
  getErrorSnippet(source: string, line: number, column: number, contextLines = 2): string {
    const lines = source.split('\n')
    const startLine = Math.max(0, line - contextLines - 1)
    const endLine = Math.min(lines.length - 1, line + contextLines - 1)

    const snippet = lines
      .slice(startLine, endLine + 1)
      .map((sourceLine, index) => {
        const lineNumber = startLine + index + 1
        const isErrorLine = lineNumber === line
        const prefix = isErrorLine ? '>' : ' '
        const formattedLineNumber = lineNumber.toString().padStart(3)
        
        let result = `${prefix} ${formattedLineNumber} | ${sourceLine}`
        
        // Add error pointer for the specific column
        if (isErrorLine && column > 0) {
          const pointer = ' '.repeat(8 + column) + '^'
          result += '\n' + pointer
        }
        
        return result
      })
      .join('\n')

    return snippet
  }
}

/**
 * Create a default parser instance
 */
export function createParser(): Parser {
  return new Parser()
}