import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { test } from 'node:test'
import bcrypt from 'bcryptjs'
import { createApp } from '../src/app.js'
import {
  getAuthCookieOptions,
  getLegacyAuthCookieOptions,
  getJwtSecret,
} from '../src/config/auth.js'
import User from '../src/models/User.js'

const testSecret = 'test-only-secret-with-at-least-32-bytes'

test('requires a sufficiently long JWT secret', () => {
  const originalSecret = process.env.JWT_SECRET

  try {
    delete process.env.JWT_SECRET
    assert.throws(getJwtSecret, /at least 32 bytes/)

    process.env.JWT_SECRET = 'too-short'
    assert.throws(getJwtSecret, /at least 32 bytes/)

    process.env.JWT_SECRET = testSecret
    assert.equal(getJwtSecret(), testSecret)
  } finally {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET
    } else {
      process.env.JWT_SECRET = originalSecret
    }
  }
})

test('uses Secure cookies in production', () => {
  const originalNodeEnv = process.env.NODE_ENV

  try {
    process.env.NODE_ENV = 'production'
    assert.deepEqual(getAuthCookieOptions(), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/api',
    })
    assert.deepEqual(getLegacyAuthCookieOptions(), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/api/auth',
    })
  } finally {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = originalNodeEnv
    }
  }
})

test('user schema stores an indexed unique email and hides password hashes', () => {
  const emailIndexes = User.schema.indexes().filter(([fields]) => fields.email)

  assert.equal(emailIndexes.length, 1)
  assert.equal(emailIndexes[0][1].unique, true)
  assert.equal(User.schema.path('passwordHash').options.select, false)
  assert.equal(User.schema.options.timestamps, true)
})

class MemoryUserModel {
  static records = []

  static reset() {
    this.records = []
  }

  static async create(userData) {
    if (this.records.some((user) => user.email === userData.email)) {
      const error = new Error('Duplicate email')
      error.code = 11000
      error.keyPattern = { email: 1 }
      throw error
    }

    const user = {
      _id: randomUUID(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.records.push(user)
    return user
  }

  static findOne({ email }) {
    return {
      select: async () =>
        this.records.find((user) => user.email === email) ?? null,
    }
  }

  static async findById(id) {
    return this.records.find((user) => user._id === id) ?? null
  }
}

test('authentication endpoints validate, register, login, protect and logout', async (t) => {
  MemoryUserModel.reset()
  const app = createApp({
    UserModel: MemoryUserModel,
    getSecret: () => testSecret,
  })
  const server = app.listen(0, '127.0.0.1')

  try {
    await once(server, 'listening')
    const { port } = server.address()
    const baseUrl = `http://127.0.0.1:${port}/api/auth`

    async function request(path, { method = 'GET', body, cookie } = {}) {
      const headers = {}
      if (body !== undefined) headers['content-type'] = 'application/json'
      if (cookie) headers.cookie = cookie

      return fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    }

    await t.test('rejects missing and invalid registration fields', async () => {
      const missing = await request('/register', {
        method: 'POST',
        body: {},
      })
      assert.equal(missing.status, 400)
      assert.deepEqual(Object.keys((await missing.json()).errors).sort(), [
        'email',
        'name',
        'password',
      ])

      const invalid = await request('/register', {
        method: 'POST',
        body: {
          name: 'A',
          email: 'not-an-email',
          password: 'short',
        },
      })
      assert.equal(invalid.status, 400)
      assert.equal((await invalid.json()).success, false)
    })

    await t.test('registers with a normalized email and hashed password', async () => {
      const response = await request('/register', {
        method: 'POST',
        body: {
          name: '  Ada Lovelace  ',
          email: '  ADA@example.com ',
          password: 'correct-horse-battery',
        },
      })

      assert.equal(response.status, 201)
      const payload = await response.json()
      assert.equal(payload.user.name, 'Ada Lovelace')
      assert.equal(payload.user.email, 'ada@example.com')
      assert.equal('passwordHash' in payload.user, false)
      assert.equal('password' in payload.user, false)

      const storedUser = MemoryUserModel.records[0]
      assert.notEqual(storedUser.passwordHash, 'correct-horse-battery')
      assert.equal(
        await bcrypt.compare(
          'correct-horse-battery',
          storedUser.passwordHash,
        ),
        true,
      )

      const cookie = response.headers.get('set-cookie')
      assert.match(cookie, /HttpOnly/i)
      assert.match(cookie, /SameSite=Lax/i)
      assert.match(cookie, /Path=\/api(?:;|,)/i)
      assert.match(cookie, /Path=\/api\/auth/i)
      assert.match(cookie, /Max-Age=900/i)
      assert.doesNotMatch(cookie, /Secure/i)
      assert.equal(payload.user.id, storedUser._id)
    })

    await t.test('rejects duplicate email registrations case-insensitively', async () => {
      const response = await request('/register', {
        method: 'POST',
        body: {
          name: 'Another Person',
          email: 'ADA@EXAMPLE.COM',
          password: 'another-correct-password',
        },
      })

      assert.equal(response.status, 409)
      assert.equal(
        (await response.json()).message,
        'An account with this email already exists.',
      )
      assert.equal(MemoryUserModel.records.length, 1)
    })

    await t.test('requires authentication for /me', async () => {
      const response = await request('/me')
      assert.equal(response.status, 401)
      assert.equal((await response.json()).message, 'Authentication required.')
    })

    await t.test('clears invalid session cookies at both paths', async () => {
      const response = await request('/me', {
        cookie: 'health_assistant_session=invalid',
      })
      assert.equal(response.status, 401)
      const cookies = response.headers.get('set-cookie')
      assert.match(cookies, /Path=\/api(?:;|,)/i)
      assert.match(cookies, /Path=\/api\/auth/i)
    })

    await t.test('logs in and returns the authenticated user from /me', async () => {
      const login = await request('/login', {
        method: 'POST',
        body: {
          email: 'ADA@example.com',
          password: 'correct-horse-battery',
        },
      })

      assert.equal(login.status, 200)
      const loginPayload = await login.json()
      assert.equal(loginPayload.user.email, 'ada@example.com')
      assert.equal('passwordHash' in loginPayload.user, false)
      const cookie = login.headers.get('set-cookie').split(';')[0]

      const me = await request('/me', { cookie })
      assert.equal(me.status, 200)
      assert.deepEqual((await me.json()).user, loginPayload.user)
      const migratedCookies = me.headers.get('set-cookie')
      assert.match(migratedCookies, /Path=\/api(?:;|,)/i)
      assert.match(migratedCookies, /Path=\/api\/auth/i)
    })

    await t.test('does not reveal whether an email exists on login failure', async () => {
      const wrongPassword = await request('/login', {
        method: 'POST',
        body: {
          email: 'ada@example.com',
          password: 'incorrect-password',
        },
      })
      const unknownEmail = await request('/login', {
        method: 'POST',
        body: {
          email: 'unknown@example.com',
          password: 'incorrect-password',
        },
      })

      assert.equal(wrongPassword.status, 401)
      assert.equal(unknownEmail.status, 401)
      assert.deepEqual(await wrongPassword.json(), await unknownEmail.json())
    })

    await t.test('clears the session cookie on logout', async () => {
      const response = await request('/logout', { method: 'POST' })
      assert.equal(response.status, 200)
      assert.equal((await response.json()).success, true)
      const cookie = response.headers.get('set-cookie')
      assert.match(cookie, /HttpOnly/i)
      assert.match(cookie, /SameSite=Lax/i)
      assert.match(cookie, /Path=\/api(?:;|,)/i)
      assert.match(cookie, /Path=\/api\/auth/i)
      assert.match(cookie, /Expires=/i)
    })
  } finally {
    server.close()
    await once(server, 'close')
  }
})
