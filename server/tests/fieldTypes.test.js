import { buildExtractionSchema } from '../ai/buildExtractionSchema.js';
import { validateFormSchema } from '../services/validateFormSchema.js';
import autoClaimSimple from '../seeds/autoClaimSimple.js';
import homeClaim from '../seeds/homeClaim.js';
import healthClaim from '../seeds/healthClaim.js';
import { flattenFields } from '../services/formFields.js';

const claimForms = [
  ['auto claim', autoClaimSimple],
  ['home claim', homeClaim],
  ['health claim', healthClaim],
];

describe('number, date and radio field types (Day 14)', () => {
  test('the auto claim form includes date, number and radio field types', () => {
    const types = flattenFields(autoClaimSimple).map((f) => f.type);

    expect(types).toContain('date');
    expect(types).toContain('number');
    expect(types).toContain('radio');
  });

  test('the auto claim form passes structural validation', () => {
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

describe('schema-driven claim types (Day 22)', () => {
  test.each(claimForms)(
    '%s form passes structural validation',
    (_name, form) => {
      expect(validateFormSchema(form)).toEqual([]);
    }
  );

  test.each(claimForms)(
    '%s form generates an extraction schema',
    (_name, form) => {
      const schema = buildExtractionSchema(form);

      expect(schema).toBeDefined();
      expect(typeof schema.safeParse).toBe('function');
    }
  );

  test.each(claimForms)(
    '%s extraction schema contains every field defined in the form',
    (_name, form) => {
      const schema = buildExtractionSchema(form);
      const expectedKeys = flattenFields(form).map((field) => field.key);
      const actualKeys = Object.keys(schema.shape);

      expect(actualKeys.sort()).toEqual(expectedKeys.sort());
    }
  );

  test('home claim extraction schema accepts valid home claim answers', () => {
    const schema = buildExtractionSchema(homeClaim);

    const result = schema.safeParse({
      incidentType: 'water_damage',
      waterSource: 'burst_pipe',
      waterShutOff: true,
      incidentDate: '2026-10-05',
      propertyAddress: '10 Example Street',
      description: 'A pipe burst under the kitchen sink.',
      roomsAffected: 2,
      habitable: 'yes',
      estimatedDamageCost: 2500,
    });

    expect(result.success).toBe(true);
  });

  test('home claim extraction schema rejects an invalid incident type', () => {
    const schema = buildExtractionSchema(homeClaim);
    const result = schema.safeParse({ incidentType: 'earthquake' });

    expect(result.success).toBe(false);
  });

  test('health claim extraction schema accepts valid health claim answers', () => {
    const schema = buildExtractionSchema(healthClaim);

    const result = schema.safeParse({
      visitType: 'emergency',
      emergencyAdmitted: true,
      nightsAdmitted: 2,
      visitDate: '2026-10-05',
      providerName: 'Example Medical Center',
      reasonForVisit: 'Treatment after an accident.',
      totalBillAmount: 1250,
      hasOtherInsurance: 'no',
      receiptsAvailable: true,
    });

    expect(result.success).toBe(true);
  });

  test('health claim extraction schema rejects an invalid visit type', () => {
    const schema = buildExtractionSchema(healthClaim);
    const result = schema.safeParse({ visitType: 'unlisted_visit' });

    expect(result.success).toBe(false);
  });
});
