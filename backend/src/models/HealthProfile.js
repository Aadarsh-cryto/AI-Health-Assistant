import mongoose from 'mongoose'

const healthProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    age: { type: Number, min: 13, max: 120, default: null },
    allergies: { type: String, maxlength: 1000, default: '' },
    conditions: { type: String, maxlength: 1000, default: '' },
    medications: { type: String, maxlength: 1000, default: '' },
    notes: { type: String, maxlength: 1000, default: '' },
  },
  { timestamps: true },
)

const HealthProfile = mongoose.model('HealthProfile', healthProfileSchema)

export default HealthProfile
