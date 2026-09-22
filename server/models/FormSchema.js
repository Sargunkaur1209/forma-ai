import mongoose from 'mongoose';
import { FIELD_TYPES } from './formConstants.js';
import {
  validateFormSchema,
  SchemaValidationError,
} from '../services/validateFormSchema.js';

const { Schema } = mongoose;

const optionSchema = new Schema(
  {
    value: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const validationSchema = new Schema(
  {
    pattern: String,
    min: Number,
    max: Number,
    message: String,
  },
  { _id: false }
);

const fieldSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      match: [/^[A-Za-z][A-Za-z0-9_]*$/, 'Field key must be letters, digits or _'],
    },
    type: { type: String, required: true, enum: FIELD_TYPES },
    label: { type: String, required: true, trim: true },
    required: { type: Boolean, default: false },
    options: { type: [optionSchema], default: undefined },
    validation: { type: validationSchema, default: undefined },
    // Shape { all|any: [{ field, op, value }] }. Stored as Mixed here;
    // its structure is checked by the schema validator (Day 4 to 5).
    showIf: { type: Schema.Types.Mixed, default: undefined },
  },
  { _id: false }
);

const sectionSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    fields: { type: [fieldSchema], default: [] },
  },
  { _id: false }
);

const formSchema = new Schema(
  {
    formId: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    version: { type: Number, required: true, default: 1, min: 1 },
    sections: { type: [sectionSchema], default: [] },
  },
  { timestamps: true, collection: 'forms' }
);

// Old drafts keep working after a schema change because versions are kept.
formSchema.index({ formId: 1, version: 1 }, { unique: true });

// Rules that plain field definitions cannot express.
// Cross-field rules live in services/validateFormSchema.js.
formSchema.pre('validate', async function () {
  const errors = validateFormSchema(this.toObject());
  if (errors.length) throw new SchemaValidationError(errors);
});

export default mongoose.model('FormSchema', formSchema);