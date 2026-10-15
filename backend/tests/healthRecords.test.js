import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { once } from 'node:events'
import jwt from 'jsonwebtoken'
import { test } from 'node:test'
import { createApp } from '../src/app.js'
import { createHistoryReceipt } from '../src/services/healthHistoryReceipt.js'

const testSecret = 'health-records-tests-only-secret-32bytes'

const validAnalysis = {
  summary: 'You described a headache that began recently.',
  possibleExplanations: ['Headaches may have many possible causes.'],
  selfCare: ['Consider resting if appropriate for you.'],
  warningSigns: ['Seek urgent help for sudden severe pain.'],
  recommendedNextStep: 'Contact a health professional if it persists.',
  disclaimer: 'This is not a diagnosis or medical advice.',
  recommendedSpecialties: ['general_practice'],
  emergency: false,
}

function matches(record, query) {
  return Object.entries(query).every(
    ([key, value]) => String(record[key]) === String(value),
  )
}

class MemoryHistoryModel {
  static records = []

  static reset() {
    this.records = []
  }

  static async create(value) {
    if (
      this.records.some(
        (record) =>
          record.userId === value.userId &&
          record.idempotencyKey === value.idempotencyKey,
      )
    ) {
      const error = new Error('duplicate')
      error.code = 11000
      throw error
    }
    const record = {
      _id: randomUUID(),
      ...value,
      createdAt: new Date(Date.now() + this.records.length),
    }
    this.records.push(record)
    return record
  }

  static find(query) {
    let records = this.records.filter((record) => matches(record, query))
    return {
      sort() {
        records = [...records].sort(
          (left, right) => right.createdAt - left.createdAt,
        )
        return this
      },
      limit(count) {
        records = records.slice(0, count)
        return this
      },
      lean: async () => records,
    }
  }

  static findOne(query) {
    return {
      lean: async () =>
        this.records.find((record) => matches(record, query)) ?? null,
    }
  }

  static findOneAndDelete(query) {
    return {
      lean: async () => {
        const index = this.records.findIndex((record) => matches(record, query))
        if (index < 0) return null
        return this.records.splice(index, 1)[0]
      },
    }
  }
}

class MemoryProfileModel {
  static profiles = []

  static reset() {
    this.profiles = []
  }

  static findOne(query) {
    return {
      lean: async () =>
        this.profiles.find((profile) => matches(profile, query)) ?? null,
    }
  }

  static findOneAndUpdate(query, update) {
    let profile = this.profiles.find((item) => matches(item, query))
    if (profile) Object.assign(profile, update.$set)
    else {
      profile = { ...query, ...update.$set }
      this.profiles.push(profile)
    }
    return { lean: async () => profile }
  }
}

test('health history and profile routes enforce private user-scoped persistence', async (t) => {
  MemoryHistoryModel.reset()
  MemoryProfileModel.reset()
  const app = createApp({
    getSecret: () => testSecret,
    HealthHistoryModel: MemoryHistoryModel,
    HealthProfileModel: MemoryProfileModel,
    analyzeSymptoms: async () => validAnalysis,
  })
  const server = app.listen(0, '127.0.0.1')

  try {
    await once(server, 'listening')
    const baseUrl = `http://127.0.0.1:${server.address().port}/api`
    const tokenFor = (userId) =>
      jwt.sign({}, testSecret, {
        algorithm: 'HS256',
        subject: userId,
        expiresIn: '5m',
      })

    async function request(path, { userId, method = 'GET', body } = {}) {
      const headers = {}
      if (userId) headers.cookie = `health_assistant_session=${tokenFor(userId)}`
      if (body !== undefined) headers['content-type'] = 'application/json'
      return fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    }

    await t.test('rejects unauthenticated history and profile requests', async () => {
      assert.equal((await request('/health-history')).status, 401)
      assert.equal((await request('/health-profile')).status, 401)
    })

    await t.test('creates, deduplicates, lists, opens, and deletes only owned history', async () => {
      const userA = 'user-a'
      const userB = 'user-b'
      const receipt = createHistoryReceipt(validAnalysis, userA, testSecret)
      const body = {
        consent: true,
        receipt,
        analysis: validAnalysis,
      }

      const createdResponse = await request('/health-history', {
        userId: userA,
        method: 'POST',
        body,
      })
      assert.equal(createdResponse.status, 201)
      assert.equal(createdResponse.headers.get('cache-control'), 'no-store')
      const created = (await createdResponse.json()).record
      assert.equal(created.symptomSummary, validAnalysis.summary)
      assert.equal(created.analysis.recommendedSpecialties[0], 'general_practice')
      assert.ok(created.id)
      assert.equal('userId' in created, false)

      const duplicate = await request('/health-history', {
        userId: userA,
        method: 'POST',
        body,
      })
      assert.equal(duplicate.status, 200)
      assert.equal((await duplicate.json()).record.id, created.id)
      assert.equal(MemoryHistoryModel.records.length, 1)

      const secondRecord = await request('/health-history', {
        userId: userA,
        method: 'POST',
        body: {
          ...body,
          receipt: createHistoryReceipt(validAnalysis, userA, testSecret),
        },
      })
      assert.equal(secondRecord.status, 201)
      const listed = await request('/health-history', { userId: userA })
      assert.deepEqual(
        (await listed.json()).records.map((record) => record.id),
        [((await secondRecord.json()).record.id), created.id],
      )

      assert.deepEqual(
        (await (await request('/health-history', { userId: userB })).json())
          .records,
        [],
      )
      assert.equal(
        (
          await request(`/health-history/${created.id}`, { userId: userB })
        ).status,
        404,
      )
      assert.equal(
        (
          await request(`/health-history/${created.id}`, {
            userId: userB,
            method: 'DELETE',
          })
        ).status,
        404,
      )
      assert.equal(
        (
          await request(`/health-history/${created.id}`, {
            userId: userA,
            method: 'DELETE',
          })
        ).status,
        200,
      )
      assert.equal(MemoryHistoryModel.records.length, 1)
    })

    await t.test('rejects history without consent or with invalid categories', async () => {
      const noConsent = await request('/health-history', {
        userId: 'user-a',
        method: 'POST',
        body: {
          consent: false,
          receipt: createHistoryReceipt(validAnalysis, 'user-a', testSecret),
          analysis: validAnalysis,
        },
      })
      assert.equal(noConsent.status, 400)

      const unsupportedCategory = await request('/health-history', {
        userId: 'user-a',
        method: 'POST',
        body: {
          consent: true,
          receipt: createHistoryReceipt(validAnalysis, 'user-a', testSecret),
          analysis: {
            ...validAnalysis,
            recommendedSpecialties: ['untrusted'],
          },
        },
      })
      assert.equal(unsupportedCategory.status, 400)
      assert.equal(MemoryHistoryModel.records.length, 1)
    })

    await t.test('rejects a receipt for another user or altered analysis', async () => {
      const receipt = createHistoryReceipt(validAnalysis, 'user-a', testSecret)
      const wrongOwner = await request('/health-history', {
        userId: 'user-b',
        method: 'POST',
        body: { consent: true, receipt, analysis: validAnalysis },
      })
      assert.equal(wrongOwner.status, 403)

      const alteredAnalysis = {
        ...validAnalysis,
        summary: 'Changed after analysis.',
      }
      const tampered = await request('/health-history', {
        userId: 'user-a',
        method: 'POST',
        body: { consent: true, receipt, analysis: alteredAnalysis },
      })
      assert.equal(tampered.status, 403)
    })

    await t.test('creates and updates an isolated optional health profile', async () => {
      const emptyProfile = await request('/health-profile', {
        userId: 'user-a',
      })
      assert.equal(emptyProfile.status, 200)
      assert.equal((await emptyProfile.json()).hasProfile, false)

      const firstSave = await request('/health-profile', {
        userId: 'user-a',
        method: 'PUT',
        body: {
          age: '34',
          allergies: 'Pollen',
          conditions: '',
          medications: '',
          notes: 'Optional note',
        },
      })
      assert.equal(firstSave.status, 200)
      assert.equal(firstSave.headers.get('cache-control'), 'no-store')
      const firstSavePayload = await firstSave.json()
      assert.equal(firstSavePayload.hasProfile, true)
      assert.deepEqual(firstSavePayload.profile, {
        age: 34,
        allergies: 'Pollen',
        conditions: '',
        medications: '',
        notes: 'Optional note',
      })

      const update = await request('/health-profile', {
        userId: 'user-a',
        method: 'PUT',
        body: {
          age: null,
          allergies: '',
          conditions: 'Asthma',
          medications: '',
          notes: '',
        },
      })
      assert.deepEqual((await update.json()).profile, {
        age: null,
        allergies: '',
        conditions: 'Asthma',
        medications: '',
        notes: '',
      })

      assert.deepEqual(
        (await (await request('/health-profile', { userId: 'user-a' })).json())
          .profile.conditions,
        'Asthma',
      )
      assert.deepEqual(
        (await (await request('/health-profile', { userId: 'user-b' })).json())
          .profile,
        { age: null, allergies: '', conditions: '', medications: '', notes: '' },
      )
    })

    await t.test('rejects invalid profile values and user-supplied identity', async () => {
      const invalidAge = await request('/health-profile', {
        userId: 'user-a',
        method: 'PUT',
        body: { age: 12 },
      })
      assert.equal(invalidAge.status, 400)

      const oversizedField = await request('/health-profile', {
        userId: 'user-a',
        method: 'PUT',
        body: { allergies: 'a'.repeat(1001) },
      })
      assert.equal(oversizedField.status, 400)

      const suppliedUserId = await request('/health-profile', {
        userId: 'user-a',
        method: 'PUT',
        body: { userId: 'user-b', notes: 'not permitted' },
      })
      assert.equal(suppliedUserId.status, 400)
    })
  } finally {
    server.close()
    await once(server, 'close')
  }
})
