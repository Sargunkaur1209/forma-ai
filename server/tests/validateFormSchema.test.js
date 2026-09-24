import { validateFormSchema } from '../services/validateFormSchema.js';
import autoClaimSimple from '../seeds/autoClaimSimple.js';

const field = (over) => ({ key: 'a', type: 'text', label: 'A', ...over });
const form = (...fields) => ({ sections: [{ id: 's1', title: 'S1', fields }] });
const pick = {
  key: 'pick',
  type: 'select',
  label: 'Pick',
  options: [{ value: 'yes', label: 'Yes' }],
};
const when = (op, value) => ({ all: [{ field: 'pick', op, value }] });

describe('validateFormSchema', () => {
  test('accepts the real seed form', () => {
    expect(validateFormSchema(autoClaimSimple)).toEqual([]);
  });

  test('accepts a valid showIf rule', () => {
    expect(validateFormSchema(form(pick, field({ showIf: when('eq', 'yes') })))).toEqual([]);
  });

  test('rejects duplicate field keys', () => {
    const dup = field();
    const errors = validateFormSchema(form(dup, dup));
    expect(errors).toContainEqual(expect.stringContaining('Duplicate field key'));
  });

  test('rejects select fields with no options', () => {
    const errors = validateFormSchema(form({ key: 'x', type: 'select', label: 'X' }));
    expect(errors).toContainEqual(expect.stringContaining('needs options'));
  });

  test('rejects an invalid regex pattern', () => {
    const errors = validateFormSchema(form(field({ validation: { pattern: '([' } })));
    expect(errors).toContainEqual(expect.stringContaining('not a valid regex'));
  });

  test('rejects min greater than max', () => {
    const errors = validateFormSchema(
      form(field({ type: 'number', validation: { min: 5, max: 1 } }))
    );
    expect(errors).toContainEqual(expect.stringContaining('min is greater than max'));
  });

  test('rejects showIf referencing an unknown field', () => {
    const errors = validateFormSchema(
      form(field({ showIf: { all: [{ field: 'ghost', op: 'eq', value: 'x' }] } }))
    );
    expect(errors).toContainEqual(expect.stringContaining('unknown field'));
  });

  test('rejects showIf value not in the target select options', () => {
    const errors = validateFormSchema(form(pick, field({ showIf: when('eq', 'maybe') })));
    expect(errors).toContainEqual(expect.stringContaining('is not an option of'));
  });

  test('rejects a showIf dependency loop', () => {
    const errors = validateFormSchema(
      form(
        field({ key: 'a', showIf: { all: [{ field: 'b', op: 'eq', value: 'x' }] } }),
        field({ key: 'b', showIf: { all: [{ field: 'a', op: 'eq', value: 'x' }] } })
      )
    );
    expect(errors).toContainEqual(expect.stringContaining('loop'));
  });

  test('confirms the seed form is 3 levels deep', () => {
    const fields = autoClaimSimple.sections.flatMap((s) => s.fields);
    const byKey = Object.fromEntries(fields.map((f) => [f.key, f]));

    const depth = (key, seen = new Set()) => {
      if (seen.has(key)) return Infinity;
      const f = byKey[key];
      const conds = f?.showIf?.all ?? f?.showIf?.any;
      if (!conds) return 1;
      const parentDepths = conds.map((c) => depth(c.field, new Set(seen).add(key)));
      return 1 + Math.max(...parentDepths);
    };

    const maxDepth = Math.max(...fields.map((f) => depth(f.key)));
    expect(maxDepth).toBe(3);
  });
});
