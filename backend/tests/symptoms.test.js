import assert from 'node:assert/strict'
import { once } from 'node:events'
import jwt from 'jsonwebtoken'
import { test } from 'node:test'
import { createApp } from '../src/app.js'
import {
  analyzeWithGemini,
  createGeminiAnalyzer,
  parseGeminiOutput,
  SymptomServiceError,
  validateGeminiResult,
} from '../src/services/geminiService.js'
import { validateSymptomRequest } from '../src/validators/symptomValidator.js'

const testSecret = 'symptom-tests-only-secret-with-32-bytes'
const validResult = {
  summary: 'You described a mild headache that began recently.',
  possibleExplanations: [
    'Headaches can have many possible causes, including dehydration or tension.',
  ],
  selfCare: ['Consider resting and drinking water if appropriate for you.'],
  warningSigns: ['Seek urgent help for sudden severe pain or new weakness.'],
  recommendedNextStep:
    'Contact a healthcare professional if the symptom persists or worsens.',
  disclaimer: 'This information is not a diagnosis or medical advice.',
  recommendedSpecialties: ['general_practice'],
  emergency: false,
}

test('validates symptom input lengths and field types', () => {
  assert.deepEqual(validateSymptomRequest({ symptoms: '' }).errors, {
    symptoms: 'Describe symptoms in 3 to 2,000 characters.',
  })
  assert.ok(
    validateSymptomRequest({
      symptoms: 'Headache',
      duration: 'x'.repeat(121),
    }).errors.duration,
  )
  assert.ok(
    validateSymptomRequest({
      symptoms: 'Headache',
      severity: 'extreme',
    }).errors.severity,
  )
  assert.ok(
    validateSymptomRequest({
      symptoms: 'Headache',
      additionalContext: 'x'.repeat(1001),
    }).errors.additionalContext,
  )
  assert.ok(
    validateSymptomRequest({ symptoms: 'Headache', duration: 4 }).errors
      .duration,
  )

  const normalized = validateSymptomRequest({
    symptoms: '  Headache  ',
    duration: ' Since yesterday ',
    severity: 'MODERATE',
    additionalContext: '  Worse in the evening  ',
  })
  assert.deepEqual(normalized, {
    value: {
      symptoms: 'Headache',
      duration: 'Since yesterday',
      severity: 'moderate',
      additionalContext: 'Worse in the evening',
    },
    errors: {},
  })
})

test('validates model result structure and rejects unsafe clinical claims', () => {
  assert.throws(
    () =>
      validateGeminiResult({
        ...validResult,
        warningSigns: 'not an array',
      }),
    (error) =>
      error instanceof SymptomServiceError &&
      error.kind === 'invalid_response',
  )
  assert.throws(
    () =>
      validateGeminiResult({
        ...validResult,
        summary: 'You have a confirmed condition.',
      }),
    (error) =>
      error instanceof SymptomServiceError &&
      error.kind === 'invalid_response',
  )
  assert.throws(
    () =>
      validateGeminiResult({
        ...validResult,
        selfCare: ['Take medication at 20 mg.'],
      }),
    (error) =>
      error instanceof SymptomServiceError &&
      error.kind === 'invalid_response',
  )
  assert.deepEqual(validateGeminiResult(validResult), validResult)
})

test('allowlists, deduplicates, and safely defaults model specialty categories', () => {
  assert.deepEqual(
    validateGeminiResult({
      ...validResult,
      recommendedSpecialties: [
        'dermatology',
        'untrusted-category',
        'dermatology',
        'cardiology',
        'urology',
      ],
    }).recommendedSpecialties,
    ['dermatology', 'cardiology', 'urology'],
  )
  assert.deepEqual(
    validateGeminiResult({
      ...validResult,
      recommendedSpecialties: ['untrusted-category'],
    }).recommendedSpecialties,
    ['general_practice'],
  )
})

test('fails safely when Gemini is not configured', async () => {
  const originalKey = process.env.GEMINI_API_KEY
  try {
    delete process.env.GEMINI_API_KEY
    await assert.rejects(
      analyzeWithGemini({ symptoms: 'Headache' }),
      (error) =>
        error instanceof SymptomServiceError &&
        error.kind === 'not_configured',
    )
  } finally {
    if (originalKey === undefined) {
      delete process.env.GEMINI_API_KEY
    } else {
      process.env.GEMINI_API_KEY = originalKey
    }
  }
})

test('mocks Gemini structured output and rejects malformed model JSON', async () => {
  const { emergency: _emergency, ...modelResult } = validResult
  let modelRequest
  const analyzer = createGeminiAnalyzer({
    environment: {
      GEMINI_API_KEY: 'test-only-key',
      GEMINI_MODEL: 'test-model',
    },
    createClient: (apiKey) => {
      assert.equal(apiKey, 'test-only-key')
      return {
        interactions: {
          create: async (request, options) => {
            modelRequest = { request, options }
            return { output_text: JSON.stringify(modelResult) }
          },
        },
      }
    },
  })

  assert.deepEqual(await analyzer({ symptoms: 'Headache' }), validResult)
  assert.equal(modelRequest.request.model, 'test-model')
  assert.equal(modelRequest.request.response_format.mime_type, 'application/json')
  assert.ok(
    modelRequest.request.response_format.schema.properties
      .recommendedSpecialties.items.enum.includes('dermatology'),
  )
  assert.equal(modelRequest.options.timeout_ms, 20_000)
  assert.ok(modelRequest.options.signal instanceof AbortSignal)
  assert.equal(modelRequest.options.retries.strategy, 'none')
  assert.match(modelRequest.request.input, /"symptoms":"Headache"/)
  assert.throws(
    () => parseGeminiOutput('{not valid JSON'),
    (error) =>
      error instanceof SymptomServiceError &&
      error.kind === 'invalid_response',
  )
})

test('uses the cost-efficient Gemini model default when no model is configured', async () => {
  const { emergency: _emergency, ...modelResult } = validResult
  let requestedModel
  const analyzer = createGeminiAnalyzer({
    environment: { GEMINI_API_KEY: 'test-only-key' },
    createClient: () => ({
      interactions: {
        create: async (request) => {
          requestedModel = request.model
          return { output_text: JSON.stringify(modelResult) }
        },
      },
    }),
  })

  await analyzer({ symptoms: 'Headache' })
  assert.equal(requestedModel, 'gemini-3.5-flash-lite')
})

test('converts Gemini rate-limit errors without exposing provider messages', async () => {
  const analyzer = createGeminiAnalyzer({
    environment: { GEMINI_API_KEY: 'test-only-key' },
    createClient: () => ({
      interactions: {
        create: async () => {
          const error = new Error('provider message with private metadata')
          error.status = 429
          throw error
        },
      },
    }),
  })

  await assert.rejects(
    analyzer({ symptoms: 'Headache' }),
    (error) =>
      error instanceof SymptomServiceError && error.kind === 'rate_limit',
  )
})

test('retries transient Gemini 503 errors with exponential backoff then succeeds', async () => {
  const { emergency: _emergency, ...modelResult } = validResult
  let calls = 0
  const delays = []
  const analyzer = createGeminiAnalyzer({
    environment: { GEMINI_API_KEY: 'test-only-key' },
    sleep: async (delay) => delays.push(delay),
    createClient: () => ({
      interactions: {
        create: async () => {
          calls += 1
          if (calls === 1) {
            const error = new Error('temporary provider outage')
            error.name = 'InternalServerError'
            error.status = 503
            throw error
          }
          return { output_text: JSON.stringify(modelResult) }
        },
      },
    }),
  })

  assert.deepEqual(
    await analyzer({ symptoms: 'Fictional mild headache' }),
    validResult,
  )
  assert.equal(calls, 2)
  assert.deepEqual(delays, [500])
})

test('retries Gemini 408 responses', async () => {
  const { emergency: _emergency, ...modelResult } = validResult
  let calls = 0
  const analyzer = createGeminiAnalyzer({
    environment: { GEMINI_API_KEY: 'test-only-key' },
    sleep: async () => {},
    createClient: () => ({
      interactions: {
        create: async () => {
          calls += 1
          if (calls === 1) {
            const error = new Error('request timeout')
            error.status = 408
            throw error
          }
          return { output_text: JSON.stringify(modelResult) }
        },
      },
    }),
  })

  assert.deepEqual(
    await analyzer({ symptoms: 'Fictional mild headache' }),
    validResult,
  )
  assert.equal(calls, 2)
})

test('retries SDK connection timeouts and succeeds on a later attempt', async () => {
  const { emergency: _emergency, ...modelResult } = validResult
  let calls = 0
  const delays = []
  const analyzer = createGeminiAnalyzer({
    environment: { GEMINI_API_KEY: 'test-only-key' },
    sleep: async (delay) => delays.push(delay),
    createClient: () => ({
      interactions: {
        create: async () => {
          calls += 1
          if (calls === 1) {
            const error = new Error('SDK connection timeout')
            error.name = 'APIConnectionTimeoutError'
            throw error
          }
          return { output_text: JSON.stringify(modelResult) }
        },
      },
    }),
  })

  assert.deepEqual(
    await analyzer({ symptoms: 'Fictional mild headache' }),
    validResult,
  )
  assert.equal(calls, 2)
  assert.deepEqual(delays, [500])
})

test('bounds retries to three attempts and does not retry permission errors', async () => {
  const analyzer = createGeminiAnalyzer({
    environment: { GEMINI_API_KEY: 'test-only-key' },
    sleep: async () => {},
    createClient: () => ({
      interactions: {
        create: async () => {
          const error = new Error('temporary provider outage')
          error.status = 500
          throw error
        },
      },
    }),
  })

  await assert.rejects(
    analyzer({ symptoms: 'Fictional mild headache' }),
    (error) =>
      error instanceof SymptomServiceError &&
      error.kind === 'provider_unavailable' &&
      error.status === 500,
  )

  let retryCalls = 0
  const permissionAnalyzer = createGeminiAnalyzer({
    environment: { GEMINI_API_KEY: 'test-only-key' },
    sleep: async () => {},
    createClient: () => ({
      interactions: {
        create: async () => {
          retryCalls += 1
          const error = new Error('access denied')
          error.status = 403
          throw error
        },
      },
    }),
  })
  await assert.rejects(
    permissionAnalyzer({ symptoms: 'Fictional mild headache' }),
    (error) =>
      error instanceof SymptomServiceError && error.kind === 'access_denied',
  )
  assert.equal(retryCalls, 1)
})

test('applies a per-attempt timeout within the total elapsed-time budget', async () => {
  let currentTime = 0
  const timeouts = []
  const analyzer = createGeminiAnalyzer({
    environment: { GEMINI_API_KEY: 'test-only-key' },
    now: () => currentTime,
    sleep: async (delay) => {
      currentTime += delay
    },
    retryPolicy: {
      requestTimeoutMs: 20_000,
      maxAttempts: 3,
      maxElapsedMs: 5_000,
      initialDelayMs: 500,
    },
    createClient: () => ({
      interactions: {
        create: async (_request, options) => {
          timeouts.push(options.timeout_ms)
          currentTime += 4_000
          const error = new Error('timed out')
          error.name = 'APIConnectionTimeoutError'
          throw error
        },
      },
    }),
  })

  await assert.rejects(
    analyzer({ symptoms: 'Fictional mild headache' }),
    (error) =>
      error instanceof SymptomServiceError && error.kind === 'timeout',
  )
  assert.deepEqual(timeouts, [5_000, 500])
})

test('aborts an SDK call that never settles within the bounded retry budget', async () => {
  const signals = []
  const timeouts = []
  const analyzer = createGeminiAnalyzer({
    environment: { GEMINI_API_KEY: 'test-only-key' },
    retryPolicy: {
      requestTimeoutMs: 15,
      maxAttempts: 2,
      maxElapsedMs: 2_000,
      initialDelayMs: 1,
    },
    createClient: () => ({
      interactions: {
        create: async (_request, options) => {
          signals.push(options.signal)
          timeouts.push(options.timeout_ms)
          return new Promise(() => {})
        },
      },
    }),
  })

  await assert.rejects(
    analyzer({ symptoms: 'Fictional mild headache' }),
    (error) =>
      error instanceof SymptomServiceError &&
      error.kind === 'timeout' &&
      error.code === 'APP_ATTEMPT_TIMEOUT' &&
      error.attempt === 2 &&
      Number.isFinite(error.elapsedMs) &&
      error.elapsedMs <= 2_100,
  )
  assert.equal(signals.length, 2)
  assert.ok(signals.every((signal) => signal.aborted))
  assert.ok(timeouts.every((timeout) => timeout > 0 && timeout <= 15))
})

test('protects symptom analysis and returns safe result/error responses', async (t) => {
  let analyzerCalls = 0
  let analyzer = async () => {
    analyzerCalls += 1
    return validResult
  }
  const app = createApp({
    getSecret: () => testSecret,
    analyzeSymptoms: (...args) => analyzer(...args),
  })
  const server = app.listen(0, '127.0.0.1')

  try {
    await once(server, 'listening')
    const { port } = server.address()
    const baseUrl = `http://127.0.0.1:${port}`
    const token = jwt.sign({}, testSecret, {
      algorithm: 'HS256',
      subject: 'test-user',
      expiresIn: '5m',
    })

    async function request(body, { authenticated = true } = {}) {
      const headers = { 'content-type': 'application/json' }
      if (authenticated) {
        headers.cookie = `health_assistant_session=${token}`
      }
      return fetch(`${baseUrl}/api/symptoms/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
    }

    function analyzerForProviderError(providerError) {
      return createGeminiAnalyzer({
        environment: { GEMINI_API_KEY: 'test-only-key' },
        retryPolicy: {
          requestTimeoutMs: 20,
          maxAttempts: 1,
          maxElapsedMs: 20,
          initialDelayMs: 1,
        },
        createClient: () => ({
          interactions: {
            create: async () => {
              throw providerError
            },
          },
        }),
      })
    }

    await t.test('preserves the existing health endpoint', async () => {
      const response = await fetch(`${baseUrl}/api/health`)
      assert.equal(response.status, 200)
      assert.deepEqual(await response.json(), { status: 'ok' })
    })

    await t.test('rejects unauthenticated requests before calling Gemini', async () => {
      const response = await request({ symptoms: 'Headache' }, {
        authenticated: false,
      })
      assert.equal(response.status, 401)
      assert.deepEqual(await response.json(), {
        success: false,
        message: 'Authentication required.',
      })
      assert.equal(analyzerCalls, 0)
    })

    await t.test('returns field validation errors without calling Gemini', async () => {
      const response = await request({
        symptoms: '',
        duration: 'x'.repeat(121),
        severity: 'extreme',
      })
      assert.equal(response.status, 400)
      const payload = await response.json()
      assert.equal(payload.success, false)
      assert.ok(payload.errors.symptoms)
      assert.ok(payload.errors.duration)
      assert.ok(payload.errors.severity)
      assert.equal(analyzerCalls, 0)
    })

    await t.test('formats a successful analysis response', async () => {
      analyzer = async (input) => {
        analyzerCalls += 1
        assert.equal(input.symptoms, 'Headache')
        assert.equal(input.severity, 'moderate')
        return validResult
      }
      const response = await request({
        symptoms: ' Headache ',
        severity: 'moderate',
      })
      assert.equal(response.status, 200)
      const payload = await response.json()
      assert.deepEqual(payload, {
        success: true,
        result: validResult,
        historyReceipt: payload.historyReceipt,
      })
      assert.match(payload.historyReceipt, /^[\w-]+\.[\w-]+\.[\w-]+$/)
      assert.equal(analyzerCalls, 1)
    })

    await t.test('routes emergency concerns without relying on Gemini', async () => {
      analyzer = async () => {
        analyzerCalls += 1
        throw new Error('Gemini must not be called for emergency reports')
      }
      const response = await request({ symptoms: 'crushing chest pain' })
      assert.equal(response.status, 200)
      const payload = await response.json()
      assert.equal(payload.result.emergency, true)
      assert.equal('historyReceipt' in payload, false)
      assert.match(payload.result.recommendedNextStep, /local emergency services/)
      assert.equal(analyzerCalls, 1)
    })

    await t.test('maps model failures without exposing internal errors', async () => {
      const originalConsoleError = console.error
      const diagnosticLines = []
      console.error = (message) => diagnosticLines.push(message)
      analyzer = async () => {
        throw new SymptomServiceError('timeout', {
          attempt: 2,
          elapsedMs: 62_000,
        })
      }
      try {
        const response = await request({ symptoms: 'A mild headache' })
        assert.equal(response.status, 504)
        const payload = await response.json()
        assert.equal(payload.success, false)
        assert.match(payload.message, /timed out/)
        assert.doesNotMatch(JSON.stringify(payload), /secret|Gemini must not/)
        assert.match(diagnosticLines.join('\n'), /category=timeout/)
        assert.match(diagnosticLines.join('\n'), /httpStatus=504/)
        assert.match(diagnosticLines.join('\n'), /attempt=2/)
        assert.match(diagnosticLines.join('\n'), /elapsedMs=/)
        assert.doesNotMatch(diagnosticLines.join('\n'), /A mild headache/)
      } finally {
        console.error = originalConsoleError
      }
    })

    await t.test('maps rate limits to a retryable client response', async () => {
      const providerError = new Error('provider rate limit')
      providerError.status = 429
      analyzer = analyzerForProviderError(providerError)
      const response = await request({ symptoms: 'A mild headache' })
      assert.equal(response.status, 429)
      assert.match((await response.json()).message, /busy right now/)
    })

    await t.test('maps SDK connection timeouts to HTTP 504', async () => {
      const providerError = new Error('connection timeout')
      providerError.name = 'APIConnectionTimeoutError'
      analyzer = analyzerForProviderError(providerError)
      const response = await request({ symptoms: 'A mild headache' })
      assert.equal(response.status, 504)
      assert.match((await response.json()).message, /timed out/)
    })

    await t.test('maps upstream 503 failures to unavailable, not rate limit', async () => {
      const providerError = new Error('provider unavailable')
      providerError.status = 503
      analyzer = analyzerForProviderError(providerError)
      const response = await request({ symptoms: 'A mild headache' })
      assert.equal(response.status, 503)
      assert.match((await response.json()).message, /temporarily unavailable/)
    })

    await t.test('maps unknown provider errors to unavailable, not rate limit', async () => {
      analyzer = analyzerForProviderError(new Error('unclassified provider error'))
      const response = await request({ symptoms: 'A mild headache' })
      assert.equal(response.status, 502)
      assert.match((await response.json()).message, /temporarily unavailable/)
    })
  } finally {
    server.close()
    await once(server, 'close')
  }
})
