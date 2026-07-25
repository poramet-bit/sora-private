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

const app = new Hono<{ Bindings: Env }>()

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

// AI test endpoint
app.get('/ai-test', async (c) => {
  try {
    if (!c.env.AI) return c.json({ error: 'AI binding not available' }, 500)
    const res = await c.env.AI.run('@cf/zai/glm-4.7-flash', {
      messages: [{ role: 'user', content: 'บอกว่าสวัสดีเป็นภาษาไทย' }],
      max_tokens: 50,
    }) as any
    return c.json({ ok: true, response: res?.response || JSON.stringify(res).slice(0, 200) })
  } catch (e: any) {
    return c.json({ error: e.message, name: e.name }, 500)
  }
})

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
