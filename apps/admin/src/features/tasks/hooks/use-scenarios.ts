import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Scenario } from '../data/schema'
import type { JsonNode } from '@render-engine/admin-sdk'

// Database type matching the backend schema
interface ScenarioRow {
  id: string
  key: string
  version: string
  build_number: number
  mainComponent: JsonNode
  components: Record<string, JsonNode>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Transform database row to frontend schema
function transformScenario(row: ScenarioRow): Scenario {
  // Extract main component name from JSONB
  let mainComponentName = 'Unknown'
  if (row.mainComponent) {
    if (typeof row.mainComponent === 'string') {
      mainComponentName = row.mainComponent
    } else if (typeof row.mainComponent === 'object') {
      // Handle JSONB object like {"type": "FeedScreen"}
      mainComponentName = row.mainComponent.type || JSON.stringify(row.mainComponent)
    }
  }

  // Count components from JSONB array
  let componentsCount = 0
  if (row.components) {
    if (Array.isArray(row.components)) {
      componentsCount = row.components.length
    } else if (typeof row.components === 'object') {
      // If it's an object, try to count keys or convert to array
      componentsCount = Object.keys(row.components).length
    }
  }

  return {
    id: row.id,
    key: row.key,
    version: row.version,
    build_number: row.build_number,
    mainComponent: mainComponentName,
    componentsCount,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

// Fetch all scenarios
export function useScenarios() {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scenario_table')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching scenarios:', error)
        throw new Error(error.message)
      }

      return (data as ScenarioRow[]).map(transformScenario)
    },
  })
}

// Fetch single scenario by ID
export function useScenario(id: string | null) {
  return useQuery({
    queryKey: ['scenarios', id],
    queryFn: async () => {
      if (!id) return null

      const { data, error } = await supabase.from('scenario_table').select('*').eq('id', id).single()

      if (error) {
        console.error('Error fetching scenario:', error)
        throw new Error(error.message)
      }

      return transformScenario(data as ScenarioRow)
    },
    enabled: !!id,
  })
}

// Fetch single scenario with raw data for editing
export function useScenarioRaw(id: string | null) {
  return useQuery({
    queryKey: ['scenarios', 'raw', id],
    queryFn: async () => {
      if (!id) return null

      const { data, error } = await supabase.from('scenario_table').select('*').eq('id', id).single()

      if (error) {
        console.error('Error fetching scenario:', error)
        throw new Error(error.message)
      }

      return data as ScenarioRow
    },
    enabled: !!id,
  })
}

// Create scenario mutation
export function useCreateScenario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (scenario: {
      key: string
      version: string
      build_number?: number
      mainComponent: JsonNode
      components: Record<string, JsonNode>
      metadata?: Record<string, unknown>
    }) => {
      const { data, error } = await supabase
        .from('scenario_table')
        .insert({
          key: scenario.key,
          version: scenario.version,
          build_number: scenario.build_number ?? 1,
          mainComponent: scenario.mainComponent,
          components: scenario.components,
          metadata: scenario.metadata ?? {},
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating scenario:', error)
        throw new Error(error.message)
      }

      return transformScenario(data as ScenarioRow)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] })
      toast.success('Сценарий успешно создан')
    },
    onError: (error: Error) => {
      toast.error(`Ошибка создания сценария: ${error.message}`)
    },
  })
}

// Update scenario mutation
export function useUpdateScenario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<{
        key: string
        version: string
        build_number: number
        mainComponent: JsonNode
        components: Record<string, JsonNode>
        metadata: Record<string, unknown>
      }>
    }) => {
      const { data, error } = await supabase
        .from('scenario_table')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating scenario:', error)
        throw new Error(error.message)
      }

      return transformScenario(data as ScenarioRow)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] })
      toast.success('Сценарий успешно обновлен')
    },
    onError: (error: Error) => {
      toast.error(`Ошибка обновления сценария: ${error.message}`)
    },
  })
}

// Delete scenario mutation
export function useDeleteScenario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('scenario_table').delete().eq('id', id)

      if (error) {
        console.error('Error deleting scenario:', error)
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] })
      toast.success('Сценарий успешно удален')
    },
    onError: (error: Error) => {
      toast.error(`Ошибка удаления сценария: ${error.message}`)
    },
  })
}

// Delete multiple scenarios
export function useDeleteScenarios() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from('scenario_table').delete().in('id', ids)

      if (error) {
        console.error('Error deleting scenarios:', error)
        throw new Error(error.message)
      }
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] })
      toast.success(`Удалено сценариев: ${ids.length}`)
    },
    onError: (error: Error) => {
      toast.error(`Ошибка удаления сценариев: ${error.message}`)
    },
  })
}
