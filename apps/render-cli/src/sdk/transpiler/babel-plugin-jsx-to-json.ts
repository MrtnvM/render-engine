import { componentTypeMapping, propMapping } from './mappings.js'
import type { NodePath } from '@babel/traverse'

// Define types for Babel AST nodes
interface JSXElement {
  type: 'JSXElement'
  openingElement: {
    name: { name: string }
    attributes: Array<{
      type: string
      name: { name: string }
      value?: any
    }>
  }
  children: Array<{
    type: string
    value?: string
    json?: JsonNode
  }>
}

interface JSXText {
  type: 'JSXText'
  value: string
}

// Type definitions
type ComponentType = 'row' | 'column' | 'stack' | 'text' | 'image' | 'button'
type PropDestination = 'style' | 'properties'

interface PropMapping {
  key: string
  destination: PropDestination
}

interface JsonNode {
  type: ComponentType
  style?: Record<string, any>
  properties?: Record<string, any>
  children?: JsonNode[]
}

interface ASTNode {
  type: string
  value?: any
  name?: string
  expression?: ASTNode
  properties?: Array<{
    key: { name: string }
    value: ASTNode
  }>
}

// Helper to convert an AST node to a JavaScript value
function astNodeToValue(node?: ASTNode | null): any {
  if (!node) return null

  switch (node.type) {
    case 'StringLiteral':
      return node.value
    case 'NumericLiteral':
      return node.value
    case 'BooleanLiteral':
      return node.value
    case 'JSXExpressionContainer':
      return astNodeToValue(node.expression)
    case 'ObjectExpression':
      return (
        node.properties?.reduce((obj: Record<string, any>, prop) => {
          const key = prop.key.name
          obj[key] = astNodeToValue(prop.value)
          return obj
        }, {}) || {}
      )
    case 'NullLiteral':
      return null
    default:
      // In a real-world scenario, you might want to throw an error
      // for unsupported types or handle more cases (e.g., TemplateLiteral).
      return null
  }
}

export default function jsxToJsonPlugin() {
  return {
    visitor: {
      JSXElement: {
        exit(path: NodePath<JSXElement>) {
          const node = path.node
          const componentName = node.openingElement.name.name

          // 1. Determine Component Type
          const componentType = componentTypeMapping[
            componentName as keyof typeof componentTypeMapping
          ] as ComponentType
          if (!componentType) {
            throw new Error(`Unsupported component type: <${componentName}>`)
          }

          const jsonNode: JsonNode = {
            type: componentType,
            style: {},
            properties: {}, // For non-style attributes
            children: [],
          }

          // Add implicit styles for layout components
          if (componentName === 'Row') jsonNode.style!.direction = 'row'
          if (componentName === 'Column') jsonNode.style!.direction = 'column'
          if (componentName === 'Stack') jsonNode.style!.position = 'relative'

          // 2. Process Props (Attributes)
          node.openingElement.attributes.forEach((attribute: any) => {
            if (attribute.type === 'JSXAttribute') {
              const propName = attribute.name.name
              const mapping = propMapping[propName as keyof typeof propMapping] as PropMapping

              if (!mapping) {
                throw new Error(`Unsupported prop: '${propName}' on <${componentName}>`)
              }

              const value = astNodeToValue(attribute.value as ASTNode)

              if (mapping.destination === 'style') {
                jsonNode.style![mapping.key] = value
              } else {
                jsonNode.properties![mapping.key] = value
              }
            }
          })

          // 3. Process Children
          node.children.forEach((child: any) => {
            if (child.type === 'JSXText') {
              const text = (child as JSXText).value.trim()
              if (text && componentName === 'Text') {
                // Map string child of <Text> to the 'text' property
                jsonNode.properties!.text = text
              }
            } else if (child.type === 'JSXElement' && (child as any).json) {
              // The child has already been processed by this visitor (exit phase)
              jsonNode.children!.push((child as any).json)
            }
          })

          // Clean up empty objects
          if (jsonNode.style && Object.keys(jsonNode.style).length === 0) delete jsonNode.style
          if (jsonNode.properties && Object.keys(jsonNode.properties).length === 0) delete jsonNode.properties
          if (jsonNode.children && jsonNode.children.length === 0)
            delete jsonNode.children

            // Attach the generated JSON to the AST node for the parent to use
          ;(path.node as any).json = jsonNode
        },
      },
    },
  }
}
