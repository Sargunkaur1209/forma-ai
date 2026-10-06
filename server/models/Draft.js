import mongoose from 'mongoose';

const { Schema } = mongoose;

const draftSchema = new Schema(
  {
    formId: { type: String, required: true, trim: true },
    formVersion: { type: Number, required: true, min: 1 },
    // The original story the user typed into MagicInput (optional).
    story: { type: String, trim: true },
    // Partial answers — no required-field validation here.
    // That is only enforced at final submit (POST /api/submissions).
    answers: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, required: true, enum: ['draft'], default: 'draft' },
  },
  { timestamps: true, collection: 'drafts' }
);

// Lets us quickly list drafts for a given form, newest first.
draftSchema.index({ formId: 1, createdAt: -1 });

export default mongoose.model('Draft', draftSchema);
