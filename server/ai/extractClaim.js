import { getModel } from './model.js';
import { buildPrompt } from './buildPrompt.js';
import { buildExtractionSchema, zodForField } from './buildExtractionSchema.js';
import { withRetry } from './withRetry.js';
import { flattenFields } from '../services/formFields.js';
import { evaluateShowIf } from '../services/evaluateShowIf.js';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Checks one value from the model against the form schema.
// The AI only proposes values. The schema decides what is valid.
function checkField(field, raw) {
  if (raw === null || raw === undefined) return { ok: true, value: null };

  const parsed = zodForField(field).safeParse(raw);
  if (!parsed.success) return { ok: false, reason: 'value is not valid for this field' };

  let value = parsed.data;
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

  return { ok: true, value };
}

/**
 * Turns a claim story into answers for the given form schema.
 * Returns { answers, missing, rejected }.
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
  const rejected = [];

  for (const field of fields) {
    const result = checkField(field, raw?.[field.key]);
    if (!result.ok) rejected.push({ key: field.key, reason: result.reason });
    else if (result.value !== null) answers[field.key] = result.value;
  }

  // Required fields that are visible under the branching rules but unanswered.
  const missing = fields
    .filter((f) => f.required && evaluateShowIf(f.showIf, answers) && answers[f.key] === undefined)
    .map((f) => f.key);

  return { answers, missing, rejected };
}
