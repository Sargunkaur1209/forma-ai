import { OPERATORS } from '../models/formConstants.js';

const OPTION_TYPES = ['select', 'radio'];
const TEXT_TYPES = ['text', 'textarea'];
const MAX_PATTERN_LENGTH = 200;

export class SchemaValidationError extends Error {
  constructor(errors) {
    super(errors.join('; '));
    this.name = 'SchemaValidationError';
    this.details = errors;
  }
}

function checkOptions(field, name, errors) {
  if (OPTION_TYPES.includes(field.type)) {
    if (!field.options?.length) {
      errors.push(`${name} (${field.type}) needs options`);
      return;
    }
    const values = field.options.map((o) => o.value);
    if (new Set(values).size !== values.length) {
      errors.push(`${name} has duplicate option values`);
    }
  } else if (field.options?.length) {
    errors.push(`${name} (${field.type}) cannot have options`);
  }
}

function checkRules(field, name, errors) {
  const rules = field.validation;
  if (!rules) return;

  if (rules.pattern != null) {
    if (!TEXT_TYPES.includes(field.type)) {
      errors.push(`${name}: pattern only applies to text and textarea`);
    } else if (rules.pattern.length > MAX_PATTERN_LENGTH) {
      errors.push(`${name}: pattern is longer than ${MAX_PATTERN_LENGTH} characters`);
    } else {
      try {
        new RegExp(rules.pattern);
      } catch {
        errors.push(`${name}: pattern is not a valid regex`);
      }
    }
  }

  if (rules.min != null || rules.max != null) {
    if (field.type !== 'number') {
      errors.push(`${name}: min and max only apply to number`);
    } else if (rules.min != null && rules.max != null && rules.min > rules.max) {
      errors.push(`${name}: min is greater than max`);
    }
  }
}

function checkCondition({ op, value }, target, name, errors) {
  if (op === 'gt' || op === 'lt') {
    if (target.type !== 'number' || typeof value !== 'number') {
      errors.push(`${name}: "${op}" needs a number field and a number value`);
    }
    return;
  }
  if (op === 'in' && (!Array.isArray(value) || value.length === 0)) {
    errors.push(`${name}: "in" needs a non-empty array`);
    return;
  }

  const values = op === 'in' ? value : [value];

  if (OPTION_TYPES.includes(target.type)) {
    const allowed = new Set(target.options?.map((o) => o.value));
    for (const v of values) {
      if (!allowed.has(v)) {
        errors.push(`${name}: "${v}" is not an option of "${target.key}"`);
      }
    }
  } else if (target.type === 'checkbox' && values.some((v) => typeof v !== 'boolean')) {
    errors.push(`${name}: checkbox "${target.key}" can only be compared with true or false`);
  }
}

function checkShowIf(field, fields, errors) {
  const rule = field.showIf;
  if (rule == null) return;
  const name = `Field "${field.key}" showIf`;

  const groups = typeof rule === 'object' ? ['all', 'any'].filter((g) => g in rule) : [];
  if (groups.length !== 1) {
    errors.push(`${name} needs exactly one of "all" or "any"`);
    return;
  }

  const conditions = rule[groups[0]];
  if (!Array.isArray(conditions) || conditions.length === 0) {
    errors.push(`${name}: "${groups[0]}" must be a non-empty array`);
    return;
  }

  for (const cond of conditions) {
    const target = fields.get(cond?.field);
    if (!target) {
      errors.push(`${name}: unknown field "${cond?.field}"`);
    } else if (!OPERATORS.includes(cond.op)) {
      errors.push(`${name}: unknown operator "${cond.op}"`);
    } else {
      checkCondition(cond, target, name, errors);
    }
  }
}

function findLoop(fields) {
  const deps = new Map();
  for (const [key, field] of fields) {
    const conditions = field.showIf?.all ?? field.showIf?.any;
    deps.set(
      key,
      Array.isArray(conditions)
        ? conditions.map((c) => c?.field).filter((k) => fields.has(k))
        : []
    );
  }

  const state = new Map();
  const visit = (key) => {
    if (state.get(key) === 2) return false;
    if (state.get(key) === 1) return true;
    state.set(key, 1);
    for (const dep of deps.get(key)) {
      if (visit(dep)) return true;
    }
    state.set(key, 2);
    return false;
  };

  return [...fields.keys()].find((key) => visit(key));
}

export function validateFormSchema(form) {
  const errors = [];
  const fields = new Map();
  const sectionIds = new Set();

  for (const section of Array.isArray(form?.sections) ? form.sections : []) {
    if (sectionIds.has(section.id)) errors.push(`Duplicate section id: ${section.id}`);
    sectionIds.add(section.id);

    for (const field of section.fields ?? []) {
      if (typeof field.key !== 'string') continue;
      if (fields.has(field.key)) {
        errors.push(`Duplicate field key: ${field.key}`);
      } else {
        fields.set(field.key, field);
      }
    }
  }

  if (fields.size === 0) errors.push('Form needs at least one field');

  for (const field of fields.values()) {
    const name = `Field "${field.key}"`;
    checkOptions(field, name, errors);
    checkRules(field, name, errors);
    checkShowIf(field, fields, errors);
  }

  const loopKey = findLoop(fields);
  if (loopKey) errors.push(`showIf rules contain a loop (check "${loopKey}")`);

  return errors;
}