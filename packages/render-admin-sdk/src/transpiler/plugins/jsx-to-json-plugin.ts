import type { File } from '@babel/types'
import { traverse } from '../traverse.js'
import type { ASTNode, JSXElement, JSXText, JsonNode, TranspilerConfig } from '../types.js'
import { getPredefinedComponents } from '../utils.js'

/**
 * Transform JSX elements to JSON nodes and collect components
 */
export function transformJsxToJson(
  ast: File,
  config?: TranspilerConfig,
): {
  rootJson: JsonNode | null
  components: Record<string, JsonNode>
} {
  let rootJson: JsonNode | null = null
  const components: Record<string, JsonNode> = {}
  const collectedComponents: Array<{
    name: string
    exportType: 'default' | 'named' | 'helper'
    jsonNode: JsonNode
  }> = []

  // Track component props for each function scope
  const componentPropsStack: Set<string>[] = []

  // Helper to get current component props
  function getCurrentComponentProps(): Set<string> {
    return componentPropsStack[componentPropsStack.length - 1] || new Set()
  }

  traverse(ast, {
    // Track function parameters for arrow functions and function declarations
    ArrowFunctionExpression: {
      enter(path: any) {
        const props = new Set<string>()

        // Extract parameter names from arrow function
        if (path.node.params) {
          path.node.params.forEach((param: any) => {
            if (param.type === 'Identifier') {
              props.add(param.name)
            } else if (param.type === 'ObjectPattern') {
              // Handle destructured parameters like { storeName, rating }
              param.properties.forEach((prop: any) => {
                if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier') {
                  props.add(prop.key.name)
                }
              })
            }
          })
        }

        componentPropsStack.push(props)
      },
      exit(path: any) {
        componentPropsStack.pop()
      },
    },
    FunctionDeclaration: {
      enter(path: any) {
        const props = new Set<string>()

        // Extract parameter names from function declaration
        if (path.node.params) {
          path.node.params.forEach((param: any) => {
            if (param.type === 'Identifier') {
              props.add(param.name)
            } else if (param.type === 'ObjectPattern') {
              // Handle destructured parameters like { storeName, rating }
              param.properties.forEach((prop: any) => {
                if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier') {
                  props.add(prop.key.name)
                }
              })
            }
          })
        }

        componentPropsStack.push(props)
      },
      exit(path: any) {
        // Pop the props stack when exiting function
        componentPropsStack.pop()

        // Original function declaration logic for collecting components
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
            collectedComponents.push({
              name: functionName,
              exportType: 'helper',
              jsonNode: (jsxElement as any).json,
            })
          }
        }
      },
    },
    JSXElement: {
      exit(path: any) {
        const node = path.node
        const componentName = getComponentName(node.openingElement.name)

        // Get predefined components dynamically
        const componentTypes = getPredefinedComponents(config?.components)
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
          data: {}, // For component props
          children: [],
        }

        // Add default flexDirection for Row and Column components
        if (componentType === 'Row') {
          jsonNode.style.flexDirection = 'row'
        } else if (componentType === 'Column') {
          jsonNode.style.flexDirection = 'column'
        }

        // 2. Process Props (Attributes)
        const currentComponentProps = getCurrentComponentProps()
        node.openingElement.attributes.forEach((attribute: any) => {
          if (attribute.type === 'JSXAttribute') {
            const propName = attribute.name.name
            const value = astNodeToValue(attribute.value as ASTNode, currentComponentProps)

            // Handle special props that should remain at root level
            if (propName === 'style') {
              // Process style object and merge into jsonNode.style
              if (value && typeof value === 'object') {
                jsonNode.style = { ...jsonNode.style, ...value }
              }
            } else if (propName === 'properties') {
              // Merge properties instead of replacing
              if (value && typeof value === 'object') {
                jsonNode.properties = { ...jsonNode.properties, ...value }
              }
            } else if (propName === 'titleStyle') {
              // titleStyle should go into properties for Button components
              jsonNode.properties.titleStyle = value
            } else {
              // All other props go into the data object
              jsonNode.data[propName] = value
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
        if (jsonNode.data && Object.keys(jsonNode.data).length === 0) delete jsonNode.data
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
            collectedComponents.push({
              name: declaration.id?.name || 'default',
              exportType: 'default',
              jsonNode: (jsxElement as any).json,
            })
          }
        } else if (declaration?.type === 'ArrowFunctionExpression' && declaration.body?.type === 'JSXElement') {
          // Handle export default () => <JSX>...</JSX>
          if ((declaration.body as any).json) {
            collectedComponents.push({
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
              collectedComponents.push({
                name: declarator.id.name,
                exportType: 'named',
                jsonNode: (declarator.init.body as any).json,
              })
            }
          })
        }
      },
    },
    Program: {
      exit(path: any) {
        // Process collected components after traversal
        for (const component of collectedComponents) {
          if (component.exportType === 'default') {
            rootJson = component.jsonNode
          } else if (component.exportType === 'named' || component.exportType === 'helper') {
            components[component.name] = component.jsonNode
          }
        }

        // Fallback: Look for JSX elements in the program body (for backward compatibility)
        if (!rootJson) {
          for (const node of path.node.body) {
            if (node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'VariableDeclaration') {
              const declaration = node.declaration
              if (declaration.declarations.length > 0) {
                const variableDeclarator = declaration.declarations[0]
                if (
                  variableDeclarator.init?.type === 'ArrowFunctionExpression' &&
                  variableDeclarator.init.body?.type === 'JSXElement' &&
                  (variableDeclarator.init.body as any).json
                ) {
                  rootJson = (variableDeclarator.init.body as any).json as JsonNode
                  break
                }
              }
            } else if (
              node.type === 'ExpressionStatement' &&
              node.expression.type === 'JSXElement' &&
              (node.expression as any).json
            ) {
              rootJson = (node.expression as any).json as JsonNode
              break
            }
          }
        }
      },
    },
  } as any)

  return { rootJson, components }
}

// Helper to convert an AST node to a JavaScript value
function astNodeToValue(node?: ASTNode | null, componentProps?: Set<string>): any {
  if (!node) return null

  switch (node.type) {
    case 'StringLiteral':
      return node.value
    case 'NumericLiteral':
      return node.value
    case 'BooleanLiteral':
      return node.value
    case 'Identifier':
      // Check if this identifier is a component prop
      if (componentProps && componentProps.has(node.name || '')) {
        return {
          type: 'prop',
          key: node.name,
        }
      }
      // For non-component props, return null (or could throw an error)
      return null
    case 'JSXExpressionContainer':
      return astNodeToValue(node.expression, componentProps)
    case 'ObjectExpression':
      return (
        node.properties?.reduce((obj: Record<string, any>, prop) => {
          // Handle different key types (Identifier, StringLiteral, etc.)
          let key: string
          if (prop.key.type === 'Identifier') {
            key = prop.key.name || 'unknown'
          } else if (prop.key.type === 'StringLiteral') {
            key = prop.key.value || 'unknown'
          } else {
            key = String(prop.key)
          }
          obj[key] = astNodeToValue(prop.value, componentProps)
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

// Helper to get the component name from different JSX name types
function getComponentName(nameNode: any): string {
  switch (nameNode.type) {
    case 'JSXIdentifier':
      return nameNode.name
    case 'JSXMemberExpression':
      return `${getComponentName(nameNode.object)}.${nameNode.property.name}`
    case 'JSXNamespacedName':
      return `${nameNode.namespace.name}:${nameNode.name.name}`
    default:
      return 'unknown'
  }
}
