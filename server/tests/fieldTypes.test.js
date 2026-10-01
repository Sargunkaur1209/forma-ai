import { buildExtractionSchema } from '../ai/buildExtractionSchema.js';
import { validateFormSchema } from '../services/validateFormSchema.js';
import autoClaimSimple from '../seeds/autoClaimSimple.js';
import { flattenFields } from '../services/formFields.js';

describe('number, date and radio field types (Day 14)', () => {
  test('the seed form includes at least one of each new type', () => {
    const types = flattenFields(autoClaimSimple).map((f) => f.type);
    expect(types).toContain('date');
    expect(types).toContain('number');
    expect(types).toContain('radio');
  });

  test('the seed form still passes structural validation', () => {
    expect(validateFormSchema(autoClaimSimple)).toEqual([]);
  });

  test('extraction schema accepts a valid date, number and radio value', () => {
    const schema = buildExtractionSchema(autoClaimSimple);
    const result = schema.safeParse({
      incidentDate: '2026-09-27',
      estimatedRepairCost: 1500,
      faultAcknowledged: 'yes',
    });
    expect(result.success).toBe(true);
  });

  test('extraction schema rejects a radio value that is not an allowed option', () => {
    const schema = buildExtractionSchema(autoClaimSimple);
    const result = schema.safeParse({ faultAcknowledged: 'maybe' });
    expect(result.success).toBe(false);
  });

  test('extraction schema rejects a non-numeric value for a number field', () => {
    const schema = buildExtractionSchema(autoClaimSimple);
    const result = schema.safeParse({ estimatedRepairCost: 'a lot' });
    expect(result.success).toBe(false);
  });
});
