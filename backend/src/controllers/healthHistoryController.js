import { validateCreateHistoryRecord } from '../validators/healthRecordsValidator.js'
import { verifyHistoryReceipt } from '../services/healthHistoryReceipt.js'

function disableCaching(response) {
  response.set('Cache-Control', 'no-store')
  response.set('Pragma', 'no-cache')
}

function serializeRecord(record) {
  return {
    id: String(record._id),
    analyzedAt: record.createdAt,
    symptomSummary: record.symptomSummary,
    analysis: record.analysis,
  }
}

export function createHealthHistoryController({ RecordModel, getSecret }) {
  async function list(request, response, next) {
    disableCaching(response)
    try {
      const records = await RecordModel.find({ userId: request.auth.userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
      return response.json({
        success: true,
        records: records.map(serializeRecord),
      })
    } catch (error) {
      return next(error)
    }
  }

  async function get(request, response, next) {
    disableCaching(response)
    try {
      const record = await RecordModel.findOne({
        _id: request.params.recordId,
        userId: request.auth.userId,
      }).lean()
      if (!record) {
        return response
          .status(404)
          .json({ success: false, message: 'History record not found.' })
      }
      return response.json({ success: true, record: serializeRecord(record) })
    } catch (error) {
      if (error?.name === 'CastError') {
        return response
          .status(404)
          .json({ success: false, message: 'History record not found.' })
      }
      return next(error)
    }
  }

  async function create(request, response, next) {
    disableCaching(response)
    const { value, errors } = validateCreateHistoryRecord(request.body)
    if (Object.keys(errors).length > 0) {
      return response.status(400).json({
        success: false,
        message: 'Check the history record fields.',
        errors,
      })
    }
    const idempotencyKey = verifyHistoryReceipt(
      value.receipt,
      value.analysis,
      request.auth.userId,
      getSecret(),
    )
    if (!idempotencyKey) {
      return response
        .status(403)
        .json({ success: false, message: 'This analysis cannot be saved.' })
    }

    try {
      const record = await RecordModel.create({
        userId: request.auth.userId,
        idempotencyKey,
        symptomSummary: value.analysis.summary.slice(0, 280),
        analysis: value.analysis,
      })
      return response.status(201).json({
        success: true,
        record: serializeRecord(record),
      })
    } catch (error) {
      if (error?.code === 11000) {
        try {
          const existing = await RecordModel.findOne({
            userId: request.auth.userId,
            idempotencyKey,
          }).lean()
          if (existing) {
            return response.json({
              success: true,
              record: serializeRecord(existing),
            })
          }
        } catch (lookupError) {
          return next(lookupError)
        }
      }
      return next(error)
    }
  }

  async function remove(request, response, next) {
    disableCaching(response)
    try {
      const record = await RecordModel.findOneAndDelete({
        _id: request.params.recordId,
        userId: request.auth.userId,
      }).lean()
      if (!record) {
        return response
          .status(404)
          .json({ success: false, message: 'History record not found.' })
      }
      return response.json({ success: true })
    } catch (error) {
      if (error?.name === 'CastError') {
        return response
          .status(404)
          .json({ success: false, message: 'History record not found.' })
      }
      return next(error)
    }
  }

  return { list, get, create, remove }
}
