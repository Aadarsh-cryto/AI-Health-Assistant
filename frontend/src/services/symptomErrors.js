const TIMEOUT_MESSAGE = 'Analysis timed out. Please try again.'
const RATE_LIMIT_MESSAGE =
  'Symptom analysis is busy right now. Please wait briefly and try again.'
const PROVIDER_UNAVAILABLE_MESSAGE =
  'Symptom analysis is temporarily unavailable. Please try again later.'

export function getSymptomAnalysisErrorMessage(error) {
  if (
    error?.status === 504 ||
    /timed out|timeout/i.test(error?.message ?? '')
  ) {
    return TIMEOUT_MESSAGE
  }

  if (error?.status === 429) {
    return RATE_LIMIT_MESSAGE
  }

  if (error?.status === 502 || error?.status === 503) {
    return PROVIDER_UNAVAILABLE_MESSAGE
  }

  return error?.message || 'Could not analyze symptoms. Try again.'
}
