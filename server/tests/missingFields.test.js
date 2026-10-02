import { extractClaim } from '../ai/extractClaim.js';
import { flattenFields } from '../services/formFields.js';
import autoClaimSimple from '../seeds/autoClaimSimple.js';

const allUndefined = () =>
  Object.fromEntries(flattenFields(autoClaimSimple).map((f) => [f.key, undefined]));

const fakeModel = (output) => ({
  withStructuredOutput: () => ({ invoke: async () => output }),
});

describe('missing required fields respect showIf (Day 16)', () => {
  test('a required field hidden by showIf is not reported as missing', async () => {
    // otherPartyInsured is required, but only visible when otherPartyAtFault is true.
    // Here otherPartyAtFault is never answered, so the field stays hidden.
    const model = fakeModel({
      ...allUndefined(),
      incidentType: 'collision',
      incidentDate: '2026-09-27',
      incidentLocation: 'Main Street',
      vehicleMake: 'honda',
      damageArea: 'front',
    });
    const result = await extractClaim(autoClaimSimple, 'story', { model });

    expect(result.missing).not.toContain('otherPartyInsured');
  });

  test('a required field becomes missing once showIf makes it visible', async () => {
    // Same story, but now otherPartyAtFault is true, which reveals
    // otherPartyInsured. The story does not say whether they were insured,
    // so it should now be reported as missing.
    const model = fakeModel({
      ...allUndefined(),
      incidentType: 'collision',
      incidentDate: '2026-09-27',
      incidentLocation: 'Main Street',
      vehicleMake: 'honda',
      damageArea: 'front',
      otherPartyAtFault: true,
    });
    const result = await extractClaim(autoClaimSimple, 'story', { model });

    expect(result.missing).toContain('otherPartyInsured');
  });

  test('a required field that becomes visible and is answered is not missing', async () => {
    const model = fakeModel({
      ...allUndefined(),
      incidentType: 'collision',
      incidentDate: '2026-09-27',
      incidentLocation: 'Main Street',
      vehicleMake: 'honda',
      damageArea: 'front',
      otherPartyAtFault: true,
      otherPartyInsured: true,
    });
    const result = await extractClaim(autoClaimSimple, 'story', { model });

    expect(result.missing).not.toContain('otherPartyInsured');
    expect(result.answers.otherPartyInsured).toBe(true);
  });

  test('an unrelated unconditional required field is still reported as missing', async () => {
    // Nothing about the incident is stated at all.
    const model = fakeModel(allUndefined());
    const result = await extractClaim(autoClaimSimple, 'story with no details', { model });

    expect(result.missing).toContain('incidentType');
    expect(result.missing).not.toContain('otherPartyInsured'); // still hidden
  });
});
