function evaluateCondition(condition, values) {
  const actualValue = values[condition.field];

  if (actualValue === undefined) {
    return false;
  }

  switch (condition.op) {
    case 'eq':
      return actualValue === condition.value;
    case 'neq':
      return actualValue !== condition.value;
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(actualValue);
    case 'gt': {
      const actualNumber = toFiniteNumber(actualValue);
      const expectedNumber = toFiniteNumber(condition.value);
      return actualNumber !== null && expectedNumber !== null && actualNumber > expectedNumber;
    }
    case 'lt': {
      const actualNumber = toFiniteNumber(actualValue);
      const expectedNumber = toFiniteNumber(condition.value);
      return actualNumber !== null && expectedNumber !== null && actualNumber < expectedNumber;
    }
    default:
      return false;
  }
}

function toFiniteNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function evaluateShowIf(showIf, values) {
  if (!showIf) {
    return true;
  }

  const conditions = showIf.all ?? showIf.any;

  if (!Array.isArray(conditions)) {
    return false;
  }

  if (showIf.all) {
    return conditions.every((condition) => evaluateCondition(condition, values));
  }

  return conditions.some((condition) => evaluateCondition(condition, values));
}
