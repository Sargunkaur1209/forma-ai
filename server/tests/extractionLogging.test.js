import 'dotenv/config';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { connectDB } from '../config/db.js';
import FormSchema from '../models/FormSchema.js';
import Extraction from '../models/Extraction.js';

const TEST_FORM_ID = 'extraction_log_test_form';

const mockExtractClaim = jest.fn();
jest.unstable_mockModule('../ai/extractClaim.js', () => ({
  extractClaim: mockExtractClaim,
}));

const { default: app } = await import('../app.js');
const { default: request } = await import('supertest');

beforeAll(async () => {
  await connectDB(process.env.MONGODB_URI);
  await FormSchema.create({
    formId: TEST_FORM_ID,
    title: 'Extraction log test form',
    version: 1,
    sections: [
      { id: 's1', title: 'S1', fields: [{ key: 'name', type: 'text', label: 'Name' }] },
    ],
  });
});

afterAll(async () => {
  await FormSchema.deleteMany({ formId: TEST_FORM_ID });
  await Extraction.deleteMany({ formId: TEST_FORM_ID });
  await mongoose.disconnect();
});

beforeEach(() => {
  mockExtractClaim.mockReset();
});

describe('extraction logging (Day 17)', () => {
  test('a successful extraction writes an Extraction document', async () => {
    mockExtractClaim.mockResolvedValue({
      answers: { name: 'Alex' },
      confidence: { name: 'medium' },
      missing: [],
      rejected: [],
    });

    await request(app)
      .post('/api/extract')
      .send({ formId: TEST_FORM_ID, story: 'My name is Alex' });

    const entry = await Extraction.findOne({ formId: TEST_FORM_ID, status: 'success' }).lean();
    expect(entry).toMatchObject({
      formId: TEST_FORM_ID,
      formVersion: 1,
      story: 'My name is Alex',
      status: 'success',
      answers: { name: 'Alex' },
    });
    expect(entry.provider).toBeTruthy();
    expect(entry.model).toBeTruthy();
    expect(typeof entry.durationMs).toBe('number');
    expect(entry.durationMs).toBeGreaterThanOrEqual(0);
  });

  test('a failed extraction writes an Extraction document with the error', async () => {
    mockExtractClaim.mockRejectedValue(new Error('[503 Service Unavailable] busy'));

    await request(app)
      .post('/api/extract')
      .send({ formId: TEST_FORM_ID, story: 'this will fail' });

    const entry = await Extraction.findOne({ formId: TEST_FORM_ID, status: 'failure' }).lean();
    expect(entry).toMatchObject({
      formId: TEST_FORM_ID,
      status: 'failure',
      story: 'this will fail',
    });
    expect(entry.errorMessage).toContain('503');
    expect(entry.answers).toBeUndefined();
  });

  test('a 400 (invalid input) does not write an Extraction document', async () => {
    const before = await Extraction.countDocuments({ formId: TEST_FORM_ID });
    await request(app).post('/api/extract').send({ formId: TEST_FORM_ID, story: '' });
    const after = await Extraction.countDocuments({ formId: TEST_FORM_ID });
    expect(after).toBe(before);
  });

  test('a logging failure does not break the API response', async () => {
    mockExtractClaim.mockResolvedValue({ answers: {}, confidence: {}, missing: [], rejected: [] });
    const spy = jest.spyOn(Extraction, 'create').mockRejectedValueOnce(new Error('db down'));

    const res = await request(app)
      .post('/api/extract')
      .send({ formId: TEST_FORM_ID, story: 'still works' });

    expect(res.status).toBe(200);
    spy.mockRestore();
  });
});
