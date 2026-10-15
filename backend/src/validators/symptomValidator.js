const SEVERITIES = new Set(['mild', 'moderate', 'severe'])

export function validateSymptomRequest(body) {
  const errors = {}

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { value: null, errors: { symptoms: 'Describe the symptoms.' } }
  }

  const symptoms =
    typeof body.symptoms === 'string' ? body.symptoms.trim() : ''
  const duration =
    typeof body.duration === 'string' ? body.duration.trim() : ''
  const additionalContext =
    typeof body.additionalContext === 'string'
      ? body.additionalContext.trim()
      : ''
  const severity =
    typeof body.severity === 'string' ? body.severity.trim().toLowerCase() : ''

  for (const field of ['symptoms', 'duration', 'severity', 'additionalContext']) {
    if (field in body && typeof body[field] !== 'string') {
      errors[field] = 'Enter this field as text.'
    }
  }
  if (symptoms.length < 3 || symptoms.length > 2000) {
    errors.symptoms = 'Describe symptoms in 3 to 2,000 characters.'
  }
  if (duration.length > 120) {
    errors.duration = 'Duration must be 120 characters or fewer.'
  }
  if (severity && !SEVERITIES.has(severity)) {
    errors.severity = 'Choose mild, moderate, or severe.'
  }
  if (additionalContext.length > 1000) {
    errors.additionalContext =
      'Additional context must be 1,000 characters or fewer.'
  }

  return {
    value:
      Object.keys(errors).length === 0
        ? { symptoms, duration, severity, additionalContext }
        : null,
    errors,
  }
}

const EMERGENCY_PATTERNS = [
  /\b(?:crushing|severe|sudden)?\s*chest\s+(?:pain|pressure|tightness)\b/i,
  /\b(?:heart attack|cardiac arrest|stroke)\b/i,
  /\b(?:difficulty|trouble|unable to|can't|cannot|shortness of)\s+breath(?:e|ing)?\b/i,
  /\b(?:can't catch (?:my|their) breath|not breathing|stopped breathing|gasping for air)\b/i,
  /\b(?:face droop(?:ing)?|slurred speech|sudden trouble speaking|sudden confusion)\b/i,
  /\b(?:sudden (?:weakness|numbness|loss of sensation) (?:in|on) (?:one|the left|the right) side|one-sided weakness|one side of (?:my|their) body (?:is )?(?:weak|numb))\b/i,
  /\b(?:unconscious|loss of consciousness|passed out|cannot be woken|won't wake up)\b/i,
  /\b(?:uncontrolled|severe|heavy) bleeding\b/i,
  /\bseizure\b/i,
  /\b(?:anaphylaxis|severe allergic reaction|throat (?:or tongue )?swelling)\b/i,
  /\b(?:overdose|poison(?:ing)?|swallowed (?:a )?poison|took too many (?:pills|tablets|medications))\b/i,
  /\b(?:suicid(?:al|e)|going to kill myself|want to end my life)\b/i,
  /\b(?:worst headache of my life|sudden severe headache)\b/i,
  /\b(?:choking|blue (?:lips|skin)|vomiting blood|blood in (?:my )?vomit|blood in (?:my )?stool|black stools|severe burn|serious head injury|severe abdominal pain)\b/i,
]

export function findEmergencyConcern({ symptoms, additionalContext = '' }) {
  const text = `${symptoms} ${additionalContext}`
  return EMERGENCY_PATTERNS.some((pattern) => pattern.test(text))
}
