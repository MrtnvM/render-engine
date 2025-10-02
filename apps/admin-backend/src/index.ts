import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import { scenarioTable } from './infrastructure/database/schema.js'
import postgres from 'postgres'
import { transpile } from '@render-engine/admin-sdk'
import { eq, desc, asc, like, and, or, not, sql } from 'drizzle-orm'
import { cors } from 'hono/cors'
import { 
  validateRequest, 
  validatePagination, 
  validateUUID, 
  validateComponentSchema,
  scenarioValidationRules,
  analyticsValidationRules 
} from './middleware/validation.js'

config({ path: '.env' })

const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client)

const app = new Hono()

// Enable CORS for cross-origin requests
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Admin panel URLs
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Error handling middleware
app.onError((err, c) => {
  console.error('API Error:', err)
  return c.json({ 
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500)
})

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// Legacy endpoint - keeping for backward compatibility
app.get('/json-schema', async (c) => {
  try {
    const scenarios = await db.select().from(scenarioTable).limit(1)
    const jsonSchema = scenarios[0] || null
    return c.json(jsonSchema)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get all scenarios with filtering, sorting, and pagination
app.get('/api/scenarios', validatePagination(), async (c) => {
  try {
    const searchQuery = c.req.query('search')
    const version = c.req.query('version')
    const sortBy = c.req.query('sortBy') || 'updatedAt'
    const sortOrder = c.req.query('sortOrder') || 'desc'
    const { page, limit } = c.get('pagination') || { page: 1, limit: 10 }
    const offset = (page - 1) * limit

    // Build dynamic where conditions
    const conditions = []
    
    if (searchQuery) {
      conditions.push(
        or(
          like(scenarioTable.key, `%${searchQuery}%`),
          like(scenarioTable.version, `%${searchQuery}%`)
        )
      )
    }
    
    if (version) {
      conditions.push(eq(scenarioTable.version, version))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Build sort order
    const orderBy = sortOrder === 'asc' 
      ? asc(scenarioTable[sortBy as keyof typeof scenarioTable])
      : desc(scenarioTable[sortBy as keyof typeof scenarioTable])

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql`count(*)`.as('count') })
      .from(scenarioTable)
      .where(whereClause)

    const total = parseInt(countResult.count as string)

    // Get scenarios with pagination
    const scenarios = await db
      .select()
      .from(scenarioTable)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)

    return c.json({
      data: scenarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Create new scenario
app.post('/api/scenarios', 
  validateRequest(scenarioValidationRules.create),
  validateComponentSchema(),
  async (c) => {
  try {
    const validatedData = c.get('validatedData')
    const { key, mainComponent, components, version, metadata } = validatedData

    // Check if scenario with this key already exists
    const existing = await db.select().from(scenarioTable).where(eq(scenarioTable.key, key)).limit(1)
    if (existing.length > 0) {
      return c.json({ error: 'Scenario with this key already exists' }, 409)
    }

    const result = await db.insert(scenarioTable).values({
      key,
      mainComponent,
      components: components || {},
      version: version || '1.0.0',
      metadata: metadata || {},
    }).returning()

    return c.json(result[0], 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get scenario by ID
app.get('/api/scenarios/:id', validateUUID(), async (c) => {
  try {
    const id = c.req.param('id')
    const scenarios = await db.select().from(scenarioTable).where(eq(scenarioTable.id, id)).limit(1)
    
    if (scenarios.length === 0) {
      return c.json({ error: 'Scenario not found' }, 404)
    }

    return c.json(scenarios[0])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get scenario by key - for client apps
app.get('/api/scenarios/by-key/:key', async (c) => {
  try {
    const key = c.req.param('key')
    const scenarios = await db.select().from(scenarioTable).where(eq(scenarioTable.key, key)).limit(1)
    
    if (scenarios.length === 0) {
      return c.json({ error: 'Scenario not found' }, 404)
    }

    return c.json(scenarios[0])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update scenario by ID
app.put('/api/scenarios/:id', 
  validateUUID(),
  validateRequest(scenarioValidationRules.update),
  validateComponentSchema(),
  async (c) => {
  try {
    const id = c.req.param('id')
    const validatedData = c.get('validatedData')
    const { key, mainComponent, components, version, metadata } = validatedData

    // Check if scenario exists
    const existing = await db.select().from(scenarioTable).where(eq(scenarioTable.id, id)).limit(1)
    if (existing.length === 0) {
      return c.json({ error: 'Scenario not found' }, 404)
    }

    // If key is being changed, check for conflicts
    if (key && key !== existing[0].key) {
      const keyConflict = await db.select().from(scenarioTable)
        .where(and(eq(scenarioTable.key, key), not(eq(scenarioTable.id, id))))
        .limit(1)
      
      if (keyConflict.length > 0) {
        return c.json({ error: 'Scenario with this key already exists' }, 409)
      }
    }

    const updateData: any = { updatedAt: new Date() }
    if (key !== undefined) updateData.key = key
    if (mainComponent !== undefined) updateData.mainComponent = mainComponent
    if (components !== undefined) updateData.components = components
    if (version !== undefined) updateData.version = version
    if (metadata !== undefined) updateData.metadata = metadata

    const result = await db
      .update(scenarioTable)
      .set(updateData)
      .where(eq(scenarioTable.id, id))
      .returning()

    return c.json(result[0])
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete scenario by ID
app.delete('/api/scenarios/:id', validateUUID(), async (c) => {
  try {
    const id = c.req.param('id')

    // Check if scenario exists
    const existing = await db.select().from(scenarioTable).where(eq(scenarioTable.id, id)).limit(1)
    if (existing.length === 0) {
      return c.json({ error: 'Scenario not found' }, 404)
    }

    await db.delete(scenarioTable).where(eq(scenarioTable.id, id))

    return c.json({ message: 'Scenario deleted successfully' })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
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

// Publish compiled scenario to database (legacy endpoint)
app.post('/api/scenarios/publish', async (c) => {
  try {
    const schema = await c.req.json()
    
    if (!schema.key) {
      return c.json({ error: 'Schema must have a key field' }, 400)
    }

    // Check if scenario with this key already exists
    const existing = await db.select().from(scenarioTable).where(eq(scenarioTable.key, schema.key)).limit(1)
    if (existing.length > 0) {
      // Update existing scenario
      const result = await db
        .update(scenarioTable)
        .set({
          mainComponent: schema.main,
          components: schema.components,
          version: schema.version || '1.0.0',
          metadata: schema.metadata || {},
          updatedAt: new Date(),
        })
        .where(eq(scenarioTable.key, schema.key))
        .returning()

      return c.json(result[0])
    } else {
      // Create new scenario
      const result = await db.insert(scenarioTable).values({
        key: schema.key,
        mainComponent: schema.main,
        components: schema.components,
        version: schema.version || '1.0.0',
        metadata: schema.metadata || {},
      }).returning()

      return c.json(result[0], 201)
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Analytics endpoints for scenario usage tracking
app.post('/api/scenarios/:id/analytics/view', 
  validateUUID(),
  validateRequest(analyticsValidationRules.view),
  async (c) => {
  try {
    const id = c.req.param('id')
    const validatedData = c.get('validatedData')
    const { platform, userAgent, sessionId } = validatedData

    // Log the view event - in a production system, this would go to a proper analytics service
    console.log('Scenario View Event:', {
      scenarioId: id,
      platform,
      userAgent,
      sessionId,
      timestamp: new Date().toISOString()
    })

    // Here you could store analytics in a separate table or send to analytics service
    // For now, we'll just return success
    return c.json({ 
      message: 'View event logged',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/api/scenarios/:id/analytics/interaction',
  validateUUID(),
  validateRequest(analyticsValidationRules.interaction),
  async (c) => {
  try {
    const id = c.req.param('id')
    const validatedData = c.get('validatedData')
    const { 
      componentId, 
      interactionType, 
      platform, 
      userAgent, 
      sessionId,
      metadata 
    } = validatedData

    // Log the interaction event
    console.log('Scenario Interaction Event:', {
      scenarioId: id,
      componentId,
      interactionType,
      platform,
      userAgent,
      sessionId,
      metadata,
      timestamp: new Date().toISOString()
    })

    // Here you could store interaction analytics in a database or send to analytics service
    return c.json({ 
      message: 'Interaction event logged',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get analytics summary for a scenario
app.get('/api/scenarios/:id/analytics', validateUUID(), async (c) => {
  try {
    const id = c.req.param('id')

    // In a real implementation, this would query analytics data from database
    // For now, returning mock data structure
    const mockAnalytics = {
      scenarioId: id,
      totalViews: 0,
      totalInteractions: 0,
      platforms: {
        android: 0,
        ios: 0,
        web: 0
      },
      topComponents: [],
      timeRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    }

    return c.json(mockAnalytics)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get overall analytics dashboard data
app.get('/api/analytics/dashboard', async (c) => {
  try {
    // Get basic stats from scenarios table
    const totalScenarios = await db.select({ count: sql`count(*)`.as('count') }).from(scenarioTable)
    
    const recentScenarios = await db
      .select()
      .from(scenarioTable)
      .orderBy(desc(scenarioTable.updatedAt))
      .limit(5)

    // In a real implementation, this would include view/interaction analytics
    const dashboardData = {
      totalScenarios: parseInt(totalScenarios[0].count as string),
      totalViews: 0, // Would come from analytics table
      totalInteractions: 0, // Would come from analytics table
      recentScenarios: recentScenarios.map(s => ({
        id: s.id,
        key: s.key,
        version: s.version,
        updatedAt: s.updatedAt
      })),
      platformStats: {
        android: 0,
        ios: 0,
        web: 0
      },
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    }

    return c.json(dashboardData)
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
