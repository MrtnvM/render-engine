export interface JSXElement {
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

export interface JSXText {
  type: 'JSXText'
  value: string
}

export type ComponentType = string

export interface JsonNode {
  type: ComponentType
  style?: Record<string, any>
  properties?: Record<string, any>
  data?: Record<string, any>
  children?: JsonNode[]
}

export interface ComponentMetadata {
  name: string
  exportType: 'default' | 'named' | 'helper'
  jsonNode: JsonNode
}

export interface ASTNode {
  type: string
  value?: any
  name?: string
  expression?: ASTNode
  properties?: Array<{
    key: {
      type: string
      name?: string
      value?: any
    }
    value: ASTNode
  }>
}

export interface TranspiledScenario {
  key: string
  version: string
  main: JsonNode
  components: Record<string, JsonNode>
}

export interface TranspilerConfig {
  /** List of predefined component names */
  components?: string[]
  /** Enable strict mode validation */
  strictMode?: boolean
}

