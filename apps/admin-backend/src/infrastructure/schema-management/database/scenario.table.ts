import { integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core'

export const scenarioTable = pgTable('scenario_table', {
  id: text('id').primaryKey().notNull(),
  mainComponent: jsonb('mainComponent').notNull().$type<Record<string, any>>(),
  components: jsonb('components').notNull().$type<Record<string, any>>(),
  version: text('version').notNull().default('1.0.0'),
  buildNumber: integer('buildNumber').notNull().default(1),
  metadata: jsonb('metadata').notNull().$type<Record<string, any>>(),
})

export type Scenario = typeof scenarioTable.$inferSelect
export type NewScenario = typeof scenarioTable.$inferInsert
