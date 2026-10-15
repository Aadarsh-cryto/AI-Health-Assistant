import { deleteJson, getJson, postJson, putJson } from './api.js'

export function getHistoryViewState({ isLoading, error, records }) {
  if (isLoading) return 'loading'
  if (error) return 'error'
  if (!Array.isArray(records) || records.length === 0) return 'empty'
  return 'success'
}

export function getHealthProfileViewMode({
  isLoading,
  error,
  hasProfile,
  isEditing,
}) {
  if (isLoading) return 'loading'
  if (error) return 'error'
  if (hasProfile && !isEditing) return 'report'
  return 'form'
}

export function getHealthHistory() {
  return getJson('/api/health-history')
}

export function getHealthHistoryRecord(recordId) {
  return getJson(`/api/health-history/${encodeURIComponent(recordId)}`)
}

export function deleteHealthHistoryRecord(recordId) {
  return deleteJson(`/api/health-history/${encodeURIComponent(recordId)}`)
}

export function getHealthProfile() {
  return getJson('/api/health-profile')
}

export function saveHealthProfile(profile) {
  return putJson('/api/health-profile', profile)
}

export function buildHistoryRecordPayload({
  analysis,
  receipt,
  consent,
}) {
  if (
    consent !== true ||
    !analysis ||
    analysis.emergency === true ||
    typeof receipt !== 'string' ||
    receipt.length === 0
  ) {
    throw new TypeError(
      'Consent, a completed non-emergency analysis, and its server receipt are required.',
    )
  }
  return { consent: true, receipt, analysis }
}

export function saveHealthHistoryRecord(payload) {
  return postJson('/api/health-history', payload)
}
