import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import { scenarioTable } from './infrastructure/database/schema.js'
import postgres from 'postgres'

config({ path: '.env' })

const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client)
// const db = drizzle(process.env.DATABASE_URL!)

const app = new Hono()

app.get('/json-schema', async (c) => {
  const schema = await db.select().from(scenarioTable)
  const jsonSchema = schema[0]
  return c.json(jsonSchema)
})

serve(
  {
    fetch: app.fetch,
    port: 3050,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)
