import { jest } from '@jest/globals';
import mongoSanitize from '../middleware/mongoSanitize.js';

describe('mongoSanitize middleware', () => {
  test('removes MongoDB operator and dotted keys from the request body', () => {
    const req = {
      body: {
        name: 'Chandra',
        '$where': 'malicious',
        'profile.name': 'bad',
        profile: {
          city: 'Ranchi',
          '$ne': null,
          'nested.key': 'bad',
        },
      },
    };
    const next = jest.fn();

    mongoSanitize(req, {}, next);

    expect(req.body).toEqual({
      name: 'Chandra',
      profile: { city: 'Ranchi' },
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('sanitises objects nested inside arrays', () => {
    const req = {
      body: [{ safe: true, '$gt': 0 }, { 'bad.key': 'removed', value: 1 }],
    };
    const next = jest.fn();

    mongoSanitize(req, {}, next);

    expect(req.body).toEqual([{ safe: true }, { value: 1 }]);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('calls next when the request body is absent', () => {
    const req = {};
    const next = jest.fn();

    expect(() => mongoSanitize(req, {}, next)).not.toThrow();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('preserves primitive request bodies', () => {
    const req = { body: 'plain text' };
    const next = jest.fn();

    mongoSanitize(req, {}, next);

    expect(req.body).toBe('plain text');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
