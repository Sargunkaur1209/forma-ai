import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import FormSchema from '../models/FormSchema.js';
import app from '../app.js';
import request from 'supertest';

const TEST_FORM_ID = 'forms_auth_test_form';
const ADMIN_KEY = process.env.ADMIN_API_KEY;

const validBody = {
  formId: TEST_FORM_ID,
  title: 'Auth test form',
  sections: [{ id: 's1', title: 'S1', fields: [{ key: 'name', type: 'text', label: 'Name' }] }],
};

beforeAll(async () => {
  await connectDB(process.env.MONGODB_URI);
});

afterAll(async () => {
  await FormSchema.deleteMany({ formId: TEST_FORM_ID });
  await mongoose.disconnect();
});

describe('POST /api/forms auth', () => {
  test('returns 401 with no admin key header', async () => {
    const res = await request(app).post('/api/forms').send(validBody);
    expect(res.status).toBe(401);
  });

  test('returns 401 with a wrong admin key', async () => {
    const res = await request(app)
      .post('/api/forms')
      .set('x-admin-key', 'wrong-key')
      .send(validBody);
    expect(res.status).toBe(401);
  });

  test('returns 201 with the correct admin key', async () => {
    const res = await request(app)
      .post('/api/forms')
      .set('x-admin-key', ADMIN_KEY)
      .send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.formId).toBe(TEST_FORM_ID);
  });

  test('GET /:formId still works with no admin key (reads stay public)', async () => {
    const res = await request(app).get(`/api/forms/${TEST_FORM_ID}`);
    expect(res.status).toBe(200);
  });
});
