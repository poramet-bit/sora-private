import type { Context } from 'hono'
import type { Env } from '../index'
import { UserRepository } from '../repositories/user-repository'
import { hashWithSalt, verifyPassword } from '../utils/crypto'
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
    const { password, ...safeUser } = user as any
    return c.json({ data: safeUser })
  }

  async createProfile(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json<CreateUserDTO>()
    if (!body.name || !body.email || !body.password) {
      return c.json({ error: 'name, email และ password จำเป็นต้องกรอก' }, 400)
    }
    if (body.password.length < 6) {
      return c.json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }, 400)
    }
    const existing = await this.repo.findByEmail(body.email)
    if (existing) return c.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, 409)

    const passwordHash = await hashWithSalt(body.password)
    const user = await this.repo.create(body, passwordHash)
    return c.json({ data: user }, 201)
  }

  async loginByEmail(c: Context<{ Bindings: Env }>) {
    const body = await c.req.json<{ email: string; password: string }>()
    if (!body.email || !body.password) {
      return c.json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, 400)
    }

    const user = await this.repo.findByEmail(body.email)
    if (!user) return c.json({ error: 'ไม่พบบัญชีที่ใช้อีเมลนี้' }, 404)

    const stored = (user as any).password
    if (!stored) return c.json({ error: 'บัญชีนี้ไม่มีรหัสผ่าน กรุณาสมัครใหม่' }, 400)

    const valid = await verifyPassword(body.password, stored)
    if (!valid) return c.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, 401)

    const { password, ...safeUser } = user as any
    return c.json({ data: safeUser })
  }

  async updateProfile(c: Context<{ Bindings: Env }>) {
    const userId = c.req.param("userId")!
    const body = await c.req.json<Partial<CreateUserDTO>>()
    const updated = await this.repo.update(userId, body)
    if (!updated) return c.json({ error: 'User not found' }, 404)
    return c.json({ data: updated })
  }
}