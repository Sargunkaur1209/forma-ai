import { describe, expect, it } from 'vitest';
import { evaluateShowIf } from './evaluateShowIf.js';

describe('evaluateShowIf', () => {
  it('always shows fields without showIf', () => {
    expect(evaluateShowIf(undefined, {})).toBe(true);
    expect(evaluateShowIf(null, {})).toBe(true);
  });

  it('evaluates eq conditions', () => {
    const showIf = { all: [{ field: 'incidentType', op: 'eq', value: 'collision' }] };

    expect(evaluateShowIf(showIf, { incidentType: 'collision' })).toBe(true);
    expect(evaluateShowIf(showIf, { incidentType: 'theft' })).toBe(false);
  });

  it('evaluates neq conditions', () => {
    const showIf = { all: [{ field: 'incidentType', op: 'neq', value: 'theft' }] };

    expect(evaluateShowIf(showIf, { incidentType: 'collision' })).toBe(true);
    expect(evaluateShowIf(showIf, { incidentType: 'theft' })).toBe(false);
  });

  it('evaluates in conditions', () => {
    const showIf = { all: [{ field: 'animalType', op: 'in', value: ['deer', 'moose'] }] };

    expect(evaluateShowIf(showIf, { animalType: 'deer' })).toBe(true);
    expect(evaluateShowIf(showIf, { animalType: 'rabbit' })).toBe(false);
  });

  it('evaluates gt and lt conditions', () => {
    expect(
      evaluateShowIf({ all: [{ field: 'amount', op: 'gt', value: 100 }] }, { amount: 101 }),
    ).toBe(true);
    expect(
      evaluateShowIf({ all: [{ field: 'amount', op: 'gt', value: 100 }] }, { amount: 100 }),
    ).toBe(false);
    expect(
      evaluateShowIf({ all: [{ field: 'amount', op: 'lt', value: 100 }] }, { amount: 99 }),
    ).toBe(true);
    expect(
      evaluateShowIf({ all: [{ field: 'amount', op: 'lt', value: 100 }] }, { amount: 100 }),
    ).toBe(false);
  });

  it('does not treat blank or non-numeric values as zero in numeric conditions', () => {
    expect(
      evaluateShowIf({ all: [{ field: 'amount', op: 'gt', value: 0 }] }, { amount: '' }),
    ).toBe(false);
    expect(
      evaluateShowIf({ all: [{ field: 'amount', op: 'lt', value: 1 }] }, { amount: null }),
    ).toBe(false);
    expect(
      evaluateShowIf({ all: [{ field: 'amount', op: 'gt', value: '' }] }, { amount: 5 }),
    ).toBe(false);
    expect(
      evaluateShowIf({ all: [{ field: 'amount', op: 'lt', value: 10 }] }, { amount: '5' }),
    ).toBe(true);
  });

  it('requires every condition in an all group', () => {
    const showIf = {
      all: [
        { field: 'incidentType', op: 'eq', value: 'animal_collision' },
        { field: 'animalType', op: 'neq', value: 'other' },
      ],
    };

    expect(evaluateShowIf(showIf, { incidentType: 'animal_collision', animalType: 'deer' })).toBe(
      true,
    );
    expect(evaluateShowIf(showIf, { incidentType: 'animal_collision', animalType: 'other' })).toBe(
      false,
    );
  });

  it('passes when at least one condition in an any group passes', () => {
    const showIf = {
      any: [
        { field: 'incidentType', op: 'eq', value: 'theft' },
        { field: 'animalType', op: 'eq', value: 'deer' },
      ],
    };

    expect(evaluateShowIf(showIf, { incidentType: 'collision', animalType: 'deer' })).toBe(true);
    expect(evaluateShowIf(showIf, { incidentType: 'collision', animalType: 'other' })).toBe(false);
  });

  it('fails conditions for missing fields', () => {
    const showIf = { all: [{ field: 'animalType', op: 'neq', value: 'other' }] };

    expect(evaluateShowIf(showIf, {})).toBe(false);
  });
});
