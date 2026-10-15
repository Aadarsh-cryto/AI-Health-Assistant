import { Router } from 'express'
import { createHealthHistoryController } from '../controllers/healthHistoryController.js'
import { createAuthMiddleware } from '../middleware/authMiddleware.js'
import HealthHistoryRecord from '../models/HealthHistoryRecord.js'

export function createHealthHistoryRouter({
  getSecret,
  RecordModel = HealthHistoryRecord,
}) {
  const router = Router()
  const authenticate = createAuthMiddleware({ getSecret })
  const controller = createHealthHistoryController({ RecordModel, getSecret })

  router.use(authenticate)
  router.get('/', controller.list)
  router.post('/', controller.create)
  router.get('/:recordId', controller.get)
  router.delete('/:recordId', controller.remove)

  return router
}
