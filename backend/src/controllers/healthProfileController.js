import { validateHealthProfile } from '../validators/healthRecordsValidator.js'

function disableCaching(response) {
  response.set('Cache-Control', 'no-store')
  response.set('Pragma', 'no-cache')
}

function serializeProfile(profile) {
  return {
    age: profile?.age ?? null,
    allergies: profile?.allergies ?? '',
    conditions: profile?.conditions ?? '',
    medications: profile?.medications ?? '',
    notes: profile?.notes ?? '',
  }
}

export function createHealthProfileController({ ProfileModel }) {
  async function get(request, response, next) {
    disableCaching(response)
    try {
      const profile = await ProfileModel.findOne({
        userId: request.auth.userId,
      }).lean()
      return response.json({
        success: true,
        profile: serializeProfile(profile),
        hasProfile: Boolean(profile),
        updatedAt: profile?.updatedAt ?? null,
      })
    } catch (error) {
      return next(error)
    }
  }

  async function update(request, response, next) {
    disableCaching(response)
    const { value, errors } = validateHealthProfile(request.body)
    if (Object.keys(errors).length > 0) {
      return response.status(400).json({
        success: false,
        message: 'Check the profile fields.',
        errors,
      })
    }
    try {
      const profile = await ProfileModel.findOneAndUpdate(
        { userId: request.auth.userId },
        { $set: value },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      ).lean()
      return response.json({
        success: true,
        profile: serializeProfile(profile),
        hasProfile: true,
        updatedAt: profile?.updatedAt ?? null,
      })
    } catch (error) {
      return next(error)
    }
  }

  return { get, update }
}
