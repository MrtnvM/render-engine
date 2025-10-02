import { z } from 'zod'

// Experiment Status Enum
export const experimentStatusSchema = z.enum(['DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED'])

export type ExperimentStatus = z.infer<typeof experimentStatusSchema>

// Variant schema
export const variantSchema = z.object({
  id: z.string(),
  name: z.string(),
  schemaVersion: z.string(),
  distribution: z.number().min(0).max(100),
  isControl: z.boolean(),
  performanceMetrics: z
    .object({
      conversionRate: z.number().optional(),
      clickThroughRate: z.number().optional(),
      averageSessionDuration: z.number().optional(),
      sampleSize: z.number().optional(),
    })
    .optional(),
  isActive: z.boolean(),
})

export type Variant = z.infer<typeof variantSchema>

// Experiment schema
export const experimentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: experimentStatusSchema,
  variants: z.array(variantSchema),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  targetAudience: z.object({
    criteria: z.string(),
    size: z.number(),
  }),
  successCriteria: z.object({
    metric: z.string(),
    improvement: z.number(),
    significance: z.number(),
  }),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Experiment = z.infer<typeof experimentSchema>

// List schema
export const experimentListSchema = z.array(experimentSchema)
