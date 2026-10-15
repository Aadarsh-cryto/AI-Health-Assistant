import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  buildGoogleMapsSpecialtySearches,
  getDoctorNavigationState,
  validateDoctorSearchCity,
} from './doctorSpecialty.js'

test('validates and normalizes supported city names', () => {
  assert.deepEqual(validateDoctorSearchCity('  New   York  '), {
    city: 'New York',
    error: '',
  })
  for (const city of ['', 'x', 'Delhi<script>', 'a'.repeat(121), null]) {
    assert.ok(validateDoctorSearchCity(city).error)
  }
})

test('forwards only unique allowlisted specialty categories from an analysis result', () => {
  const navigationState = getDoctorNavigationState({
    recommendedSpecialties: [
      'dermatology',
      'unknown-category',
      'dermatology',
      'cardiology',
    ],
    summary: 'Sensitive symptom text is not copied to navigation state.',
  })
  assert.deepEqual(navigationState, {
    specialties: ['dermatology', 'cardiology'],
  })
  assert.deepEqual(getDoctorNavigationState(navigationState), navigationState)
  assert.deepEqual(getDoctorNavigationState({}).specialties, [
    'general_practice',
  ])
})

test('builds URL-encoded Google Maps searches only for requested specialties', () => {
  const searches = buildGoogleMapsSpecialtySearches(
    "St. John's",
    ['general_practice', 'unknown-category', 'dermatology'],
  )
  assert.deepEqual(
    searches.map(({ specialty, searchTerm }) => [specialty, searchTerm]),
    [
      ['general_practice', 'general physician'],
      ['general_practice', 'general medicine doctor'],
      ['dermatology', 'dermatologist'],
    ],
  )
  for (const search of searches) {
    const url = new URL(search.url)
    assert.equal(url.origin, 'https://www.google.com')
    assert.equal(url.pathname, '/maps/search/')
    assert.equal(url.searchParams.get('api'), '1')
    assert.equal(
      url.searchParams.get('query'),
      `${search.searchTerm} in St. John's`,
    )
  }
})

test('rejects invalid city text and falls back to a safe specialty category', () => {
  assert.throws(
    () => buildGoogleMapsSpecialtySearches('Delhi<script>', ['dermatology']),
    /Enter a city/,
  )
  assert.equal(
    buildGoogleMapsSpecialtySearches('London', ['untrusted'])[0].specialty,
    'general_practice',
  )
})
