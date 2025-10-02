import { z } from 'zod'

// Schema matching Scenario.swift from iOS SDK
export const scenarioSchema = z.object({
  id: z.string(),
  key: z.string(),
  version: z.string(),
  build_number: z.number(),
  mainComponent: z.string(), // Component type name
  componentsCount: z.number(), // Number of components in the scenario
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Scenario = z.infer<typeof scenarioSchema>

// Legacy export for backwards compatibility
export const taskSchema = scenarioSchema
export type Task = Scenario
