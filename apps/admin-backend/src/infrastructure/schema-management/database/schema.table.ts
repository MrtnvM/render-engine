import { jsonb, pgTable, serial, text } from 'drizzle-orm/pg-core'

export const schemaTable = pgTable('schema_table', {
  id: serial('id').primaryKey(),
  schema: jsonb('schema').notNull(),
})
