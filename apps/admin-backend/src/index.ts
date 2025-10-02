import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import { scenarioTable } from './infrastructure/database/schema.js'
import postgres from 'postgres'
import { transpile } from '@render-engine/admin-sdk'

config({ path: '.env' })

const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client)

const app = new Hono()

// Enable CORS for admin frontend
app.use('*', cors({
  origin: process.env.ADMIN_FRONTEND_URL || 'http://localhost:5173',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

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
    const result = await db.insert(scenarioTable).values({
      key: schema.key,
      mainComponent: schema.main,
      components: schema.components,
      version: schema.version || '1.0.0',
      metadata: schema.metadata || {},
    }).returning()

    return c.json(result[0])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get all scenarios (list)
app.get('/api/scenarios', async (c) => {
  try {
    const { desc } = await import('drizzle-orm')
    const scenarios = await db.select().from(scenarioTable).orderBy(desc(scenarioTable.updatedAt))
    return c.json(scenarios)
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

// Update scenario by key
app.put('/api/scenarios/:key', async (c) => {
  try {
    const key = c.req.param('key')
    const updates = await c.req.json()
    const { eq } = await import('drizzle-orm')
    
    // Check if scenario exists
    const existing = await db.select().from(scenarioTable).where(eq(scenarioTable.key, key)).limit(1)
    if (existing.length === 0) {
      return c.json({ error: 'Scenario not found' }, 404)
    }

    // Update the scenario
    const result = await db.update(scenarioTable)
      .set({
        ...updates,
        updatedAt: new Date(),
        buildNumber: existing[0].buildNumber + 1, // Increment build number
      })
      .where(eq(scenarioTable.key, key))
      .returning()

    return c.json(result[0])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete scenario by key
app.delete('/api/scenarios/:key', async (c) => {
  try {
    const key = c.req.param('key')
    const { eq } = await import('drizzle-orm')
    
    // Check if scenario exists
    const existing = await db.select().from(scenarioTable).where(eq(scenarioTable.key, key)).limit(1)
    if (existing.length === 0) {
      return c.json({ error: 'Scenario not found' }, 404)
    }

    await db.delete(scenarioTable).where(eq(scenarioTable.key, key))
    return c.json({ message: 'Scenario deleted successfully' })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Validate JSX code without transpiling
app.post('/api/scenarios/validate', async (c) => {
  try {
    const { jsxCode } = await c.req.json()
    
    if (!jsxCode) {
      return c.json({ error: 'jsxCode is required' }, 400)
    }

    // Try to transpile to validate
    await transpile(jsxCode)
    
    return c.json({ valid: true, message: 'JSX code is valid' })
  } catch (error: any) {
    return c.json({ 
      valid: false, 
      message: 'JSX code is invalid', 
      error: error.message 
    }, 400)
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
