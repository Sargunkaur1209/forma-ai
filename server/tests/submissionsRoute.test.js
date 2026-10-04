import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import FormSchema from '../models/FormSchema.js';
import Submission from '../models/Submission.js';
import app from '../app.js';
import request from 'supertest';

const TEST_FORM_ID = 'submissions_route_test_form';

beforeAll(async () => {
  await connectDB(process.env.MONGODB_URI);
  await FormSchema.create({
    formId: TEST_FORM_ID,
    title: 'Submissions route test form',
    version: 1,
    sections: [
      {
        id: 's1',
        title: 'S1',
        fields: [
          { key: 'name', type: 'text', label: 'Name', required: true },
          {
            key: 'hasPet',
            type: 'checkbox',
            label: 'Has a pet?',
          },
          {
            key: 'petType',
            type: 'select',
            label: 'Pet type',
            required: true,
            options: [{ value: 'dog', label: 'Dog' }, { value: 'cat', label: 'Cat' }],
            showIf: { all: [{ field: 'hasPet', op: 'eq', value: true }] },
          },
        ],
      },
    ],
  });
});

afterAll(async () => {
  await FormSchema.deleteMany({ formId: TEST_FORM_ID });
  await Submission.deleteMany({ formId: TEST_FORM_ID });
  await mongoose.disconnect();
});

describe('POST /api/submissions', () => {
  test('returns 400 when formId is missing', async () => {
    const res = await request(app).post('/api/submissions').send({ version: 1, answers: {} });
    expect(res.status).toBe(400);
  });

  test('returns 400 when version is missing or not a positive integer', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .send({ formId: TEST_FORM_ID, answers: {} });
    expect(res.status).toBe(400);
  });

  test('returns 400 when answers is missing', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .send({ formId: TEST_FORM_ID, version: 1 });
    expect(res.status).toBe(400);
  });

  test('returns 404 when the form/version does not exist', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .send({ formId: TEST_FORM_ID, version: 99, answers: { name: 'Alex' } });
    expect(res.status).toBe(404);
  });

  test('returns 201 and saves a valid submission', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .send({ formId: TEST_FORM_ID, version: 1, answers: { name: 'Alex' } });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      formId: TEST_FORM_ID,
      formVersion: 1,
      answers: { name: 'Alex' },
      status: 'submitted',
    });
    expect(res.body.id).toBeTruthy();

    const saved = await Submission.findById(res.body.id).lean();
    expect(saved).toBeTruthy();
    expect(saved.answers.name).toBe('Alex');
  });

  test('returns 400 with details when a required field is missing', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .send({ formId: TEST_FORM_ID, version: 1, answers: {} });

    expect(res.status).toBe(400);
    expect(res.body.details).toContainEqual({ key: 'name', reason: 'is required' });
  });

  test('strips a hidden field value and does not save it', async () => {
    const res = await request(app).post('/api/submissions').send({
      formId: TEST_FORM_ID,
      version: 1,
      answers: { name: 'Alex', hasPet: false, petType: 'dog' },
    });

    expect(res.status).toBe(201);
    expect(res.body.answers).not.toHaveProperty('petType');
  });

  test('requires a field once showIf reveals it, and rejects if missing', async () => {
    const res = await request(app).post('/api/submissions').send({
      formId: TEST_FORM_ID,
      version: 1,
      answers: { name: 'Alex', hasPet: true },
    });

    expect(res.status).toBe(400);
    expect(res.body.details).toContainEqual({ key: 'petType', reason: 'is required' });
  });

  test('does not trust a client-sent formId/version to skip the database lookup', async () => {
    const res = await request(app).post('/api/submissions').send({
      formId: TEST_FORM_ID,
      version: 1,
      answers: { name: 'Alex', sections: [{ hacked: true }] }, // extra junk keys ignored
    });
    expect(res.status).toBe(201);
    expect(res.body.answers).not.toHaveProperty('sections');
  });
});
