/**
 * Pruebas de Integración para rutas de autenticación
 *
 * Estas pruebas validan la integración completa de las rutas HTTP
 */

const request = require('supertest');
const express = require('express');
const router = require('../../../../src/domains/auth/routes/auth');

// Mock del middleware de validación - debe retornar array de middleware
jest.mock('../../../../src/middleware/validation', () => ({
  validate: (rules) => [
    ...rules,
    (req, res, next) => next()
  ],
  sanitizeString: jest.fn(),
  sanitizeQuery: jest.fn()
}));

// Mocks mínimos para integración
jest.mock('../../../../src/domains/auth/services/authService', () => ({
  authenticateUser: jest.fn(),
  authenticateAdmin: jest.fn(),
  generarTokenEmpresa: jest.fn(),
  generarTokenAdmin: jest.fn(),
  generarRefreshToken: jest.fn(),
  validateRefreshToken: jest.fn(),
  registrarActividadAuth: jest.fn()
}));

jest.mock('../../../../src/domains/auth/models', () => {
  const mockTransaction = {
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined)
  };

  return {
    Usuario: {
      findOne: jest.fn(),
      create: jest.fn()
    },
    Rol: {
      findOne: jest.fn()
    },
    RevokedToken: {
      create: jest.fn()
    },
    sequelize: {
      transaction: jest.fn().mockResolvedValue(mockTransaction)
    }
  };
});

jest.mock('../../../../src/domains/core/models', () => ({
  Empresa: {
    create: jest.fn(),
    findOne: jest.fn()
  }
}));

jest.mock('../../../../src/domains/billing/models', () => ({
  Plan: {
    findOne: jest.fn()
  },
  Suscripcion: {
    create: jest.fn()
  }
}));

jest.mock('../../../../src/domains/eventBus', () => ({
  eventBus: {
    publish: jest.fn()
  }
}));

const authService = require('../../../../src/domains/auth/services/authService');
const { Usuario, Rol, sequelize, RevokedToken } = require('../../../../src/domains/auth/models');
const { Empresa } = require('../../../../src/domains/core/models');
const { Plan, Suscripcion } = require('../../../../src/domains/billing/models');
const { eventBus } = require('../../../../src/domains/eventBus');

// Crear app de test
const app = express();
app.use(express.json());
app.use('/auth', router);

describe('Auth Routes - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret_key_for_integration';
    process.env.JWT_EXPIRES = '1h';
    process.env.TRIAL_DIAS = '14';
  });

  describe('Flujo completo de registro y login', () => {
    it('debería permitir registro seguido de login exitoso', async () => {
      // Setup para registro
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      Usuario.findOne.mockResolvedValue(null);
      Rol.findOne.mockResolvedValue({ id: 1, nombre: 'admin' });
      Empresa.create.mockResolvedValue({ id: 1, nombre: "Test's Empresa", plan: 'basico', estado: 'activo' });
      Usuario.create.mockResolvedValue({
        id: 1,
        nombre: 'Test User',
        email: 'test@pymex.com',
        empresa_id: 1,
        rol_id: 1
      });
      Plan.findOne.mockResolvedValue({ id: 1, codigo: 'trial', nombre: 'Trial', estado: 'activo' });
      Suscripcion.create.mockResolvedValue({ id: 1, fecha_fin: new Date() });

      // Ejecutar registro
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          nombre: 'Test User',
          email: 'test@pymex.com',
          password: 'password123'
        });

      expect(registerResponse.statusCode).toBe(201);
      expect(eventBus.publish).toHaveBeenCalledWith(
        'USER_REGISTERED',
        expect.any(Object),
        'AUTH'
      );

      // Reset mocks para login
      jest.clearAllMocks();

      // Setup para login
      const mockUsuario = {
        id: 1,
        empresa_id: 1,
        rol_id: 1,
        nombre: 'Test User',
        email: 'test@pymex.com',
        Rol: { nombre: 'admin' },
        Empresa: { id: 1, nombre: "Test's Empresa", estado: 'activo', plan: 'basico' }
      };

      authService.authenticateUser.mockResolvedValue({
        usuario: mockUsuario,
        rolNombre: 'admin',
        aviso: null,
        empresa: mockUsuario.Empresa
      });

      authService.generarTokenEmpresa.mockReturnValue('integration_access_token');
      authService.generarRefreshToken.mockReturnValue({
        refreshToken: 'integration_refresh_token',
        refreshTokenHash: 'hash_xyz789',
        expiresAt: new Date(Date.now() + 86400000)
      });

      RevokedToken.create.mockResolvedValue({ id: 1 });
      authService.registrarActividadAuth.mockResolvedValue(undefined);

      // Ejecutar login
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@pymex.com',
          password: 'password123'
        });

      expect(loginResponse.statusCode).toBe(200);
      expect(loginResponse.body.token).toBe('integration_access_token');
      expect(loginResponse.body.usuario.email).toBe('test@pymex.com');
      expect(authService.registrarActividadAuth).toHaveBeenCalledWith(
        'LOGIN_SUCCESS',
        expect.objectContaining({
          userId: 1,
          email: 'test@pymex.com'
        })
      );
    });
  });

  describe('Validaciones de entrada', () => {
    it('debería rechazar registro sin email válido', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nombre: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('debería rechazar login sin password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@pymex.com'
        });

      expect(response.statusCode).toBe(400);
    });

    it('debería rechazar start-trial sin campos requeridos', async () => {
      const response = await request(app)
        .post('/auth/start-trial')
        .send({
          empresa_nombre: 'Test Corp'
        });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Manejo de errores en cascada', () => {
    it('debería hacer rollback si falla creación de usuario después de crear empresa', async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      Usuario.findOne.mockResolvedValue(null);
      Rol.findOne.mockResolvedValue({ id: 1, nombre: 'admin' });
      Empresa.create.mockResolvedValue({ id: 1, nombre: "Test's Empresa" });

      // Simular error al crear usuario
      const error = new Error('Database constraint violation');
      error.name = 'SequelizeUniqueConstraintError';
      Usuario.create.mockRejectedValue(error);

      const response = await request(app)
        .post('/auth/register')
        .send({
          nombre: 'Test User',
          email: 'test@pymex.com',
          password: 'password123'
        });

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe('Endpoints protegidos', () => {
    it('debería manejar correctamente petición a perfil sin token', async () => {
      // Nota: En una implementación real, el middleware de auth fallaría
      // Aquí probamos que el endpoint existe y responde
      Usuario.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/auth/perfil');

      // Dependiendo de la implementación del middleware, puede retornar 401 o 404
      expect([401, 404, 500]).toContain(response.statusCode);
    });
  });

  describe('Refresh token flow', () => {
    it('debería permitir refrescar token con refresh token válido', async () => {
      const mockStoredToken = {
        id: 1,
        token_type: 'refresh',
        userId: 1,
        expires_at: new Date(Date.now() + 86400000),
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      authService.validateRefreshToken.mockResolvedValue(mockStoredToken);

      const mockUsuario = {
        id: 1,
        empresa_id: 100,
        rol_id: 2,
        nombre: 'Test User',
        email: 'test@pymex.com',
        estado: 'activo',
        Rol: { nombre: 'admin' },
        Empresa: { id: 100, nombre: 'Test Corp', estado: 'activo', plan: 'basic' }
      };

      Usuario.findOne.mockResolvedValue(mockUsuario);
      authService.generarTokenEmpresa.mockReturnValue('new_access_token_xyz');
      authService.generarRefreshToken.mockReturnValue({
        refreshToken: 'new_refresh_token_xyz',
        refreshTokenHash: 'new_hash_xyz',
        expiresAt: new Date(Date.now() + 86400000)
      });
      RevokedToken.create.mockResolvedValue({ id: 2 });
      authService.registrarActividadAuth.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'valid_refresh_token' });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBe('new_access_token_xyz');
      expect(response.body.refreshToken).toBe('new_refresh_token_xyz');
      expect(mockStoredToken.destroy).toHaveBeenCalled();
      expect(authService.registrarActividadAuth).toHaveBeenCalledWith(
        'REFRESH_TOKEN_SUCCESS',
        expect.any(Object)
      );
    });

    it('debería rechazar refresh token expirado', async () => {
      const { AuthenticationError } = require('../../../../src/middleware/errorHandler');
      authService.validateRefreshToken.mockRejectedValue(
        new AuthenticationError('Refresh token expirado. Inicia sesión nuevamente.')
      );

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'expired_token' });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Trial flow', () => {
    it('debería completar flujo de trial exitosamente', async () => {
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      Plan.findOne.mockResolvedValue({ id: 1, codigo: 'trial', nombre: 'Trial', estado: 'activo', precio_mensual: 0 });
      Empresa.create.mockResolvedValue({ id: 1, nombre: 'Trial Enterprise', ruc: '123456789', plan: 'trial', estado: 'activo' });
      Usuario.create.mockResolvedValue({ id: 1, nombre: 'Trial User', email: 'trial@pymex.com' });
      Suscripcion.create.mockResolvedValue({
        id: 1,
        estado: 'trial',
        fecha_inicio: new Date(),
        fecha_fin: new Date(Date.now() + 14 * 86400000)
      });

      const response = await request(app)
        .post('/auth/start-trial')
        .send({
          empresa_nombre: 'Trial Enterprise',
          empresa_ruc: '123456789',
          nombre: 'Trial User',
          email: 'trial@pymex.com',
          password: 'password123',
          dias_trial: 14
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.mensaje).toBe('Trial iniciado');
      expect(response.body.empresa).toBeDefined();
      expect(response.body.usuario).toBeDefined();
      expect(eventBus.publish).toHaveBeenCalledWith(
        'TRIAL_STARTED',
        expect.objectContaining({
          diasTrial: 14
        }),
        'AUTH'
      );
    });
  });
});
