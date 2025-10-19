/**
 * JSON representation of a component node
 */
export interface JsonNode {
  type: string
  style?: Record<string, any>
  properties?: Record<string, any>
  data?: Record<string, any>
  children?: JsonNode[]
}

/**
 * Store descriptor
 */
export interface StoreDescriptor {
  id: string
  scope: 'global' | 'scenario' | 'screen'
  storage: 'memory' | 'persistent'
  initialValue?: any
}

/**
 * Action descriptor
 */
export interface ActionDescriptor {
  id: string
  kind: string
  [key: string]: any
}

/**
 * Transpiled scenario with declarative actions
 */
export interface Scenario {
  key: string
  description: string
  version: string
  main: JsonNode // JSON node for main component
  components?: Record<string, JsonNode> // Named components
  stores?: StoreDescriptor[]
  actions?: ActionDescriptor[]
}
