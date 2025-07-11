import request from 'supertest';
import express from 'express';
import RateLimiter from '../middleware/rateLimiter';

describe('RateLimiter', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    const rateLimiter = new RateLimiter(2, 1000); // 2 requests per second for testing
    app.use(rateLimiter.middleware());
    app.get('/test', (req, res) => res.json({ success: true }));
  });

  test('should allow requests within limit', async () => {
    const response1 = await request(app).get('/test');
    const response2 = await request(app).get('/test');

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
  });

  test('should block requests exceeding limit', async () => {
    await request(app).get('/test');
    await request(app).get('/test');
    const response3 = await request(app).get('/test');

    expect(response3.status).toBe(429);
    expect(response3.body.error).toBe('Too many requests');
  });
});
