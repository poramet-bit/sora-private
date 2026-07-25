import type { User, CreateUserDTO } from '../models/types'

export class UserRepository {
  constructor(private db: D1Database) {}

  async findAll(): Promise<User[]> {
    const { results } = await this.db.prepare('SELECT * FROM users ORDER BY created_at DESC').all()
    return results as unknown as User[]
  }

  async findById(id: string): Promise<User | null> {
    return await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first() as unknown as User | null
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first() as unknown as User | null
  }

  async create(data: CreateUserDTO): Promise<User> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    await this.db.prepare('INSERT INTO users (id, name, email, age, gender, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, data.name, data.email, data.age, data.gender, createdAt).run()
    return { id, ...data, createdAt }
  }

  async update(id: string, data: Partial<CreateUserDTO>): Promise<User | null> {
    const existing = await this.findById(id)
    if (!existing) return null
    const merged = { ...existing, ...data }
    await this.db.prepare('UPDATE users SET name = ?, email = ?, age = ?, gender = ? WHERE id = ?')
      .bind(merged.name, merged.email, merged.age, merged.gender, id).run()
    return merged
  }

  async delete(id: string): Promise<boolean> {
    const r = await this.db.prepare('DELETE FROM users WHERE id = ?').bind(id).run()
    return r.meta.changes > 0
  }
}
