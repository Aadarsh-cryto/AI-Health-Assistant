import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

const environmentPath = fileURLToPath(new URL('../.env', import.meta.url))
dotenv.config({ path: environmentPath })

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite'

if (!apiKey) {
  console.error('Gemini connectivity check failed: category=configuration_missing')
  process.exitCode = 1
} else {
  const client = new GoogleGenAI({ apiKey })
  const startedAt = performance.now()

  try {
    await client.interactions.create(
      { model, input: 'Reply with exactly the single word OK.' },
      {
        timeout_ms: 15_000,
        retries: { strategy: 'none' },
      },
    )
    console.log(
      `Gemini connectivity check passed: elapsedMs=${Math.round(performance.now() - startedAt)}`,
    )
  } catch (error) {
    const status =
      Number.isInteger(error?.status) ? error.status :
      Number.isInteger(error?.statusCode) ? error.statusCode :
      'unknown'
    const code = error?.code ?? error?.cause?.code
    const safeCode =
      (typeof code === 'string' && /^[a-zA-Z0-9_.-]{1,60}$/.test(code)) ||
      (typeof code === 'number' && Number.isFinite(code))
        ? code
        : 'unknown'
    const name =
      typeof error?.name === 'string' &&
      /^[a-zA-Z0-9_-]{1,60}$/.test(error.name)
        ? error.name
        : 'UnknownError'
    const category =
      name.toLowerCase().includes('timeout') || safeCode === 'ETIMEDOUT'
        ? 'timeout'
        : status === 401
          ? 'authentication'
          : status === 403
            ? 'permission'
            : status === 429
              ? 'quota_or_rate_limit'
              : status >= 500 && status <= 599
                ? 'provider_failure'
                : safeCode !== 'unknown'
                  ? 'connection_or_transport'
                  : 'request_failure'
    const phase = category === 'timeout' ? 'unknown' : 'not_applicable'
    console.error(
      `Gemini connectivity check failed: category=${category} name=${name} status=${status} code=${safeCode} phase=${phase} elapsedMs=${Math.round(performance.now() - startedAt)}`,
    )
    process.exitCode = 1
  }
}
