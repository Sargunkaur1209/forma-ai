import { z } from 'zod';
import { flattenFields } from '../services/formFields.js';

// One Zod type per field type. Every field is nullable: the model returns
// null when the story does not say anything about it, instead of guessing.
function zodForField(field) {
  let schema;
  switch (field.type) {
    case 'number':
      schema = z.number();
      break;
    case 'checkbox':
      schema = z.boolean();
      break;
    case 'select':
    case 'radio':
      schema = z.enum(field.options.map((option) => option.value));
      break;
    case 'date':
      schema = z.string().describe('Date in YYYY-MM-DD format');
      break;
    default:
      schema = z.string(); // text, textarea
  }
  return schema.nullable();
}

// Builds the output schema from the form schema, so the form stays the
// source of truth for which keys exist and which values are valid.
export function buildExtractionSchema(form) {
  const shape = {};
  for (const field of flattenFields(form)) {
    shape[field.key] = zodForField(field);
  }
  return z.object(shape);
}
