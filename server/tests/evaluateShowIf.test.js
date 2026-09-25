import { evaluateShowIf, getVisibleFieldKeys } from '../services/evaluateShowIf.js';

describe('evaluateShowIf', () => {
  test('no showIf means always visible', () => {
    expect(evaluateShowIf(undefined, {})).toBe(true);
    expect(evaluateShowIf(null, {})).toBe(true);
  });

  test('eq: true when the value matches', () => {
    const rule = { all: [{ field: 'a', op: 'eq', value: 'x' }] };
    expect(evaluateShowIf(rule, { a: 'x' })).toBe(true);
    expect(evaluateShowIf(rule, { a: 'y' })).toBe(false);
  });

  test('neq: true when the value differs', () => {
    const rule = { all: [{ field: 'a', op: 'neq', value: 'x' }] };
    expect(evaluateShowIf(rule, { a: 'y' })).toBe(true);
    expect(evaluateShowIf(rule, { a: 'x' })).toBe(false);
  });

  test('in: true when the value is in the array', () => {
    const rule = { all: [{ field: 'a', op: 'in', value: ['x', 'y'] }] };
    expect(evaluateShowIf(rule, { a: 'x' })).toBe(true);
    expect(evaluateShowIf(rule, { a: 'z' })).toBe(false);
  });

  test('gt and lt: numeric comparison', () => {
    const gtRule = { all: [{ field: 'a', op: 'gt', value: 5 }] };
    const ltRule = { all: [{ field: 'a', op: 'lt', value: 5 }] };
    expect(evaluateShowIf(gtRule, { a: 10 })).toBe(true);
    expect(evaluateShowIf(gtRule, { a: 3 })).toBe(false);
    expect(evaluateShowIf(ltRule, { a: 3 })).toBe(true);
    expect(evaluateShowIf(ltRule, { a: 10 })).toBe(false);
  });

  test('unanswered field: eq, in, gt, lt are false; neq is true (per schema contract)', () => {
    const values = {}; // field "a" was never answered

    expect(evaluateShowIf({ all: [{ field: 'a', op: 'eq', value: 'x' }] }, values)).toBe(false);
    expect(evaluateShowIf({ all: [{ field: 'a', op: 'in', value: ['x'] }] }, values)).toBe(false);
    expect(evaluateShowIf({ all: [{ field: 'a', op: 'gt', value: 5 }] }, values)).toBe(false);
    expect(evaluateShowIf({ all: [{ field: 'a', op: 'lt', value: 5 }] }, values)).toBe(false);
    expect(evaluateShowIf({ all: [{ field: 'a', op: 'neq', value: 'x' }] }, values)).toBe(true);
  });

  test('empty string and null count as unanswered', () => {
    const rule = { all: [{ field: 'a', op: 'neq', value: 'x' }] };
    expect(evaluateShowIf(rule, { a: '' })).toBe(true);
    expect(evaluateShowIf(rule, { a: null })).toBe(true);
  });

  test('all: every condition must pass (AND)', () => {
    const rule = {
      all: [
        { field: 'a', op: 'eq', value: 'x' },
        { field: 'b', op: 'eq', value: 'y' },
      ],
    };
    expect(evaluateShowIf(rule, { a: 'x', b: 'y' })).toBe(true);
    expect(evaluateShowIf(rule, { a: 'x', b: 'z' })).toBe(false);
  });

  test('any: at least one condition must pass (OR)', () => {
    const rule = {
      any: [
        { field: 'a', op: 'eq', value: 'x' },
        { field: 'b', op: 'eq', value: 'y' },
      ],
    };
    expect(evaluateShowIf(rule, { a: 'x', b: 'z' })).toBe(true);
    expect(evaluateShowIf(rule, { a: 'w', b: 'z' })).toBe(false);
  });

  test('three-level chain: each level depends on the previous answer', () => {
    // incidentType -> animalType -> deerAlertActive, from the real seed form
    const animalTypeRule = { all: [{ field: 'incidentType', op: 'eq', value: 'animal_collision' }] };
    const deerAlertRule = { all: [{ field: 'animalType', op: 'eq', value: 'deer' }] };

    const values = { incidentType: 'animal_collision', animalType: 'deer' };
    expect(evaluateShowIf(animalTypeRule, values)).toBe(true);
    expect(evaluateShowIf(deerAlertRule, values)).toBe(true);

    const partial = { incidentType: 'animal_collision' }; // animalType not answered yet
    expect(evaluateShowIf(animalTypeRule, partial)).toBe(true);
    expect(evaluateShowIf(deerAlertRule, partial)).toBe(false);
  });
});

describe('getVisibleFieldKeys', () => {
  test('returns only fields whose showIf passes (or have none)', () => {
    const fields = [
      { key: 'incidentType' }, // no showIf
      { key: 'animalType', showIf: { all: [{ field: 'incidentType', op: 'eq', value: 'animal_collision' }] } },
      { key: 'otherPartyAtFault', showIf: { all: [{ field: 'incidentType', op: 'eq', value: 'collision' }] } },
    ];
    const values = { incidentType: 'animal_collision' };

    const visible = getVisibleFieldKeys(fields, values);
    expect(visible.has('incidentType')).toBe(true);
    expect(visible.has('animalType')).toBe(true);
    expect(visible.has('otherPartyAtFault')).toBe(false);
  });
});
