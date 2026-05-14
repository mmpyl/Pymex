/**
 * Pruebas Unitarias para el Middleware de Autenticación
 * 
 * Valida la verificación de tokens JWT y blacklist
 */

const jwt = require('jsonwebtoken');

// Configurar secrets para pruebas (deben coincidir con .env.test)
const TEST_SECRET_EMPRESA = process.env.JWT_SECRET_EMPRESA || process.env.JWT_SECRET;
const TEST_SECRET_ADMIN = process.env.JWT_SECRET_ADMIN || process.env.JWT_SECRET;

// Mock del redis antes de cargar el middleware
jest.mock('../../src/config/redis', () => ({
  checkConnection: jest.fn().mockResolvedValue(false),
  isBlacklisted: jest.fn().mockResolvedValue(false),
  revokeToken: jest.fn().mockResolvedValue(true),
  redis: { on: jest.fn() }
}));

const authMiddleware = require('../../src/middleware/auth');

describe('Auth Middleware - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockReq = (headers = {}) => ({ headers });
  
  const createMockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  describe('verificarTokenEmpresa', () => {
    it('debería llamar a next() si el token es válido', async () => {
      const token = jwt.sign(
        { 
          token_type: 'empresa', 
          scope: 'business',
          id: 1, 
          empresa_id: 100,
          jti: 'test-jti-123'
        },
        TEST_SECRET_EMPRESA
      );
      
      const req = createMockReq({ authorization: `Bearer ${token}` });
      const res = createMockRes();
      const next = jest.fn();

      await authMiddleware.verificarTokenEmpresa(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.usuario).toBeDefined();
      expect(req.usuario.id).toBe(1);
      expect(req.usuario.empresa_id).toBe(100);
    });

    it('debería retornar 401 si no hay header de autorización', async () => {
      const req = createMockReq({});
      const res = createMockRes();
      const next = jest.fn();

      await authMiddleware.verificarTokenEmpresa(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería retornar 401 si el token no tiene formato Bearer', async () => {
      const req = createMockReq({ authorization: 'InvalidFormat token123' });
      const res = createMockRes();
      const next = jest.fn();

      await authMiddleware.verificarTokenEmpresa(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('debería retornar 403 si el token es inválido', async () => {
      const req = createMockReq({ authorization: 'Bearer invalid_token_here' });
      const res = createMockRes();
      const next = jest.fn();

      await authMiddleware.verificarTokenEmpresa(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería retornar 401 si el token expiró', async () => {
      const expiredToken = jwt.sign(
        { 
          token_type: 'empresa', 
          scope: 'business',
          id: 1,
          jti: 'test-jti-expired'
        },
        TEST_SECRET_EMPRESA,
        { expiresIn: '-1h' } // Token ya expirado
      );

      const req = createMockReq({ authorization: `Bearer ${expiredToken}` });
      const res = createMockRes();
      const next = jest.fn();

      await authMiddleware.verificarTokenEmpresa(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería retornar 403 si el token_type no es "empresa"', async () => {
      // Usamos el mismo secret de empresa pero con token_type diferente
      const adminToken = jwt.sign(
        { 
          token_type: 'admin', 
          scope: 'global',
          id: 1,
          jti: 'test-jti-admin'
        },
        TEST_SECRET_EMPRESA  // Usamos el mismo secret para que pueda ser verificado
      );

      const req = createMockReq({ authorization: `Bearer ${adminToken}` });
      const res = createMockRes();
      const next = jest.fn();

      await authMiddleware.verificarTokenEmpresa(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token no válido para esta ruta' });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería retornar 403 si el scope no es "business"', async () => {
      const wrongScopeToken = jwt.sign(
        { 
          token_type: 'empresa', 
          scope: 'invalid_scope',
          id: 1,
          jti: 'test-jti-wrong-scope'
        },
        TEST_SECRET_EMPRESA
      );

      const req = createMockReq({ authorization: `Bearer ${wrongScopeToken}` });
      const res = createMockRes();
      const next = jest.fn();

      await authMiddleware.verificarTokenEmpresa(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Scope inválido para acceso de empresa' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('verificarTokenAdmin', () => {
    it('debería llamar a next() si el token de admin es válido', async () => {
      const token = jwt.sign(
        { 
          token_type: 'admin', 
          scope: 'global',
          id: 1,
          rol: 'superadmin',
          jti: 'test-jti-admin-123'
        },
        TEST_SECRET_ADMIN
      );
      
      const req = createMockReq({ authorization: `Bearer ${token}` });
      const res = createMockRes();
      const next = jest.fn();

      await authMiddleware.verificarTokenAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.admin).toBeDefined();
      expect(req.admin.id).toBe(1);
      expect(req.admin.rol).toBe('superadmin');
    });

    it('debería retornar 403 si el token_type no es "admin" (con secret admin)', async () => {
      // Token de empresa firmado con secret de admin para probar validación de tipo
      const empresaToken = jwt.sign(
        { 
          token_type: 'empresa', 
          scope: 'business',
          id: 1,
          jti: 'test-jti-empresa'
        },
        TEST_SECRET_ADMIN  // Firmado con secret de admin
      );

      const req = createMockReq({ authorization: `Bearer ${empresaToken}` });
      const res = createMockRes();
      const next = jest.fn();

      await authMiddleware.verificarTokenAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token no válido para panel admin' });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería retornar 403 si el scope no es "global"', async () => {
      const wrongScopeToken = jwt.sign(
        { 
          token_type: 'admin', 
          scope: 'limited',
          id: 1,
          jti: 'test-jti-limited'
        },
        TEST_SECRET_ADMIN
      );

      const req = createMockReq({ authorization: `Bearer ${wrongScopeToken}` });
      const res = createMockRes();
      const next = jest.fn();

      await authMiddleware.verificarTokenAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Scope inválido para acceso global' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('parseBearer', () => {
    it('debería extraer el token del header Authorization', () => {
      const req = { headers: { authorization: 'Bearer mytoken123' } };
      
      const result = authMiddleware.parseBearer(req);
      
      expect(result).toBe('mytoken123');
    });

    it('debería retornar null si no hay header', () => {
      const req = { headers: {} };
      
      const result = authMiddleware.parseBearer(req);
      
      expect(result).toBeNull();
    });

    it('debería retornar null si el formato no es Bearer', () => {
      const req = { headers: { authorization: 'Basic token123' } };
      
      const result = authMiddleware.parseBearer(req);
      
      expect(result).toBeNull();
    });
  });

  describe('getSecretForTokenType', () => {
    it('debería retornar JWT_SECRET_ADMIN para tipo admin', () => {
      const result = authMiddleware.getSecretForTokenType('admin');
      expect(result).toBe(TEST_SECRET_ADMIN);
    });

    it('debería retornar JWT_SECRET_EMPRESA para tipo empresa', () => {
      const result = authMiddleware.getSecretForTokenType('empresa');
      expect(result).toBe(TEST_SECRET_EMPRESA);
    });

    it('debería retornar JWT_SECRET_EMPRESA por defecto', () => {
      const result = authMiddleware.getSecretForTokenType('unknown');
      expect(result).toBe(TEST_SECRET_EMPRESA);
    });
  });
});
