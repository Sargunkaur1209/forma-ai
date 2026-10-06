import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Draft from '../models/Draft.js';
import app from '../app.js';
import request from 'supertest';

const TEST_FORM_ID = 'drafts_route_test_form';

beforeAll(async () => {
  await connectDB(process.env.MONGODB_URI);
});

afterAll(async () => {
  await Draft.deleteMany({ formId: TEST_FORM_ID });
  await mongoose.disconnect();
});

describe('POST /api/drafts', () => {
  test('returns 400 when formId is missing', async () => {
    const res = await request(app)
      .post('/api/drafts')
      .send({ formVersion: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/formId/);
  });

  test('returns 400 when formId is invalid', async () => {
    const res = await request(app)
      .post('/api/drafts')
      .send({ formId: '!!bad!!', formVersion: 1 });
    expect(res.status).toBe(400);
  });

  test('returns 400 when formVersion is missing', async () => {
    const res = await request(app)
      .post('/api/drafts')
      .send({ formId: TEST_FORM_ID });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/formVersion/);
  });

  test('returns 400 when formVersion is not a positive integer', async () => {
    const res = await request(app)
      .post('/api/drafts')
      .send({ formId: TEST_FORM_ID, formVersion: 0 });
    expect(res.status).toBe(400);
  });

  test('returns 400 when answers is not a plain object', async () => {
    const res = await request(app)
      .post('/api/drafts')
      .send({ formId: TEST_FORM_ID, formVersion: 1, answers: ['bad'] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/answers/);
  });

  test('returns 201 with a valid draft (no answers)', async () => {
    const res = await request(app)
      .post('/api/drafts')
      .send({ formId: TEST_FORM_ID, formVersion: 1 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      formId: TEST_FORM_ID,
      formVersion: 1,
      answers: {},
      status: 'draft',
    });
    expect(res.body.id).toBeTruthy();
  });

  test('returns 201 with a valid draft (with answers and story)', async () => {
    const res = await request(app)
      .post('/api/drafts')
      .send({
        formId: TEST_FORM_ID,
        formVersion: 1,
        answers: { incidentType: 'collision' },
        story: 'A deer ran into my car.',
      });
    expect(res.status).toBe(201);
    expect(res.body.answers).toEqual({ incidentType: 'collision' });
    expect(res.body.story).toBe('A deer ran into my car.');
  });
});

describe('GET /api/drafts/:id', () => {
  let draftId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/drafts')
      .send({ formId: TEST_FORM_ID, formVersion: 1, answers: { name: 'Chandrakant' } });
    draftId = res.body.id;
  });

  test('returns 400 for an invalid ObjectId', async () => {
    const res = await request(app).get('/api/drafts/not-an-id');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid draft id/i);
  });

  test('returns 404 for an unknown id', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/drafts/${fakeId}`);
    expect(res.status).toBe(404);
  });

  test('returns 200 and the draft', async () => {
    const res = await request(app).get(`/api/drafts/${draftId}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: draftId,
      formId: TEST_FORM_ID,
      answers: { name: 'Chandrakant' },
      status: 'draft',
    });
  });
});

describe('PUT /api/drafts/:id', () => {
  let draftId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/drafts')
      .send({ formId: TEST_FORM_ID, formVersion: 1, answers: { incidentType: 'collision' } });
    draftId = res.body.id;
  });

  test('returns 400 for an invalid ObjectId', async () => {
    const res = await request(app).put('/api/drafts/not-an-id').send({ answers: {} });
    expect(res.status).toBe(400);
  });

  test('returns 400 when answers is missing', async () => {
    const res = await request(app).put(`/api/drafts/${draftId}`).send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/answers/);
  });

  test('returns 400 when answers is an array', async () => {
    const res = await request(app).put(`/api/drafts/${draftId}`).send({ answers: [] });
    expect(res.status).toBe(400);
  });

  test('returns 404 for an unknown id', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).put(`/api/drafts/${fakeId}`).send({ answers: {} });
    expect(res.status).toBe(404);
  });

  test('returns 200 and overwrites answers', async () => {
    const res = await request(app)
      .put(`/api/drafts/${draftId}`)
      .send({ answers: { incidentType: 'animal_collision', animalType: 'deer' } });
    expect(res.status).toBe(200);
    expect(res.body.answers).toEqual({ incidentType: 'animal_collision', animalType: 'deer' });
    // old key must be gone — PUT is a full overwrite
    expect(res.body.answers.name).toBeUndefined();
  });

  test('returns 200 and updates story when provided', async () => {
    const res = await request(app)
      .put(`/api/drafts/${draftId}`)
      .send({ answers: {}, story: 'Updated story.' });
    expect(res.status).toBe(200);
    expect(res.body.story).toBe('Updated story.');
  });
});
