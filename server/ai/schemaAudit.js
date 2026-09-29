// Schema audit: confirms the auto-claim form served by GET /api/forms/:formId
// is correctly structured for the mid-project review (Day 12) — three levels
// of branching, sub-branches, and no structural problems.
// Usage: node ai/schemaAudit.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import FormSchema from '../models/FormSchema.js';
import { validateFormSchema } from '../services/validateFormSchema.js';
import { flattenFields } from '../services/formFields.js';

function fieldDepth(byKey, key, seen = new Set()) {
  if (seen.has(key)) return Infinity; // loop guard
  const field = byKey[key];
  const conditions = field?.showIf?.all ?? field?.showIf?.any;
  if (!conditions) return 1;
  const parentDepths = conditions.map((c) => fieldDepth(byKey, c.field, new Set(seen).add(key)));
  return 1 + Math.max(...parentDepths);
}

async function audit(formId) {
  const results = [];
  const check = (label, pass, detail) => results.push({ label, pass, detail });

  const form = await FormSchema.findOne({ formId }).sort({ version: -1 }).lean();
  check(`Form "${formId}" exists`, !!form, form ? `version ${form.version}` : 'not found in database');
  if (!form) return results;

  const structuralErrors = validateFormSchema(form);
  check(
    'Schema passes structural validation',
    structuralErrors.length === 0,
    structuralErrors.length ? structuralErrors.join('; ') : 'no errors'
  );

  const fields = flattenFields(form);
  const byKey = Object.fromEntries(fields.map((f) => [f.key, f]));
  check('Form has at least one field', fields.length > 0, `${fields.length} fields`);

  const branchingFields = fields.filter((f) => f.showIf);
  check(
    'Form has fields with showIf rules',
    branchingFields.length > 0,
    `${branchingFields.length} field(s) with showIf`
  );

  const maxDepth = Math.max(0, ...fields.map((f) => fieldDepth(byKey, f.key)));
  check('Branching reaches at least 3 levels', maxDepth >= 3, `max depth: ${maxDepth}`);

  // A sub-branch: any field that has 2+ other fields directly depending on
  // it, meaning the branching splits into separate paths from that point.
  function directChildrenOf(key) {
    return fields.filter((f) => {
      const conditions = f.showIf?.all ?? f.showIf?.any;
      return conditions?.some((c) => c.field === key);
    });
  }
  const branchPoints = fields.filter((f) => directChildrenOf(f.key).length >= 2);
  check(
    'Form has a field with multiple sub-branches',
    branchPoints.length > 0,
    branchPoints.length
      ? branchPoints.map((f) => `${f.key} -> [${directChildrenOf(f.key).map((c) => c.key).join(', ')}]`).join('; ')
      : 'no field has 2+ direct dependents'
  );

  const requiredFields = fields.filter((f) => f.required);
  check('Form has required fields', requiredFields.length > 0, `${requiredFields.length} required field(s)`);

  return results;
}

async function run() {
  await connectDB(process.env.MONGODB_URI);
  const formId = process.argv[2] || 'auto_claim_v1';

  console.log(`Schema audit: ${formId}\n`);
  const results = await audit(formId);

  let failed = 0;
  for (const { label, pass, detail } of results) {
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
    if (!pass) failed++;
  }

  console.log(`\n${results.length - failed}/${results.length} checks passed.`);
  await mongoose.disconnect();
  process.exitCode = failed > 0 ? 1 : 0;
}

run().catch((err) => {
  console.error('Audit failed:', err.message);
  process.exitCode = 1;
});

