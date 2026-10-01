import { getModel } from './model.js';
import { buildPrompt } from './buildPrompt.js';
import { buildExtractionSchema, zodForField } from './buildExtractionSchema.js';
import { withRetry } from './withRetry.js';
import { flattenFields } from '../services/formFields.js';
import { evaluateShowIf } from '../services/evaluateShowIf.js';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const OPTION_TYPES = ['select', 'radio'];

// Tries to match a raw string against a field's options, case-insensitively,
// by value first then by label. Returns the canonical option value, or null.
function normalizeOption(field, raw) {
  if (typeof raw !== 'string') return null;
  const needle = raw.trim().toLowerCase();
  const byValue = field.options?.find((o) => o.value.toLowerCase() === needle);
  if (byValue) return byValue.value;
  const byLabel = field.options?.find((o) => o.label.toLowerCase() === needle);
  if (byLabel) return byLabel.value;
  return null;
}

// Checks one value from the model against the form schema, and assigns a
// confidence level. The AI only proposes values. The schema decides what
// is valid, and normalization only ever maps to an already-allowed value.
function checkField(field, raw) {
  if (raw === null || raw === undefined) return { ok: true, value: null };

  // For option fields, try an exact schema match first, then a normalized
  // (case-insensitive, value-or-label) match before giving up.
  if (OPTION_TYPES.includes(field.type) && typeof raw === 'string') {
    const exact = zodForField(field).safeParse(raw);
    if (exact.success) return { ok: true, value: exact.data, confidence: 'high' };

    const normalized = normalizeOption(field, raw);
    if (normalized) return { ok: true, value: normalized, confidence: 'medium' };

    return { ok: false, reason: 'value is not valid for this field' };
  }

  const parsed = zodForField(field).safeParse(raw);
  if (!parsed.success) return { ok: false, reason: 'value is not valid for this field' };

  let value = parsed.data;
  let confidence = field.type === 'text' || field.type === 'textarea' ? 'medium' : 'high';

  if (typeof value === 'string') {
    value = value.trim();
    if (value === '') return { ok: true, value: null };

    if (field.type === 'date' && !DATE_PATTERN.test(value)) {
      return { ok: false, reason: 'date must be YYYY-MM-DD' };
    }
    const rules = field.validation;
    if (rules?.pattern && !new RegExp(rules.pattern).test(value)) {
      return { ok: false, reason: rules.message ?? 'does not match the required format' };
    }
  }

  if (typeof value === 'number') {
    const { min, max } = field.validation ?? {};
    if ((min != null && value < min) || (max != null && value > max)) {
      return { ok: false, reason: 'number is out of range' };
    }
  }

  return { ok: true, value, confidence };
}

/**
 * Turns a claim story into answers for the given form schema.
 * Returns { answers, confidence, missing, rejected }.
 * `confidence` has one entry per key in `answers`: "high" (exact schema
 * match), or "medium" (normalized option match, or free text, which has
 * no ground truth to verify against).
 * `model` and `sleep` can be injected so tests never call the real API.
 */
export async function extractClaim(form, story, { model, sleep } = {}) {
  const schema = buildExtractionSchema(form);
  const { system, user } = buildPrompt(form, story);
  const structured = (model ?? getModel()).withStructuredOutput(schema);

  const raw = await withRetry(
    () => structured.invoke([['system', system], ['human', user]]),
    { sleep }
  );

  const fields = flattenFields(form);
  const answers = {};
  const confidence = {};
  const rejected = [];

  for (const field of fields) {
    const result = checkField(field, raw?.[field.key]);
    if (!result.ok) {
      rejected.push({ key: field.key, reason: result.reason });
    } else if (result.value !== null) {
      answers[field.key] = result.value;
      confidence[field.key] = result.confidence;
    }
  }

  // Required fields that are visible under the branching rules but unanswered.
  const missing = fields
    .filter((f) => f.required && evaluateShowIf(f.showIf, answers) && answers[f.key] === undefined)
    .map((f) => f.key);

  return { answers, confidence, missing, rejected };
}
