import { useMutation } from '@tanstack/react-query'
import type { TranspiledScenario } from '@render-engine/admin-sdk'

interface CompileScenarioRequest {
  jsxCode: string
}

type CompiledScenario = TranspiledScenario

interface CompilationError {
  error: string
  errors?: Array<{
    code: string
    message: string
    field?: string
    severity: 'error' | 'warning' | 'info'
    line?: number
    column?: number
  }>
}

/**
 * Hook для компиляции JSX кода в JSON схему
 */
export function useCompileScenario() {
  return useMutation<CompiledScenario, CompilationError, CompileScenarioRequest>({
    mutationFn: async (data) => {
      const response = await fetch('http://localhost:3050/api/scenarios/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw error
      }

      return response.json()
    },
  })
}
