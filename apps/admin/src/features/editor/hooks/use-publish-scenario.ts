import { useMutation, useQueryClient } from '@tanstack/react-query'

interface PublishScenarioRequest {
  key: string
  version?: string
  mainComponent: Record<string, any>
  components: Record<string, any>
  stores?: any[]
  actions?: any[]
  metadata?: Record<string, any>
}

interface PublishedScenario {
  id: string
  key: string
  version: string
  buildNumber: number
  mainComponent: Record<string, any>
  components: Record<string, any>
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface PublishError {
  error: string
  message?: string
}

/**
 * Hook для публикации скомпилированного сценария
 */
export function usePublishScenario() {
  const queryClient = useQueryClient()

  return useMutation<PublishedScenario, PublishError, PublishScenarioRequest>({
    mutationFn: async (data) => {
      const response = await fetch('http://localhost:3050/api/scenarios/publish', {
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
    onSuccess: () => {
      // Инвалидировать кеш сценариев после успешной публикации
      queryClient.invalidateQueries({ queryKey: ['scenarios'] })
    },
  })
}
