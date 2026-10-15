import mongoose from 'mongoose'

const analysisSchema = new mongoose.Schema(
  {
    summary: { type: String, required: true, maxlength: 800 },
    possibleExplanations: { type: [String], required: true, maxlength: 5 },
    selfCare: { type: [String], required: true, maxlength: 5 },
    warningSigns: { type: [String], required: true, maxlength: 6 },
    recommendedNextStep: { type: String, required: true, maxlength: 600 },
    disclaimer: { type: String, required: true, maxlength: 300 },
    recommendedSpecialties: { type: [String], default: [], maxlength: 3 },
  },
  { _id: false },
)

const healthHistoryRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    idempotencyKey: { type: String, required: true, maxlength: 64 },
    symptomSummary: { type: String, required: true, maxlength: 280 },
    analysis: { type: analysisSchema, required: true },
  },
  { timestamps: true },
)

healthHistoryRecordSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true },
)
healthHistoryRecordSchema.index({ userId: 1, createdAt: -1 })

const HealthHistoryRecord = mongoose.model(
  'HealthHistoryRecord',
  healthHistoryRecordSchema,
)

export default HealthHistoryRecord
