import { Hono } from 'hono'
import { ConfigurationController } from '../controllers/configuration.controller.js'
import { DebugWebSocketHandler } from '../websocket/debug-websocket.js'

const configurationRoutes = new Hono()
const controller = new ConfigurationController()
const wsHandler = new DebugWebSocketHandler()

/**
 * GET /api/v1/config
 * Fetch configuration for a scenario
 */
configurationRoutes.get('/api/v1/config', async (c) => {
  return controller.getConfiguration(c)
})

/**
 * GET /api/v1/config/default
 * Get default configuration
 */
configurationRoutes.get('/api/v1/config/default', async (c) => {
  return controller.getDefaultConfiguration(c)
})

/**
 * WS /api/v1/debug/config/subscribe
 * WebSocket endpoint for debug mode schema updates
 * Note: For MVP, this is a placeholder implementation
 */
configurationRoutes.get('/api/v1/debug/config/subscribe', async (c) => {
  // Check if it's a WebSocket upgrade request
  const upgradeHeader = c.req.header('Upgrade')
  if (upgradeHeader !== 'websocket') {
    return c.text('Expected WebSocket connection', 400)
  }

  // For MVP, we'll return a message indicating WebSocket support is coming
  return c.json({
    message: 'WebSocket endpoint for debug mode - coming soon',
    status: 'development',
    timestamp: new Date().toISOString(),
  })
})

export { configurationRoutes }