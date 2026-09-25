// Temporary manual test harness; likely to be superseded when Vitest is introduced on Day 13.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { evaluateShowIf } from './evaluateShowIf.js';

describe('evaluateShowIf', () => {
  it('always shows fields without showIf', () => {
    assert.equal(evaluateShowIf(undefined, {}), true);
    assert.equal(evaluateShowIf(null, {}), true);
  });

  it('evaluates eq conditions', () => {
    const showIf = { all: [{ field: 'incidentType', op: 'eq', value: 'collision' }] };

    assert.equal(evaluateShowIf(showIf, { incidentType: 'collision' }), true);
    assert.equal(evaluateShowIf(showIf, { incidentType: 'theft' }), false);
  });

  it('evaluates neq conditions', () => {
    const showIf = { all: [{ field: 'incidentType', op: 'neq', value: 'theft' }] };

    assert.equal(evaluateShowIf(showIf, { incidentType: 'collision' }), true);
    assert.equal(evaluateShowIf(showIf, { incidentType: 'theft' }), false);
  });

  it('evaluates in conditions', () => {
    const showIf = { all: [{ field: 'animalType', op: 'in', value: ['deer', 'moose'] }] };

    assert.equal(evaluateShowIf(showIf, { animalType: 'deer' }), true);
    assert.equal(evaluateShowIf(showIf, { animalType: 'rabbit' }), false);
  });

  it('evaluates gt and lt conditions', () => {
    assert.equal(
      evaluateShowIf({ all: [{ field: 'amount', op: 'gt', value: 100 }] }, { amount: 101 }),
      true,
    );
    assert.equal(
      evaluateShowIf({ all: [{ field: 'amount', op: 'gt', value: 100 }] }, { amount: 100 }),
      false,
    );
    assert.equal(
      evaluateShowIf({ all: [{ field: 'amount', op: 'lt', value: 100 }] }, { amount: 99 }),
      true,
    );
    assert.equal(
      evaluateShowIf({ all: [{ field: 'amount', op: 'lt', value: 100 }] }, { amount: 100 }),
      false,
    );
  });

  it('requires every condition in an all group', () => {
    const showIf = {
      all: [
        { field: 'incidentType', op: 'eq', value: 'animal_collision' },
        { field: 'animalType', op: 'neq', value: 'other' },
      ],
    };

    assert.equal(
      evaluateShowIf(showIf, { incidentType: 'animal_collision', animalType: 'deer' }),
      true,
    );
    assert.equal(
      evaluateShowIf(showIf, { incidentType: 'animal_collision', animalType: 'other' }),
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

    assert.equal(evaluateShowIf(showIf, { incidentType: 'collision', animalType: 'deer' }), true);
    assert.equal(evaluateShowIf(showIf, { incidentType: 'collision', animalType: 'other' }), false);
  });

  it('fails conditions for missing fields', () => {
    const showIf = { all: [{ field: 'animalType', op: 'neq', value: 'other' }] };

    assert.equal(evaluateShowIf(showIf, {}), false);
  });
});
