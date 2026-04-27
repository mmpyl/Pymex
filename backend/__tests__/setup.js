// Setup file for Jest tests
// Configurar variables de entorno para testing

process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_USER = process.env.DB_USER || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password_12345678';
process.env.DB_NAME = process.env.DB_NAME || 'test_db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_characters_long';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
process.env.CORS_ALLOWED_ORIGINS = process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000';
process.env.APP_URL = process.env.APP_URL || 'http://localhost:3000';
process.env.REQUIRE_HTTPS = 'false';

// Mock de conexiones externas
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    keys: jest.fn()
  }));
});

jest.mock('pg', () => {
  const mockClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn()
  };
  return {
    Client: jest.fn(() => mockClient),
    Pool: jest.fn(() => mockClient)
  };
});
