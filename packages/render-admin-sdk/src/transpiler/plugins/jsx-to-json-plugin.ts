import type { File, Node } from '@babel/types'
import type { Visitor } from '@babel/traverse'
import type { ASTNode, JSXElement, JSXText, JsonNode, TranspilerConfig } from '../types.js'
import { TranspilerPlugin } from './base-plugin.js'
import type { ComponentRegistry } from './component-registry.js'

export interface JsxToJsonResult {
  rootJson: JsonNode | null
  components: Record<string, JsonNode>
}

/**
 * Plugin to transform JSX elements to JSON nodes and collect components.
 *
 * Processes:
 * - JSX elements → JSON structure with type, style, properties, data, children
 * - Component props and prop references
 * - Default exports, named exports, and helper functions
 */
export class JsxToJsonPlugin extends TranspilerPlugin<JsxToJsonResult> {
  private rootJson: JsonNode | null = null
  private components: Record<string, JsonNode> = {}
  private collectedComponents: Array<{
    name: string
    exportType: 'default' | 'named' | 'helper'
    jsonNode: JsonNode
  }> = []

  // Track component props for each function scope
  private componentPropsStack: Set<string>[] = []

  // Handler ID mapping (provided by ActionHandlerAnalyzer)
  public handlerIdByFunction: Map<Node, string> = new Map()

  // Component registry for validation
  private registry: ComponentRegistry

  constructor(registry: ComponentRegistry, config?: TranspilerConfig) {
    super(config)
    this.registry = registry
  }

  /**
   * Get current component props from the props stack
   */
  private getCurrentComponentProps(): Set<string> {
    return this.componentPropsStack[this.componentPropsStack.length - 1] || new Set()
  }

  protected getVisitors(): Visitor {
    return {
      // Track function parameters for arrow functions and function declarations
      ArrowFunctionExpression: {
        enter: (path: any) => {
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

          this.componentPropsStack.push(props)
        },
        exit: (path: any) => {
          this.componentPropsStack.pop()
        },
      },
      FunctionDeclaration: {
        enter: (path: any) => {
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

          this.componentPropsStack.push(props)
        },
        exit: (path: any) => {
          // Pop the props stack when exiting function
          this.componentPropsStack.pop()

          // Skip if this is a default export (handled by ExportDefaultDeclaration)
          if (path.parent?.type === 'ExportDefaultDeclaration') {
            return
          }

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
              this.collectedComponents.push({
                name: functionName,
                exportType: 'helper',
                jsonNode: (jsxElement as any).json,
              })
            }
          }
        },
      },
      JSXElement: {
        exit: (path: any) => {
          const node = path.node
          const componentName = this.getComponentName(node.openingElement.name)

          // Validate component exists (either base UI component or local scenario component)
          if (!this.registry.isValid(componentName)) {
            throw new Error(this.registry.getUnknownComponentError(componentName))
          }

          // Mark component for collection
          ;(path.node as any).componentName = componentName

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
          const currentComponentProps = this.getCurrentComponentProps()
          node.openingElement.attributes.forEach((attribute: any) => {
            if (attribute.type === 'JSXAttribute') {
              const propName = attribute.name.name
              const value = this.astNodeToValue(attribute.value as ASTNode, currentComponentProps)

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
        exit: (path: any) => {
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
              this.collectedComponents.push({
                name: declaration.id?.name || 'default',
                exportType: 'default',
                jsonNode: (jsxElement as any).json,
              })
            }
          } else if (declaration?.type === 'ArrowFunctionExpression' && declaration.body?.type === 'JSXElement') {
            // Handle export default () => <JSX>...</JSX>
            if ((declaration.body as any).json) {
              this.collectedComponents.push({
                name: 'default',
                exportType: 'default',
                jsonNode: (declaration.body as any).json,
              })
            }
          }
        },
      },
      ExportNamedDeclaration: {
        exit: (path: any) => {
          const declaration = path.node.declaration
          if (declaration?.type === 'VariableDeclaration') {
            declaration.declarations.forEach((declarator: any) => {
              if (
                declarator.id?.name &&
                declarator.init?.body?.type === 'JSXElement' &&
                (declarator.init.body as any).json
              ) {
                // Handle export const MyComponent = () => <JSX>...</JSX>
                this.collectedComponents.push({
                  name: declarator.id.name,
                  exportType: 'named',
                  jsonNode: (declarator.init.body as any).json,
                })
              }
            })
          }
        },
      },
      VariableDeclarator: {
        exit: (path: any) => {
          // Skip if this is part of an export (handled by ExportNamedDeclaration)
          if (path.findParent((p: any) => p.isExportNamedDeclaration() || p.isExportDefaultDeclaration())) {
            return
          }

          const variableName = path.node.id?.name
          const init = path.node.init

          if (!variableName || !init) {
            return
          }

          // Check for arrow function components: const Foo = () => <JSX/>
          if (init.type === 'ArrowFunctionExpression') {
            let jsxElement = null

            // Direct JSX return: () => <JSX/>
            if (init.body?.type === 'JSXElement' && (init.body as any).json) {
              jsxElement = init.body
            }
            // Block body with return: () => { return <JSX/> }
            else if (init.body?.type === 'BlockStatement' && init.body.body?.length > 0) {
              const returnStatement = init.body.body.find((stmt: any) => stmt.type === 'ReturnStatement')
              if (returnStatement?.argument?.type === 'JSXElement' && (returnStatement.argument as any).json) {
                jsxElement = returnStatement.argument
              }
            }

            if (jsxElement) {
              this.collectedComponents.push({
                name: variableName,
                exportType: 'helper',
                jsonNode: (jsxElement as any).json,
              })
            }
          }
        },
      },
      Program: {
        exit: (path: any) => {
          // Process collected components after traversal
          for (const component of this.collectedComponents) {
            if (component.exportType === 'default') {
              this.rootJson = component.jsonNode
            } else if (component.exportType === 'named' || component.exportType === 'helper') {
              this.components[component.name] = component.jsonNode
            }
          }

          // Fallback: Look for JSX elements in the program body (for backward compatibility)
          if (!this.rootJson) {
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
                    this.rootJson = (variableDeclarator.init.body as any).json as JsonNode
                    break
                  }
                }
              } else if (
                node.type === 'ExpressionStatement' &&
                node.expression.type === 'JSXElement' &&
                (node.expression as any).json
              ) {
                this.rootJson = (node.expression as any).json as JsonNode
                break
              }
            }
          }
        },
      },
    }
  }

  protected afterTraverse(ast: File, state: any): JsxToJsonResult {
    return {
      rootJson: this.rootJson,
      components: this.components,
    }
  }

  /**
   * Convert an AST node to a JavaScript value
   */
  private astNodeToValue(node?: ASTNode | null, componentProps?: Set<string>): any {
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
        return this.astNodeToValue(node.expression, componentProps)
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
            obj[key] = this.astNodeToValue(prop.value, componentProps)
            return obj
          }, {}) || {}
        )
      case 'NullLiteral':
        return null
      case 'ArrowFunctionExpression':
      case 'FunctionExpression': {
        // Check if this handler has been analyzed by ActionHandlerAnalyzer
        const actionId = this.handlerIdByFunction.get(node as any)
        if (actionId) {
          return actionId
        }
        // If no action ID, return null (handler wasn't analyzed - might be unsupported pattern)
        return null
      }
      default:
        // In a real-world scenario, you might want to throw an error
        // for unsupported types or handle more cases (e.g., TemplateLiteral).
        return null
    }
  }

  /**
   * Get the component name from different JSX name types
   */
  private getComponentName(nameNode: any): string {
    switch (nameNode.type) {
      case 'JSXIdentifier':
        return nameNode.name
      case 'JSXMemberExpression':
        return `${this.getComponentName(nameNode.object)}.${nameNode.property.name}`
      case 'JSXNamespacedName':
        return `${nameNode.namespace.name}:${nameNode.name.name}`
      default:
        return 'unknown'
    }
  }
}
