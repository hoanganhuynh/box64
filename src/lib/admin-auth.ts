import crypto from 'crypto'

export const COOKIE_NAME = 'admin_session'
export const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function secret() {
  return process.env.ADMIN_SESSION_SECRET ?? 'dev-secret-please-set-in-env'
}

export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', secret()).update(password).digest('hex')
}

export function createToken(email: string): string {
  const payload = Buffer.from(email).toString('base64url')
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyToken(token: string): string | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, sig] = parts
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
  if (sig !== expected) return null
  try {
    return Buffer.from(payload, 'base64url').toString('utf-8')
  } catch {
    return null
  }
}
