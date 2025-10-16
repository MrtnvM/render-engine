import { z } from 'zod'

/**
 * DTO для запроса компиляции сценария из JSX в JSON
 */
export const CompileScenarioDtoSchema = z.object({
  jsxCode: z.string().min(1, 'JSX code cannot be empty'),
})

export type CompileScenarioDto = z.infer<typeof CompileScenarioDtoSchema>
