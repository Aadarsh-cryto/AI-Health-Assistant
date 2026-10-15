export const AUTH_COOKIE_NAME = 'health_assistant_session'
export const AUTH_TOKEN_LIFETIME_SECONDS = 15 * 60

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT_SECRET must contain at least 32 bytes.')
  }

  return secret
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api',
  }
}

export function getLegacyAuthCookieOptions() {
  return { ...getAuthCookieOptions(), path: '/api/auth' }
}
