import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getSymptomAnalysisErrorMessage } from './symptomErrors.js'

test('maps HTTP 504 and request timeouts to the timeout message', () => {
  assert.equal(
    getSymptomAnalysisErrorMessage({ status: 504 }),
    'Analysis timed out. Please try again.',
  )
  assert.equal(
    getSymptomAnalysisErrorMessage(new Error('Request timed out.')),
    'Analysis timed out. Please try again.',
  )
})

test('uses the rate-limit message only for HTTP 429', () => {
  assert.equal(
    getSymptomAnalysisErrorMessage({ status: 429 }),
    'Symptom analysis is busy right now. Please wait briefly and try again.',
  )
  assert.equal(
    getSymptomAnalysisErrorMessage({
      status: 503,
      message: 'Symptom analysis is busy right now.',
    }),
    'Symptom analysis is temporarily unavailable. Please try again later.',
  )
})

test('maps HTTP 503 provider failures to a temporary-unavailable message', () => {
  assert.equal(
    getSymptomAnalysisErrorMessage({ status: 503 }),
    'Symptom analysis is temporarily unavailable. Please try again later.',
  )
})
