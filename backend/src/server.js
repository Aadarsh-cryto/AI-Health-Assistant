import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import app from './app.js'
import { getJwtSecret } from './config/auth.js'
import { connectDB } from './config/db.js'

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) })

const port = Number(process.env.PORT ?? 3000)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.')
}

function getConnectionErrorCategory(error) {
  const code = error?.code ?? error?.cause?.code
  const codeName = error?.codeName ?? error?.cause?.codeName

  if (error?.name === 'MongoParseError') {
    return 'invalid MongoDB URI format'
  }

  if (code === 18 || codeName === 'AuthenticationFailed') {
    return 'authentication failed'
  }

  if (code === 'ENOTFOUND') {
    return 'DNS lookup failed'
  }

  if (code === 'ETIMEDOUT') {
    return 'network connection timed out'
  }

  if (code === 'ECONNREFUSED') {
    return 'connection refused'
  }

  if (error?.name === 'MongooseServerSelectionError') {
    return 'server selection failed; check network access and the Atlas IP access list'
  }

  return 'MongoDB connection failed'
}

try {
  getJwtSecret()
  await connectDB()
  app.listen(port, () => {
    console.log(`Health assistant API listening on port ${port}.`)
  })
} catch (error) {
  const category =
    error?.message === 'JWT_SECRET must contain at least 32 bytes.'
      ? error.message
      : getConnectionErrorCategory(error)
  console.error(`Server startup failed: ${category}`)
  process.exitCode = 1
}
