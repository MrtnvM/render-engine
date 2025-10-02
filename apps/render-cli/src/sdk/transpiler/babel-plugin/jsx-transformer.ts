/**
 * JSXTransformer class for transforming JSX in Babel AST.
 * Creates visitors and coordinates with JSXProcessor.
 */

import type { JSXProcessor, ProcessingContext } from '../types.js'
import { isJSXElement } from '../ast/type-guards.js'
import { createProcessingContext } from '../jsx/jsx-processor.js'
import { wrapError } from '../errors.js'
import type { PropTracker } from './prop-tracker.js'

/**
 * Transforms JSX elements in the AST using JSXProcessor.
 * Coordinates with PropTracker to provide component props context.
 */
export class JSXTransformer {
  constructor(
    private readonly jsxProcessor: JSXProcessor,
    private readonly propTracker: PropTracker
  ) {}

  /**
   * Create JSX visitor for Babel traverse
   */
  createJSXVisitor(): {
    exit: (path: any) => void
  } {
    return {
      exit: (path: any) => {
        try {
          const node = path.node

          if (!isJSXElement(node)) {
            return
          }

          // Get current component props from prop tracker
          const componentProps = this.propTracker.getCurrentProps()

          // Create processing context
          const context: ProcessingContext = createProcessingContext({
            componentProps,
            depth: this.propTracker.getScopeDepth(),
          })

          // Process the JSX element
          const jsonNode = this.jsxProcessor.processElement(node, context)

          // Attach the JSON to the AST node for parent processing
          ;(path.node as any).json = jsonNode

          // Store component name for component collection
          ;(path.node as any).componentName = node.openingElement.name.name
        } catch (error) {
          throw wrapError(error, `Failed to transform JSX element`)
        }
      },
    }
  }

  /**
   * Create JSX expression container visitor (for dynamic content)
   */
  createJSXExpressionVisitor(): {
    enter: (path: any) => void
  } {
    return {
      enter: (path: any) => {
        // This could be used to handle JSX expression containers specially
        // For now, we handle them in the main JSX processing
      },
    }
  }

  /**
   * Create JSX text visitor (for text content)
   */
  createJSXTextVisitor(): {
    enter: (path: any) => void
  } {
    return {
      enter: (path: any) => {
        // Text nodes are handled by the JSXProcessor when processing children
        // This visitor could be used for special text processing if needed
      },
    }
  }

  /**
   * Get transformation statistics
   */
  getTransformStats(): {
    transformedElements: number
    currentScopeDepth: number
    availableProps: string[]
  } {
    return {
      transformedElements: 0, // This would need to be tracked if needed
      currentScopeDepth: this.propTracker.getScopeDepth(),
      availableProps: Array.from(this.propTracker.getCurrentProps()).sort(),
    }
  }

  /**
   * Reset transformation state (useful for testing)
   */
  reset(): void {
    this.propTracker.reset()
  }
}

/**
 * Create JSX transformer with dependencies
 */
export function createJSXTransformer(
  jsxProcessor: JSXProcessor,
  propTracker: PropTracker
): JSXTransformer {
  return new JSXTransformer(jsxProcessor, propTracker)
}