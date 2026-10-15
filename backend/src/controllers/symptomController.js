import { performance } from 'node:perf_hooks'
import { SymptomServiceError } from '../services/geminiService.js'
import { createHistoryReceipt } from '../services/healthHistoryReceipt.js'
import {
  findEmergencyConcern,
  validateSymptomRequest,
} from '../validators/symptomValidator.js'

const EMERGENCY_MESSAGE =
  'Your description may include an emergency warning sign. Contact your local emergency services or go to the nearest emergency department now. Do not wait for AI analysis.'

const SERVICE_MESSAGES = {
  not_configured:
    'Symptom analysis is not configured yet. Please try again later.',
  rate_limit:
    'Symptom analysis is busy right now. Please wait briefly and try again.',
  timeout:
    'Analysis timed out. Please try again.',
  provider_unavailable:
    'Symptom analysis is temporarily unavailable. Please try again later.',
  invalid_api_key:
    'Symptom analysis is temporarily unavailable. Please try again later.',
  access_denied:
    'Symptom analysis is temporarily unavailable. Please try again later.',
  model_unavailable:
    'Symptom analysis is temporarily unavailable. Please try again later.',
  invalid_response:
    'A safe analysis could not be prepared. Please try again later.',
  unavailable:
    'Symptom analysis is temporarily unavailable. Please try again later.',
}

function emergencyResult() {
  return {
    summary: EMERGENCY_MESSAGE,
    possibleExplanations: [],
    selfCare: [],
    warningSigns: [EMERGENCY_MESSAGE],
    recommendedNextStep: EMERGENCY_MESSAGE,
    disclaimer:
      'This tool cannot assess emergencies. Do not wait for or rely on AI-generated information.',
    emergency: true,
  }
}

export function createSymptomController({ analyzeSymptoms, getSecret }) {
  async function analyze(request, response, next) {
    const startedAt = performance.now()
    const { value, errors } = validateSymptomRequest(request.body)
    if (Object.keys(errors).length > 0) {
      return response.status(400).json({
        success: false,
        message: 'Check the highlighted fields.',
        errors,
      })
    }

    if (findEmergencyConcern(value)) {
      return response.status(200).json({
        success: true,
        result: emergencyResult(),
      })
    }

    try {
      const result = await analyzeSymptoms(value)
      return response.status(200).json({
        success: true,
        result,
        ...(!result.emergency
          ? {
              historyReceipt: createHistoryReceipt(
                result,
                request.auth.userId,
                getSecret(),
              ),
            }
          : {}),
      })
    } catch (error) {
      if (error instanceof SymptomServiceError) {
        const statusByKind = {
          not_configured: 503,
          rate_limit: 429,
          timeout: 504,
          provider_unavailable: 503,
          invalid_api_key: 502,
          access_denied: 502,
          model_unavailable: 502,
        }
        const status = statusByKind[error.kind] ?? 502
        const category = /^[a-z_]{1,40}$/.test(error.kind)
          ? error.kind
          : 'unknown'
        const providerStatus = Number.isInteger(error.status)
          ? error.status
          : 'unknown'
        const attempt = Number.isInteger(error.attempt)
          ? error.attempt
          : 'unknown'
        const elapsedMs = Math.round(performance.now() - startedAt)
        console.error(
          `Symptom analysis failed: category=${category} httpStatus=${status} providerStatus=${providerStatus} attempt=${attempt} elapsedMs=${elapsedMs}`,
        )
        return response.status(status).json({
          success: false,
          message:
            SERVICE_MESSAGES[error.kind] ?? SERVICE_MESSAGES.unavailable,
        })
      }

      return next(error)
    }
  }

  return { analyze }
}
