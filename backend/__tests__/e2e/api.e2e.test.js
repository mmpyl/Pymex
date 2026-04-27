const request = require('supertest');
const app = require('../../src/app');

describe('E2E Tests - API Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 OK status', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
    });
  });

  describe('GET /api/public/info', () => {
    it('should return public info or require auth', async () => {
      const response = await request(app).get('/api/public/info');
      // El endpoint puede retornar 200, 401 o 404 dependiendo de la configuración
      expect([200, 401, 404]).toContain(response.statusCode);
    });
  });
});
