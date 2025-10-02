import type { 
  Scenario, 
  CreateScenarioData, 
  UpdateScenarioData, 
  CompileResult,
  ValidationResult 
} from '../types'

const API_BASE = 'http://localhost:3050/api'

export const scenarioService = {
  async getAll(): Promise<Scenario[]> {
    const response = await fetch(`${API_BASE}/scenarios`)
    if (!response.ok) {
      throw new Error('Failed to fetch scenarios')
    }
    return response.json()
  },

  async getByKey(key: string): Promise<Scenario> {
    const response = await fetch(`${API_BASE}/scenarios/${encodeURIComponent(key)}`)
    if (!response.ok) {
      throw new Error('Failed to fetch scenario')
    }
    return response.json()
  },

  async create(data: CreateScenarioData): Promise<Scenario> {
    // First compile the JSX code
    const compiled = await this.compile(data.jsxCode)
    
    // Then publish the compiled scenario
    const response = await fetch(`${API_BASE}/scenarios/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: data.key || compiled.key,
        main: compiled.main,
        components: compiled.components,
        version: compiled.version,
        metadata: {
          ...data.metadata,
          jsxCode: data.jsxCode,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create scenario')
    }

    return response.json()
  },

  async update(key: string, data: UpdateScenarioData): Promise<Scenario> {
    let updates: any = {
      metadata: data.metadata,
    }

    // If JSX code is being updated, compile it first
    if (data.jsxCode) {
      const compiled = await this.compile(data.jsxCode)
      updates = {
        ...updates,
        mainComponent: compiled.main,
        components: compiled.components,
        metadata: {
          ...data.metadata,
          jsxCode: data.jsxCode,
        },
      }
    }

    const response = await fetch(`${API_BASE}/scenarios/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update scenario')
    }

    return response.json()
  },

  async delete(key: string): Promise<void> {
    const response = await fetch(`${API_BASE}/scenarios/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete scenario')
    }
  },

  async compile(jsxCode: string): Promise<CompileResult> {
    const response = await fetch(`${API_BASE}/scenarios/compile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jsxCode }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to compile JSX')
    }

    return response.json()
  },

  async validate(jsxCode: string): Promise<ValidationResult> {
    const response = await fetch(`${API_BASE}/scenarios/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jsxCode }),
    })

    // Note: validation endpoint returns 400 for invalid code
    const result = await response.json()
    return result
  },
}