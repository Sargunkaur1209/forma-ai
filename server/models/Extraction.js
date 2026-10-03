import mongoose from 'mongoose';

const { Schema } = mongoose;

const extractionSchema = new Schema(
  {
    formId: { type: String, required: true, trim: true },
    formVersion: { type: Number, required: true },
    story: { type: String, required: true },
    provider: { type: String, required: true }, // "google" or "ollama"
    model: { type: String, required: true }, // e.g. "llama3.1:8b"
    status: { type: String, required: true, enum: ['success', 'failure'] },
    durationMs: { type: Number, required: true },

    // Only populated when status is "success".
    answers: { type: Schema.Types.Mixed },
    confidence: { type: Schema.Types.Mixed },
    missing: { type: [String] },
    rejected: { type: [Schema.Types.Mixed] },

    // Only populated when status is "failure".
    errorMessage: { type: String },
  },
  { timestamps: true, collection: 'extractions' }
);

extractionSchema.index({ formId: 1, createdAt: -1 });

export default mongoose.model('Extraction', extractionSchema);
