import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_LIFETIME_SECONDS,
  getAuthCookieOptions,
  getLegacyAuthCookieOptions,
} from '../config/auth.js'

const PASSWORD_HASH_ROUNDS = 12
const MAX_PASSWORD_BYTES = 72
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getObjectBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {}
  }

  return body
}

function getValidEmail(value) {
  if (typeof value !== 'string') {
    return null
  }

  const email = value.trim().toLowerCase()
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null
}

function getValidName(value) {
  if (typeof value !== 'string') {
    return null
  }

  const name = value.trim()
  return name.length >= 2 && name.length <= 80 ? name : null
}

function isValidPassword(value) {
  return (
    typeof value === 'string' &&
    value.length >= 8 &&
    Buffer.byteLength(value, 'utf8') <= MAX_PASSWORD_BYTES
  )
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  }
}

function setSessionCookie(response, user, getSecret) {
  const token = jwt.sign({}, getSecret(), {
    algorithm: 'HS256',
    subject: user._id.toString(),
    expiresIn: AUTH_TOKEN_LIFETIME_SECONDS,
  })

  response.cookie(AUTH_COOKIE_NAME, token, {
    ...getAuthCookieOptions(),
    maxAge: AUTH_TOKEN_LIFETIME_SECONDS * 1000,
  })
  response.clearCookie(AUTH_COOKIE_NAME, getLegacyAuthCookieOptions())
}

function isDuplicateEmailError(error) {
  return error?.code === 11000 && Boolean(error?.keyPattern?.email)
}

export function createAuthController({ UserModel, getSecret }) {
  async function register(request, response) {
    const body = getObjectBody(request.body)
    const name = getValidName(body.name)
    const email = getValidEmail(body.email)
    const password = body.password
    const errors = {}

    if (!name) {
      errors.name = 'Enter a name between 2 and 80 characters.'
    }
    if (!email) {
      errors.email = 'Enter a valid email address.'
    }
    if (!isValidPassword(password)) {
      errors.password = `Use a password of at least 8 characters and no more than ${MAX_PASSWORD_BYTES} UTF-8 bytes.`
    }

    if (Object.keys(errors).length > 0) {
      return response.status(400).json({
        success: false,
        message: 'Check the highlighted fields.',
        errors,
      })
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS)
    let user

    try {
      user = await UserModel.create({ name, email, passwordHash })
    } catch (error) {
      if (isDuplicateEmailError(error)) {
        return response.status(409).json({
          success: false,
          message: 'An account with this email already exists.',
        })
      }
      throw error
    }

    setSessionCookie(response, user, getSecret)
    return response.status(201).json({
      success: true,
      message: 'Account created.',
      user: publicUser(user),
    })
  }

  async function login(request, response) {
    const body = getObjectBody(request.body)
    const email = getValidEmail(body.email)
    const password = body.password
    const errors = {}

    if (!email) {
      errors.email = 'Enter a valid email address.'
    }
    if (typeof password !== 'string' || password.length === 0) {
      errors.password = 'Enter your password.'
    } else if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
      errors.password = `Password must not exceed ${MAX_PASSWORD_BYTES} UTF-8 bytes.`
    }

    if (Object.keys(errors).length > 0) {
      return response.status(400).json({
        success: false,
        message: 'Check the highlighted fields.',
        errors,
      })
    }

    const user = await UserModel.findOne({ email }).select('+passwordHash')
    let passwordMatches = false

    if (user) {
      passwordMatches = await bcrypt.compare(password, user.passwordHash)
    } else {
      await bcrypt.hash(password, PASSWORD_HASH_ROUNDS)
    }

    if (!passwordMatches) {
      return response.status(401).json({
        success: false,
        message: 'Email or password is incorrect.',
      })
    }

    setSessionCookie(response, user, getSecret)
    return response.status(200).json({
      success: true,
      message: 'Signed in.',
      user: publicUser(user),
    })
  }

  async function me(request, response) {
    const user = await UserModel.findById(request.auth.userId)

    if (!user) {
      response.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions())
      response.clearCookie(AUTH_COOKIE_NAME, getLegacyAuthCookieOptions())
      return response
        .status(401)
        .json({ success: false, message: 'Authentication required.' })
    }

    const token = request.cookies?.[AUTH_COOKIE_NAME]
    const maxAge = request.auth.expiresAt * 1000 - Date.now()
    if (token && maxAge > 0) {
      response.clearCookie(AUTH_COOKIE_NAME, getLegacyAuthCookieOptions())
      response.cookie(AUTH_COOKIE_NAME, token, {
        ...getAuthCookieOptions(),
        maxAge,
      })
    }

    return response.status(200).json({
      success: true,
      user: publicUser(user),
    })
  }

  function logout(_request, response) {
    response.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions())
    response.clearCookie(AUTH_COOKIE_NAME, getLegacyAuthCookieOptions())
    return response
      .status(200)
      .json({ success: true, message: 'Signed out.' })
  }

  return { register, login, me, logout }
}
