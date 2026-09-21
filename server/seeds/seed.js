import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import FormSchema from '../models/FormSchema.js';
import autoClaimSimple from './autoClaimSimple.js';

const forms = [autoClaimSimple];

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  for (const form of forms) {
    // Find + save (not updateOne) so the model's validation hook runs.
    const doc =
      (await FormSchema.findOne({ formId: form.formId, version: form.version })) ??
      new FormSchema();
    doc.set(form);
    await doc.save();
    console.log(`Seeded ${form.formId} v${form.version}`);
  }
}

try {
  await seed();
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
