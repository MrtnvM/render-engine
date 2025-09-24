import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import { schemaTable } from './infrastructure/database/schema.js'
import postgres from 'postgres'

config({ path: '.env' })

const client = postgres(process.env.DATABASE_URL!, { prepare: false })
const db = drizzle(client)
// const db = drizzle(process.env.DATABASE_URL!)

const app = new Hono()

// Legacy endpoint - keeping for backward compatibility
app.get('/json-schema', async (c) => {
  const schema = await db.select().from(schemaTable)
  const jsonSchema = schema[0]?.schema

  if (!jsonSchema) {
    return c.json({
      error: 'No schema found',
      scenario_id: 'default',
      schema_version: '1.0.0',
      config: {
        type: 'Screen',
        id: 'default_screen',
        children: [
          {
            type: 'Text',
            props: { text: 'No schema configured' },
          },
        ],
      },
    })
  }

  return c.json(jsonSchema)
})

// Health check endpoint
app.get('/health', async (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// Configuration API endpoint - MVP implementation
app.get('/api/v1/config', async (c) => {
  try {
    const query = c.req.query()

    // Validate required parameters
    const scenarioId = query.scenario_id
    const platform = query.platform
    const renderEngineVersion = query.render_engine_version
    const userId = query.user_id

    if (!scenarioId || !platform || !renderEngineVersion || !userId) {
      return c.json({
        error: 'Missing required parameters',
        message: 'scenario_id, platform, render_engine_version, and user_id are required',
      }, 400)
    }

    // Validate platform
    const validPlatforms = ['ios', 'android', 'web']
    if (!validPlatforms.includes(platform)) {
      return c.json({
        error: 'Invalid platform',
        message: 'Platform must be one of: ios, android, web',
      }, 400)
    }

    // Check for cache validation
    const ifNoneMatch = c.req.header('If-None-Match')
    const ifModifiedSince = c.req.header('If-Modified-Since')

    if (ifNoneMatch || ifModifiedSince) {
      // For MVP, we'll always return 200 (you can implement proper caching later)
    }

    // Mock experiment resolution (90% base, 10% experiment)
    const experimentVariant = Math.random() < 0.9 ? 'base' : 'experiment'

    // Generate ETag
    const etag = `"${scenarioId}-${platform}-${renderEngineVersion}-${experimentVariant}"`

    // Create response based on scenario
    const response = {
      schema_version: '1.0.0',
      render_engine: {
        min_version: '1.0.0',
        max_version: '2.0.0',
      },
      scenario_id: scenarioId,
      platform: platform,
      last_modified: new Date().toISOString(),
      etag: etag,
      config: {
        type: 'Screen',
        id: `${scenarioId}_screen`,
        children: [
          {
            type: 'Text',
            props: {
              text: `Welcome to ${scenarioId}! This is a ${experimentVariant} variant for ${platform} platform.`
            },
          },
          {
            type: 'Button',
            props: {
              label: 'Continue',
              action: 'next_step',
            },
          },
        ],
      },
    }

    // Set cache headers
    return c.json(response, 200, {
      'ETag': etag,
      'Last-Modified': response.last_modified,
      'Cache-Control': 'max-age=60',
    })

  } catch (error) {
    console.error('Configuration API error:', error)

    // Return default schema on error
    const defaultResponse = {
      schema_version: '1.0.0',
      scenario_id: 'default',
      config: {
        type: 'Screen',
        id: 'default_screen',
        children: [
          {
            type: 'Text',
            props: { text: 'Something went wrong. Please try again.' },
          },
        ],
      },
    }

    return c.json(defaultResponse, 500)
  }
})

// Default configuration endpoint
app.get('/api/v1/config/default', async (c) => {
  try {
    const query = c.req.query()
    const scenarioId = query.scenario_id || 'default'
    const platform = query.platform || 'web'

    const response = {
      schema_version: '1.0.0',
      scenario_id: scenarioId,
      config: {
        type: 'Screen',
        id: 'default_screen',
        children: [
          {
            type: 'Text',
            props: { text: 'Default configuration loaded.' },
          },
        ],
      },
    }

    return c.json(response, 200, {
      'Cache-Control': 'max-age=300', // 5 minutes
    })
  } catch (error) {
    console.error('Default configuration API error:', error)

    const defaultResponse = {
      schema_version: '1.0.0',
      scenario_id: 'default',
      config: {
        type: 'Screen',
        id: 'default_screen',
        children: [
          {
            type: 'Text',
            props: { text: 'Something went wrong. Please try again.' },
          },
        ],
      },
    }

    return c.json(defaultResponse, 500)
  }
})

// Debug WebSocket endpoint placeholder
app.get('/api/v1/debug/config/subscribe', async (c) => {
  return c.json({
    message: 'WebSocket endpoint for debug mode - coming soon',
    status: 'development',
    timestamp: new Date().toISOString(),
  })
})

serve(
  {
    fetch: app.fetch,
    port: 3050,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
    console.log('Available endpoints:')
    console.log('  GET  /health')
    console.log('  GET  /json-schema (legacy)')
    console.log('  GET  /api/v1/config')
    console.log('  GET  /api/v1/config/default')
    console.log('  GET  /api/v1/debug/config/subscribe (placeholder)')
    console.log('')
    console.log('Configuration API is now implemented!')
    console.log('Try: curl "http://localhost:3050/api/v1/config?scenario_id=onboarding&platform=ios&render_engine_version=1.0.0&user_id=12345"')
  },
)
