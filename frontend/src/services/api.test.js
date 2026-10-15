import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiError, getJson } from './api.js'

test('aborts an in-flight API request when its caller cancels', async () => {
  const originalFetch = globalThis.fetch
  const controller = new AbortController()
  globalThis.fetch = (_path, { signal }) =>
    new Promise((_, reject) => {
      signal.addEventListener(
        'abort',
        () => reject(new DOMException('Aborted', 'AbortError')),
        { once: true },
      )
    })

    test('keeps caller cancellation distinct when aborting response parsing', async () => {
      const originalFetch = globalThis.fetch
      const controller = new AbortController()
      globalThis.fetch = async (_path, { signal }) => ({
        json: () =>
          new Promise((_, reject) => {
            const rejectAbort = () => reject(new DOMException('Aborted', 'AbortError'))
            if (signal.aborted) rejectAbort()
            else signal.addEventListener('abort', rejectAbort, { once: true })
          }),
      })

      try {
        const request = getJson('/api/auth/me', {
          signal: controller.signal,
        })
        controller.abort()
        await assert.rejects(
          request,
          (error) =>
            error instanceof ApiError && error.message === 'Request cancelled.',
        )
      } finally {
        globalThis.fetch = originalFetch
      }
    })

  try {
    const request = getJson('/api/auth/me', {
      signal: controller.signal,
    })
    controller.abort()
    await assert.rejects(
      request,
      (error) =>
        error instanceof ApiError && error.message === 'Request cancelled.',
    )
  } finally {
    globalThis.fetch = originalFetch
  }
})
