import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import jwt from 'jsonwebtoken'

export function getPersistableAnalysis(analysis) {
  return {
    summary: analysis.summary.trim(),
    possibleExplanations: analysis.possibleExplanations.map((item) =>
      item.trim(),
    ),
    selfCare: analysis.selfCare.map((item) => item.trim()),
    warningSigns: analysis.warningSigns.map((item) => item.trim()),
    recommendedNextStep: analysis.recommendedNextStep.trim(),
    disclaimer: analysis.disclaimer.trim(),
    recommendedSpecialties: analysis.recommendedSpecialties ?? [],
  }
}

function getDigest(analysis) {
  return createHash('sha256')
    .update(JSON.stringify(getPersistableAnalysis(analysis)))
    .digest()
}

export function createHistoryReceipt(analysis, userId, secret) {
  const digest = getDigest(analysis).toString('hex')
  return jwt.sign(
    { digest, jti: randomUUID() },
    secret,
    { algorithm: 'HS256', subject: userId, expiresIn: '30m' },
  )
}

export function verifyHistoryReceipt(receipt, analysis, userId, secret) {
  try {
    const payload = jwt.verify(receipt, secret, {
      algorithms: ['HS256'],
    })
    if (
      typeof payload !== 'object' ||
      payload.sub !== userId ||
      typeof payload.jti !== 'string' ||
      !/^[a-f0-9-]{36}$/i.test(payload.jti) ||
      typeof payload.digest !== 'string' ||
      !/^[a-f0-9]{64}$/i.test(payload.digest)
    ) {
      return null
    }

    const expected = Buffer.from(payload.digest, 'hex')
    const actual = getDigest(analysis)
    return timingSafeEqual(expected, actual) ? payload.jti : null
  } catch {
    return null
  }
}
