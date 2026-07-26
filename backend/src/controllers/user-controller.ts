import type { Context } from 'hono'
import type { AppEnv } from '../index'
import { UserRepository } from '../repositories/user-repository'
import { hashWithSalt, verifyPassword } from '../utils/crypto'
import type { CreateUserInput, LoginInput, UpdateUserInput } from '../validations/schemas'

export class UserController {
  private repo: UserRepository

  constructor(c: Context<AppEnv>) {
    this.repo = new UserRepository(c.env.DB)
  }

  async getProfile(c: Context<AppEnv>) {
    const userId = c.req.param('userId')!
    const user = await this.repo.findById(userId)
    if (!user) return c.json({ error: 'User not found' }, 404)
    const { password, ...safeUser } = user as any
    return c.json({ data: safeUser })
  }

  async createProfile(c: Context<AppEnv>) {
    const body = c.get('validatedBody') as CreateUserInput
    const existing = await this.repo.findByEmail(body.email)
    if (existing) return c.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, 409)

    const passwordHash = await hashWithSalt(body.password)
    const user = await this.repo.create(body, passwordHash)
    return c.json({ data: user }, 201)
  }

  async loginByEmail(c: Context<AppEnv>) {
    const body = c.get('validatedBody') as LoginInput

    const user = await this.repo.findByEmail(body.email)
    if (!user) return c.json({ error: 'ไม่พบบัญชีที่ใช้อีเมลนี้' }, 404)

    const stored = (user as any).password
    if (!stored) return c.json({ error: 'บัญชีนี้ไม่มีรหัสผ่าน กรุณาสมัครใหม่' }, 400)

    const valid = await verifyPassword(body.password, stored)
    if (!valid) return c.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, 401)

    const { password, ...safeUser } = user as any
    return c.json({ data: safeUser })
  }

  async updateProfile(c: Context<AppEnv>) {
    const userId = c.req.param('userId')!
    const body = c.get('validatedBody') as UpdateUserInput
    const updated = await this.repo.update(userId, body)
    if (!updated) return c.json({ error: 'User not found' }, 404)
    return c.json({ data: updated })
  }
}
