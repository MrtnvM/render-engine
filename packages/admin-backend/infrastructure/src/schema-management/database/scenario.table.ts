import { jsonb, pgTable, text, uuid, integer, timestamp } from 'drizzle-orm/pg-core'

export const scenarioTable = pgTable('scenario_table', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  key: text('key').notNull(),
  mainComponent: jsonb('mainComponent').notNull().$type<Record<string, any>>(),
  components: jsonb('components').notNull().$type<Record<string, any>>(),
  stores: jsonb('stores').$type<Array<Record<string, any>>>(),
  actions: jsonb('actions').$type<Array<Record<string, any>>>(),
  version: text('version').notNull().default('1.0.0'),
  buildNumber: integer('build_number').notNull().default(1),
  metadata: jsonb('metadata').notNull().$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Scenario = typeof scenarioTable.$inferSelect
export type NewScenario = typeof scenarioTable.$inferInsert
