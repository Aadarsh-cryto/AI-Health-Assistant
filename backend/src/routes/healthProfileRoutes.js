import { Router } from 'express'
import { createHealthProfileController } from '../controllers/healthProfileController.js'
import { createAuthMiddleware } from '../middleware/authMiddleware.js'
import HealthProfile from '../models/HealthProfile.js'

export function createHealthProfileRouter({
  getSecret,
  ProfileModel = HealthProfile,
}) {
  const router = Router()
  const authenticate = createAuthMiddleware({ getSecret })
  const controller = createHealthProfileController({ ProfileModel })

  router.use(authenticate)
  router.get('/', controller.get)
  router.put('/', controller.update)

  return router
}
