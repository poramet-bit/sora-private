import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { apiRoutes } from './routes'

export interface Env {
  DB: D1Database
  AI: Ai
  ENVIRONMENT: string
  CORS_ORIGIN: string
}

export type AppEnv = {
  Bindings: Env
  Variables: {
    validatedBody: unknown
    validatedQuery: Record<string, unknown>
  }
}

const app = new Hono<AppEnv>()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}))

// Handle CORS preflight explicitly
app.options('*', (c) => c.body(null, 204))

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString(), ai: !!c.env.AI }))

// API routes
app.route('/api', apiRoutes)

// 404
app.notFound((c) => c.json({ error: 'Not found' }, 404))

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error', message: err.message }, 500)
})

export default app
