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
    case 'gt':
      return Number.isFinite(Number(actualValue)) && Number(actualValue) > Number(condition.value);
    case 'lt':
      return Number.isFinite(Number(actualValue)) && Number(actualValue) < Number(condition.value);
    default:
      return false;
  }
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
