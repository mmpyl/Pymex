/**
 * Pruebas Unitarias para authService.js
 * 
 * Estas pruebas validan la lógica de autenticación del servicio
 */

const authService = require('../../../../src/domains/auth/services/authService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock de los modelos y dependencias
jest.mock('../../../../src/domains/auth/models', () => ({
  Usuario: {
    findOne: jest.fn(),
    findByPk: jest.fn()
  },
  Rol: {},
  RevokedToken: {
    findOne: jest.fn()
  }
}));

jest.mock('../../../../src/domains/core/models', () => ({
  Empresa: {}
}));

jest.mock('../../../../src/domains/auth/models/UsuarioAdmin', () => ({}));
jest.mock('../../../../src/domains/auth/models/AuditoriaAdmin', () => ({
  create: jest.fn()
}));

jest.mock('../../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

const authModels = require('../../../../src/domains/auth/models');
const { Usuario, RevokedToken } = authModels;
const AuditoriaAdmin = require('../../../../src/domains/auth/models/AuditoriaAdmin');

describe('AuthService - Unit Tests', () => {
  const mockPasswordHash = '$2a$10$Xv7OHZ5Rz0L6Qh8qF9Z0Ze9Y8X7W6V5U4T3S2R1Q0P9O8N7M6L5K4';
  
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret_key_for_unit_tests';
    process.env.JWT_EXPIRES = '1h';
    process.env.REFRESH_TOKEN_EXPIRES_DAYS = '30';
  });

  describe('authenticateUser', () => {
    it('debería autenticar usuario con credenciales válidas', async () => {
      const mockUser = {
        id: 1,
        email: 'test@pymex.com',
        password: await bcrypt.hash('password123', 10),
        estado: 'activo',
        nombre: 'Test User',
        empresa_id: 1,
        rol_id: 1,
        Empresa: { id: 1, nombre: 'Test Corp', estado: 'activo', plan: 'basic' },
        Rol: { id: 1, nombre: 'admin' }
      };

      Usuario.findOne.mockResolvedValue(mockUser);

      const result = await authService.authenticateUser('test@pymex.com', 'password123');

      expect(Usuario.findOne).toHaveBeenCalledWith({
        where: { email: 'test@pymex.com', estado: 'activo' },
        include: expect.any(Array)
      });
      expect(result.usuario).toEqual(mockUser);
      expect(result.rolNombre).toBe('admin');
      expect(result.aviso).toBeNull();
    });

    it('debería lanzar AuthenticationError si el usuario no existe', async () => {
      Usuario.findOne.mockResolvedValue(null);

      await expect(authService.authenticateUser('noexiste@pymex.com', 'password123'))
        .rejects.toThrow('Credenciales inválidas');
    });

    it('debería lanzar AuthenticationError si la contraseña es incorrecta', async () => {
      const mockUser = {
        id: 1,
        email: 'test@pymex.com',
        password: mockPasswordHash,
        estado: 'activo'
      };

      Usuario.findOne.mockResolvedValue(mockUser);

      await expect(authService.authenticateUser('test@pymex.com', 'wrongpassword'))
        .rejects.toThrow('Credenciales inválidas');
    });

    it('debería retornar aviso si la empresa está suspendida', async () => {
      const mockUser = {
        id: 1,
        email: 'test@pymex.com',
        password: await bcrypt.hash('password123', 10),
        estado: 'activo',
        nombre: 'Test User',
        empresa_id: 1,
        rol_id: 1,
        Empresa: { id: 1, nombre: 'Suspended Corp', estado: 'suspendido', plan: 'basic' },
        Rol: { id: 1, nombre: 'admin' }
      };

      Usuario.findOne.mockResolvedValue(mockUser);

      const result = await authService.authenticateUser('test@pymex.com', 'password123');

      expect(result.aviso).toBe('Tu empresa está suspendida. Contacta al soporte.');
    });

    it('debería lanzar ValidationError si email o password faltan', async () => {
      await expect(authService.authenticateUser('', 'password123'))
        .rejects.toThrow('Email y contraseña son obligatorios');
      
      await expect(authService.authenticateUser('test@pymex.com', ''))
        .rejects.toThrow('Email y contraseña son obligatorios');
    });
  });

  describe('validateRefreshToken', () => {
    it('debería validar un refresh token válido', async () => {
      const refreshToken = 'valid_refresh_token_abc123';
      const crypto = require('crypto');
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      const mockStoredToken = {
        id: 1,
        token_hash: refreshTokenHash,
        token_type: 'refresh',
        expires_at: new Date(Date.now() + 86400000) // 1 día en el futuro
      };

      RevokedToken.findOne.mockResolvedValue(mockStoredToken);

      const result = await authService.validateRefreshToken(refreshToken);

      expect(RevokedToken.findOne).toHaveBeenCalledWith({
        where: {
          token_hash: refreshTokenHash,
          token_type: ['refresh', 'refresh_admin']
        }
      });
      expect(result).toEqual(mockStoredToken);
    });

    it('debería lanzar AuthenticationError si el refresh token no existe', async () => {
      RevokedToken.findOne.mockResolvedValue(null);

      await expect(authService.validateRefreshToken('invalid_token'))
        .rejects.toThrow('Refresh token inválido o expirado');
    });

    it('debería lanzar AuthenticationError si el refresh token expiró', async () => {
      const refreshToken = 'expired_token';
      const crypto = require('crypto');
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      const mockExpiredToken = {
        id: 1,
        token_hash: refreshTokenHash,
        token_type: 'refresh',
        expires_at: new Date(Date.now() - 86400000), // 1 día en el pasado
        destroy: jest.fn().mockResolvedValue(true)
      };

      RevokedToken.findOne.mockResolvedValue(mockExpiredToken);

      await expect(authService.validateRefreshToken(refreshToken))
        .rejects.toThrow('Refresh token expirado. Inicia sesión nuevamente.');
      
      expect(mockExpiredToken.destroy).toHaveBeenCalled();
    });

    it('debería lanzar ValidationError si no se proporciona refresh token', async () => {
      await expect(authService.validateRefreshToken(null))
        .rejects.toThrow('Refresh token es requerido');
    });
  });

  describe('generarRefreshToken', () => {
    it('debería generar un refresh token con los datos correctos', () => {
      const userData = { id: 1, email: 'test@pymex.com', userType: 'empresa' };
      
      const result = authService.generarRefreshToken(userData);

      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('refreshTokenHash');
      expect(result).toHaveProperty('expiresAt');
      expect(result.userId).toBe(1);
      expect(result.userType).toBe('empresa');
      expect(result.metadata.email).toBe('test@pymex.com');
      expect(typeof result.refreshToken).toBe('string');
      expect(result.refreshToken.length).toBeGreaterThan(50);
    });

    it('debería generar refresh token sin userData', () => {
      const result = authService.generarRefreshToken({});

      expect(result).toHaveProperty('refreshToken');
      expect(result.userId).toBeNull();
      expect(result.userType).toBe('empresa');
    });
  });

  describe('generarTokenEmpresa', () => {
    it('debería generar un token JWT válido para empresa', () => {
      const mockUsuario = {
        id: 1,
        empresa_id: 100,
        rol_id: 2,
        nombre: 'Test User'
      };

      const token = authService.generarTokenEmpresa(mockUsuario, 'admin');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Verificar que el token puede ser decodificado
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.token_type).toBe('empresa');
      expect(decoded.scope).toBe('business');
      expect(decoded.id).toBe(1);
      expect(decoded.empresa_id).toBe(100);
      expect(decoded.rol).toBe('admin');
      expect(decoded.jti).toBeDefined();
    });
  });

  describe('generarTokenAdmin', () => {
    it('debería generar un token JWT válido para admin', () => {
      const mockAdmin = {
        id: 1,
        rol: 'superadmin',
        nombre: 'Admin User'
      };

      const token = authService.generarTokenAdmin(mockAdmin);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.token_type).toBe('admin');
      expect(decoded.scope).toBe('global');
      expect(decoded.id).toBe(1);
      expect(decoded.rol).toBe('superadmin');
    });
  });

  describe('registrarActividadAuth', () => {
    it('debería registrar actividad de auditoría', async () => {
      const mockDatos = { userId: 1, email: 'test@pymex.com', evento: 'LOGIN' };
      
      await authService.registrarActividadAuth('USER_LOGIN', mockDatos);

      expect(AuditoriaAdmin.create).toHaveBeenCalledWith({
        evento: 'USER_LOGIN',
        metadata: mockDatos,
        fecha: expect.any(Date)
      }, { transaction: null });
    });

    it('debería manejar errores silenciosamente si falla la auditoría', async () => {
      AuditoriaAdmin.create.mockRejectedValue(new Error('DB Error'));
      
      // No debería lanzar error
      await expect(authService.registrarActividadAuth('USER_LOGIN', {}))
        .resolves.toBeUndefined();
    });
  });
});
