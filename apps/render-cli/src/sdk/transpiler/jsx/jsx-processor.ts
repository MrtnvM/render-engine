/**
 * JSXProcessor class for converting JSX elements to JSON nodes.
 * Handles JSX processing logic with dependency injection for testability.
 */

import type {
  JSXElement,
  JSXChild,
  JSXAttribute,
  JSXText,
  JsonNode,
  NodeAttributes,
  ProcessingContext,
  ComponentRegistry,
  ValueConverter,
  ConversionContext,
  JSXProcessor as IJSXProcessor,
} from '../types.js'
import { isJSXElement, isJSXText, isJSXExpressionContainer } from '../ast/type-guards.js'
import { ConversionError, ComponentNotFoundError } from '../errors.js'
import { createConversionContext } from '../ast/value-converter.js'

/**
 * JSXProcessor handles the conversion of JSX elements to JSON nodes.
 * Uses dependency injection for ComponentRegistry and ValueConverter.
 */
export class JSXProcessor implements IJSXProcessor {
  constructor(
    private readonly registry: ComponentRegistry,
    private readonly valueConverter: ValueConverter,
  ) {}

  /**
   * Process a JSX element and convert it to a JSON node
   */
  processElement(element: JSXElement, context: ProcessingContext): JsonNode {
    const componentName = element.openingElement.name.name

    // Check if component is registered in the predefined registry
    const isRegistered = this.registry.isRegistered(componentName)

    // For registered components, get their definition
    // For unregistered components (user-defined), use default configuration
    const componentDefinition = isRegistered
      ? this.registry.getDefinition(componentName)
      : {
          name: componentName,
          defaultStyles: {},
          supportedProps: [],
          childrenAllowed: true,
          textChildrenAllowed: false,
        }

    // Process attributes
    const attributes = this.processAttributes(element.openingElement.attributes, context)

    // Process children
    let processedChildren: JsonNode[] = []
    if (componentDefinition.childrenAllowed && element.children.length > 0) {
      processedChildren = this.processChildren(element.children, {
        ...context,
        parentComponent: componentName,
        depth: context.depth + 1,
      })
    }

    // Create JSON node with all attributes merged
    const jsonNode: JsonNode = {
      type: componentName,
      style: { ...componentDefinition.defaultStyles, ...attributes.style },
      properties: { ...attributes.properties },
      data: { ...attributes.data },
      children: processedChildren,
    }

    // Clean up empty objects
    const cleanedNode = this.cleanupEmptyProperties(jsonNode)

    return cleanedNode
  }

  /**
   * Process JSX attributes and convert them to node attributes
   */
  processAttributes(attributes: readonly JSXAttribute[], context: ProcessingContext): NodeAttributes {
    const result: NodeAttributes = {
      style: {},
      properties: {},
      data: {},
    }

    const conversionContext: ConversionContext = createConversionContext({
      componentProps: context.componentProps,
      strictMode: false, // Could be configurable
    })

    for (const attribute of attributes) {
      if (attribute.type === 'JSXAttribute') {
        const propName = attribute.name.name
        const value = attribute.value ? this.valueConverter.convert(attribute.value as any, conversionContext) : true // JSX boolean shorthand: <Component prop /> means prop={true}

        // Route attributes to appropriate category
        if (propName === 'style') {
          // Style should be an object that merges with existing styles
          if (value && typeof value === 'object' && !Array.isArray(value) && value.type !== 'prop') {
            Object.assign(result.style, value)
          } else {
            // Handle style as prop reference or other value
            result.data[propName] = value
          }
        } else if (propName === 'properties') {
          // Properties should be an object that merges with existing properties
          if (value && typeof value === 'object' && !Array.isArray(value) && value.type !== 'prop') {
            Object.assign(result.properties, value)
          } else {
            // Handle properties as prop reference or other value
            result.data[propName] = value
          }
        } else if (this.isSpecialProperty(propName)) {
          // Special properties go into the properties object
          result.properties[propName] = value
        } else {
          // All other props go into the data object
          result.data[propName] = value
        }
      }
    }

    return result
  }

  /**
   * Process JSX children and convert them to JSON nodes
   */
  processChildren(children: readonly JSXChild[], context: ProcessingContext): JsonNode[] {
    const result: JsonNode[] = []

    for (const child of children) {
      if (isJSXElement(child)) {
        // Recursively process JSX elements
        const processedChild = this.processElement(child, context)
        result.push(processedChild)
      } else if (isJSXText(child)) {
        // Handle text content based on parent component
        const textContent = this.processTextContent(child, context.parentComponent || 'unknown')
        if (textContent !== null && context.parentComponent === 'Text') {
          // For Text components, text goes into properties
          const textNode: JsonNode = {
            type: 'TextContent',
            properties: { text: textContent },
          }
          result.push(textNode)
        }
        // For other components, text children are typically ignored or handled specially
      } else if (isJSXExpressionContainer(child)) {
        // Handle JSX expression containers
        // This could contain dynamic content, props, etc.
        const conversionContext: ConversionContext = createConversionContext({
          componentProps: context.componentProps,
          strictMode: false,
        })

        const expressionValue = this.valueConverter.convert(child.expression as any, conversionContext)

        // Handle the expression result based on its type
        if (typeof expressionValue === 'string' && context.parentComponent === 'Text') {
          const textNode: JsonNode = {
            type: 'TextContent',
            properties: { text: expressionValue },
          }
          result.push(textNode)
        }
      }
    }

    return result
  }

  /**
   * Process text content based on parent component type
   */
  processTextContent(text: JSXText, parentType: string): string | null {
    const trimmedText = text.value.trim()

    if (!trimmedText) {
      return null
    }

    // For Text components, preserve the text content
    if (parentType === 'Text') {
      return trimmedText
    }

    // For other components, text children are typically not allowed
    // But we return the text in case the caller wants to handle it
    return trimmedText
  }

  /**
   * Check if a property should go into the properties object rather than data
   */
  private isSpecialProperty(propName: string): boolean {
    // Properties that should go into the properties object
    const specialProperties = new Set([
      'titleStyle', // Button title style
      'text', // Text content
      'source', // Image source
      'resizeMode', // Image resize mode
    ])

    return specialProperties.has(propName)
  }

  /**
   * Clean up empty properties from JSON node
   */
  private cleanupEmptyProperties(node: JsonNode): JsonNode {
    const cleaned: any = { type: node.type }

    // Only include non-empty style object
    if (node.style && Object.keys(node.style).length > 0) {
      cleaned.style = node.style
    }

    // Only include non-empty properties object
    if (node.properties && Object.keys(node.properties).length > 0) {
      cleaned.properties = node.properties
    }

    // Only include non-empty data object
    if (node.data && Object.keys(node.data).length > 0) {
      cleaned.data = node.data
    }

    // Only include non-empty children array
    if (node.children && node.children.length > 0) {
      cleaned.children = node.children
    }

    return cleaned as JsonNode
  }
}

/**
 * Create a default processing context
 */
export function createProcessingContext(overrides?: Partial<ProcessingContext>): ProcessingContext {
  return {
    componentProps: new Set(),
    depth: 0,
    ...overrides,
  }
}
