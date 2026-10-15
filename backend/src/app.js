import express from 'express'
import cookieParser from 'cookie-parser'
import User from './models/User.js'
import { getJwtSecret } from './config/auth.js'
import { errorMiddleware } from './middleware/errorMiddleware.js'
import { createAuthRouter } from './routes/authRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import { createHealthHistoryRouter } from './routes/healthHistoryRoutes.js'
import { createHealthProfileRouter } from './routes/healthProfileRoutes.js'
import { createSymptomRouter } from './routes/symptomRoutes.js'

export function createApp({
  UserModel = User,
  getSecret = getJwtSecret,
  analyzeSymptoms,
  HealthHistoryModel,
  HealthProfileModel,
} = {}) {
  const app = express()

  app.use(express.json({ limit: '10kb' }))
  app.use(cookieParser())
  app.use('/api/health', healthRoutes)
  app.use('/api/auth', createAuthRouter({ UserModel, getSecret }))
  app.use('/api/symptoms', createSymptomRouter({ getSecret, analyzeSymptoms }))
  app.use(
    '/api/health-history',
    createHealthHistoryRouter({ getSecret, RecordModel: HealthHistoryModel }),
  )
  app.use(
    '/api/health-profile',
    createHealthProfileRouter({ getSecret, ProfileModel: HealthProfileModel }),
  )
  app.use(errorMiddleware)

  return app
}

const app = createApp()

export default app
