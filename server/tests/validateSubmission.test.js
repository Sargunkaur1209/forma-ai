import { validateSubmission } from '../services/validateSubmission.js';
import autoClaimSimple from '../seeds/autoClaimSimple.js';

const fullValidAnswers = {
  incidentType: 'collision',
  incidentDate: '2026-09-27',
  incidentLocation: 'Main Street',
  vehicleMake: 'honda',
  damageArea: 'front',
};

describe('validateSubmission (Day 18)', () => {
  test('accepts a complete, valid submission', () => {
    const result = validateSubmission(autoClaimSimple, fullValidAnswers);
    expect(result.ok).toBe(true);
    expect(result.answers).toMatchObject(fullValidAnswers);
  });

  test('rejects when a visible required field is missing', () => {
    const { incidentType, ...rest } = fullValidAnswers;
    const result = validateSubmission(autoClaimSimple, rest);
    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual({ key: 'incidentType', reason: 'is required' });
  });

  test('does not require a field that is hidden by showIf', () => {
    // otherPartyInsured is required, but only when otherPartyAtFault is true.
    // Here otherPartyAtFault is never set (collision, fault unstated), so it
    // must not be required.
    const result = validateSubmission(autoClaimSimple, fullValidAnswers);
    expect(result.ok).toBe(true);
  });

  test('requires a field once showIf makes it visible', () => {
    const answers = { ...fullValidAnswers, otherPartyAtFault: true };
    const result = validateSubmission(autoClaimSimple, answers);
    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual({ key: 'otherPartyInsured', reason: 'is required' });
  });

  test('strips the value of a hidden field even if the client sent one', () => {
    // animalType only applies to animal_collision, but the client sends it
    // anyway alongside a collision incidentType (stale/manipulated state).
    const answers = { ...fullValidAnswers, animalType: 'deer' };
    const result = validateSubmission(autoClaimSimple, answers);
    expect(result.ok).toBe(true);
    expect(result.answers.animalType).toBeUndefined();
  });

  test('rejects a select value that is not an allowed option', () => {
    const answers = { ...fullValidAnswers, vehicleMake: 'batmobile' };
    const result = validateSubmission(autoClaimSimple, answers);
    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({ key: 'vehicleMake' }));
  });

  test('rejects a malformed date', () => {
    const answers = { ...fullValidAnswers, incidentDate: '27/09/2026' };
    const result = validateSubmission(autoClaimSimple, answers);
    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual({ key: 'incidentDate', reason: 'must be in YYYY-MM-DD format' });
  });

  test('rejects a number out of range', () => {
    const answers = { ...fullValidAnswers, estimatedRepairCost: -50 };
    const result = validateSubmission(autoClaimSimple, answers);
    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({ key: 'estimatedRepairCost' }));
  });

  test('rejects a wrong type for a checkbox field', () => {
    const answers = { ...fullValidAnswers, vehicleDriveable: 'yes' };
    const result = validateSubmission(autoClaimSimple, answers);
    expect(result.ok).toBe(false);
  });

  test('a non-required field left blank is accepted and omitted', () => {
    const result = validateSubmission(autoClaimSimple, fullValidAnswers);
    expect(result.ok).toBe(true);
    expect(result.answers).not.toHaveProperty('description');
  });

  test('collects multiple errors at once, not just the first', () => {
    const result = validateSubmission(autoClaimSimple, {});
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
