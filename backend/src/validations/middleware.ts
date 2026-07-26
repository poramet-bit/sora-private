import type { Context, Next } from 'hono'
import type { ZodSchema } from 'zod'

export const validateBody = <T>(schema: ZodSchema<T>) =>
  async (c: Context, next: Next) => {
    let data: unknown
    try {
      data = await c.req.json()
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400)
    }

    const result = schema.safeParse(data)
    if (!result.success) {
      return c.json({
        error: 'Validation failed',
        details: result.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      }, 400)
    }
    c.set('validatedBody', result.data)
    await next()
  }

export const validateQuery = <T>(schema: ZodSchema<T>) =>
  async (c: Context, next: Next) => {
    const raw: Record<string, string> = {}
    for (const [key, value] of new URL(c.req.url).searchParams.entries()) {
      raw[key] = value
    }
    const result = schema.safeParse(raw)
    if (!result.success) {
      return c.json({
        error: 'Invalid query parameters',
        details: result.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      }, 400)
    }
    c.set('validatedQuery', result.data)
    await next()
  }

export const validateParams = <T>(schema: ZodSchema<T>) =>
  async (c: Context, next: Next) => {
    const params = c.req.param()
    const result = schema.safeParse(params)
    if (!result.success) {
      return c.json({
        error: 'Invalid path parameters',
        details: result.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      }, 400)
    }
    await next()
  }
