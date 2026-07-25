import type { Context } from 'hono'
import type { Env } from '../index'
import { UserRepository } from '../repositories/user-repository'
import type { CreateUserDTO } from '../models/types'

export class UserController {
  private repo: UserRepository

  constructor(c: Context<{ Bindings: Env }>) {
    this.repo = new UserRepository(c.env.DB)
  }

  async getProfile(c: Context<{ Bindings: Env }>) {
    const userId = c.req.param("userId")!
    const user = await this.repo.findById(userId)
    if (!user) return c.json({ error: 'User not found' }, 404)
    return c.json({ data: user })
  }

  async createProfile(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json<CreateUserDTO>()
    if (!body.name || !body.email) return c.json({ error: 'name and email are required' }, 400)
    const existing = await this.repo.findByEmail(body.email)
    if (existing) return c.json({ error: 'Email already exists' }, 409)
    const user = await this.repo.create(body)
    return c.json({ data: user }, 201)
  }

  async updateProfile(c: Context<{ Bindings: Env }>) {
    const userId = c.req.param("userId")!
    const body = await c.req.json<Partial<CreateUserDTO>>()
    const updated = await this.repo.update(userId, body)
    if (!updated) return c.json({ error: 'User not found' }, 404)
    return c.json({ data: updated })
  }

  async listUsers(c: Context<{ Bindings: Env }>) {
    const users = await this.repo.findAll()
    return c.json({ data: users })
  }
}
