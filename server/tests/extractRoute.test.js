import 'dotenv/config';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import { connectDB } from '../config/db.js';
import FormSchema from '../models/FormSchema.js';

const TEST_FORM_ID = 'extract_route_test_form';

// Mock the extraction service before importing the app, so the route
// never calls a real model. jest.unstable_mockModule is required because
// this project uses ES modules.
const mockExtractClaim = jest.fn();
jest.unstable_mockModule('../ai/extractClaim.js', () => ({
  extractClaim: mockExtractClaim,
}));

// Dynamic imports: must happen after the mock is registered above.
const { default: app } = await import('../app.js');
const { default: request } = await import('supertest');

beforeAll(async () => {
  await connectDB(process.env.MONGODB_URI);
  await FormSchema.create({
    formId: TEST_FORM_ID,
    title: 'Extract route test form',
    version: 1,
    sections: [
      {
        id: 's1',
        title: 'S1',
        fields: [{ key: 'name', type: 'text', label: 'Name', required: true }],
      },
    ],
  });
});

afterAll(async () => {
  await FormSchema.deleteMany({ formId: TEST_FORM_ID });
  await mongoose.disconnect();
});

beforeEach(() => {
  mockExtractClaim.mockReset();
});

describe('POST /api/extract', () => {
  test('returns 400 when formId is missing', async () => {
    const res = await request(app).post('/api/extract').send({ story: 'hello' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/formId/);
  });

  test('returns 400 when formId has invalid characters', async () => {
    const res = await request(app).post('/api/extract').send({ formId: 'bad id!', story: 'hello' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when story is missing', async () => {
    const res = await request(app).post('/api/extract').send({ formId: TEST_FORM_ID });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/story/i);
  });

  test('returns 400 when story is only whitespace', async () => {
    const res = await request(app).post('/api/extract').send({ formId: TEST_FORM_ID, story: '   ' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when story exceeds the max length', async () => {
    const res = await request(app)
      .post('/api/extract')
      .send({ formId: TEST_FORM_ID, story: 'x'.repeat(2001) });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/longer than/);
  });

  test('returns 404 when the form does not exist', async () => {
    const res = await request(app)
      .post('/api/extract')
      .send({ formId: 'does_not_exist', story: 'hello' });
    expect(res.status).toBe(404);
  });

  test('returns 200 with answers on a successful extraction', async () => {
    mockExtractClaim.mockResolvedValue({
      answers: { name: 'Alex' },
      missing: [],
      rejected: [],
    });

    const res = await request(app)
      .post('/api/extract')
      .send({ formId: TEST_FORM_ID, story: 'My name is Alex' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      formId: TEST_FORM_ID,
      version: 1,
      answers: { name: 'Alex' },
      missing: [],
      rejected: [],
    });
  });

  test('returns 502 with a generic message when extraction fails', async () => {
    mockExtractClaim.mockRejectedValue(new Error('[503 Service Unavailable] busy'));

    const res = await request(app)
      .post('/api/extract')
      .send({ formId: TEST_FORM_ID, story: 'hello' });

    expect(res.status).toBe(502);
    expect(res.body.error).toBe('Extraction failed. Please try again.');
  });

  test('the form passed to extractClaim is loaded from the database, not the request body', async () => {
    mockExtractClaim.mockResolvedValue({ answers: {}, missing: [], rejected: [] });

    await request(app)
      .post('/api/extract')
      .send({ formId: TEST_FORM_ID, story: 'hello', sections: [{ hacked: true }] });

    const [formArg] = mockExtractClaim.mock.calls[0];
    expect(formArg.formId).toBe(TEST_FORM_ID);
    expect(formArg.sections[0].fields[0].key).toBe('name'); // from the real seeded form
  });
});

