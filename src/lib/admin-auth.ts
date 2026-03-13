import crypto from 'crypto'

export const ADMIN_COOKIE_NAME = 'admin_session'
const SALT = 'laguaca_admin_session' // Debe coincidir con ADMIN_SALT en middleware

/** Genera el token de la cookie (solo Node; usado en API login). */
export function getAdminToken(): string {
  const secret = process.env.ADMIN_PASSWORD || ''
  return crypto.createHash('sha256').update(secret + SALT).digest('hex')
}

export function isAdminAuthenticated(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false
  return cookieValue === getAdminToken()
}
