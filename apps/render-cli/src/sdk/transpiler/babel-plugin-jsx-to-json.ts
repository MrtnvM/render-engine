import type { NodePath } from '@babel/traverse'
import fs from 'fs'
import path from 'path'

// Function to get predefined component names directly from ui.tsx
function getPredefinedComponents(): string[] {
  try {
    // Try different path strategies to find ui.tsx
    const possiblePaths = [
      path.resolve(process.cwd(), 'apps/render-cli/src/sdk/ui/ui.tsx'), // From workspace root
      path.resolve(process.cwd(), 'src/sdk/ui/ui.tsx'), // From project root
    ]

    let uiContent = ''
    for (const uiPath of possiblePaths) {
      try {
        uiContent = fs.readFileSync(uiPath, 'utf8')
        break
      } catch (e) {
        continue
      }
    }

    if (!uiContent) {
      console.warn('Could not read ui.tsx file, using fallback component list')
      return ['Column', 'Row', 'Stack', 'Text', 'Image', 'Button', 'Checkbox', 'Stepper', 'Rating']
    }

    // Extract component names from export const statements
    const componentNames: string[] = []
    const exportRegex = /export const (\w+)/g
    let match

    while ((match = exportRegex.exec(uiContent)) !== null) {
      componentNames.push(match[1])
    }

    return componentNames
  } catch (error) {
    console.warn('Error reading ui.tsx file, using fallback component list')
    return ['Column', 'Row', 'Stack', 'Text', 'Image', 'Button', 'Checkbox', 'Stepper', 'Rating']
  }
}

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
type ComponentType = string

interface JsonNode {
  type: ComponentType
  style?: Record<string, any>
  properties?: Record<string, any>
  children?: JsonNode[]
}

interface ComponentMetadata {
  name: string
  exportType: 'default' | 'named' | 'helper'
  jsonNode: JsonNode
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
  const components: ComponentMetadata[] = []

  const plugin = {
    visitor: {
      JSXElement: {
        exit(path: NodePath<JSXElement>) {
          const node = path.node
          const componentName = node.openingElement.name.name

          // Get predefined components dynamically from ui.tsx
          const componentTypes = getPredefinedComponents()
          if (componentTypes.includes(componentName)) {
            // We'll collect this information later when we encounter the export declaration
            ;(path.node as any).componentName = componentName
          }

          // 1. Determine Component Type
          const componentType = componentName
          if (!componentType) {
            throw new Error(`Unsupported component type: <${componentName}>`)
          }

          const jsonNode: any = {
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

              const value = astNodeToValue(attribute.value as ASTNode)
              jsonNode[propName] = value
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
      ExportDefaultDeclaration: {
        exit(path: any) {
          const declaration = path.node.declaration
          if (declaration?.type === 'FunctionDeclaration') {
            // Handle export default function MyComponent() { return <JSX>...</JSX> }
            // Check if the function body contains a JSX element
            let jsxElement = null
            if (declaration.body?.type === 'BlockStatement' && declaration.body.body.length > 0) {
              const returnStatement = declaration.body.body.find((stmt: any) => stmt.type === 'ReturnStatement')
              if (returnStatement?.argument?.type === 'JSXElement' && (returnStatement.argument as any).json) {
                jsxElement = returnStatement.argument
              }
            }
            if (jsxElement) {
              components.push({
                name: declaration.id?.name || 'default',
                exportType: 'default',
                jsonNode: (jsxElement as any).json,
              })
            }
          } else if (declaration?.type === 'ArrowFunctionExpression' && declaration.body?.type === 'JSXElement') {
            // Handle export default () => <JSX>...</JSX>
            if ((declaration.body as any).json) {
              components.push({
                name: 'default',
                exportType: 'default',
                jsonNode: (declaration.body as any).json,
              })
            }
          }
        },
      },
      ExportNamedDeclaration: {
        exit(path: any) {
          const declaration = path.node.declaration
          if (declaration?.type === 'VariableDeclaration') {
            declaration.declarations.forEach((declarator: any) => {
              if (
                declarator.id?.name &&
                declarator.init?.body?.type === 'JSXElement' &&
                (declarator.init.body as any).json
              ) {
                // Handle export const MyComponent = () => <JSX>...</JSX>
                components.push({
                  name: declarator.id.name,
                  exportType: 'named',
                  jsonNode: (declarator.init.body as any).json,
                })
              }
            })
          }
        },
      },
      FunctionDeclaration: {
        exit(path: any) {
          // Capture all function declarations that return JSX, not just exported ones
          const functionName = path.node.id?.name
          if (functionName) {
            // Check if the function body contains a JSX element
            let jsxElement = null
            if (path.node.body?.type === 'BlockStatement' && path.node.body.body.length > 0) {
              const returnStatement = path.node.body.body.find((stmt: any) => stmt.type === 'ReturnStatement')
              if (returnStatement?.argument?.type === 'JSXElement' && (returnStatement.argument as any).json) {
                jsxElement = returnStatement.argument
              }
            }
            if (jsxElement) {
              components.push({
                name: functionName,
                exportType: 'helper',
                jsonNode: (jsxElement as any).json,
              })
            }
          }
        },
      },
    },
  }

  return { plugin, components }
}
