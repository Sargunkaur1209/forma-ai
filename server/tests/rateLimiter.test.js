import express from 'express';
import request from 'supertest';
import apiRateLimiter from '../middleware/rateLimiter.js';

describe('API rate limiter', () => {
  test('allows requests within the configured limit', async () => {
    const app = express();
    app.use(apiRateLimiter);
    app.get('/api/test', (req, res) => res.json({ status: 'ok' }));

    const response = await request(app).get('/api/test');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('includes rate-limit headers on allowed requests', async () => {
    const app = express();
    app.use(apiRateLimiter);
    app.get('/api/test', (req, res) => res.json({ status: 'ok' }));

    const response = await request(app).get('/api/test');

    expect(response.headers['ratelimit']).toContain('100-in-15min');
  });
});



