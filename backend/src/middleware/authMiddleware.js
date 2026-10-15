import jwt from 'jsonwebtoken'
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getLegacyAuthCookieOptions,
} from '../config/auth.js'

export function createAuthMiddleware({ getSecret }) {
  return function authenticate(request, response, next) {
    const token = request.cookies?.[AUTH_COOKIE_NAME]

    if (!token) {
      return response
        .status(401)
        .json({ success: false, message: 'Authentication required.' })
    }

    let payload

    try {
      payload = jwt.verify(token, getSecret(), { algorithms: ['HS256'] })
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        response.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions())
        response.clearCookie(AUTH_COOKIE_NAME, getLegacyAuthCookieOptions())
        return response
          .status(401)
          .json({ success: false, message: 'Authentication required.' })
      }

      return next(error)
    }

    if (typeof payload !== 'object' || typeof payload.sub !== 'string') {
      response.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions())
      response.clearCookie(AUTH_COOKIE_NAME, getLegacyAuthCookieOptions())
      return response
        .status(401)
        .json({ success: false, message: 'Authentication required.' })
    }

    request.auth = { userId: payload.sub, expiresAt: payload.exp }
    return next()
  }
}
