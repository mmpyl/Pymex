/**
 * Pruebas Unitarias para UsuarioRepository
 *
 * Estas pruebas validan las operaciones del repositorio de usuarios
 */

// Datos de mock
const mockRolInstance = {
  id: 2,
  nombre: 'admin',
  descripcion: 'Administrador'
};

const mockUsuarioInstance = {
  id: 1,
  empresa_id: 100,
  rol_id: 2,
  nombre: 'Test User',
  email: 'test@pymex.com',
  password: 'hashed_password',
  estado: 'activo',
  rol: mockRolInstance,
  update: jest.fn().mockResolvedValue(true)
};

// Mock completo de sequelize que incluye métodos de asociación
const mockTransaction = jest.fn();
const mockSequelizeInstance = {
  transaction: mockTransaction,
  where: jest.fn(),
  fn: jest.fn(),
  col: jest.fn(),
  and: jest.fn(),
  or: jest.fn()
};

// Mock de database ANTES de cualquier import
jest.mock('../../../../src/config/database', () => ({
  define: jest.fn(() => ({
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    belongsToMany: jest.fn()
  })),
  transaction: mockTransaction,
  query: jest.fn(),
  authenticate: jest.fn(),
  sync: jest.fn()
}));

// Mock de los modelos directamente con métodos de asociación simulados
jest.mock('../../../../src/domains/auth/models/Usuario', () => {
  const mockModel = {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
  };
  // Añadir métodos de asociación para que Sequelize no falle
  mockModel.hasMany = jest.fn();
  mockModel.belongsTo = jest.fn();
  return mockModel;
});

jest.mock('../../../../src/domains/auth/models/Rol', () => {
  const mockModel = {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  };
  mockModel.hasMany = jest.fn();
  mockModel.belongsTo = jest.fn();
  mockModel.belongsToMany = jest.fn();
  return mockModel;
});

jest.mock('../../../../src/domains/auth/models/Permiso', () => {
  const mockModel = {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  };
  mockModel.belongsToMany = jest.fn();
  return mockModel;
});

jest.mock('../../../../src/domains/auth/models/RolPermiso', () => ({
  findByPk: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn()
}));

// Ahora podemos importar
const UsuarioRepository = require('../../../../src/domains/auth/repositories/UsuarioRepository');
const { Usuario } = require('../../../../src/domains/auth/models/Usuario');
const { Rol } = require('../../../../src/domains/auth/models/Rol');
const sequelize = require('../../../../src/config/database');

describe('UsuarioRepository - Unit Tests', () => {
  let repository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new UsuarioRepository();
  });

  describe('findById', () => {
    it('debería encontrar un usuario por ID con su rol', async () => {
      Usuario.findByPk.mockResolvedValue(mockUsuarioInstance);

      const result = await repository.findById(1);

      expect(Usuario.findByPk).toHaveBeenCalledWith(1, expect.objectContaining({
        include: expect.arrayContaining([
          expect.objectContaining({
            as: 'rol'
          })
        ])
      }));
      expect(result).toEqual(mockUsuarioInstance);
    });

    it('debería retornar null si el usuario no existe', async () => {
      Usuario.findByPk.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los usuarios sin filtros', async () => {
      const mockUsuarios = [mockUsuarioInstance];
      Usuario.findAll.mockResolvedValue(mockUsuarios);

      const result = await repository.findAll();

      expect(Usuario.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.any(Object),
        include: expect.arrayContaining([
          expect.objectContaining({ as: 'rol' })
        ])
      }));
      expect(result).toEqual(mockUsuarios);
    });

    it('debería filtrar usuarios por empresa_id', async () => {
      const mockUsuarios = [mockUsuarioInstance];
      Usuario.findAll.mockResolvedValue(mockUsuarios);

      const result = await repository.findAll({ where: { empresa_id: 100 } });

      expect(Usuario.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { empresa_id: 100 }
      }));
    });

    it('debería aplicar paginación y ordenamiento', async () => {
      const mockUsuarios = [mockUsuarioInstance];
      Usuario.findAll.mockResolvedValue(mockUsuarios);

      const result = await repository.findAll({
        limit: 10,
        offset: 0,
        order: [['nombre', 'ASC']]
      });

      expect(Usuario.findAll).toHaveBeenCalledWith(expect.objectContaining({
        limit: 10,
        offset: 0,
        order: [['nombre', 'ASC']]
      }));
    });
  });

  describe('create', () => {
    it('debería crear un nuevo usuario', async () => {
      const nuevoUsuario = {
        empresa_id: 100,
        rol_id: 2,
        nombre: 'Nuevo Usuario',
        email: 'nuevo@pymex.com',
        password: 'hashed_password'
      };

      Usuario.create.mockResolvedValue({ ...nuevoUsuario, id: 2, estado: 'activo' });

      const result = await repository.create(nuevoUsuario);

      expect(Usuario.create).toHaveBeenCalledWith(nuevoUsuario);
      expect(result.id).toBe(2);
      expect(result.estado).toBe('activo');
    });
  });

  describe('update', () => {
    it('debería actualizar un usuario existente', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ ...mockUsuarioInstance, nombre: 'Updated Name' });
      const usuarioMock = {
        ...mockUsuarioInstance,
        update: mockUpdate
      };

      Usuario.findByPk.mockResolvedValue(usuarioMock);

      const result = await repository.update(1, { nombre: 'Updated Name' });

      expect(Usuario.findByPk).toHaveBeenCalledWith(1);
      expect(mockUpdate).toHaveBeenCalledWith({ nombre: 'Updated Name' });
    });

    it('debería lanzar error si el usuario no existe', async () => {
      Usuario.findByPk.mockResolvedValue(null);

      await expect(repository.update(999, { nombre: 'Test' }))
        .rejects.toThrow('Usuario con ID 999 no encontrado');
    });
  });

  describe('delete (soft delete)', () => {
    it('debería hacer soft delete cambiando estado a inactivo', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(true);
      const usuarioMock = {
        ...mockUsuarioInstance,
        update: mockUpdate
      };

      Usuario.findByPk.mockResolvedValue(usuarioMock);

      const result = await repository.delete(1);

      expect(Usuario.findByPk).toHaveBeenCalledWith(1);
      expect(mockUpdate).toHaveBeenCalledWith({ estado: 'inactivo' });
      expect(result).toBe(true);
    });

    it('debería lanzar error si el usuario no existe', async () => {
      Usuario.findByPk.mockResolvedValue(null);

      await expect(repository.delete(999))
        .rejects.toThrow('Usuario con ID 999 no encontrado');
    });
  });

  describe('count', () => {
    it('debería contar todos los usuarios sin filtros', async () => {
      Usuario.count.mockResolvedValue(50);

      const result = await repository.count();

      expect(Usuario.count).toHaveBeenCalledWith({ where: {} });
      expect(result).toBe(50);
    });

    it('debería contar usuarios filtrados por empresa_id', async () => {
      Usuario.count.mockResolvedValue(10);

      const result = await repository.count({ empresa_id: 100 });

      expect(Usuario.count).toHaveBeenCalledWith({ where: { empresa_id: 100 } });
      expect(result).toBe(10);
    });
  });

  describe('transaction', () => {
    it('debería ejecutar operación en transacción y hacer commit', async () => {
      const mockCommit = jest.fn().mockResolvedValue(undefined);
      const mockRollback = jest.fn().mockResolvedValue(undefined);
      const mockTransactionObj = { commit: mockCommit, rollback: mockRollback };

      mockTransaction.mockResolvedValue(mockTransactionObj);

      const callback = jest.fn().mockResolvedValue('result');

      const result = await repository.transaction(callback);

      expect(mockTransaction).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(mockTransactionObj);
      expect(mockCommit).toHaveBeenCalled();
      expect(mockRollback).not.toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('debería hacer rollback si hay error', async () => {
      const mockCommit = jest.fn();
      const mockRollback = jest.fn().mockResolvedValue(undefined);
      const mockTransactionObj = { commit: mockCommit, rollback: mockRollback };

      mockTransaction.mockResolvedValue(mockTransactionObj);

      const error = new Error('DB Error');
      const callback = jest.fn().mockRejectedValue(error);

      await expect(repository.transaction(callback)).rejects.toThrow('DB Error');

      expect(mockRollback).toHaveBeenCalled();
      expect(mockCommit).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('debería encontrar un usuario por email con su rol', async () => {
      Usuario.findOne.mockResolvedValue(mockUsuarioInstance);

      const result = await repository.findByEmail('test@pymex.com');

      expect(Usuario.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { email: 'test@pymex.com' },
        include: expect.arrayContaining([
          expect.objectContaining({ as: 'rol' })
        ])
      }));
      expect(result).toEqual(mockUsuarioInstance);
    });

    it('debería retornar null si no existe usuario con ese email', async () => {
      Usuario.findOne.mockResolvedValue(null);

      const result = await repository.findByEmail('noexiste@pymex.com');

      expect(result).toBeNull();
    });
  });

  describe('findByEmpresa', () => {
    it('debería encontrar todos los usuarios de una empresa', async () => {
      const mockUsuarios = [mockUsuarioInstance];
      Usuario.findAll.mockResolvedValue(mockUsuarios);

      const result = await repository.findByEmpresa(100);

      expect(Usuario.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { empresa_id: 100 },
        include: expect.arrayContaining([
          expect.objectContaining({ as: 'rol' })
        ])
      }));
      expect(result).toEqual(mockUsuarios);
    });

    it('debería retornar array vacío si no hay usuarios en la empresa', async () => {
      Usuario.findAll.mockResolvedValue([]);

      const result = await repository.findByEmpresa(999);

      expect(result).toEqual([]);
    });
  });

  describe('findActiveById', () => {
    it('debería encontrar un usuario activo por ID', async () => {
      Usuario.findOne.mockResolvedValue(mockUsuarioInstance);

      const result = await repository.findActiveById(1);

      expect(Usuario.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1, estado: 'activo' },
        include: expect.arrayContaining([
          expect.objectContaining({ as: 'rol' })
        ])
      }));
      expect(result).toEqual(mockUsuarioInstance);
    });

    it('debería retornar null si el usuario está inactivo', async () => {
      Usuario.findOne.mockResolvedValue(null);

      const result = await repository.findActiveById(1);

      expect(result).toBeNull();
    });
  });
});
