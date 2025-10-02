import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import { scenarioTable } from './infrastructure/database/schema.js'
import postgres from 'postgres'
import { transpile } from '@render-engine/admin-sdk'

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

// Compile JSX to JSON endpoint
app.post('/api/scenarios/compile', async (c) => {
  try {
    const { jsxCode } = await c.req.json()

    if (!jsxCode) {
      return c.json({ error: 'jsxCode is required' }, 400)
    }

    const schema = await transpile(jsxCode)
    return c.json(schema)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Publish compiled scenario to database
app.post('/api/scenarios/publish', async (c) => {
  try {
    const schema = await c.req.json()

    if (!schema.key) {
      return c.json({ error: 'Schema must have a key field' }, 400)
    }

    // Insert scenario into database
    const result = await db
      .insert(scenarioTable)
      .values({
        key: schema.key,
        mainComponent: schema.main,
        components: schema.components,
        version: schema.version || '1.0.0',
        metadata: schema.metadata || {},
      })
      .returning()

    return c.json(result[0])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get scenario by key
app.get('/api/scenarios/:key', async (c) => {
  try {
    const key = c.req.param('key')
    const { eq } = await import('drizzle-orm')
    const scenarios = await db.select().from(scenarioTable).where(eq(scenarioTable.key, key)).limit(1)

    if (scenarios.length === 0) {
      return c.json({ error: 'Scenario not found' }, 404)
    }

    return c.json(scenarios[0])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
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
