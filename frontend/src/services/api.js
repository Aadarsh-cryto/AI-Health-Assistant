export class ApiError extends Error {
  constructor(message, { status, errors = {}, choices = [] } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.choices = choices
  }
}

async function requestJson(
  path,
  { method, body, timeoutMs, signal: externalSignal } = {},
) {
  const controller =
    timeoutMs || externalSignal ? new AbortController() : null
  let timedOut = false
  let timeoutId = null
  const abortFromCaller = () => controller?.abort()
  if (externalSignal?.aborted) controller?.abort()
  else externalSignal?.addEventListener('abort', abortFromCaller, { once: true })
  if (controller && timeoutMs) {
    timeoutId = window.setTimeout(() => {
      timedOut = true
      controller.abort()
    }, timeoutMs)
  }

  try {
    const response = await fetch(path, {
      method,
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller?.signal,
    })

    let result
    try {
      result = await response.json()
    } catch (error) {
      if (controller?.signal.aborted || externalSignal?.aborted) throw error
      throw new ApiError('The server returned an unreadable response.', {
        status: response.status,
      })
    }

    if (!response.ok || result.success !== true) {
      throw new ApiError(
        typeof result.message === 'string'
          ? result.message
          : 'The request could not be completed. Please try again.',
        {
          status: response.status,
          errors:
            result.errors && typeof result.errors === 'object'
              ? result.errors
              : {},
          choices: Array.isArray(result.choices)
            ? result.choices
                .filter((choice) => typeof choice === 'string')
                .slice(0, 5)
            : [],
        },
      )
    }

    return result
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (timedOut) {
      throw new ApiError('Request timed out. Please try again.')
    }
    if (externalSignal?.aborted) {
      throw new ApiError('Request cancelled.')
    }
    throw new ApiError(
      'Could not reach the server. Check your connection and try again.',
    )
  } finally {
    if (timeoutId !== null) window.clearTimeout(timeoutId)
    externalSignal?.removeEventListener('abort', abortFromCaller)
  }
}

export function postJson(path, body, options) {
  return requestJson(path, { method: 'POST', body, ...options })
}

export function getJson(path, options) {
  return requestJson(path, { method: 'GET', ...options })
}

export function deleteJson(path, options) {
  return requestJson(path, { method: 'DELETE', ...options })
}

export function putJson(path, body, options) {
  return requestJson(path, { method: 'PUT', body, ...options })
}
