const NUMERIC_OPS = new Set(["gt", "lt"]);

function toComparableNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Evaluates one condition against the current answers.
 * Per the schema contract: an unanswered field makes eq/in/gt/lt false,
 * and neq true (the "not equal to an unknown value" case).
 */
function evaluateCondition(condition, values) {
  const { field, op, value } = condition;
  const actual = values[field];
  const isUnanswered = actual === undefined || actual === null || actual === "";

  if (isUnanswered) {
    return op === "neq";
  }

  switch (op) {
    case "eq":
      return actual === value;
    case "neq":
      return actual !== value;
    case "in":
      return Array.isArray(value) && value.includes(actual);
    case "gt": {
      const a = toComparableNumber(actual);
      const b = toComparableNumber(value);
      return a !== null && b !== null && a > b;
    }
    case "lt": {
      const a = toComparableNumber(actual);
      const b = toComparableNumber(value);
      return a !== null && b !== null && a < b;
    }
    default:
      return false;
  }
}

/**
 * Evaluates a field's showIf rule. No rule means always visible.
 * Exactly one of "all" (AND) or "any" (OR) is expected, per the contract.
 */
export function evaluateShowIf(showIf, values) {
  if (showIf == null) return true;

  const conditions = showIf.all ?? showIf.any;
  if (!Array.isArray(conditions) || conditions.length === 0) return false;

  return showIf.all
    ? conditions.every((c) => evaluateCondition(c, values))
    : conditions.some((c) => evaluateCondition(c, values));
}

/**
 * Given a full field list (flattened, from all sections) and the current
 * answers, returns the set of keys that are currently visible. Used at
 * submit time to strip hidden fields' values before saving.
 */
export function getVisibleFieldKeys(fields, values) {
  const visible = new Set();
  for (const field of fields) {
    if (evaluateShowIf(field.showIf, values)) {
      visible.add(field.key);
    }
  }
  return visible;
}
