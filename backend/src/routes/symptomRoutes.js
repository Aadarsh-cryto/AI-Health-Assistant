import { Router } from 'express'
import { createSymptomController } from '../controllers/symptomController.js'
import { createAuthMiddleware } from '../middleware/authMiddleware.js'
import { analyzeWithGemini } from '../services/geminiService.js'

export function createSymptomRouter({
  getSecret,
  analyzeSymptoms = analyzeWithGemini,
}) {
  const router = Router()
  const authenticate = createAuthMiddleware({ getSecret })
  const controller = createSymptomController({ analyzeSymptoms, getSecret })

  router.post('/analyze', authenticate, controller.analyze)

  return router
}
