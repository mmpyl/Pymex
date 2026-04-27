const request = require('supertest');
const app = require('../src/app');

describe('API Health Check', () => {
  it('GET /health should return 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
  });
});
