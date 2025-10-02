export interface Scenario {
  id: string
  key: string
  mainComponent: Record<string, any>
  components: Record<string, any>
  version: string
  buildNumber: number
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreateScenarioData {
  key: string
  jsxCode: string
  metadata?: Record<string, any>
}

export interface UpdateScenarioData {
  jsxCode?: string
  metadata?: Record<string, any>
}

export interface CompileResult {
  key: string
  version: string
  main: Record<string, any>
  components: Record<string, any>
}

export interface ValidationResult {
  valid: boolean
  message: string
  error?: string
}