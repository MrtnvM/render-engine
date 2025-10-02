/**
 * PropTracker class for tracking function parameters across scopes.
 * Handles arrow functions, function declarations, and destructured parameters.
 */

import type { ASTNode } from '../types.js'
import { extractFunctionParams } from '../ast/ast-utils.js'

/**
 * Tracks component props (function parameters) across different scopes.
 * Maintains a stack of prop sets for nested function scopes.
 */
export class PropTracker {
  private readonly propsStack: Set<string>[] = []

  /**
   * Create visitor for arrow function expressions
   */
  createArrowFunctionVisitor(): {
    enter: (path: any) => void
    exit: (path: any) => void
  } {
    return {
      enter: (path: any) => {
        const props = this.extractParamsFromNode(path.node)
        this.propsStack.push(props)
      },
      exit: (path: any) => {
        this.propsStack.pop()
      },
    }
  }

  /**
   * Create visitor for function declarations
   */
  createFunctionVisitor(): {
    enter: (path: any) => void
    exit: (path: any) => void
  } {
    return {
      enter: (path: any) => {
        const props = this.extractParamsFromNode(path.node)
        this.propsStack.push(props)
      },
      exit: (path: any) => {
        this.propsStack.pop()
      },
    }
  }

  /**
   * Get current component props in scope
   */
  getCurrentProps(): Set<string> {
    if (this.propsStack.length === 0) {
      return new Set()
    }
    return this.propsStack[this.propsStack.length - 1]
  }

  /**
   * Get all props from all scopes (merged)
   */
  getAllProps(): Set<string> {
    const allProps = new Set<string>()
    for (const props of this.propsStack) {
      for (const prop of props) {
        allProps.add(prop)
      }
    }
    return allProps
  }

  /**
   * Check if a prop is available in current or parent scopes
   */
  hasProp(propName: string): boolean {
    for (let i = this.propsStack.length - 1; i >= 0; i--) {
      if (this.propsStack[i].has(propName)) {
        return true
      }
    }
    return false
  }

  /**
   * Get current scope depth
   */
  getScopeDepth(): number {
    return this.propsStack.length
  }

  /**
   * Reset the props stack (useful for testing)
   */
  reset(): void {
    this.propsStack.length = 0
  }

  /**
   * Extract parameter names from AST node
   */
  private extractParamsFromNode(node: ASTNode): Set<string> {
    return extractFunctionParams(node)
  }

  /**
   * Get props at specific scope level (0 = outermost)
   */
  getPropsAtLevel(level: number): Set<string> | null {
    if (level < 0 || level >= this.propsStack.length) {
      return null
    }
    return this.propsStack[level]
  }

  /**
   * Check if we're currently in a function scope
   */
  isInFunctionScope(): boolean {
    return this.propsStack.length > 0
  }

  /**
   * Get debug information about current state
   */
  getDebugInfo(): {
    scopeDepth: number
    totalProps: number
    propsPerScope: Array<{ level: number; props: string[] }>
  } {
    return {
      scopeDepth: this.propsStack.length,
      totalProps: this.getAllProps().size,
      propsPerScope: this.propsStack.map((props, level) => ({
        level,
        props: Array.from(props).sort(),
      })),
    }
  }
}