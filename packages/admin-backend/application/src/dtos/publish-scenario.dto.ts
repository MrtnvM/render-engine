import { z } from 'zod'

/**
 * DTO для публикации скомпилированного сценария
 */
export const PublishScenarioDtoSchema = z.object({
  key: z.string().min(1, 'Scenario key is required'),
  version: z.string().default('1.0.0'),
  mainComponent: z.record(z.any()),
  components: z.record(z.any()),
  stores: z.array(z.any()).optional(),
  actions: z.array(z.any()).optional(),
  metadata: z.record(z.any()).optional().default({}),
})

export type PublishScenarioDto = z.infer<typeof PublishScenarioDtoSchema>
