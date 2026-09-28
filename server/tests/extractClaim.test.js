import { extractClaim } from '../ai/extractClaim.js';
import { withRetry, isRetryable } from '../ai/withRetry.js';
import { flattenFields } from '../services/formFields.js';
import autoClaimSimple from '../seeds/autoClaimSimple.js';

const allNull = () =>
  Object.fromEntries(flattenFields(autoClaimSimple).map((f) => [f.key, null]));

// A fake model: withStructuredOutput().invoke() resolves to the given object.
const fakeModel = (output) => ({
  withStructuredOutput: () => ({ invoke: async () => output }),
});

const deerStory = 'I hit a deer on I-95 yesterday in my Honda and the windshield shattered.';

describe('extractClaim', () => {
  test('extracts the deer story and reports missing required fields', async () => {
    const model = fakeModel({
      ...allNull(),
      incidentType: 'animal_collision',
      animalType: 'deer',
      incidentDate: '2026-09-27',
      incidentLocation: 'I-95',
      vehicleMake: 'honda',
      damageArea: 'windshield',
    });
    const result = await extractClaim(autoClaimSimple, deerStory, { model });

    expect(result.answers).toMatchObject({
      incidentType: 'animal_collision',
      animalType: 'deer',
      vehicleMake: 'honda',
      damageArea: 'windshield',
    });
    expect(result.rejected).toEqual([]);
    expect(result.missing).toEqual([]); // every required field was answered
  });

  test('null values are left out of the answers', async () => {
    const result = await extractClaim(autoClaimSimple, deerStory, { model: fakeModel(allNull()) });
    expect(result.answers).toEqual({});
  });

  test('reports required fields the story did not answer', async () => {
    const model = fakeModel({ ...allNull(), incidentType: 'theft' });
    const result = await extractClaim(autoClaimSimple, 'Someone stole my car.', { model });
    expect(result.missing).toEqual(
      expect.arrayContaining(['incidentDate', 'incidentLocation', 'vehicleMake', 'damageArea'])
    );
  });

  test('rejects a select value that is not an allowed option', async () => {
    const model = fakeModel({ ...allNull(), vehicleMake: 'batmobile' });
    const result = await extractClaim(autoClaimSimple, deerStory, { model });
    expect(result.answers.vehicleMake).toBeUndefined();
    expect(result.rejected).toContainEqual(expect.objectContaining({ key: 'vehicleMake' }));
  });

  test('rejects a value that breaks the field pattern, using the schema message', async () => {
    const model = fakeModel({ ...allNull(), incidentDate: 'yesterday' });
    const result = await extractClaim(autoClaimSimple, deerStory, { model });
    expect(result.answers.incidentDate).toBeUndefined();
    expect(result.rejected).toContainEqual({
      key: 'incidentDate',
      reason: 'Use the format YYYY-MM-DD',
    });
  });

  test('one bad value does not discard the good ones', async () => {
    const model = fakeModel({ ...allNull(), vehicleMake: 'batmobile', damageArea: 'front' });
    const result = await extractClaim(autoClaimSimple, deerStory, { model });
    expect(result.answers.damageArea).toBe('front');
  });
});

describe('withRetry', () => {
  const noSleep = async () => {};

  test('retries a 503 and then succeeds', async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls++;
        if (calls < 3) throw new Error('Error fetching: [503 Service Unavailable] busy');
        return 'ok';
      },
      { sleep: noSleep }
    );
    expect(result).toBe('ok');
    expect(calls).toBe(3);
  });

  test('gives up after the maximum attempts', async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls++;
          throw new Error('[429 Too Many Requests]');
        },
        { attempts: 3, sleep: noSleep }
      )
    ).rejects.toThrow('429');
    expect(calls).toBe(3);
  });

  test('does not retry a bad request', async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls++;
          throw new Error('[400 Bad Request] invalid');
        },
        { sleep: noSleep }
      )
    ).rejects.toThrow('400');
    expect(calls).toBe(1);
  });

  test('uses the delay Google asks for', async () => {
    const waits = [];
    let calls = 0;
    await withRetry(
      async () => {
        calls++;
        if (calls === 1) throw new Error('[429 Too Many Requests] Please retry in 18.5s.');
        return 'ok';
      },
      { sleep: async (ms) => waits.push(ms) }
    );
    expect(waits).toEqual([19000]);
  });

  test('isRetryable only accepts 429, 503 and network errors', () => {
    expect(isRetryable(new Error('[429 Too Many Requests]'))).toBe(true);
    expect(isRetryable(new Error('[503 Service Unavailable]'))).toBe(true);
    expect(isRetryable(Object.assign(new Error('x'), { code: 'ECONNRESET' }))).toBe(true);
    expect(isRetryable(new Error('[404 Not Found]'))).toBe(false);
  });
});
