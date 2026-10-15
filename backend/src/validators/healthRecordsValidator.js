import { SUPPORTED_SPECIALTY_CATEGORIES } from '../services/geminiService.js'
import { getPersistableAnalysis } from '../services/healthHistoryReceipt.js'

const ANALYSIS_ARRAY_LIMITS = {
  possibleExplanations: { max: 5, itemLength: 500 },
  selfCare: { max: 5, itemLength: 500 },
  warningSigns: { max: 6, itemLength: 500 },
}

function validText(value, maxLength) {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= maxLength
  )
}

function validateTextArray(value, { max, itemLength }) {
  return (
    Array.isArray(value) &&
    value.length <= max &&
    value.every((item) => validText(item, itemLength))
  )
}

export function validateCreateHistoryRecord(body) {
  const errors = {}
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { value: null, errors: { analysis: 'Provide a valid analysis.' } }
  }

  const { analysis } = body
  if (
    body.consent !== true ||
    typeof body.receipt !== 'string' ||
    body.receipt.length < 1 ||
    body.receipt.length > 2048
  ) {
    errors.consent = 'Confirm consent and submit a valid analysis receipt.'
  }
  if (
    !analysis ||
    typeof analysis !== 'object' ||
    Array.isArray(analysis) ||
    !validText(analysis.summary, 800) ||
    !validText(analysis.recommendedNextStep, 600) ||
    !validText(analysis.disclaimer, 300)
  ) {
    errors.analysis = 'The analysis result is incomplete.'
  }
  if (analysis && typeof analysis === 'object') {
    for (const [field, constraints] of Object.entries(ANALYSIS_ARRAY_LIMITS)) {
      if (!validateTextArray(analysis[field], constraints)) {
        errors.analysis = 'The analysis result is incomplete or too large.'
      }
    }
    if (
      analysis.recommendedSpecialties !== undefined &&
      (!Array.isArray(analysis.recommendedSpecialties) ||
        analysis.recommendedSpecialties.length > 3 ||
        !analysis.recommendedSpecialties.every((category) =>
          SUPPORTED_SPECIALTY_CATEGORIES.includes(category),
        ))
    ) {
      errors.analysis = 'The analysis contains an unsupported category.'
    }
    if (analysis.emergency === true) {
      errors.analysis = 'Emergency guidance is not saved to health history.'
    }
  }

  return {
    value:
      Object.keys(errors).length === 0
        ? {
            receipt: body.receipt,
            analysis: getPersistableAnalysis(analysis),
          }
        : null,
    errors,
  }
}

const PROFILE_FIELDS = Object.freeze([
  'age',
  'allergies',
  'conditions',
  'medications',
  'notes',
])

export function validateHealthProfile(body) {
  const errors = {}
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { value: null, errors: { profile: 'Provide valid profile fields.' } }
  }

  const extraFields = Object.keys(body).filter(
    (field) => !PROFILE_FIELDS.includes(field),
  )
  if (extraFields.length > 0) {
    errors.profile = 'Only supported optional profile fields can be saved.'
  }

  let age = null
  if (body.age !== undefined && body.age !== null && body.age !== '') {
    age = Number(body.age)
    if (!Number.isInteger(age) || age < 13 || age > 120) {
      errors.age = 'Age must be a whole number between 13 and 120.'
    }
  }

  const value = { age }
  for (const field of PROFILE_FIELDS.slice(1)) {
    const fieldValue = body[field] ?? ''
    if (typeof fieldValue !== 'string') {
      errors[field] = 'Enter this field as text.'
    } else if (fieldValue.length > 1000) {
      errors[field] = 'This field must be 1,000 characters or fewer.'
    } else {
      value[field] = fieldValue.trim()
    }
  }

  return {
    value: Object.keys(errors).length === 0 ? value : null,
    errors,
  }
}
