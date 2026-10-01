import { extractClaim } from '../ai/extractClaim.js';
import { flattenFields } from '../services/formFields.js';
import autoClaimSimple from '../seeds/autoClaimSimple.js';

const allNull = () =>
  Object.fromEntries(flattenFields(autoClaimSimple).map((f) => [f.key, undefined]));

const fakeModel = (output) => ({
  withStructuredOutput: () => ({ invoke: async () => output }),
});

describe('extractClaim normalization and confidence (Day 15)', () => {
  test('an exact option value gets high confidence', async () => {
    const model = fakeModel({ ...allNull(), vehicleMake: 'honda' });
    const result = await extractClaim(autoClaimSimple, 'story', { model });
    expect(result.answers.vehicleMake).toBe('honda');
    expect(result.confidence.vehicleMake).toBe('high');
  });

  test('a differently-cased option value is normalized with medium confidence', async () => {
    const model = fakeModel({ ...allNull(), vehicleMake: 'HONDA' });
    const result = await extractClaim(autoClaimSimple, 'story', { model });
    expect(result.answers.vehicleMake).toBe('honda');
    expect(result.confidence.vehicleMake).toBe('medium');
  });

  test('a value matching the option label is normalized with medium confidence', async () => {
    const model = fakeModel({ ...allNull(), incidentType: 'Hit an animal' });
    const result = await extractClaim(autoClaimSimple, 'story', { model });
    expect(result.answers.incidentType).toBe('animal_collision');
    expect(result.confidence.incidentType).toBe('medium');
  });

  test('a value that matches no option, even normalized, is rejected', async () => {
    const model = fakeModel({ ...allNull(), vehicleMake: 'batmobile' });
    const result = await extractClaim(autoClaimSimple, 'story', { model });
    expect(result.answers.vehicleMake).toBeUndefined();
    expect(result.rejected).toContainEqual(expect.objectContaining({ key: 'vehicleMake' }));
  });

  test('free text fields always get medium confidence', async () => {
    const model = fakeModel({ ...allNull(), incidentLocation: 'I-95' });
    const result = await extractClaim(autoClaimSimple, 'story', { model });
    expect(result.confidence.incidentLocation).toBe('medium');
  });

  test('checkbox, number and date fields get high confidence once valid', async () => {
    const model = fakeModel({
      ...allNull(),
      vehicleDriveable: true,
      estimatedRepairCost: 1500,
      incidentDate: '2026-09-27',
    });
    const result = await extractClaim(autoClaimSimple, 'story', { model });
    expect(result.confidence.vehicleDriveable).toBe('high');
    expect(result.confidence.estimatedRepairCost).toBe('high');
    expect(result.confidence.incidentDate).toBe('high');
  });

  test('confidence only has entries for keys present in answers', async () => {
    const model = fakeModel({ ...allNull(), vehicleMake: 'honda' });
    const result = await extractClaim(autoClaimSimple, 'story', { model });
    expect(Object.keys(result.confidence)).toEqual(Object.keys(result.answers));
  });
});
