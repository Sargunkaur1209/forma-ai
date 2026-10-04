import { flattenFields } from './formFields.js';
import { getVisibleFieldKeys } from './evaluateShowIf.js';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const OPTION_TYPES = ['select', 'radio'];

function checkValue(field, value) {
  if (value === undefined || value === null || value === '') {
    return field.required ? { ok: false, reason: 'is required' } : { ok: true, value: undefined };
  }

  if (OPTION_TYPES.includes(field.type)) {
    const allowed = field.options?.map((o) => o.value) ?? [];
    if (!allowed.includes(value)) return { ok: false, reason: 'is not one of the allowed values' };
    return { ok: true, value };
  }

  if (field.type === 'checkbox') {
    if (typeof value !== 'boolean') return { ok: false, reason: 'must be true or false' };
    return { ok: true, value };
  }

  if (field.type === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { ok: false, reason: 'must be a number' };
    }
    const { min, max } = field.validation ?? {};
    if ((min != null && value < min) || (max != null && value > max)) {
      return { ok: false, reason: 'is out of range' };
    }
    return { ok: true, value };
  }

  if (typeof value !== 'string') return { ok: false, reason: 'must be text' };
  const trimmed = value.trim();
  if (trimmed === '') {
    return field.required ? { ok: false, reason: 'is required' } : { ok: true, value: undefined };
  }

  if (field.type === 'date' && !DATE_PATTERN.test(trimmed)) {
    return { ok: false, reason: 'must be in YYYY-MM-DD format' };
  }
  const rules = field.validation;
  if (rules?.pattern && !new RegExp(rules.pattern).test(trimmed)) {
    return { ok: false, reason: rules.message ?? 'does not match the required format' };
  }

  return { ok: true, value: trimmed };
}

/**
 * Validates and cleans a set of submitted answers against the form schema.
 * - Hidden fields (per showIf, evaluated against the submitted answers) are
 *   stripped, even if the client sent a value for them.
 * - Every visible required field must have a value.
 * - Every provided value must match its field's type and constraints.
 * Returns { ok: true, answers } or { ok: false, errors: [{ key, reason }] }.
 */
export function validateSubmission(form, submittedAnswers = {}) {
  const fields = flattenFields(form);
  const visibleKeys = getVisibleFieldKeys(fields, submittedAnswers);

  const answers = {};
  const errors = [];

  for (const field of fields) {
    if (!visibleKeys.has(field.key)) continue; // stripped: hidden fields never reach `answers`

    const result = checkValue(field, submittedAnswers[field.key]);
    if (!result.ok) {
      errors.push({ key: field.key, reason: result.reason });
    } else if (result.value !== undefined) {
      answers[field.key] = result.value;
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true, answers };
}
