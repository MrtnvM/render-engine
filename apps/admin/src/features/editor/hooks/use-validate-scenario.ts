import { useMutation } from '@tanstack/react-query'
import type { JsonNode, StoreDescriptor, ActionDescriptor } from '@/types/scenario'

interface ValidationRequest {
  key: string
  version: string
  main: JsonNode
  components: Record<string, JsonNode>
  stores?: StoreDescriptor[]
  actions?: ActionDescriptor[]
}

interface ValidationResult {
  isValid: boolean
  errors: Array<{
    code: string
    message: string
    field?: string
    severity: 'error' | 'warning' | 'info'
  }>
  warnings: Array<{
    code: string
    message: string
    field?: string
    severity: 'error' | 'warning' | 'info'
  }>
  info: Array<{
    code: string
    message: string
    field?: string
    severity: 'error' | 'warning' | 'info'
  }>
}

/**
 * Hook для валидации скомпилированного сценария
 */
export function useValidateScenario() {
  return useMutation<ValidationResult, Error, ValidationRequest>({
    mutationFn: async (data) => {
      const response = await fetch('http://localhost:3050/api/scenarios/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Validation failed')
      }

      return response.json()
    },
  })
}
