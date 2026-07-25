/**
 * Password hashing using Web Crypto API (SHA-256 + salt)
 * Available in Cloudflare Workers runtime
 */

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function hashWithSalt(password: string): Promise<string> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16))
  const salt = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('')
  const hash = await hashPassword(password, salt)
  return `${salt}:${hash}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const computed = await hashPassword(password, salt)
  return computed === hash
}