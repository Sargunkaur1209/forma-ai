export function buildValidationRules(field) {
  const rules = {};
  const validation = field.validation ?? {};
  const requiredMessage =
    typeof validation.required === 'string' ? validation.required : validation.required?.message;

  if (field.required === true) {
    rules.required =
      requiredMessage ?? (field.label ? `${field.label} is required` : 'This field is required');
  }

  if (validation.pattern) {
    rules.pattern = {
      value: new RegExp(validation.pattern),
      message: validation.message || 'Invalid format',
    };
  }

  if (typeof validation.min === 'number') {
    rules.min = {
      value: validation.min,
      message: validation.message || `Value must be at least ${validation.min}`,
    };
  }

  if (typeof validation.max === 'number') {
    rules.max = {
      value: validation.max,
      message: validation.message || `Value must be at most ${validation.max}`,
    };
  }

  return rules;
}
