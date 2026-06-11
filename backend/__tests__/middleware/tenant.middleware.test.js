const { ensureTenantAccess } = require('../../src/middleware/tenant');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Tenant Middleware - Isolation Tests', () => {
  it('permite continuar y normaliza req.empresa_id si el token tiene empresa válida', () => {
    const req = {
      usuario: { empresa_id: 10 },
      params: {},
      query: {},
      body: {}
    };
    const res = createMockRes();
    const next = jest.fn();

    ensureTenantAccess()(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.empresa_id).toBe(10);
    expect(req.tenant).toEqual({ empresa_id: 10 });
  });

  it('rechaza tokens sin empresa_id válido', () => {
    const req = { usuario: { id: 1 }, params: {}, query: {}, body: {} };
    const res = createMockRes();
    const next = jest.fn();

    ensureTenantAccess()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Token sin empresa válida',
      code: 'TENANT_REQUIRED'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rechaza empresa_id de otro tenant en params', () => {
    const req = {
      usuario: { empresa_id: 10 },
      params: { empresaId: '99' },
      query: {},
      body: {}
    };
    const res = createMockRes();
    const next = jest.fn();

    ensureTenantAccess({ paramKey: 'empresaId' })(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'No puedes acceder u operar sobre otra empresa',
      code: 'TENANT_ACCESS_DENIED',
      field: 'params.empresaId'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rechaza inyección anidada de empresa_id de otro tenant en body', () => {
    const req = {
      usuario: { empresa_id: 10 },
      params: {},
      query: {},
      body: { items: [{ producto_id: 1, empresa_id: 99 }] }
    };
    const res = createMockRes();
    const next = jest.fn();

    ensureTenantAccess()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'No puedes acceder u operar sobre otra empresa',
      code: 'TENANT_ACCESS_DENIED',
      field: 'body.items[0].empresa_id'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rechaza empresa_id inválido en query', () => {
    const req = {
      usuario: { empresa_id: 10 },
      params: {},
      query: { empresa_id: 'abc' },
      body: {}
    };
    const res = createMockRes();
    const next = jest.fn();

    ensureTenantAccess()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Identificador de empresa inválido',
      code: 'INVALID_TENANT_ID',
      field: 'query.empresa_id'
    });
    expect(next).not.toHaveBeenCalled();
  });
});
