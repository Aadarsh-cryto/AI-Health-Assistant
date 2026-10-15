import { Router } from 'express'
import { createAuthController } from '../controllers/authController.js'
import { createAuthMiddleware } from '../middleware/authMiddleware.js'

export function createAuthRouter({ UserModel, getSecret }) {
  const router = Router()
  const controller = createAuthController({ UserModel, getSecret })
  const authenticate = createAuthMiddleware({ getSecret })

  router.post('/register', controller.register)
  router.post('/login', controller.login)
  router.get('/me', authenticate, controller.me)
  router.post('/logout', controller.logout)

  return router
}
