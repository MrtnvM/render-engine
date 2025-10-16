import 'reflect-metadata';
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { config } from 'dotenv'
import { cors } from 'hono/cors'
import './di-container.js' // Инициализация DI контейнера
import scenariosRouter from './api/scenarios/index.js'

config({ path: '.env' })

const app = new Hono()

// CORS middleware для работы с фронтендом
app.use('/*', cors())

// Монтирование роутов
app.route('/api/scenarios', scenariosRouter)

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
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
