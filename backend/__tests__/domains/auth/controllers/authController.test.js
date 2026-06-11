
/**
 * Pruebas Unitarias para authController.js
 *
 * Estas pruebas validan los endpoints HTTP del controlador de autenticación
 */

// ============================================
// MOCKS - Deben ir ANTES de cualquier require
// ============================================

// Mock de bcrypt antes de cualquier importación
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_abc123'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_jwt_token_xyz'),
  verify: jest.fn().mockReturnValue({ userId: 1, empresa_id: 100, rol: 'admin' }),
  decode: jest.fn().mockReturnValue({ userId: 1, empresa_id: 100 })
}));

// Mock de dependencias
jest.mock('../../../../src/domains/auth/services/authService', () => ({
  authenticateUser: jest.fn(),
  authenticateAdmin: jest.fn(),
  generarTokenEmpresa: jest.fn(),
  generarTokenAdmin: jest.fn(),
  generarRefreshToken: jest.fn(),
  validateRefreshToken: jest.fn(),
  registrarActividadAuth: jest.fn()
}));

jest.mock('../../../../src/domains/auth/models', () => ({
  Usuario: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  },
  Rol: {
    findOne: jest.fn()
  },
  RevokedToken: {
    create: jest.fn()
  },
  sequelize: {
    transaction: jest.fn(),
    where: jest.fn(),
    fn: jest.fn(),
    col: jest.fn()
  }
}));

jest.mock('../../../../src/domains/core/models', () => ({
  Empresa: {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn()
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

jest.mock('../../../../src/middleware/errorHandler', () => {
  const originalModule = jest.requireActual('../../../../src/middleware/errorHandler');
  return {
    ...originalModule,
    asyncHandler: (fn) => fn
  };
});

// Mock del middleware de autenticación
jest.mock('../../../../src/middleware/auth', () => {
  return jest.fn((req, res, next) => {
    req.usuario = { id: 1, empresa_id: 100, email: 'test@pymex.com' };
    next();
  });
});

// Mock del middleware de validación - debe retornar array de middleware
jest.mock('../../../../src/middleware/validation', () => ({
  validate: (rules) => [
    ...rules,
    (req, res, next) => next()
  ],
  sanitizeString: jest.fn(),
  sanitizeQuery: jest.fn()
}));


// ============================================
// IMPORTS - Ahora sí podemos importar todo
// ============================================

const request = require('supertest');
const express = require('express');
const authService = require('../../../../src/domains/auth/services/authService');
const { Usuario, Rol, sequelize, RevokedToken } = require('../../../../src/domains/auth/models');
const { Empresa } = require('../../../../src/domains/core/models');
const { Plan, Suscripcion } = require('../../../../src/domains/billing/models');
const { eventBus } = require('../../../../src/domains/eventBus');

// Importar las rutas reales
const authRoutes = require('../../../../src/domains/auth/routes/auth');

// Crear app de test
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);
  return app;
};

describe('AuthController - Unit Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();

    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_EXPIRES = '1h';
    process.env.TRIAL_DIAS = '14';

    // Configurar mocks de transacción por defecto
    sequelize.transaction.mockImplementation(async (fn) => {
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      if (typeof fn === 'function') return fn(mockTransaction);
      return Promise.resolve(mockTransaction);
    });

    // Default stubs para evitar errores por llamados no configurados
    Usuario.findOne.mockResolvedValue(null);
    Usuario.findByPk.mockResolvedValue(null);
    Rol.findOne.mockResolvedValue({ id: 1, nombre: 'admin' });
    Empresa.create.mockResolvedValue({ id: 1, nombre: "Test's Empresa" });
    Plan.findOne.mockResolvedValue(null);
    Suscripcion.create.mockResolvedValue({ id: 1, fecha_fin: new Date() });
    RevokedToken.create.mockResolvedValue({ id: 1 });
    authService.validateRefreshToken.mockResolvedValue({
      token_type: 'refresh',
      userId: 1,
      expires_at: new Date(Date.now() + 86400000),
      destroy: jest.fn().mockResolvedValue(undefined)
    });
  });


  describe('POST /auth/register', () => {
    it('debería registrar un nuevo usuario y empresa exitosamente', async () => {
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

      const response = await request(app)
        .post('/auth/register')
        .send({
          nombre: 'Test User',
          email: 'test@pymex.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.mensaje).toBe('Registro completado');
      expect(eventBus.publish).toHaveBeenCalledWith(
        'USER_REGISTERED',
        expect.objectContaining({
          userId: 1,
          email: 'test@pymex.com'
        }),
        'AUTH'
      );
    });

    it('debería retornar error si faltan campos obligatorios', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nombre: 'Test User'
          // faltan email y password
        });

      expect(response.statusCode).toBe(400);
    });

    it('debería retornar error si el email ya existe', async () => {
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      Usuario.findOne.mockResolvedValue({ id: 1, email: 'test@pymex.com' });

      const response = await request(app)
        .post('/auth/register')
        .send({
          nombre: 'Test User',
          email: 'test@pymex.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(409);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('POST /auth/login', () => {
    it('debería iniciar sesión exitosamente', async () => {
      const mockUsuario = {
        id: 1,
        empresa_id: 100,
        rol_id: 2,
        nombre: 'Test User',
        email: 'test@pymex.com',
        Rol: { nombre: 'admin' },
        Empresa: { id: 100, nombre: 'Test Corp', estado: 'activo', plan: 'basic' }
      };

      authService.authenticateUser.mockResolvedValue({
        usuario: mockUsuario,
        rolNombre: 'admin',
        aviso: null,
        empresa: mockUsuario.Empresa
      });

      authService.generarTokenEmpresa.mockReturnValue('mock_access_token');
      authService.generarRefreshToken.mockReturnValue({
        refreshToken: 'mock_refresh_token',
        refreshTokenHash: 'hash_abc123',
        expiresAt: new Date(Date.now() + 86400000)
      });

      RevokedToken.create.mockResolvedValue({ id: 1 });
      authService.registrarActividadAuth.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@pymex.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBe('mock_access_token');
      expect(response.body.refreshToken).toBe('mock_refresh_token');
      expect(authService.authenticateUser).toHaveBeenCalledWith('test@pymex.com', 'password123');
    });

    it('debería retornar error si las credenciales son inválidas', async () => {
      const { AuthenticationError } = require('../../../../src/middleware/errorHandler');
      authService.authenticateUser.mockRejectedValue(new AuthenticationError('Credenciales inválidas'));

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'wrong@pymex.com',
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(401);
    });

    it('debería incluir aviso si la empresa está suspendida', async () => {
      const mockUsuario = {
        id: 1,
        empresa_id: 100,
        rol_id: 2,
        nombre: 'Test User',
        email: 'test@pymex.com',
        Rol: { nombre: 'admin' },
        Empresa: { id: 100, nombre: 'Suspended Corp', estado: 'suspendido', plan: 'basic' }
      };

      authService.authenticateUser.mockResolvedValue({
        usuario: mockUsuario,
        rolNombre: 'admin',
        aviso: 'Tu empresa está suspendida. Contacta al soporte.',
        empresa: mockUsuario.Empresa
      });

      authService.generarTokenEmpresa.mockReturnValue('mock_access_token');
      authService.generarRefreshToken.mockReturnValue({
        refreshToken: 'mock_refresh_token',
        refreshTokenHash: 'hash_abc123',
        expiresAt: new Date()
      });
      RevokedToken.create.mockResolvedValue({ id: 1 });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@pymex.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.aviso).toBe('Tu empresa está suspendida. Contacta al soporte.');
    });
  });

  describe('GET /auth/perfil', () => {
    it('debería retornar el perfil del usuario autenticado', async () => {
      const mockUsuario = {
        id: 1,
        empresa_id: 100,
        rol_id: 2,
        nombre: 'Test User',
        email: 'test@pymex.com',
        estado: 'activo',
        Rol: { id: 2, nombre: 'admin' },
        Empresa: { id: 100, nombre: 'Test Corp', plan: 'basic', estado: 'activo' },
        toJSON: function() {
          return {
            id: this.id,
            empresa_id: this.empresa_id,
            rol_id: this.rol_id,
            nombre: this.nombre,
            email: this.email,
            estado: this.estado
          };
        }
      };

      Usuario.findOne.mockResolvedValue(mockUsuario);

      const response = await request(app)
        .get('/auth/perfil')
        .set('Authorization', 'Bearer valid_token');

      expect(response.statusCode).toBe(200);
      expect(response.body.nombre).toBe('Test User');
      expect(response.body.email).toBe('test@pymex.com');
    });
  });

  describe('POST /auth/refresh', () => {
    it('debería refrescar el token exitosamente', async () => {
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
      authService.generarTokenEmpresa.mockReturnValue('new_access_token');
      authService.generarRefreshToken.mockReturnValue({
        refreshToken: 'new_refresh_token',
        refreshTokenHash: 'new_hash',
        expiresAt: new Date(Date.now() + 86400000)
      });
      RevokedToken.create.mockResolvedValue({ id: 2 });

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'valid_refresh_token' });

      expect(response.statusCode).toBe(200);
      expect(response.body.token).toBe('new_access_token');
      expect(response.body.refreshToken).toBe('new_refresh_token');
    });

    it('debería retornar error si el refresh token es inválido', async () => {
      const { AuthenticationError } = require('../../../../src/middleware/errorHandler');
      authService.validateRefreshToken.mockRejectedValue(new AuthenticationError('Refresh token inválido o expirado'));

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid_token' });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /auth/start-trial', () => {
    it('debería iniciar un trial exitosamente', async () => {
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined)
      };
      sequelize.transaction.mockResolvedValue(mockTransaction);

      Plan.findOne.mockResolvedValue({ id: 1, codigo: 'trial', nombre: 'Trial', estado: 'activo' });
      Empresa.create.mockResolvedValue({ id: 1, nombre: 'Test Enterprise', ruc: null, plan: 'trial', estado: 'activo' });
      Usuario.create.mockResolvedValue({ id: 1, nombre: 'Test User', email: 'test@pymex.com' });
      Suscripcion.create.mockResolvedValue({ id: 1, fecha_fin: new Date() });

      const response = await request(app)
        .post('/auth/start-trial')
        .send({
          empresa_nombre: 'Test Enterprise',
          nombre: 'Test User',
          email: 'test@pymex.com',
          password: 'password123',
          dias_trial: 14
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.mensaje).toBe('Trial iniciado');
      expect(eventBus.publish).toHaveBeenCalledWith(
        'TRIAL_STARTED',
        expect.objectContaining({
          userId: 1,
          empresaId: 1
        }),
        'AUTH'
      );
    });

    it('debería retornar error si faltan campos obligatorios', async () => {
      const response = await request(app)
        .post('/auth/start-trial')
        .send({
          empresa_nombre: 'Test Enterprise'
          // faltan nombre, email, password
        });

      expect(response.statusCode).toBe(400);
    });
  });
});
