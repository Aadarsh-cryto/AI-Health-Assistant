import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  buildHistoryRecordPayload,
  getHealthProfileViewMode,
  getHistoryViewState,
} from './healthRecords.js'

test('represents history loading, error, empty, and successful states', () => {
  assert.equal(
    getHistoryViewState({ isLoading: true, error: '', records: [] }),
    'loading',
  )
  assert.equal(
    getHistoryViewState({
      isLoading: false,
      error: 'Could not load.',
      records: [],
    }),
    'error',
  )
  assert.equal(
    getHistoryViewState({ isLoading: false, error: '', records: [] }),
    'empty',
  )
  assert.equal(
    getHistoryViewState({
      isLoading: false,
      error: '',
      records: [{ id: 'record-1' }],
    }),
    'success',
  )
})

test('shows the form for first-time users and the report for saved profiles', () => {
  assert.equal(
    getHealthProfileViewMode({
      isLoading: true,
      error: '',
      hasProfile: false,
      isEditing: false,
    }),
    'loading',
  )
  assert.equal(
    getHealthProfileViewMode({
      isLoading: false,
      error: '',
      hasProfile: false,
      isEditing: false,
    }),
    'form',
  )
  assert.equal(
    getHealthProfileViewMode({
      isLoading: false,
      error: '',
      hasProfile: true,
      isEditing: false,
    }),
    'report',
  )
  assert.equal(
    getHealthProfileViewMode({
      isLoading: false,
      error: '',
      hasProfile: true,
      isEditing: true,
    }),
    'form',
  )
  assert.equal(
    getHealthProfileViewMode({
      isLoading: false,
      error: 'Unable to load.',
      hasProfile: true,
      isEditing: false,
    }),
    'error',
  )
})

test('history payload requires consent and excludes raw symptom input', () => {
  const analysis = {
    summary: 'Short generated summary.',
    recommendedSpecialties: ['general_practice'],
  }
  assert.throws(
    () =>
      buildHistoryRecordPayload({
        consent: false,
        receipt: 'signed-analysis-receipt',
        analysis,
      }),
    /Consent/,
  )
  assert.deepEqual(
    buildHistoryRecordPayload({
      consent: true,
      receipt: 'signed-analysis-receipt',
      analysis,
      symptoms: 'Sensitive raw symptom text is not included.',
    }),
    { consent: true, receipt: 'signed-analysis-receipt', analysis },
  )
  assert.throws(
    () =>
      buildHistoryRecordPayload({
        consent: true,
        receipt: 'signed-analysis-receipt',
        analysis: { ...analysis, emergency: true },
      }),
    /non-emergency/,
  )
})
