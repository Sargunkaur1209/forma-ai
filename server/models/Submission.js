import mongoose from 'mongoose';

const { Schema } = mongoose;

const submissionSchema = new Schema(
  {
    formId: { type: String, required: true, trim: true },
    formVersion: { type: Number, required: true },
    answers: { type: Schema.Types.Mixed, required: true },
    status: { type: String, required: true, enum: ['submitted'], default: 'submitted' },
  },
  { timestamps: true, collection: 'submissions' }
);

submissionSchema.index({ formId: 1, createdAt: -1 });

export default mongoose.model('Submission', submissionSchema);
